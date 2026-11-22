/**
 * Welding Consumable Calculator (WCC)
 * Calculation Engine Module 4: Preheat, Max Interpass & PWHT Advisory
 * Standards: ASME B31.3 Table 331.1.1 • ASME Sec. IX
 * Governing Document: WCC-SPEC-2026-REV01
 * Pure JavaScript (.js only)
 */

/**
 * Compute preheat, max interpass, and mandatory PWHT requirements
 * @param {Object} metallurgy
 * @param {number} wallThicknessMm
 * @returns {Object}
 */
export function buildThermalAdvisory(metallurgy, wallThicknessMm) {
  const {
    isP11,
    isP22,
    isP5,
    isP9,
    isP91,
    isDuplex,
    isSuperDuplex,
    isNickelAlloy,
    isStainless,
    isLowTemp,
    isPipeline,
  } = metallurgy;
  const t = parseFloat(wallThicknessMm) || 0;

  let preheatMinCelsius = 20;
  let interpassMaxCelsius = 250;
  let preheatNote = 'Standard ambient preheat (min 20°C / dry surface).';

  if (isP11) {
    preheatMinCelsius = 150;
    interpassMaxCelsius = 230;
    preheatNote = 'Mandatory preheat min 150°C; control interpass temperature ≤ 230°C (ASME P-No 4).';
  } else if (isP22) {
    preheatMinCelsius = 175;
    interpassMaxCelsius = 260;
    preheatNote = 'Mandatory preheat min 175°C; control interpass temperature ≤ 260°C (ASME P-No 5A).';
  } else if (isP5) {
    preheatMinCelsius = 175;
    interpassMaxCelsius = 280;
    preheatNote = 'Mandatory preheat min 175°C; control interpass temperature ≤ 280°C (ASME P-No 5B).';
  } else if (isP91) {
    preheatMinCelsius = 200;
    interpassMaxCelsius = 300;
    preheatNote = 'Mandatory preheat min 200°C; control interpass ≤ 300°C & cool below 90°C before PWHT (ASME P-No 15E).';
  } else if (isP9) {
    preheatMinCelsius = 200;
    interpassMaxCelsius = 290;
    preheatNote = 'Mandatory preheat min 200°C; control interpass temperature ≤ 290°C (ASME P-No 5B).';
  } else if (isSuperDuplex) {
    preheatMinCelsius = 20;
    interpassMaxCelsius = 120;
    preheatNote = 'No preheat required; strictly limit interpass ≤ 120°C to avoid sigma phase in Super Duplex.';
  } else if (isDuplex) {
    preheatMinCelsius = 20;
    interpassMaxCelsius = 150;
    preheatNote = 'No preheat required; strictly limit interpass ≤ 150°C to prevent deleterious phases.';
  } else if (isNickelAlloy) {
    preheatMinCelsius = 20;
    interpassMaxCelsius = 150;
    preheatNote = 'No preheat required; keep interpass ≤ 150°C for Inconel / Nickel alloy & dissimilar transitions.';
  } else if (isStainless) {
    preheatMinCelsius = 20;
    interpassMaxCelsius = 175;
    preheatNote = 'Austenitic Stainless (P-No 8): No preheat; strictly maintain interpass ≤ 175°C.';
  } else if (t >= 50.0) {
    preheatMinCelsius = 150;
    interpassMaxCelsius = isLowTemp ? 200 : 235;
    preheatNote = 'Heavy-section Carbon Steel (t ≥ 50 mm): Apply min 150°C preheat; control interpass ≤ 235°C.';
  } else if (isLowTemp || t >= 20.0) {
    preheatMinCelsius = 100;
    interpassMaxCelsius = isLowTemp ? 200 : 250;
    preheatNote = isLowTemp
      ? 'Low-Temp Carbon Steel (A333/LF2): Apply min 100°C preheat and keep interpass ≤ 200°C.'
      : 'Thick-wall Carbon Steel (t ≥ 20 mm): Apply min 100°C preheat; max interpass 250°C.';
  } else if (isPipeline) {
    preheatMinCelsius = 75;
    interpassMaxCelsius = 250;
    preheatNote = 'High-Strength Pipeline Steel (API 5L X52/X65): Apply min 75°C preheat; max interpass 250°C.';
  }

  let pwhtAdvisory = {
    required: false,
    temperatureCelsius: null,
    holdingTimeMin: 0,
    preheatMinCelsius,
    interpassMaxCelsius,
    preheatNote,
    note: 'PWHT not mandatory for this base material configuration under ASME B31.3 / ASME Sec. IX.',
  };

  if (isP11) {
    pwhtAdvisory = {
      required: true,
      temperatureCelsius: 730,
      holdingTimeMin: Math.max(60, Math.ceil(t * 2.5) + (t >= 30 ? 50 : 0)),
      preheatMinCelsius,
      interpassMaxCelsius,
      preheatNote,
      note: 'ASME B31.3 Table 331.1.1 (P-No 4): Mandatory PWHT at 700°C - 750°C (Nominal 730°C).',
    };
  } else if (isP22) {
    pwhtAdvisory = {
      required: true,
      temperatureCelsius: 740,
      holdingTimeMin: Math.max(120, Math.ceil(t * 2.5)),
      preheatMinCelsius,
      interpassMaxCelsius,
      preheatNote,
      note: 'ASME B31.3 Table 331.1.1 (P-No 5A): Mandatory PWHT at 700°C - 760°C (Nominal 740°C).',
    };
  } else if (isP5) {
    pwhtAdvisory = {
      required: true,
      temperatureCelsius: 740,
      holdingTimeMin: Math.max(120, Math.ceil(t * 2.5)),
      preheatMinCelsius,
      interpassMaxCelsius,
      preheatNote,
      note: 'ASME B31.3 Table 331.1.1 (P-No 5B): Mandatory PWHT at 700°C - 760°C (Nominal 740°C).',
    };
  } else if (isP91) {
    pwhtAdvisory = {
      required: true,
      temperatureCelsius: 760,
      holdingTimeMin: Math.max(120, Math.ceil(t * 2.5)),
      preheatMinCelsius,
      interpassMaxCelsius,
      preheatNote,
      note: 'ASME B31.3 Table 331.1.1 (P-No 15E): Mandatory PWHT at 730°C - 775°C (Nominal 760°C, Min 120 min).',
    };
  } else if (isP9) {
    pwhtAdvisory = {
      required: true,
      temperatureCelsius: 740,
      holdingTimeMin: Math.max(120, Math.ceil(t * 2.5)),
      preheatMinCelsius,
      interpassMaxCelsius,
      preheatNote,
      note: 'ASME B31.3 Table 331.1.1 (P-No 5B): Mandatory PWHT at 730°C - 760°C (Min 120 min).',
    };
  } else if (!isStainless && !isDuplex && !isNickelAlloy && t > 19.05) {
    pwhtAdvisory = {
      required: true,
      temperatureCelsius: 620,
      holdingTimeMin: Math.max(60, Math.ceil(t * 2.5)),
      preheatMinCelsius,
      interpassMaxCelsius,
      preheatNote,
      note: 'ASME B31.3 Table 331.1.1 (P-No 1): PWHT mandatory for Carbon Steel with wall thickness t > 19.05 mm.',
    };
  }

  return pwhtAdvisory;
}