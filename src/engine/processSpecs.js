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
  const isSuperDuplex = materialGroup.includes('Super Duplex') || materialGroup.includes('2507');
  const isDuplex = isSuperDuplex || materialGroup.includes('Duplex');
  const isNickelAlloy = materialGroup.includes('Nickel') || density > 8.12;
  const isStainless = !isDuplex && !isNickelAlloy && (
    materialGroup.includes('Stainless') || (density >= 7.92 && density <= 8.10)
  );

  const isP11 = materialGroup.includes('P11') || materialGroup.includes('1.25Cr');
  const isP22 = materialGroup.includes('P22') || materialGroup.includes('2.25Cr');
  const isP5 = materialGroup.includes('P5') || materialGroup.includes('5Cr');
  const isP91 = materialGroup.includes('P91') || materialGroup.includes('9Cr 1Mo-V');
  const isP9 = !isP91 && (materialGroup.includes('P9') || materialGroup.includes('9Cr'));
  const isLowTemp = materialGroup.includes('Low Temp') || materialGroup.includes('A333');
  const isPipeline = materialGroup.includes('Pipeline');

  const is304 = isStainless && materialGroup.includes('304');
  const is321Or347 = isStainless && (materialGroup.includes('321') || materialGroup.includes('347'));
  const is310 = isStainless && materialGroup.includes('310');

  const isInconel625 = isNickelAlloy && materialGroup.includes('625');
  const isIncoloy825 = isNickelAlloy && materialGroup.includes('825');
  const isHastelloyC276 = isNickelAlloy && (materialGroup.includes('C-276') || materialGroup.includes('Hastelloy'));

  let defaultTigClass = 'ER70S-6';
  if (isSuperDuplex) {
    defaultTigClass = 'ER2594';
  } else if (isDuplex) {
    defaultTigClass = 'ER2209';
  } else if (is304) {
    defaultTigClass = isFluxCoredTig ? 'TG-X308L (Flux-Cored)' : 'ER308L';
  } else if (is321Or347) {
    defaultTigClass = 'ER347';
  } else if (is310) {
    defaultTigClass = 'ER310';
  } else if (isStainless) {
    defaultTigClass = isFluxCoredTig ? 'TG-X316L (Flux-Cored)' : 'ER316L';
  } else if (isP11) {
    defaultTigClass = 'ER80S-B2';
  } else if (isP22) {
    defaultTigClass = 'ER90S-B3';
  } else if (isP5) {
    defaultTigClass = 'ER80S-B6';
  } else if (isP91) {
    defaultTigClass = 'ER90S-B9';
  } else if (isP9) {
    defaultTigClass = 'ER80S-B8';
  } else if (isInconel625) {
    defaultTigClass = 'ERNiCrMo-3 (Inconel 625)';
  } else if (isIncoloy825) {
    defaultTigClass = 'ERNiFeCr-1 / ERNiCrMo-3';
  } else if (isHastelloyC276) {
    defaultTigClass = 'ERNiCrMo-4 (C-276)';
  } else if (isNickelAlloy) {
    defaultTigClass = 'ERNiCr-3 (Inconel 82)';
  }

  let defaultSmawClass = 'E7018-1 H4R';
  if (isSuperDuplex) {
    defaultSmawClass = 'E2594-16';
  } else if (isDuplex) {
    defaultSmawClass = 'E2209-17';
  } else if (is304) {
    defaultSmawClass = 'E308L-17';
  } else if (is321Or347) {
    defaultSmawClass = 'E347-17';
  } else if (is310) {
    defaultSmawClass = 'E310-16';
  } else if (isStainless) {
    defaultSmawClass = 'E316L-17 / E308L-17';
  } else if (isP11) {
    defaultSmawClass = 'E8018-B2 H4R';
  } else if (isP22) {
    defaultSmawClass = 'E9018-B3 H4R';
  } else if (isP5) {
    defaultSmawClass = 'E8018-B6';
  } else if (isP91) {
    defaultSmawClass = 'E9018-B9 H4R';
  } else if (isP9) {
    defaultSmawClass = 'E8015-B8';
  } else if (isInconel625 || isIncoloy825) {
    defaultSmawClass = 'ENiCrMo-3 (Inconel 112)';
  } else if (isHastelloyC276) {
    defaultSmawClass = 'ENiCrMo-4';
  } else if (isNickelAlloy) {
    defaultSmawClass = 'ENiCrFe-3 (Inconel 182)';
  } else if (isPipeline) {
    defaultSmawClass = 'E7018-1 / E8018-G';
  }

  let defaultGmawClass = 'ER70S-6';
  if (isSuperDuplex) defaultGmawClass = 'ER2594';
  else if (isDuplex) defaultGmawClass = 'ER2209';
  else if (is304) defaultGmawClass = 'ER308L';
  else if (is321Or347) defaultGmawClass = 'ER347';
  else if (is310) defaultGmawClass = 'ER310';
  else if (isStainless) defaultGmawClass = 'ER316L';
  else if (isP11) defaultGmawClass = 'ER80S-B2';
  else if (isP22) defaultGmawClass = 'ER90S-B3';
  else if (isP5) defaultGmawClass = 'ER80S-B6';
  else if (isP91) defaultGmawClass = 'ER90S-B9';
  else if (isP9) defaultGmawClass = 'ER80S-B8';
  else if (isInconel625 || isIncoloy825) defaultGmawClass = 'ERNiCrMo-3';
  else if (isHastelloyC276) defaultGmawClass = 'ERNiCrMo-4';
  else if (isNickelAlloy) defaultGmawClass = 'ERNiCr-3';

  let defaultFcawClass = 'E71T-1C';
  if (isSuperDuplex) defaultFcawClass = 'E2594T1-1';
  else if (isDuplex) defaultFcawClass = 'E2209T1-1';
  else if (is304) defaultFcawClass = 'E308LT1-1';
  else if (is321Or347) defaultFcawClass = 'E347T1-1';
  else if (is310) defaultFcawClass = 'E310T1-1';
  else if (isStainless) defaultFcawClass = 'E316LT1-1';
  else if (isP11) defaultFcawClass = 'E81T1-B2';
  else if (isP22) defaultFcawClass = 'E91T1-B3';
  else if (isP5) defaultFcawClass = 'E81T1-B6';
  else if (isP91) defaultFcawClass = 'E91T1-B9';
  else if (isNickelAlloy) defaultFcawClass = 'ENiCrFe3T1-1';

  return {
    isStainless,
    isNickelAlloy,
    isDuplex,
    isSuperDuplex,
    isP11,
    isP22,
    isP5,
    isP9,
    isP91,
    isLowTemp,
    isPipeline,
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
 * Physical raw bare-wire mass (grams) of a single GTAW rod or SMAW core wire
 * Example: Ø 2.4 mm × 1000 mm Carbon Steel (7.85 g/cm³) = 35.51 g (~141 rods per 5 kg box)
 */
export function getRawUnitWeightGrams(
  proc,
  dia,
  electrodeLenMm,
  { isNickelAlloy = false, isStainless = false, isFluxCoredTig = false } = {}
) {
  const d = Math.max(0.4, parseFloat(dia) || 2.4);
  const density = isNickelAlloy ? 8.44 : (isStainless ? 7.98 : 7.85);
  const areaMm2 = Math.PI * (d / 2.0) * (d / 2.0);

  if (proc === 'GTAW') {
    const lenMm = Math.max(100.0, parseFloat(electrodeLenMm) || 1000.0);
    // Flux-cored tubular TIG wire (e.g. TG-X) has ~85% metallic core fill density
    const fillFactor = isFluxCoredTig ? 0.85 : 1.0;
    return (areaMm2 * lenMm * 0.001) * density * fillFactor;
  }

  if (proc === 'SMAW') {
    const lenMm = Math.max(150.0, parseFloat(electrodeLenMm) || 350.0);
    // Core wire mass (excluding flux coating; 50 mm stub loss applied in net deposit calc)
    return (areaMm2 * lenMm * 0.001) * density;
  }

  return 1.0;
}

/**
 * Physically calibrated net weld metal deposit weight per piece (rod or electrode)
 * - GTAW: Bare rod mass × 0.90 usable efficiency (~100 mm hand-hold stub loss on 1000 mm rod)
 * - SMAW: Active burned core wire (Length - 50 mm stub) × recovery factor (0.95 CS/LA E7018, 0.90 SS/Ni)
 */
export function getUnitDepositWeightGrams(
  proc,
  dia,
  electrodeLenMm,
  { isNickelAlloy = false, isStainless = false, isFluxCoredTig = false } = {}
) {
  const d = Math.max(0.4, parseFloat(dia) || 2.4);
  const density = isNickelAlloy ? 8.44 : (isStainless ? 7.98 : 7.85);
  const areaMm2 = Math.PI * (d / 2.0) * (d / 2.0);

  if (proc === 'GTAW') {
    const rawRodGrams = getRawUnitWeightGrams('GTAW', d, electrodeLenMm, {
      isNickelAlloy,
      isStainless,
      isFluxCoredTig,
    });
    // ~10% stub/end-cut & arc transfer loss on 1000 mm TIG rod (Ø 2.4mm CS -> 31.96 g net deposit)
    return Math.round(rawRodGrams * 0.90 * 100) / 100;
  }

  if (proc === 'SMAW') {
    const stubLossMm = 50.0;
    const chosenLen = parseFloat(electrodeLenMm) || 350.0;
    const activeLenMm = Math.max(100.0, chosenLen - stubLossMm);
    const activeCoreMassGrams = (areaMm2 * activeLenMm * 0.001) * density;

    // E7018/E8018 basic iron-powder coating recovers ~95% of active core wire; rutile SS/Ni ~90%
    const recoveryFactor = (isStainless || isNickelAlloy) ? 0.90 : 0.95;
    return Math.round(activeCoreMassGrams * recoveryFactor * 100) / 100;
  }

  return 1.0;
}

/**
 * Nominal single-pass cross-sectional bead area (mm²) per process and diameter
 * SAW calibrated against TSGI-PQR-CS-025 (Ø 2.50 mm EH12K -> ~33 mm² per pass)
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
    if (dia <= 2.60) return 33.0;
    if (dia <= 3.30) return 50.0;
    return 70.0;
  }
  return 20.0;
}

/**
 * Calibrated travel speed (mm/min) per process, diameter, metallurgy, pipe/plate & position
 * Benchmarked against STAR Refinery PQRs: AS-001, AS-002, AS-005, CS-025 & SS-004
 */
export function getProcessTravelSpeed(
  proc,
  dia,
  isRootPass = false,
  {
    isPipe = true,
    t = 10,
    posSpeedMult = 1.0,
    effectiveDirectionMult = 1.0,
    isStainless = false,
    isDuplex = false,
    isNickelAlloy = false,
    isP9 = false,
    isP91 = false,
    isP11 = false,
    isP22 = false,
    isP5 = false,
    isCapPass = false,
  } = {}
) {
  const speedMult = posSpeedMult * effectiveDirectionMult;

  if (proc === 'GTAW') {
    // High-alloy / viscous weld pools (Stainless, Duplex, Inconel, P5/P9/P91, thick P11/P22) run slower controlled TIG
    const isSlowAlloy =
      isStainless ||
      isDuplex ||
      isNickelAlloy ||
      isP5 ||
      isP9 ||
      isP91 ||
      ((isP11 || isP22) && t >= 15.0);
    if (isPipe) {
      const rootSpeed = isSlowAlloy ? 37.5 : 85.0;
      const fillSpeed = isSlowAlloy ? 88.0 : 120.0;
      return (isRootPass ? rootSpeed : fillSpeed) * speedMult;
    }
    const plateRootSpeed = isSlowAlloy ? 50.0 : 95.0;
    const plateFillSpeed = isSlowAlloy ? 95.0 : 130.0;
    return (isRootPass ? plateRootSpeed : plateFillSpeed) * speedMult;
  }

  if (proc === 'SMAW') {
    const heavyPlate40Speed = t >= 35.0 ? 85.0 : 110.0;
    const baseSpeed = dia <= 2.50 ? 85.0 : (dia <= 3.25 ? 92.0 : heavyPlate40Speed);
    const isSlowAlloyCap = isStainless || isDuplex || isNickelAlloy;
    const capSpeedFactor = isCapPass ? (isSlowAlloyCap ? 1.05 : 1.20) : 1.0;
    return baseSpeed * capSpeedFactor * speedMult;
  }

  if (proc === 'GMAW') {
    return (isRootPass ? 70.0 : 140.0) * speedMult;
  }

  if (proc === 'FCAW') {
    return (isRootPass ? 135.0 : 165.0) * speedMult;
  }

  if (proc === 'SAW') {
    return 500.0; // Mechanized 1G process (TSGI-PQR-CS-025 avg: 513.5 mm/min)
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