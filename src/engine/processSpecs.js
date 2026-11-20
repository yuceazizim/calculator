/**
 * Welding Consumable Calculator (WCC)
 * Calculation Engine Module 2: Process Physics, Metallurgy Classifications, Speed & Heat Input
 * Covers: GTAW (141), SMAW (111), GMAW (135), FCAW (136), SAW (121)
 * Standards: ASME Sec. IX • AWS A5.X • EN ISO 15614-1
 * Governing Document: WCC-SPEC-2026-REV01
 * Pure JavaScript (.js only)
 */

/**
 * Determine base metal metallurgy family & default AWS filler classifications
 */
export function resolveMetallurgyProfile({ materialGroup = 'Carbon Steel', density = 7.85, isFluxCoredTig = false }) {
  const isStainless = materialGroup.includes('Stainless') || (density >= 7.95 && density <= 8.10);
  const isNickelAlloy = materialGroup.includes('Nickel') || density > 8.20;
  const isDuplex = materialGroup.includes('Duplex');
  const isP11 = materialGroup.includes('P11') || materialGroup.includes('1.25Cr');
  const isP9 = materialGroup.includes('P9') || materialGroup.includes('9Cr');
  const isLowTemp = materialGroup.includes('Low Temp') || materialGroup.includes('A333');

  let defaultTigClass = 'ER70S-6';
  if (isStainless) defaultTigClass = isFluxCoredTig ? 'TG-X316L (Flux-Cored)' : 'ER316L';
  else if (isP11) defaultTigClass = 'ER80S-B2';
  else if (isP9) defaultTigClass = 'ER80S-B8';
  else if (isDuplex) defaultTigClass = 'ER2209';
  else if (isNickelAlloy) defaultTigClass = 'ERNiCr-3 (Inconel 82)';

  let defaultSmawClass = 'E7018-1 H4R';
  if (isStainless) defaultSmawClass = 'E316L-17 / E308L-17';
  else if (isDuplex) defaultSmawClass = 'E2209-17';
  else if (isP11) defaultSmawClass = 'E8018-B2 H4R';
  else if (isP9) defaultSmawClass = 'E8015-B8';
  else if (isNickelAlloy) defaultSmawClass = 'ENiCrFe-3 (Inconel 182)';

  const defaultGmawClass = isStainless ? 'ER316L' : (isNickelAlloy ? 'ERNiCr-3' : 'ER70S-6');
  const defaultFcawClass = isStainless ? 'E316LT1-1' : (isDuplex ? 'E2209T1-1' : 'E71T-1C');

  return {
    isStainless,
    isNickelAlloy,
    isDuplex,
    isP11,
    isP9,
    isLowTemp,
    defaultTigClass,
    defaultSmawClass,
    defaultGmawClass,
    defaultFcawClass,
  };
}

/**
 * Resolve welding position speed multiplier & vertical travel direction multiplier
 */
export function getPositionMultipliers(weldPosition = 'vertical_fixed', travelDirection = 'uphill') {
  const normalizedPosition = ['flat', 'horizontal', 'vertical_fixed', 'overhead'].includes(weldPosition)
    ? weldPosition
    : 'vertical_fixed';

  let posSpeedMult = 1.0;
  switch (normalizedPosition) {
    case 'flat':
      posSpeedMult = 1.20; // 1G / 1F
      break;
    case 'horizontal':
      posSpeedMult = 1.05; // 2G / 2F
      break;
    case 'overhead':
      posSpeedMult = 0.90; // 4G / 4F
      break;
    case 'vertical_fixed':
    default:
      posSpeedMult = 1.00; // 3G / 3F / 5G / 6G (PQR Base Calibration)
      break;
  }

  const effectiveDirectionMult =
    normalizedPosition === 'vertical_fixed' && travelDirection === 'downhill' ? 2.2 : 1.0;

  return {
    normalizedPosition,
    posSpeedMult,
    effectiveDirectionMult,
  };
}

/**
 * True if process uses torch shielding gas
 */
export function isGasShieldedProcess(proc) {
  return ['GTAW', 'GMAW', 'FCAW'].includes(String(proc || '').toUpperCase());
}

/**
 * Default rod/electrode length in mm for a given process & diameter
 */
export function getDefaultLengthMm(proc, dia) {
  const p = String(proc || 'SMAW').toUpperCase();
  const d = parseFloat(dia) || 3.25;
  if (p === 'GTAW') return 1000;
  if (p === 'SMAW') {
    if (d <= 2.50) return 300;
    if (d >= 4.00) return 450;
    return 350;
  }
  return null;
}

/**
 * ASME 3xd diameter options for any process
 */
export function getDiameterOptions(process) {
  const proc = String(process || 'SMAW').toUpperCase();
  if (proc === 'GTAW') {
    return [
      { value: 1.60, label: 'Ø 1.60 mm (≤ 4.8 mm)' },
      { value: 2.00, label: 'Ø 2.00 mm (≤ 6.0 mm)' },
      { value: 2.40, label: 'Ø 2.40 mm (≤ 7.2 mm)' },
      { value: 3.20, label: 'Ø 3.20 mm (≤ 9.6 mm)' },
    ];
  }
  if (proc === 'GMAW') {
    return [
      { value: 0.80, label: 'Ø 0.80 mm (≤ 2.4 mm)' },
      { value: 1.00, label: 'Ø 1.00 mm (≤ 3.0 mm)' },
      { value: 1.20, label: 'Ø 1.20 mm (≤ 3.6 mm)' },
      { value: 1.60, label: 'Ø 1.60 mm (≤ 4.8 mm)' },
    ];
  }
  if (proc === 'FCAW') {
    return [
      { value: 1.00, label: 'Ø 1.00 mm (≤ 3.0 mm)' },
      { value: 1.20, label: 'Ø 1.20 mm (≤ 3.6 mm)' },
      { value: 1.40, label: 'Ø 1.40 mm (≤ 4.2 mm)' },
      { value: 1.60, label: 'Ø 1.60 mm (≤ 4.8 mm)' },
    ];
  }
  if (proc === 'SAW') {
    return [
      { value: 2.50, label: 'Ø 2.50 mm (≤ 7.5 mm)' },
      { value: 3.20, label: 'Ø 3.20 mm (≤ 9.6 mm)' },
      { value: 4.00, label: 'Ø 4.00 mm (≤ 12.0 mm)' },
    ];
  }
  return [
    { value: 2.00, label: 'Ø 2.00 mm (≤ 6.0 mm)' },
    { value: 2.50, label: 'Ø 2.50 mm (≤ 7.5 mm)' },
    { value: 3.25, label: 'Ø 3.25 mm (≤ 9.7 mm)' },
    { value: 4.00, label: 'Ø 4.00 mm (≤ 12.0 mm)' },
    { value: 5.00, label: 'Ø 5.00 mm (≤ 15.0 mm)' },
  ];
}

/**
 * Calibrated net deposit weight per piece (rod or electrode) accounting for 50mm SMAW stub loss
 */
export function getUnitDepositWeightGrams(
  proc,
  dia,
  electrodeLenMm,
  { isNickelAlloy = false, isStainless = false, isFluxCoredTig = false } = {}
) {
  if (proc === 'GTAW') {
    const rodLenRatio = (parseFloat(electrodeLenMm) || 1000.0) / 1000.0;
    let baseTig = 33.0;
    if (dia <= 1.6) baseTig = isNickelAlloy ? 15.3 : 14.2;
    else if (dia <= 2.0) baseTig = isNickelAlloy ? 23.9 : 22.2;
    else if (dia <= 2.4) {
      baseTig = isFluxCoredTig ? 30.5 : (isNickelAlloy ? 35.0 : (isStainless ? 33.5 : 33.0));
    } else {
      baseTig = isNickelAlloy ? 61.5 : 57.0;
    }
    return baseTig * rodLenRatio;
  }

  if (proc === 'SMAW') {
    const stubLossMm = 50.0;
    const chosenLen = parseFloat(electrodeLenMm) || 350.0;
    const activeLenMm = Math.max(100.0, chosenLen - stubLossMm);

    let baseDeposit = 22.5;
    let refTotalLenMm = 350.0;

    if (dia <= 2.0) {
      baseDeposit = 7.5;
      refTotalLenMm = 300.0;
    } else if (dia <= 2.50) {
      baseDeposit = (isStainless || isNickelAlloy) ? 11.2 : 13.8;
      refTotalLenMm = (isStainless || isNickelAlloy) ? 300.0 : 350.0;
    } else if (dia <= 3.25) {
      baseDeposit = (isStainless || isNickelAlloy) ? 21.8 : 22.5;
      refTotalLenMm = 350.0;
    } else if (dia <= 4.00) {
      baseDeposit = (isStainless || isNickelAlloy) ? 33.5 : 44.0;
      refTotalLenMm = (isStainless || isNickelAlloy) ? 350.0 : 450.0;
    } else {
      baseDeposit = 68.0;
      refTotalLenMm = 450.0;
    }

    const refActiveLenMm = Math.max(100.0, refTotalLenMm - stubLossMm);
    return baseDeposit * (activeLenMm / refActiveLenMm);
  }

  return 1.0;
}

/**
 * Nominal single-pass cross-sectional bead area (mm²) per process and diameter
 */
export function getNominalBeadArea(proc, dia) {
  if (proc === 'GTAW') {
    return (dia <= 1.6) ? 7.0 : (dia <= 2.0 ? 9.0 : (dia <= 2.4 ? 11.5 : 16.0));
  }
  if (proc === 'SMAW') {
    return (dia <= 2.50) ? 16.5 : (dia <= 3.25 ? 26.0 : (dia <= 4.0 ? 40.0 : 60.0));
  }
  if (proc === 'GMAW') {
    if (dia <= 0.85) return 14.0;
    if (dia <= 1.05) return 18.0;
    if (dia <= 1.25) return 25.0;
    return 34.0;
  }
  if (proc === 'FCAW') {
    if (dia <= 1.05) return 18.0;
    if (dia <= 1.25) return 25.0;
    if (dia <= 1.45) return 30.0;
    return 35.0;
  }
  if (proc === 'SAW') {
    if (dia <= 2.60) return 55.0;
    if (dia <= 3.30) return 75.0;
    return 95.0;
  }
  return 20.0;
}

/**
 * Calibrated travel speed (mm/min) per process, diameter, pipe/plate & position
 */
export function getProcessTravelSpeed(
  proc,
  dia,
  isRootPass = false,
  { isPipe = true, t = 10, posSpeedMult = 1.0, effectiveDirectionMult = 1.0 } = {}
) {
  const speedMult = posSpeedMult * effectiveDirectionMult;
  if (proc === 'GTAW') {
    const gtawRootSpeed = isPipe ? 37.5 : 60.0;
    return (isRootPass ? gtawRootSpeed : 88.0) * speedMult;
  }
  if (proc === 'SMAW') {
    const heavyPlate40Speed = t >= 35.0 ? 85.0 : 110.0;
    return (dia <= 2.50 ? 85.0 : (dia <= 3.25 ? 90.0 : heavyPlate40Speed)) * speedMult;
  }
  if (proc === 'GMAW') {
    return (isRootPass ? 70.0 : 140.0) * speedMult;
  }
  if (proc === 'FCAW') {
    return (isRootPass ? 160.0 : 225.0) * speedMult;
  }
  if (proc === 'SAW') {
    return 500.0; // Mechanized 1G process
  }
  return 90.0 * speedMult;
}

/**
 * EN ISO 15614-1 Thermal Efficiency Factor (k)
 */
export function getThermalEfficiencyK(proc) {
  switch (proc) {
    case 'GTAW': return 0.60;
    case 'SMAW': return 0.80;
    case 'GMAW': return 0.80;
    case 'FCAW': return 0.80;
    case 'SAW':  return 1.00;
    default:     return 0.80;
  }
}

/**
 * Nominal amperage, voltage & heat input (kJ/mm) calculation
 */
export function getHeatInputMetrics(proc, dia, speedMmMin, isRootPass = false, isNickelAlloy = false) {
  let amps = 125;
  let volts = 22.0;

  if (proc === 'GTAW') {
    if (isRootPass) {
      amps = dia <= 2.0 ? 95 : (dia <= 2.4 ? 115 : 135);
      volts = 10.5;
    } else {
      amps = dia <= 2.0 ? 130 : (dia <= 2.4 ? 160 : 195);
      volts = 11.2;
    }
  } else if (proc === 'SMAW') {
    if (isNickelAlloy) {
      if (dia <= 2.50) { amps = 70; volts = 18.5; }
      else if (dia <= 3.25) { amps = 85; volts = 19.0; }
      else { amps = 120; volts = 20.5; }
    } else {
      if (dia <= 2.0) { amps = 65; volts = 21.0; }
      else if (dia <= 2.50) { amps = 95; volts = 22.0; }
      else if (dia <= 3.25) { amps = 125; volts = 22.0; }
      else if (dia <= 4.00) { amps = 155; volts = 23.0; }
      else { amps = 200; volts = 24.0; }
    }
  } else if (proc === 'GMAW') {
    if (dia <= 0.85) { amps = isRootPass ? 85 : 115; volts = isRootPass ? 17.0 : 19.5; }
    else if (dia <= 1.05) { amps = isRootPass ? 95 : 135; volts = isRootPass ? 17.5 : 20.5; }
    else if (dia <= 1.25) { amps = isRootPass ? 110 : 165; volts = isRootPass ? 18.0 : 21.5; }
    else { amps = isRootPass ? 140 : 210; volts = isRootPass ? 19.5 : 23.5; }
  } else if (proc === 'FCAW') {
    if (dia <= 1.05) { amps = 165; volts = 21.0; }
    else if (dia <= 1.25) { amps = 210; volts = 22.0; }
    else if (dia <= 1.45) { amps = 240; volts = 24.0; }
    else { amps = 270; volts = 25.0; }
  } else if (proc === 'SAW') {
    if (dia <= 2.60) { amps = 450; volts = 28.5; }
    else if (dia <= 3.30) { amps = 520; volts = 29.5; }
    else { amps = 600; volts = 30.5; }
  }

  const k = getThermalEfficiencyK(proc);
  const speed = Math.max(1, speedMmMin || 90);
  const heatInputKjMm = (k * volts * amps * 60.0) / (speed * 1000.0);

  return {
    amperageAvg: amps,
    voltageAvg: volts,
    travelSpeedMmMin: Math.round(speed * 10) / 10,
    thermalEfficiencyK: k,
    heatInputKjMm: Math.round(heatInputKjMm * 100) / 100,
  };
}