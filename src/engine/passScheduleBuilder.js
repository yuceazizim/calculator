/**
 * Welding Consumable Calculator (WCC)
 * Calculation Engine Module 3: ASME WPS Pass & Layer Schedule Builder
 * Features:
 *   - Geometry-Driven 4-Layer Automatic Sequencing (Root, Hot, Fill & Cap)
 *   - ASME QW-410 (3xd) Cap Stringer Width & Area Capacity Rules
 *   - Multi-Process Custom Stepped Pass Stacking Mode
 *   - Per-Layer Torch & Backing/Purge Gas Flow Resolution
 *   - Smart Auto-Suggest Generator synced with Physical Groove Geometry
 * Governing Document: WCC-SPEC-2026-REV01
 * Pure JavaScript (.js only)
 */

import { calculateWeldGeometry } from './geometryCalculator.js';
import {
  resolveMetallurgyProfile,
  getPositionMultipliers,
  isGasShieldedProcess,
  getDefaultLengthMm,
  getNominalBeadArea,
  getProcessTravelSpeed,
  getHeatInputMetrics,
  getUnitDepositWeightGrams,
} from './processSpecs.js';

/**
 * Resolve filler class & unit type for a given process
 */
function getProcessFillerMeta(proc, metallurgy) {
  const p = String(proc || 'SMAW').toUpperCase();
  if (p === 'GTAW') return { fillerClass: metallurgy.defaultTigClass, unit: 'rods' };
  if (p === 'GMAW') return { fillerClass: metallurgy.defaultGmawClass, unit: 'kg' };
  if (p === 'FCAW') return { fillerClass: metallurgy.defaultFcawClass, unit: 'kg' };
  if (p === 'SAW') return { fillerClass: 'EH12K', unit: 'kg' };
  return { fillerClass: metallurgy.defaultSmawClass, unit: 'electrodes' };
}

/**
 * Resolve torch & purge gas flow context
 */
export function buildGasPolicyContext({
  isPipe,
  weldGeometry,
  requiresBackingGas,
  isFluxCoredTig,
  gasFlowRateLpm,
  purgeGasFlowRateLpm,
  purgeStrategy,
  t,
  rootProcess,
}) {
  const isGrooveButt = weldGeometry === 'butt' || weldGeometry === 'double_v';
  const isPurgeAllowed = isPipe && isGrooveButt && Boolean(requiresBackingGas) && !Boolean(isFluxCoredTig);

  const parsedTorchFlow = parseFloat(gasFlowRateLpm);
  const defaultTorchFlow = Number.isFinite(parsedTorchFlow) && parsedTorchFlow >= 0 ? parsedTorchFlow : 14.0;

  const hasExplicitPurgeFlow =
    purgeGasFlowRateLpm !== undefined && purgeGasFlowRateLpm !== null && purgeGasFlowRateLpm !== '';
  const parsedPurgeFlow = hasExplicitPurgeFlow ? parseFloat(purgeGasFlowRateLpm) : 10.0;
  const defaultPurgeFlow = isPurgeAllowed
    ? (Number.isFinite(parsedPurgeFlow) && parsedPurgeFlow >= 0 ? parsedPurgeFlow : 10.0)
    : 0;

  const normalizedPurgeStrategy = ['auto', 'full', 'root_hot', 'gtaw_all'].includes(purgeStrategy)
    ? purgeStrategy
    : 'auto';

  const resolveRowTorchGasLpm = (proc, explicitVal) => {
    if (!isGasShieldedProcess(proc)) return 0;
    if (explicitVal !== undefined && explicitVal !== null && explicitVal !== '') {
      const parsed = parseFloat(explicitVal);
      if (Number.isFinite(parsed) && parsed >= 0) return Math.round(parsed * 10) / 10;
    }
    return Math.round(defaultTorchFlow * 10) / 10;
  };

  const resolveAutoPurgeActive = ({ proc, isRootOrHotLayer, isFullTigJoint }) => {
    if (!isPurgeAllowed || defaultPurgeFlow <= 0) return false;
    if (normalizedPurgeStrategy === 'full') return true;
    if (normalizedPurgeStrategy === 'root_hot') return Boolean(isRootOrHotLayer);
    if (normalizedPurgeStrategy === 'gtaw_all') return String(proc || '').toUpperCase() === 'GTAW';

    if (t <= 6.0) return true;
    if (isFullTigJoint) return Boolean(isRootOrHotLayer);
    if (String(proc || '').toUpperCase() === 'GTAW') return true;
    return Boolean(isRootOrHotLayer && rootProcess !== 'GTAW');
  };

  const resolveRowPurgeGasLpm = ({ proc, explicitVal, isRootOrHotLayer, isFullTigJoint }) => {
    if (!isPurgeAllowed) return 0;
    if (explicitVal !== undefined && explicitVal !== null && explicitVal !== '') {
      const parsed = parseFloat(explicitVal);
      if (Number.isFinite(parsed) && parsed >= 0) return Math.round(parsed * 10) / 10;
    }
    const active = resolveAutoPurgeActive({ proc, isRootOrHotLayer, isFullTigJoint });
    return active ? Math.round(defaultPurgeFlow * 10) / 10 : 0;
  };

  return {
    isGrooveButt,
    isPurgeAllowed,
    defaultTorchFlow,
    defaultPurgeFlow,
    normalizedPurgeStrategy,
    resolveRowTorchGasLpm,
    resolveRowPurgeGasLpm,
  };
}

/**
 * Compute required cap stringer pass count respecting ASME 3xd width limit & area capacity
 */
function computeCapPassCount({ capTotalWidth, areaCap, capProc, capDia, weldGeometry }) {
  const nominalBead = getNominalBeadArea(capProc, capDia);
  const effectiveMaxBeadWidth = Math.max(1.5, capDia * 2.8); // Strictly <= 3.0 * d (ASME QW-410)
  const widthBasedRuns = Math.max(1, Math.ceil((capTotalWidth || effectiveMaxBeadWidth) / effectiveMaxBeadWidth));
  const singleSideRuns = Math.min(12, Math.max(widthBasedRuns, Math.ceil((areaCap / (weldGeometry === 'double_v' ? 2.0 : 1.0)) / (nominalBead * 1.35))));
  return weldGeometry === 'double_v' ? singleSideRuns * 2 : singleSideRuns;
}

/**
 * Build automatic geometry-driven pass schedule (Root + Hot + Fill + Cap)
 */
function buildAutomaticSchedule({
  geom,
  metallurgy,
  speedCtx,
  gasCtx,
  rootProcess,
  fillProcess,
  weldGeometry,
  selectedDiameters,
  standardElectrodeLength,
}) {
  const schedule = [];
  let passIdx = 1;
  const safeTotalArea = geom.totalCrossSectionAreaMm2 || 1.0;
  const isFullTigJoint = rootProcess === 'GTAW' && fillProcess === 'GTAW';

  const pushLayer = ({
    layerName,
    proc,
    dia,
    len,
    passesCount,
    areaShareMm2,
    isRootPass,
    isRootOrHotLayer,
  }) => {
    const pCount = Math.max(1, passesCount);
    const ratio = Math.max(0, areaShareMm2) / safeTotalArea;
    const rawNetGrams = geom.totalNetWeightGrams * ratio;
    const netWeightGrams = Math.round(rawNetGrams * 10) / 10;
    const { fillerClass, unit } = getProcessFillerMeta(proc, metallurgy);

    const speed = getProcessTravelSpeed(proc, dia, isRootPass, speedCtx);
    const heatMetrics = getHeatInputMetrics(proc, dia, speed, isRootPass, metallurgy.isNickelAlloy);
    const rawArcMin = (geom.seamLengthMm / speed) * pCount;

    const startPass = passIdx;
    const endPass = startPass + pCount - 1;
    passIdx = endPass + 1;

    schedule.push({
      passRange: pCount === 1 ? `Pass ${startPass}` : `Pass ${startPass}-${endPass}`,
      layerName,
      process: proc,
      fillerClass,
      diameterMm: dia,
      lengthMm: len,
      maxAllowableWidthMm: dia * 3.0,
      passesCount: pCount,
      netWeightGrams,
      rawNetWeightGrams: rawNetGrams,
      unit,
      arcTimeMinutes: Math.round(rawArcMin * 10) / 10,
      rawArcTimeMinutes: rawArcMin,
      torchGasLpm: gasCtx.resolveRowTorchGasLpm(proc, null),
      purgeGasLpm: gasCtx.resolveRowPurgeGasLpm({
        proc,
        explicitVal: null,
        isRootOrHotLayer,
        isFullTigJoint,
      }),
      ...heatMetrics,
    });
  };

  const rProc = String(rootProcess || 'GTAW').toUpperCase();
  const fProc = String(fillProcess || 'SMAW').toUpperCase();
  const rDia = selectedDiameters[rProc] || 2.4;
  const fDia = selectedDiameters[fProc] || 3.25;
  const rLen = rProc === 'GTAW' ? 1000.0 : (rProc === 'SMAW' ? standardElectrodeLength : null);
  const fLen = fProc === 'GTAW' ? 1000.0 : (fProc === 'SMAW' ? standardElectrodeLength : null);

  // Case 1: Compact Single-Pass Fillet / Socket
  if (geom.areaFill <= 0.01 && geom.areaCap <= 0.01) {
    const nominalBead = getNominalBeadArea(fProc, fDia);
    const runs = Math.max(1, Math.round(geom.totalCrossSectionAreaMm2 / nominalBead));
    pushLayer({
      layerName: weldGeometry === 'fillet' ? 'Fillet Fill & Cover' : 'Groove Fill & Cap',
      proc: fProc,
      dia: fDia,
      len: fLen,
      passesCount: runs,
      areaShareMm2: geom.totalCrossSectionAreaMm2,
      isRootPass: true,
      isRootOrHotLayer: true,
    });
    return schedule;
  }

  // Case 2: Standard Physical 4-Layer Breakdown (Root -> Hot -> Fill -> Cap)
  // 2A. Root Pass (Pass 1)
  if (geom.areaRootOnly > 0) {
    const rootBead = getNominalBeadArea(rProc, rDia);
    const rootPasses = geom.areaRootOnly > rootBead * 2.1 && geom.t > 12 ? 2 : 1;
    pushLayer({
      layerName: 'Root Pass',
      proc: rProc,
      dia: rDia,
      len: rLen,
      passesCount: rootPasses,
      areaShareMm2: geom.areaRootOnly,
      isRootPass: true,
      isRootOrHotLayer: true,
    });
  }

  // 2B. Hot Pass (Pass 2) - uses Root Process when GTAW or same process, or Fill Process if non-GTAW root
  if (geom.areaHotOnly > 0) {
    const hotProc = rProc === 'GTAW' ? 'GTAW' : fProc;
    const hotDia = rProc === 'GTAW' ? rDia : fDia;
    const hotLen = rProc === 'GTAW' ? rLen : fLen;
    pushLayer({
      layerName: 'Hot Pass',
      proc: hotProc,
      dia: hotDia,
      len: hotLen,
      passesCount: 1,
      areaShareMm2: geom.areaHotOnly,
      isRootPass: false,
      isRootOrHotLayer: true,
    });
  }

  // 2C. Groove Fill (Exact remaining groove body up to flush surface)
  if (geom.areaFill > 0.5) {
    const isHeavySmawButt = fProc === 'SMAW' && geom.t > 15.0 && gasCtx.isGrooveButt;
    if (isHeavySmawButt) {
      // Narrow root deep fill with Ø 2.50mm (ASME 3xd clearance) + Main Body Fill
      const deepArea = geom.areaFill * 0.12;
      const mainArea = geom.areaFill - deepArea;
      const deepBead = getNominalBeadArea('SMAW', 2.50);
      const deepRuns = Math.max(1, Math.min(3, Math.round(deepArea / deepBead)));
      const deepLen = Math.min(350.0, standardElectrodeLength);

      pushLayer({
        layerName: 'Deep Fill (Narrow Root)',
        proc: 'SMAW',
        dia: 2.50,
        len: deepLen,
        passesCount: deepRuns,
        areaShareMm2: deepArea,
        isRootPass: false,
        isRootOrHotLayer: false,
      });

      const mainUnitDep = getUnitDepositWeightGrams('SMAW', fDia, standardElectrodeLength, {
        isNickelAlloy: metallurgy.isNickelAlloy,
        isStainless: metallurgy.isStainless,
      });
      const mainNominalBead = getNominalBeadArea('SMAW', fDia);
      const mainGrams = geom.totalNetWeightGrams * (mainArea / safeTotalArea);
      const mainRunsByArea = Math.round(mainArea / mainNominalBead);
      const mainRunsByDep = Math.round(mainGrams / Math.max(15.0, mainUnitDep * 1.4));
      const mainRuns = Math.max(2, Math.round((mainRunsByArea + mainRunsByDep) / 2));

      pushLayer({
        layerName: `Main Body Fill (${mainRuns}xØ${Number(fDia).toFixed(2)}mm)`,
        proc: 'SMAW',
        dia: fDia,
        len: fLen,
        passesCount: mainRuns,
        areaShareMm2: mainArea,
        isRootPass: false,
        isRootOrHotLayer: false,
      });
    } else {
      const fillNominalBead = getNominalBeadArea(fProc, fDia);
      const fillRuns = Math.max(1, Math.round(geom.areaFill / fillNominalBead));
      pushLayer({
        layerName: 'Groove Fill',
        proc: fProc,
        dia: fDia,
        len: fLen,
        passesCount: fillRuns,
        areaShareMm2: geom.areaFill,
        isRootPass: false,
        isRootOrHotLayer: false,
      });
    }
  }

  // 2D. Cap Cover (Actual parabolic reinforcement area + ASME 3xd stringer count)
  if (geom.areaCap > 0.2) {
    const capRuns = computeCapPassCount({
      capTotalWidth: geom.capTotalWidth,
      areaCap: geom.areaCap,
      capProc: fProc,
      capDia: fDia,
      weldGeometry,
    });

    pushLayer({
      layerName: weldGeometry === 'double_v' ? 'Cap Cover (Both Sides)' : 'Cap Cover (Stringers)',
      proc: fProc,
      dia: fDia,
      len: fLen,
      passesCount: capRuns,
      areaShareMm2: geom.areaCap,
      isRootPass: false,
      isRootOrHotLayer: false,
    });
  }

  return schedule;
}

/**
 * Build Custom Stepped Pass Schedule from user-defined layers
 */
function buildCustomSchedule({
  customPassGroups,
  geom,
  metallurgy,
  speedCtx,
  gasCtx,
  fillProcess,
  selectedDiameters,
  standardElectrodeLength,
}) {
  const schedule = [];
  let currentPassIndex = 1;

  let sumRelativeWeight = 0;
  let sumGtawNominalArea = 0;
  let sumFillNominalArea = 0;
  let allCustomAreGtaw = true;

  customPassGroups.forEach((grp) => {
    const pCount = parseInt(grp.passesCount, 10) || 1;
    const proc = String(grp.process || fillProcess || 'SMAW').toUpperCase();
    const dia = parseFloat(grp.diameterMm) || selectedDiameters[proc] || 3.25;
    const beadArea = getNominalBeadArea(proc, dia);
    const layerNominalArea = pCount * beadArea;

    sumRelativeWeight += layerNominalArea;
    if (proc === 'GTAW') {
      sumGtawNominalArea += layerNominalArea;
    } else {
      allCustomAreGtaw = false;
      sumFillNominalArea += layerNominalArea;
    }
  });

  const isHybridSparseGroove =
    gasCtx.isGrooveButt &&
    sumGtawNominalArea > 0 &&
    sumFillNominalArea > 0 &&
    sumRelativeWeight < geom.totalCrossSectionAreaMm2;

  const cappedGtawTotalShare = isHybridSparseGroove
    ? Math.min(0.35, sumGtawNominalArea / (geom.totalCrossSectionAreaMm2 || 1.0))
    : 0;

  customPassGroups.forEach((grp, idx) => {
    const pCount = parseInt(grp.passesCount, 10) || 1;
    const proc = String(grp.process || fillProcess || 'SMAW').toUpperCase();
    const dia = parseFloat(grp.diameterMm) || selectedDiameters[proc] || 3.25;
    const rowLen =
      proc === 'GTAW'
        ? (parseFloat(grp.lengthMm) || 1000.0)
        : (proc === 'SMAW'
          ? (parseFloat(grp.lengthMm) ||
            (dia <= 2.0 ? 300.0 : (dia >= 4.0 && !metallurgy.isStainless ? 450.0 : standardElectrodeLength)))
          : null);

    const beadArea = getNominalBeadArea(proc, dia);
    const layerNominalArea = pCount * beadArea;

    let grpRatio = layerNominalArea / (sumRelativeWeight || 1.0);
    if (isHybridSparseGroove) {
      if (proc === 'GTAW') {
        grpRatio = (layerNominalArea / sumGtawNominalArea) * cappedGtawTotalShare;
      } else {
        grpRatio = (layerNominalArea / sumFillNominalArea) * (1.0 - cappedGtawTotalShare);
      }
    }

    const rawNetGrams = geom.totalNetWeightGrams * grpRatio;
    const grpNetGrams = Math.round(rawNetGrams * 10) / 10;
    const { fillerClass, unit } = getProcessFillerMeta(proc, metallurgy);

    const isRoot =
      idx === 0 &&
      (grp.label?.toLowerCase().includes('root') || grp.label?.toLowerCase().includes('kök'));
    const isRootOrHotLayer = currentPassIndex <= 2;

    const speed = getProcessTravelSpeed(proc, dia, isRoot, speedCtx);
    const heatMetrics = getHeatInputMetrics(proc, dia, speed, isRoot, metallurgy.isNickelAlloy);
    const rawArcMin = (geom.seamLengthMm / speed) * pCount;

    const endPass = currentPassIndex + pCount - 1;
    schedule.push({
      passRange: pCount === 1 ? `Pass ${currentPassIndex}` : `Pass ${currentPassIndex}-${endPass}`,
      layerName: grp.label || `Layer ${idx + 1} (${pCount}xØ${dia.toFixed(2)}mm)`,
      process: proc,
      fillerClass,
      diameterMm: dia,
      lengthMm: rowLen,
      maxAllowableWidthMm: dia * 3.0,
      passesCount: pCount,
      netWeightGrams: grpNetGrams,
      rawNetWeightGrams: rawNetGrams,
      unit,
      arcTimeMinutes: Math.round(rawArcMin * 10) / 10,
      rawArcTimeMinutes: rawArcMin,
      torchGasLpm: gasCtx.resolveRowTorchGasLpm(proc, grp.torchGasLpm),
      purgeGasLpm: gasCtx.resolveRowPurgeGasLpm({
        proc,
        explicitVal: grp.purgeGasLpm,
        isRootOrHotLayer,
        isFullTigJoint: allCustomAreGtaw,
      }),
      ...heatMetrics,
    });

    currentPassIndex = endPass + 1;
  });

  return schedule;
}

/**
 * Main Schedule Builder Entry Point
 */
export function buildWpsPassSchedule(context) {
  const { customPassGroups } = context;
  if (Array.isArray(customPassGroups) && customPassGroups.length > 0) {
    return buildCustomSchedule(context);
  }
  return buildAutomaticSchedule(context);
}

/**
 * Smart Auto-Suggest Generator for Custom Mode
 * Generates exact geometry-driven Root, Hot, Fill & Cap layers from current calculator inputs
 */
export function buildAutoSuggestLayers(params) {
  const geom = calculateWeldGeometry(params);
  const metallurgy = resolveMetallurgyProfile({
    materialGroup: params.materialGroup || 'Carbon Steel',
    density: geom.density,
    isFluxCoredTig: Boolean(params.isFluxCoredTig),
  });
  const { posSpeedMult, effectiveDirectionMult } = getPositionMultipliers(
    params.weldPosition || 'vertical_fixed',
    params.travelDirection || 'uphill'
  );

  const selectedDiameters = {
    GTAW: parseFloat(params.tigWireDiaMm) || 2.4,
    SMAW: parseFloat(params.smawElectrodeDiaMm) || 3.25,
    GMAW: parseFloat(params.gmawWireDiaMm) || 1.0,
    FCAW: parseFloat(params.fcawWireDiaMm) || 1.2,
    SAW: parseFloat(params.sawWireDiaMm) || 2.5,
  };
  const standardElectrodeLength = parseFloat(params.smawLengthMm) || 350.0;

  const gasCtx = buildGasPolicyContext({
    isPipe: geom.isPipe,
    weldGeometry: params.weldGeometry || 'butt',
    requiresBackingGas: params.requiresBackingGas,
    isFluxCoredTig: params.isFluxCoredTig,
    gasFlowRateLpm: params.gasFlowRateLpm,
    purgeGasFlowRateLpm: params.purgeGasFlowRateLpm,
    purgeStrategy: params.purgeStrategy || 'auto',
    t: geom.t,
    rootProcess: params.rootProcess || 'GTAW',
  });

  const autoRows = buildAutomaticSchedule({
    geom,
    metallurgy,
    speedCtx: {
      isPipe: geom.isPipe,
      t: geom.t,
      posSpeedMult,
      effectiveDirectionMult,
    },
    gasCtx,
    rootProcess: params.rootProcess || 'GTAW',
    fillProcess: params.fillProcess || 'SMAW',
    weldGeometry: params.weldGeometry || 'butt',
    selectedDiameters,
    standardElectrodeLength,
  });

  return autoRows.map((row, idx) => ({
    id: Date.now() + idx,
    label: row.layerName,
    process: row.process,
    diameterMm: row.diameterMm,
    lengthMm: row.lengthMm ?? getDefaultLengthMm(row.process, row.diameterMm),
    passesCount: row.passesCount,
    torchGasLpm: row.torchGasLpm,
    purgeGasLpm: row.purgeGasLpm,
  }));
}