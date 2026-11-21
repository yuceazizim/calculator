/**
 * Welding Consumable Calculator (WCC)
 * Calculation Engine Module 5: Consumable Accumulation, Shielding/Purge Gas & EPC Batch Scaling
 * Governing Document: WCC-SPEC-2026-REV01
 * Pure JavaScript (.js only)
 */

import {
  getUnitDepositWeightGrams,
  getRawUnitWeightGrams,
} from './processSpecs.js';

/**
 * Accumulate schedule rows, calculate single-joint consumables & gas,
 * and scale unrounded totals across project joint quantity
 */
export function aggregateConsumablesAndBatch({
  wpsPassSchedule,
  geom,
  metallurgy,
  gasCtx,
  selectedDiameters,
  standardElectrodeLength,
  scrapMultiplier,
  cylinderVolumeM3,
  jointQuantity,
  isFluxCoredTig,
}) {
  const qty = Math.max(1, parseInt(jointQuantity, 10) || 1);
  const selectedTigDia = selectedDiameters.GTAW || 2.4;
  const selectedSmawDia = selectedDiameters.SMAW || 3.25;
  const selectedGmawDia = selectedDiameters.GMAW || 1.0;
  const selectedFcawDia = selectedDiameters.FCAW || 1.2;
  const selectedSawDia = selectedDiameters.SAW || 2.5;

  let gtawNetGrams = 0;
  let smawNetGrams = 0;
  let gmawNetGrams = 0;
  let fcawNetGrams = 0;
  let sawNetGrams = 0;

  let rawGtawGrams = 0;
  let rawSmawGrams = 0;
  let rawGmawGrams = 0;
  let rawFcawGrams = 0;
  let rawSawGrams = 0;

  let exactTigRodsFloat = 0;
  let exactTigGrossGrams = 0;
  let exactSmawElectrodesFloat = 0;
  const usedTigDias = new Set();
  const usedSmawDias = new Set();
  const usedSmawSpecs = new Set();
  const usedSmawLens = new Set();

  let totalArcTimeMinutes = 0;
  let rawTotalArcMinutes = 0;
  let totalPassesCount = 0;
  let maxHeatInputKjMm = 0;
  let weightedHeatInputSum = 0;

  wpsPassSchedule.forEach((row) => {
    totalPassesCount += row.passesCount;
    totalArcTimeMinutes += row.arcTimeMinutes || 0;
    rawTotalArcMinutes += row.rawArcTimeMinutes || row.arcTimeMinutes || 0;

    if (row.heatInputKjMm) {
      maxHeatInputKjMm = Math.max(maxHeatInputKjMm, row.heatInputKjMm);
      weightedHeatInputSum += row.heatInputKjMm * row.passesCount;
    }

    const rowDia = row.diameterMm || selectedDiameters[row.process] || selectedSmawDia;
    const rowLen = row.lengthMm || (row.process === 'GTAW' ? 1000.0 : standardElectrodeLength);
    const rowRawGrams = row.rawNetWeightGrams || row.netWeightGrams;

    if (row.process === 'GTAW') {
      gtawNetGrams += row.netWeightGrams;
      rawGtawGrams += rowRawGrams;

      usedTigDias.add(Number(rowDia).toFixed(1));
      const unitDep = getUnitDepositWeightGrams('GTAW', rowDia, rowLen, {
        isNickelAlloy: metallurgy.isNickelAlloy,
        isStainless: metallurgy.isStainless,
        isFluxCoredTig,
      });
      const rawRodMass = getRawUnitWeightGrams('GTAW', rowDia, rowLen, {
        isNickelAlloy: metallurgy.isNickelAlloy,
        isStainless: metallurgy.isStainless,
        isFluxCoredTig,
      });
      const rowExactPieces = (rowRawGrams * scrapMultiplier) / unitDep;
      exactTigRodsFloat += rowExactPieces;
      exactTigGrossGrams += rowExactPieces * rawRodMass;
      row.pieceCount = Math.max(1, Math.round(rowExactPieces));
    } else if (row.process === 'SMAW') {
      smawNetGrams += row.netWeightGrams;
      rawSmawGrams += rowRawGrams;

      usedSmawDias.add(Number(rowDia).toFixed(2));
      usedSmawLens.add(Math.round(rowLen));
      usedSmawSpecs.add(`Ø ${Number(rowDia).toFixed(2)}×${Math.round(rowLen)}`);

      const unitDep = getUnitDepositWeightGrams('SMAW', rowDia, rowLen, {
        isNickelAlloy: metallurgy.isNickelAlloy,
        isStainless: metallurgy.isStainless,
      });
      const rowExactPieces = (rowRawGrams * scrapMultiplier) / unitDep;
      exactSmawElectrodesFloat += rowExactPieces;
      row.pieceCount = Math.max(1, Math.round(rowExactPieces));
    } else if (row.process === 'GMAW') {
      gmawNetGrams += row.netWeightGrams;
      rawGmawGrams += rowRawGrams;
      row.pieceCount = Math.round(((row.netWeightGrams * scrapMultiplier) / 1000.0) * 100) / 100;
    } else if (row.process === 'FCAW') {
      fcawNetGrams += row.netWeightGrams;
      rawFcawGrams += rowRawGrams;
      row.pieceCount = Math.round(((row.netWeightGrams * scrapMultiplier) / 1000.0) * 100) / 100;
    } else if (row.process === 'SAW') {
      sawNetGrams += row.netWeightGrams;
      rawSawGrams += rowRawGrams;
      row.pieceCount = Math.round(((row.netWeightGrams * scrapMultiplier) / 1000.0) * 100) / 100;
    }
  });

  const avgHeatInputKjMm =
    totalPassesCount > 0 ? Math.round((weightedHeatInputSum / totalPassesCount) * 100) / 100 : 0;

  const tigRodsCalculated = gtawNetGrams > 0 ? Math.ceil(exactTigRodsFloat) : 0;
  const smawElectrodesCalculated = smawNetGrams > 0 ? Math.ceil(exactSmawElectrodesFloat) : 0;

  const usedTigArr = Array.from(usedTigDias);
  const usedSmawArr = Array.from(usedSmawDias);
  const usedSmawSpecsArr = Array.from(usedSmawSpecs);
  const usedSmawLensArr = Array.from(usedSmawLens);

  const effectiveTigDia = usedTigArr.length === 1 ? parseFloat(usedTigArr[0]) : selectedTigDia;
  const effectiveTigLabel =
    usedTigArr.length > 0 ? `${usedTigArr.map((d) => `Ø ${d}`).join(' / ')} mm` : `Ø ${selectedTigDia} mm`;

  const effectiveSmawDia = usedSmawArr.length === 1 ? parseFloat(usedSmawArr[0]) : selectedSmawDia;
  const effectiveSmawLen = usedSmawLensArr.length === 1 ? usedSmawLensArr[0] : standardElectrodeLength;
  const hasMixedSmawSpecs =
    usedSmawSpecsArr.length > 1 ||
    (usedSmawLensArr.length === 1 && usedSmawLensArr[0] !== Math.round(standardElectrodeLength));
  const effectiveSmawLabel = hasMixedSmawSpecs
    ? `${usedSmawSpecsArr.join(' / ')} mm`
    : (usedSmawArr.length > 0
      ? `${usedSmawArr.map((d) => `Ø ${d}`).join(' / ')} mm × ${Math.round(effectiveSmawLen)} mm`
      : `Ø ${selectedSmawDia} mm × ${Math.round(standardElectrodeLength)} mm`);

  // Single-joint gross weights (consistent with exact rod/electrode physics)
  const tigActive = gtawNetGrams > 0;
  const tigGrossWeightGrams = tigActive ? Math.round(exactTigGrossGrams * 10) / 10 : 0;

  const smawActive = smawNetGrams > 0;
  // Covered electrode box-to-weld efficiency (~57% accounting for flux coating, 50mm stub & spatter)
  const smawEfficiency = 0.57;
  const smawGrossWeightGrams = smawActive
    ? Math.round(((smawNetGrams * scrapMultiplier) / smawEfficiency) * 10) / 10
    : 0;

  const gmawActive = gmawNetGrams > 0;
  const gmawGrossWeightKg = gmawActive
    ? Math.round((((gmawNetGrams * scrapMultiplier) / 0.88) / 1000.0) * 100) / 100
    : 0;

  const fcawActive = fcawNetGrams > 0;
  const fcawGrossWeightKg = fcawActive
    ? Math.round((((fcawNetGrams * scrapMultiplier) / 0.85) / 1000.0) * 100) / 100
    : 0;

  const sawActive = sawNetGrams > 0;
  const sawWireWeightKg = sawActive
    ? Math.round((((sawNetGrams * scrapMultiplier) / 0.99) / 1000.0) * 100) / 100
    : 0;
  const sawFluxWeightKg = sawActive ? Math.round((sawWireWeightKg * 1.10) * 100) / 100 : 0;

  // Shielding & Purge Gas Calculation (Per-Pass Flow Aware)
  const shopLossSurgeFactor = 1.20;
  let rawTorchGasLiters = 0;
  let rawTorchGasAccum = 0;
  let rawPurgeWeldingLiters = 0;
  let dispPurgeWeldingLiters = 0;
  let hasAnyPurgeLayer = false;

  wpsPassSchedule.forEach((row) => {
    const rowRawArcMin = row.rawArcTimeMinutes || row.arcTimeMinutes || 0;
    const rowDispArcMin = row.arcTimeMinutes || 0;
    const rowTorchLpm = Number(row.torchGasLpm) || 0;
    const rowPurgeLpm = Number(row.purgeGasLpm) || 0;

    if (rowTorchLpm > 0) {
      rawTorchGasLiters += rowRawArcMin * rowTorchLpm * shopLossSurgeFactor;
      rawTorchGasAccum += rowDispArcMin * rowTorchLpm * shopLossSurgeFactor;
    }

    if (rowPurgeLpm > 0) {
      hasAnyPurgeLayer = true;
      rawPurgeWeldingLiters += rowRawArcMin * rowPurgeLpm;
      dispPurgeWeldingLiters += rowDispArcMin * rowPurgeLpm;
    }
  });

  const torchGasLiters = Math.round(rawTorchGasAccum * 10) / 10;

  let purgeGasLiters = 0;
  let rawPurgeGasLiters = 0;
  let purgeGasApplied = false;

  if (gasCtx.isPurgeAllowed && hasAnyPurgeLayer) {
    purgeGasApplied = true;
    const innerDiameterMm = Math.max(1, geom.od - 2.0 * geom.t);
    const innerRadiusCm = innerDiameterMm / 10.0 / 2.0;
    const purgeDamDistanceCm = 40.0;
    const vDamLiter = Math.PI * innerRadiusCm * innerRadiusCm * purgeDamDistanceCm * 0.001;

    rawPurgeGasLiters = (4.0 * vDamLiter + rawPurgeWeldingLiters) * 1.15;
    purgeGasLiters = Math.round((4.0 * vDamLiter + dispPurgeWeldingLiters) * 1.15 * 10) / 10;
  }

  const totalGasLiters = Math.round((torchGasLiters + purgeGasLiters) * 10) / 10;
  const cylVolM3 = parseFloat(cylinderVolumeM3) || 6.0;
  const cylinderCapacityLiters = cylVolM3 * 1000.0;
  const cylinderPressureBar = cylVolM3 >= 9.5 ? 200 : 150;
  const cylindersRequired =
    totalGasLiters > 0 ? totalGasLiters / (cylinderCapacityLiters * 0.95) : 0;

  // EPC Project Batch Totals (Unrounded Multiplication)
  const projNetWeightKg = (geom.totalNetWeightGrams * qty) / 1000.0;
  const projNetWeightTons = projNetWeightKg / 1000.0;
  const projTotalSeamMeters = (geom.seamLengthMm * qty) / 1000.0;

  const projTigNetKg = (rawGtawGrams * qty) / 1000.0;
  const projTigGrossKg = (exactTigGrossGrams * qty) / 1000.0;
  const projTigRods = tigActive ? Math.ceil(exactTigRodsFloat * qty) : 0;
  const projTigBoxes5Kg = tigActive ? Math.ceil(projTigGrossKg / 5.0) : 0;

  const projSmawNetKg = (rawSmawGrams * qty) / 1000.0;
  const projSmawGrossKg = (rawSmawGrams * qty * scrapMultiplier / smawEfficiency) / 1000.0;
  const projSmawElectrodes = smawActive ? Math.ceil(exactSmawElectrodesFloat * qty) : 0;
  const projSmawBoxes = smawActive ? Math.ceil(projSmawGrossKg / 4.5) : 0;

  const projGmawGrossKg = (rawGmawGrams * qty * scrapMultiplier / 0.88) / 1000.0;
  const projGmawSpools15Kg = gmawActive ? Math.ceil(projGmawGrossKg / 15.0) : 0;

  const projFcawGrossKg = (rawFcawGrams * qty * scrapMultiplier / 0.85) / 1000.0;
  const projFcawSpools15Kg = fcawActive ? Math.ceil(projFcawGrossKg / 15.0) : 0;

  const projSawWireKg = (rawSawGrams * qty * scrapMultiplier / 0.99) / 1000.0;
  const projSawFluxKg = projSawWireKg * 1.10;
  const projSawWireSpools25Kg = sawActive ? Math.ceil(projSawWireKg / 25.0) : 0;
  const projSawFluxBags25Kg = sawActive ? Math.ceil(projSawFluxKg / 25.0) : 0;

  const projTorchGasLiters = rawTorchGasLiters * qty;
  const projPurgeGasLiters = rawPurgeGasLiters * qty;
  const projTotalGasLiters = projTorchGasLiters + projPurgeGasLiters;
  const projTotalGasM3 = projTotalGasLiters / 1000.0;
  const projCylinders =
    projTotalGasLiters > 0 ? Math.ceil(projTotalGasLiters / (cylinderCapacityLiters * 0.95)) : 0;

  const projArcTimeMinutes = rawTotalArcMinutes * qty;
  const projArcTimeHours = projArcTimeMinutes / 60.0;
  const projArcShifts8h = projArcTimeHours / 8.0;

  return {
    effectiveDiameters: {
      effectiveTigDia,
      effectiveSmawDia,
      effectiveSmawLen,
    },
    consumables: {
      tig: {
        active: tigActive,
        awsClass: metallurgy.defaultTigClass,
        netWeightGrams: Math.round(gtawNetGrams * 10) / 10,
        grossWeightGrams: tigGrossWeightGrams,
        grossWeightKg: Math.round((tigGrossWeightGrams / 1000.0) * 100) / 100,
        rodsCount: tigRodsCalculated,
        selectedDiameterMm: effectiveTigDia,
        diameterLabel: effectiveTigLabel,
        standardLengthMm: 1000.0,
        isFluxCored: isFluxCoredTig,
      },
      smaw: {
        active: smawActive,
        awsClass: metallurgy.defaultSmawClass,
        netWeightGrams: Math.round(smawNetGrams * 10) / 10,
        grossWeightGrams: smawGrossWeightGrams,
        grossWeightKg: Math.round((smawGrossWeightGrams / 1000.0) * 100) / 100,
        electrodesCount: smawElectrodesCalculated,
        selectedDiameterMm: effectiveSmawDia,
        diameterLabel: effectiveSmawLabel,
        selectedLengthMm: effectiveSmawLen,
        includesLengthInLabel: true,
        efficiencyPercent: Math.round(smawEfficiency * 100),
      },
      gmaw: {
        active: gmawActive,
        awsClass: metallurgy.defaultGmawClass,
        spoolWeightKg: gmawGrossWeightKg,
        spoolsCount: Math.ceil(gmawGrossWeightKg / 15.0),
        recommendedDiameterMm: selectedGmawDia,
      },
      fcaw: {
        active: fcawActive,
        awsClass: metallurgy.defaultFcawClass,
        spoolWeightKg: fcawGrossWeightKg,
        spoolsCount: Math.ceil(fcawGrossWeightKg / 15.0),
        recommendedDiameterMm: selectedFcawDia,
      },
      saw: {
        active: sawActive,
        wireAwsClass: 'EH12K',
        wireWeightKg: sawWireWeightKg,
        fluxTradeName: 'OK Flux 10.62',
        fluxWeightKg: sawFluxWeightKg,
        recommendedWireDiaMm: selectedSawDia,
      },
    },
    productivity: {
      estimatedPassCount: totalPassesCount,
      totalArcTimeMinutes: Math.round(totalArcTimeMinutes * 10) / 10,
      totalArcTimeHours: Math.round((totalArcTimeMinutes / 60.0) * 100) / 100,
      avgHeatInputKjMm,
      maxHeatInputKjMm: Math.round(maxHeatInputKjMm * 100) / 100,
    },
    shieldingGas: {
      torchGasFlowRateLpm: gasCtx.defaultTorchFlow,
      purgeGasFlowRateLpm: gasCtx.defaultPurgeFlow,
      purgeStrategy: gasCtx.normalizedPurgeStrategy,
      torchGasLiters,
      purgeGasLiters,
      purgeGasApplied,
      totalGasLiters,
      cylinderVolumeM3: cylVolM3,
      cylinderPressureBar,
      cylinderCapacityLiters,
      cylindersRequired: Math.round(cylindersRequired * 100) / 100,
    },
    projectTotals: {
      jointQuantity: qty,
      totalSeamMeters: Math.round(projTotalSeamMeters * 10) / 10,
      netWeldWeightKg: Math.round(projNetWeightKg * 100) / 100,
      netWeldWeightTons: Math.round(projNetWeightTons * 1000) / 1000,
      tig: {
        active: tigActive,
        diameterLabel: effectiveTigLabel,
        netWeightKg: Math.round(projTigNetKg * 100) / 100,
        grossWeightKg: Math.round(projTigGrossKg * 100) / 100,
        rodsCount: projTigRods,
        boxes5KgCount: projTigBoxes5Kg,
      },
      smaw: {
        active: smawActive,
        diameterLabel: effectiveSmawLabel,
        netWeightKg: Math.round(projSmawNetKg * 100) / 100,
        grossWeightKg: Math.round(projSmawGrossKg * 100) / 100,
        electrodesCount: projSmawElectrodes,
        boxesCount: projSmawBoxes,
      },
      gmaw: {
        active: gmawActive,
        grossWeightKg: Math.round(projGmawGrossKg * 100) / 100,
        spools15KgCount: projGmawSpools15Kg,
      },
      fcaw: {
        active: fcawActive,
        grossWeightKg: Math.round(projFcawGrossKg * 100) / 100,
        spools15KgCount: projFcawSpools15Kg,
      },
      saw: {
        active: sawActive,
        wireWeightKg: Math.round(projSawWireKg * 100) / 100,
        fluxWeightKg: Math.round(projSawFluxKg * 100) / 100,
        wireSpools25KgCount: projSawWireSpools25Kg,
        fluxBags25KgCount: projSawFluxBags25Kg,
      },
      gas: {
        torchGasLiters: Math.round(projTorchGasLiters),
        purgeGasLiters: Math.round(projPurgeGasLiters),
        totalGasLiters: Math.round(projTotalGasLiters),
        totalGasM3: Math.round(projTotalGasM3 * 100) / 100,
        cylindersRequired: projCylinders,
      },
      productivity: {
        totalArcTimeMinutes: Math.round(projArcTimeMinutes),
        totalArcTimeHours: Math.round(projArcTimeHours * 10) / 10,
        totalArcShifts8h: Math.round(projArcShifts8h * 10) / 10,
      },
    },
  };
}