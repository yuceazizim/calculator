/**
 * Welding Consumable Calculator (WCC)
 * Calculation Engine Module 1: Weld Joint Geometry, Physical Layer Areas, Volume & Net Weight
 * Supports: Single-V Butt, Double-V (X-Joint), Socket Weld (ASME B16.11) & Fillet Weld (AWS D1.1)
 * Governing Document: WCC-SPEC-2026-REV01
 * Pure JavaScript (.js only)
 */

function toNum(val, fallback) {
  const parsed = parseFloat(val);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/**
 * Calculate weld cross-sectional area, exact physical layer areas (Root, Hot, Fill, Cap),
 * seam length, volume and net deposited metal weight for 1 joint
 * @param {Object} params
 * @returns {Object}
 */
export function calculateWeldGeometry(params) {
  const {
    jointType = 'pipe',
    weldGeometry = 'butt',
    pipeOdMm,
    wallThicknessMm,
    weldLengthMm,
    rootGapMm = 2.5,
    rootFaceMm = 1.6,
    bevelAngleDeg = 37.5,
    capHeightMm = 1.5,
    capExcessWidthMm = 2.0,
    rootPenetrationMm = 1.0,
    filletSizeType = 'throat',
    filletSizeMm = 6.0,
    filletSides = 'single',
    materialDensity = 7.85,
  } = params;

  const isPipe = jointType === 'pipe';
  const t = Math.max(0, toNum(wallThicknessMm, 0));
  const density = toNum(materialDensity, 7.85);
  const od = isPipe ? Math.max(0, toNum(pipeOdMm, 0)) : 0;

  const g = Math.max(0, toNum(rootGapMm, 2.5));
  const f = Math.max(0, toNum(rootFaceMm, 1.6));
  const angleDeg = Math.max(0, toNum(bevelAngleDeg, 37.5));
  const c = Math.max(0, toNum(capHeightMm, 1.5));
  const wExcess = Math.max(0, toNum(capExcessWidthMm, 2.0));
  const hPen = Math.max(0, toNum(rootPenetrationMm, 1.0));
  const parsedFilletSize = Math.max(0, toNum(filletSizeMm, 6.0));

  let totalCrossSectionAreaMm2 = 0;
  let seamLengthMm = 0;
  let meanDiameterMm = 0;
  let bevelTopWidth = 0;
  let capTotalWidth = 0;

  // Exact Physical Layer Cross-Section Breakdown (mm²)
  let areaRootOnly = 0;
  let areaHotOnly = 0;
  let areaRootPart = 0; // areaRootOnly + areaHotOnly
  let areaFill = 0;
  let areaCap = 0;

  if (weldGeometry === 'fillet') {
    let legZ = parsedFilletSize;
    let throatA = parsedFilletSize;

    if (filletSizeType === 'throat') {
      throatA = parsedFilletSize;
      legZ = throatA * Math.SQRT2;
    } else {
      legZ = parsedFilletSize;
      throatA = legZ / Math.SQRT2;
    }

    const numSides = filletSides === 'double' ? 2.0 : 1.0;
    const baseTriangleArea = 0.5 * legZ * legZ * numSides;
    const convexityCrownArea = baseTriangleArea * 0.10;
    totalCrossSectionAreaMm2 = baseTriangleArea + convexityCrownArea;

    capTotalWidth = legZ * Math.SQRT2;
    bevelTopWidth = capTotalWidth;

    if (throatA <= 5.0) {
      // Single-pass or compact fillet
      areaRootOnly = totalCrossSectionAreaMm2;
      areaHotOnly = 0;
      areaRootPart = areaRootOnly;
      areaFill = 0;
      areaCap = 0;
    } else {
      // Multi-pass fillet: root + body fill + outer cover cap
      areaRootOnly = Math.min(totalCrossSectionAreaMm2 * 0.35, 18.0 * numSides);
      areaCap = Math.max(convexityCrownArea, totalCrossSectionAreaMm2 * 0.28);
      areaFill = Math.max(0, totalCrossSectionAreaMm2 - areaRootOnly - areaCap);
      areaHotOnly = 0;
      areaRootPart = areaRootOnly;
    }

    if (isPipe) {
      meanDiameterMm = od;
      seamLengthMm = Math.PI * od;
    } else {
      seamLengthMm = toNum(weldLengthMm, 1000.0);
    }
  } else if (weldGeometry === 'socket') {
    // ASME B16.11 & B31.3 minimum socket leg length Cx = 1.09 * t with 15% crown
    const socketLegCx = Math.max(3.2, 1.09 * t);
    const baseArea = 0.5 * socketLegCx * socketLegCx;
    areaCap = baseArea * 0.15;
    totalCrossSectionAreaMm2 = baseArea + areaCap;
    capTotalWidth = socketLegCx * Math.SQRT2;
    bevelTopWidth = capTotalWidth;

    areaRootOnly = baseArea * 0.55;
    areaHotOnly = 0;
    areaRootPart = areaRootOnly;
    areaFill = Math.max(0, totalCrossSectionAreaMm2 - areaRootPart - areaCap);

    meanDiameterMm = od + 2.0;
    seamLengthMm = Math.PI * meanDiameterMm;
  } else if (weldGeometry === 'double_v') {
    // Symmetrical Double-V (X-Joint) Groove Geometry
    const angleRad = (angleDeg * Math.PI) / 180.0;
    const totalBevelHeight = Math.max(0, t - f);
    const halfBevelHeight = totalBevelHeight / 2.0;

    bevelTopWidth = g + 2.0 * (halfBevelHeight * Math.tan(angleRad));
    capTotalWidth = bevelTopWidth + 2.0 * wExcess;

    const areaRootGap = g * t;
    const areaBevel = 2.0 * (halfBevelHeight * halfBevelHeight * Math.tan(angleRad));
    areaCap = 2.0 * ((2.0 / 3.0) * capTotalWidth * c);

    const areaGrooveBody = areaRootGap + areaBevel;
    totalCrossSectionAreaMm2 = areaGrooveBody + areaCap;

    // Central land + root pass & back-gouge/hot pass in X-Joint
    const rootH = Math.min(t * 0.45, Math.max(2.2, f + 1.0));
    const rootBevelH = Math.max(0, rootH - f);
    areaRootOnly = Math.min(
      areaGrooveBody * 0.55,
      (g * rootH) + 2.0 * ((rootBevelH / 2.0) * (rootBevelH / 2.0) * Math.tan(angleRad))
    );

    const hotTopH = Math.min(t * 0.72, rootH + 2.0);
    const hotBevelH = Math.max(0, hotTopH - f);
    const areaRootPlusHot = Math.min(
      areaGrooveBody * 0.85,
      (g * hotTopH) + 2.0 * ((hotBevelH / 2.0) * (hotBevelH / 2.0) * Math.tan(angleRad))
    );

    areaHotOnly = Math.max(0, areaRootPlusHot - areaRootOnly);
    areaRootPart = areaRootOnly + areaHotOnly;
    areaFill = Math.max(0, areaGrooveBody - areaRootPart);

    if (isPipe) {
      meanDiameterMm = Math.max(0, od - t);
      seamLengthMm = Math.PI * meanDiameterMm;
    } else {
      seamLengthMm = toNum(weldLengthMm, 400.0);
    }
  } else {
    // Standard Single V-Groove Butt Weld
    const angleRad = (angleDeg * Math.PI) / 180.0;
    const bevelHeight = Math.max(0, t - f);

    bevelTopWidth = g + 2.0 * (bevelHeight * Math.tan(angleRad));
    capTotalWidth = bevelTopWidth + 2.0 * wExcess;

    const areaRootGap = g * t;
    const areaBevel = bevelHeight * bevelHeight * Math.tan(angleRad);
    areaCap = (2.0 / 3.0) * capTotalWidth * c;
    const areaRootPenetration = (2.0 / 3.0) * g * hPen;

    const areaGrooveBody = areaRootGap + areaBevel + areaRootPenetration;
    totalCrossSectionAreaMm2 = areaGrooveBody + areaCap;

    if (t <= 4.5) {
      // Thin-wall groove (e.g. 2" SCH STD 3.91mm): Root (~55% body) + Hot/Fill (~45% body) + Cap
      areaRootOnly = areaGrooveBody * 0.55;
      areaHotOnly = areaGrooveBody - areaRootOnly;
      areaRootPart = areaGrooveBody;
      areaFill = 0;
    } else {
      // Medium & Heavy Wall (e.g. t = 10mm, 20mm, 40mm): Physical Root + Hot + Fill + Cap
      const rootH = Math.min(t * 0.45, Math.max(2.0, f + 0.8));
      const rootBevelH = Math.max(0, rootH - f);
      areaRootOnly =
        (g * rootH) +
        (rootBevelH * rootBevelH * Math.tan(angleRad)) +
        areaRootPenetration;

      const hotTopH = Math.min(t * 0.72, rootH + 1.8);
      const hotBevelH = Math.max(0, hotTopH - f);
      const areaRootPlusHot =
        (g * hotTopH) +
        (hotBevelH * hotBevelH * Math.tan(angleRad)) +
        areaRootPenetration;

      areaHotOnly = Math.max(0, areaRootPlusHot - areaRootOnly);
      areaRootPart = areaRootOnly + areaHotOnly;
      areaFill = Math.max(0, areaGrooveBody - areaRootPart);
    }

    if (isPipe) {
      meanDiameterMm = Math.max(0, od - t);
      seamLengthMm = Math.PI * meanDiameterMm;
    } else {
      seamLengthMm = toNum(weldLengthMm, 400.0);
    }
  }

  // Volume & Net Deposited Metal Weight (1x Joint)
  const totalVolumeMm3 = totalCrossSectionAreaMm2 * seamLengthMm;
  const totalVolumeCm3 = totalVolumeMm3 / 1000.0;
  const totalNetWeightGrams = totalVolumeCm3 * density;
  const totalNetWeightKg = totalNetWeightGrams / 1000.0;

  return {
    isPipe,
    t,
    od,
    density,
    g,
    f,
    angleDeg,
    c,
    parsedFilletSize,
    totalCrossSectionAreaMm2,
    totalVolumeCm3,
    totalNetWeightGrams,
    totalNetWeightKg,
    seamLengthMm,
    meanDiameterMm,
    bevelTopWidth,
    capTotalWidth,
    areaRootOnly,
    areaHotOnly,
    areaRootPart,
    areaFill,
    areaCap,
  };
}