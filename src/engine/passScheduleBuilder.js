/**
 * Welding Consumable Calculator (WCC)
 * Calculation Engine Module 3: ASME WPS Pass & Layer Schedule Builder
 * Features:
 *   - Geometry-Driven 4-Layer Automatic Sequencing (Root, Hot, Fill & Cap)
 *   - ASME QW-410 Stringer Cap Width & Area Capacity Rules
 *   - Calibrated Heavy-Wall SMAW Narrow Root Fill (t >= 25 mm) & Uphill Weave Bead Area
 *   - SAW 3-Pass GTAW Buffer Protection (TSGI-PQR-CS-025)
 *   - Multi-Process Custom Stepped Pass Stacking Mode (Physical Cap Share Enforcement)
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
 * Compute required cap stringer pass count respecting ASME stringer widths & area capacity
 * - Continuous wire processes (GMAW, FCAW, SAW) lay wider weld pools (~9-12 mm)
 * - Stick/TIG stringers (SMAW, GTAW) lay ~2.0 * electrode/wire diameter (SS-004, AS-005)
 */
function computeCapPassCount({ capTotalWidth, areaCap, capProc, capDia, weldGeometry }) {
  const nominalBead = getNominalBeadArea(capProc, capDia);
  let wireBeadWidth;
  if (['GMAW', 'FCAW', 'SAW'].includes(capProc)) {
    const poolMultiplier = capProc === 'SAW' ? 4.0 : 2.5;
    wireBeadWidth = Math.max(capDia * 2.8, Math.sqrt(nominalBead * poolMultiplier));
  } else {
    wireBeadWidth = capDia * 2.0;
  }

  const effectiveMaxBeadWidth = Math.max(1.5, wireBeadWidth);
  const widthBasedRuns = Math.max(1, Math.ceil((capTotalWidth || effectiveMaxBeadWidth) / effectiveMaxBeadWidth));
  const singleSideRuns = Math.min(
    12,
    Math.max(widthBasedRuns, Math.ceil((areaCap / (weldGeometry === 'double_v' ? 2.0 : 1.0)) / (nominalBead * 1.35)))
  );
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
  const isVerticalUphill =
    speedCtx.posSpeedMult === 1.0 && speedCtx.effectiveDirectionMult === 1.0;

  const pushLayer = ({
    layerName,
    proc,
    dia,
    len,
    passesCount,
    areaShareMm2,
    isRootPass,
    isCapPass = false,
    isRootOrHotLayer,
  }) => {
    const pCount = Math.max(1, passesCount);
    const ratio = Math.max(0, areaShareMm2) / safeTotalArea;
    const rawNetGrams = geom.totalNetWeightGrams * ratio;
    const netWeightGrams = Math.round(rawNetGrams * 10) / 10;
    const { fillerClass, unit } = getProcessFillerMeta(proc, metallurgy);

    const speed = getProcessTravelSpeed(proc, dia, isRootPass, {
      ...speedCtx,
      isStainless: metallurgy.isStainless,
      isDuplex: metallurgy.isDuplex,
      isNickelAlloy: metallurgy.isNickelAlloy,
      isP9: metallurgy.isP9,
      isP11: metallurgy.isP11,
      isCapPass,
    });
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

  // 2B. Hot Pass (Pass 2)
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

  // 2B-2. SAW Backing Buffer Pass: Deposit 3rd GTAW pass (~6mm total TIG thickness) before high-amperage SAW
  let remainingFillArea = geom.areaFill;
  if (rProc === 'GTAW' && fProc === 'SAW' && geom.t >= 12.0 && remainingFillArea > 25.0) {
    const tigBufferArea = Math.min(remainingFillArea * 0.25, getNominalBeadArea('GTAW', rDia) * 1.4);
    remainingFillArea = Math.max(0, remainingFillArea - tigBufferArea);
    pushLayer({
      layerName: 'Groove Fill (TIG Buffer)',
      proc: 'GTAW',
      dia: rDia,
      len: rLen,
      passesCount: 1,
      areaShareMm2: tigBufferArea,
      isRootPass: false,
      isRootOrHotLayer: false,
    });
  }

  // 2C. Groove Fill (Deep Fill Ø2.50mm reserved for heavy walls t >= 25mm per AS-002 vs AS-005)
  if (remainingFillArea > 0.5) {
    const isHeavySmawButt = fProc === 'SMAW' && geom.t >= 25.0 && gasCtx.isGrooveButt;
    if (isHeavySmawButt) {
      const deepBead = getNominalBeadArea('SMAW', 2.50);
      const deepArea = Math.min(remainingFillArea * 0.12, deepBead * 1.35);
      const mainArea = Math.max(0, remainingFillArea - deepArea);
      const deepRuns = Math.max(1, Math.min(2, Math.round(deepArea / deepBead)));
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

      const mainNominalBead = getNominalBeadArea('SMAW', fDia);
      const weaveFactor =
        isVerticalUphill && geom.t >= 25.0 ? (geom.t >= 45.0 ? 1.65 : 1.20) : 1.0;
      const effectiveFillBead = mainNominalBead * weaveFactor;
      const mainRuns = Math.max(2, Math.round(mainArea / effectiveFillBead));

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
      const fillRuns = Math.max(1, Math.round(remainingFillArea / fillNominalBead));
      pushLayer({
        layerName: 'Groove Fill',
        proc: fProc,
        dia: fDia,
        len: fLen,
        passesCount: fillRuns,
        areaShareMm2: remainingFillArea,
        isRootPass: false,
        isRootOrHotLayer: false,
      });
    }
  }

  // 2D. Cap Cover (Actual parabolic reinforcement area + ASME stringer count)
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
      isCapPass: true,
      isRootOrHotLayer: false,
    });
  }

  return schedule;
}

/**
 * Detect whether a custom layer label denotes a Cap / Cover layer
 */
function isCapLayerLabel(label) {
  const s = (label || '').toLowerCase();
  return s.includes('cap') || s.includes('cover') || s.includes('kapak');
}

/**
 * Build Custom Stepped Pass Schedule from user-defined layers
 * Physically bounds Cap/Cover layers to geom.areaCap so stringer count does not steal groove body metal
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

  let sumCapNominalArea = 0;
  let sumBodyNominalArea = 0;
  let sumBodyGtawNominalArea = 0;
  let sumBodyFillNominalArea = 0;
  let allCustomAreGtaw = true;

  customPassGroups.forEach((grp) => {
    const pCount = parseInt(grp.passesCount, 10) || 1;
    const proc = String(grp.process || fillProcess || 'SMAW').toUpperCase();
    const dia = parseFloat(grp.diameterMm) || selectedDiameters[proc] || 3.25;
    const beadArea = getNominalBeadArea(proc, dia);
    const layerNominalArea = pCount * beadArea;
    const isCap = isCapLayerLabel(grp.label);

    if (proc !== 'GTAW') {
      allCustomAreGtaw = false;
    }

    if (isCap) {
      sumCapNominalArea += layerNominalArea;
    } else {
      sumBodyNominalArea += layerNominalArea;
      if (proc === 'GTAW') {
        sumBodyGtawNominalArea += layerNominalArea;
      } else {
        sumBodyFillNominalArea += layerNominalArea;
      }
    }
  });

  const hasPhysicalCapSplit =
    gasCtx.isGrooveButt &&
    geom.areaCap > 0.2 &&
    sumCapNominalArea > 0 &&
    sumBodyNominalArea > 0;

  const safeTotalArea = geom.totalCrossSectionAreaMm2 || 1.0;
  const physicalCapShare = hasPhysicalCapSplit
    ? Math.min(0.32, Math.max(0.12, geom.areaCap / safeTotalArea))
    : 0;
  const bodyTotalShare = 1.0 - physicalCapShare;

  const grooveBodyArea = hasPhysicalCapSplit
    ? Math.max(1.0, safeTotalArea - geom.areaCap)
    : safeTotalArea;

  const isHybridSparseGroove =
    gasCtx.isGrooveButt &&
    sumBodyGtawNominalArea > 0 &&
    sumBodyFillNominalArea > 0 &&
    sumBodyNominalArea < grooveBodyArea;

  const cappedGtawBodyFraction = isHybridSparseGroove
    ? Math.min(0.35, sumBodyGtawNominalArea / grooveBodyArea)
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
    const isCap = isCapLayerLabel(grp.label);

    let grpRatio = 0;
    if (hasPhysicalCapSplit && isCap) {
      grpRatio = (layerNominalArea / sumCapNominalArea) * physicalCapShare;
    } else if (isHybridSparseGroove) {
      const bodyFrac =
        proc === 'GTAW'
          ? (layerNominalArea / sumBodyGtawNominalArea) * cappedGtawBodyFraction
          : (layerNominalArea / sumBodyFillNominalArea) * (1.0 - cappedGtawBodyFraction);
      grpRatio = bodyFrac * bodyTotalShare;
    } else if (hasPhysicalCapSplit) {
      grpRatio = (layerNominalArea / sumBodyNominalArea) * bodyTotalShare;
    } else {
      const totalNominal = sumBodyNominalArea + sumCapNominalArea || 1.0;
      grpRatio = layerNominalArea / totalNominal;
    }

    const rawNetGrams = geom.totalNetWeightGrams * grpRatio;
    const grpNetGrams = Math.round(rawNetGrams * 10) / 10;
    const { fillerClass, unit } = getProcessFillerMeta(proc, metallurgy);

    const labelLower = (grp.label || '').toLowerCase();
    const isRoot =
      idx === 0 && (labelLower.includes('root') || labelLower.includes('kök'));
    const isRootOrHotLayer = currentPassIndex <= 2;

    const speed = getProcessTravelSpeed(proc, dia, isRoot, {
      ...speedCtx,
      isStainless: metallurgy.isStainless,
      isDuplex: metallurgy.isDuplex,
      isNickelAlloy: metallurgy.isNickelAlloy,
      isP9: metallurgy.isP9,
      isP11: metallurgy.isP11,
      isCapPass: isCap,
    });
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