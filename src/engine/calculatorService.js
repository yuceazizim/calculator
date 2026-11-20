/**
 * Welding Consumable Calculator (WCC)
 * Core Engineering Calculation Orchestrator
 * Standards: ASME Sec. IX • ASME B31.3 • ASME B16.11 • ASME B36.10M • AWS D1.1 • EN ISO 15614-1
 * Governing Document: WCC-SPEC-2026-REV01 Master Benchmark Manual
 * Pure JavaScript (.js only)
 */

import { calculateWeldGeometry } from './geometryCalculator.js';
import {
  resolveMetallurgyProfile,
  getPositionMultipliers,
} from './processSpecs.js';
import {
  buildGasPolicyContext,
  buildWpsPassSchedule,
} from './passScheduleBuilder.js';
import { aggregateConsumablesAndBatch } from './batchAggregator.js';
import { buildThermalAdvisory } from './thermalAdvisory.js';

export class CalculatorService {
  static calculate(params = {}) {
    const {
      jointType = 'pipe',
      weldGeometry = 'butt',
      jointQuantity = 1,
      materialGroup = 'Carbon Steel',
      requiresBackingGas = false,
      isFluxCoredTig = false,
      rootProcess = 'GTAW',
      fillProcess = 'SMAW',
      customPassGroups = null,
      cylinderVolumeM3 = 6.0,
      weldPosition = 'vertical_fixed',
      travelDirection = 'uphill',
      filletSizeType = 'throat',
      filletSides = 'single',
      includeShopScrap = true,
      gasFlowRateLpm,
      purgeGasFlowRateLpm,
      purgeStrategy = 'auto',
      tigWireDiaMm,
      smawElectrodeDiaMm,
      smawLengthMm,
      gmawWireDiaMm,
      fcawWireDiaMm,
      sawWireDiaMm,
    } = params;

    const qty = Math.max(1, parseInt(jointQuantity, 10) || 1);
    const scrapMultiplier = includeShopScrap ? 1.15 : 1.00;

    // 1. Weld Joint Geometry, Volume & Net Deposit Weight (1x Joint)
    const geom = calculateWeldGeometry(params);

    // 2. Base Material Metallurgy & Filler Class Resolution
    const metallurgy = resolveMetallurgyProfile({
      materialGroup,
      density: geom.density,
      isFluxCoredTig: Boolean(isFluxCoredTig),
    });

    // 3. Position & Travel Direction Multipliers
    const {
      normalizedPosition,
      posSpeedMult,
      effectiveDirectionMult,
    } = getPositionMultipliers(weldPosition, travelDirection);

    const speedCtx = {
      isPipe: geom.isPipe,
      t: geom.t,
      posSpeedMult,
      effectiveDirectionMult,
    };

    // 4. Consumable Sizing & Gas Policy Context
    const selectedDiameters = {
      GTAW: parseFloat(tigWireDiaMm) || 2.4,
      SMAW: parseFloat(smawElectrodeDiaMm) || 3.25,
      GMAW: parseFloat(gmawWireDiaMm) || 1.0,
      FCAW: parseFloat(fcawWireDiaMm) || 1.2,
      SAW: parseFloat(sawWireDiaMm) || 2.5,
    };
    const standardElectrodeLength = parseFloat(smawLengthMm) || 350.0;

    const gasCtx = buildGasPolicyContext({
      isPipe: geom.isPipe,
      weldGeometry,
      requiresBackingGas,
      isFluxCoredTig,
      gasFlowRateLpm,
      purgeGasFlowRateLpm,
      purgeStrategy,
      t: geom.t,
      rootProcess,
    });

    // 5. Build ASME WPS Pass & Layer Schedule (Auto or Custom Stepped Mode)
    const wpsPassSchedule = buildWpsPassSchedule({
      customPassGroups,
      geom,
      metallurgy,
      speedCtx,
      gasCtx,
      rootProcess,
      fillProcess,
      weldGeometry,
      selectedDiameters,
      standardElectrodeLength,
    });

    // 6. Per-Row Consumable Accumulation, Shielding/Purge Gas & EPC Batch Scaling
    const {
      effectiveDiameters,
      consumables,
      productivity,
      shieldingGas,
      projectTotals,
    } = aggregateConsumablesAndBatch({
      wpsPassSchedule,
      geom,
      metallurgy,
      gasCtx,
      selectedDiameters,
      standardElectrodeLength,
      scrapMultiplier,
      cylinderVolumeM3,
      jointQuantity: qty,
      isFluxCoredTig: Boolean(isFluxCoredTig),
    });

    // 7. Heat Treatment, Preheat & Max Interpass Advisory
    const heatTreatment = buildThermalAdvisory(metallurgy, geom.t);

    const gtawNetGrams = consumables.tig.netWeightGrams || 0;
    const hasCustomGroups =
      Array.isArray(customPassGroups) && customPassGroups.length > 0;

    return {
      inputSummary: {
        jointType,
        weldGeometry,
        jointQuantity: qty,
        materialGroup,
        densityGPerCm3: geom.density,
        wallThicknessMm: geom.t,
        pipeOdMm: geom.isPipe ? geom.od : null,
        seamLengthMm: Math.round(geom.seamLengthMm * 10) / 10,
        meanDiameterMm: Math.round(geom.meanDiameterMm * 10) / 10,
        bevelAngleDeg: geom.angleDeg,
        rootGapMm: geom.g,
        rootFaceMm: geom.f,
        capHeightMm: geom.c,
        filletSizeType,
        filletSizeMm: geom.parsedFilletSize,
        filletSides,
        requiresBackingGas: Boolean(requiresBackingGas),
        isFluxCoredTig: Boolean(isFluxCoredTig),
        rootProcess,
        fillProcess,
        weldPosition: normalizedPosition,
        travelDirection,
        gasFlowRateLpm: gasCtx.defaultTorchFlow,
        purgeGasFlowRateLpm: gasCtx.defaultPurgeFlow,
        purgeStrategy: gasCtx.normalizedPurgeStrategy,
        cylinderVolumeM3: shieldingGas.cylinderVolumeM3,
        selectedTigDia: effectiveDiameters.effectiveTigDia,
        selectedSmawDia: effectiveDiameters.effectiveSmawDia,
        selectedSmawLen: effectiveDiameters.effectiveSmawLen,
        selectedGmawDia: selectedDiameters.GMAW,
        selectedFcawDia: selectedDiameters.FCAW,
        selectedSawDia: selectedDiameters.SAW,
        includeShopScrap: Boolean(includeShopScrap),
        useCustomPassSequencing: hasCustomGroups,
      },
      customPassGroups: hasCustomGroups ? customPassGroups : null,
      geometry: {
        crossSectionAreaMm2: Math.round(geom.totalCrossSectionAreaMm2 * 100) / 100,
        weldVolumeCm3: Math.round(geom.totalVolumeCm3 * 100) / 100,
        totalNetWeldWeightKg: Math.round(geom.totalNetWeightKg * 1000) / 1000,
        totalNetWeldWeightGrams: Math.round(geom.totalNetWeightGrams * 10) / 10,
        rootWeightGrams: Math.round(gtawNetGrams * 10) / 10,
        fillWeightGrams:
          Math.round((geom.totalNetWeightGrams - gtawNetGrams) * 10) / 10,
      },
      consumables,
      wpsPassSchedule,
      productivity,
      shieldingGas,
      projectTotals,
      heatTreatment,
    };
  }
}

export default CalculatorService;