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
    isP9,
    isDuplex,
    isNickelAlloy,
    isStainless,
    isLowTemp,
  } = metallurgy;
  const t = parseFloat(wallThicknessMm) || 0;

  let preheatMinCelsius = 20;
  let interpassMaxCelsius = 250;
  let preheatNote = 'Standard ambient preheat (min 20°C / dry surface).';

  if (isP11) {
    preheatMinCelsius = 150;
    interpassMaxCelsius = 230;
    preheatNote = 'Mandatory preheat min 150°C; control interpass temperature ≤ 230°C (ASME P-No 4).';
  } else if (isP9) {
    preheatMinCelsius = 200;
    interpassMaxCelsius = 290;
    preheatNote = 'Mandatory preheat min 200°C; control interpass temperature ≤ 290°C (ASME P-No 5B).';
  } else if (isDuplex) {
    preheatMinCelsius = 20;
    interpassMaxCelsius = 150;
    preheatNote = 'No preheat required; strictly limit interpass ≤ 150°C to prevent deleterious phases.';
  } else if (isNickelAlloy) {
    preheatMinCelsius = 20;
    interpassMaxCelsius = 150;
    preheatNote = 'No preheat required; keep interpass ≤ 150°C for Inconel / dissimilar transition.';
  } else if (isStainless) {
    preheatMinCelsius = 20;
    interpassMaxCelsius = 175;
    preheatNote = 'Austenitic Stainless (P-No 8): No preheat; strictly maintain interpass ≤ 175°C.';
  } else if (isLowTemp || t >= 20.0) {
    preheatMinCelsius = 100;
    interpassMaxCelsius = isLowTemp ? 200 : 250;
    preheatNote = isLowTemp
      ? 'Low-Temp Carbon Steel (A333/LF2): Apply min 100°C preheat and keep interpass ≤ 200°C.'
      : 'Thick-wall Carbon Steel (t ≥ 20 mm): Apply min 100°C preheat; max interpass 250°C.';
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