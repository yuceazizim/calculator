/**
 * Welding Consumable Calculator (WCC)
 * Custom Hook: useWeldCalculator (Serverless Local Engine Edition)
 * Centralized State Management & Instant Client-Side Calculation Orchestration
 * Standards: ASME Sec. IX • ASME B31.3 • ASME B16.11 • ASME B36.10M • AWS D1.1 • EN ISO 15614-1
 * Governing Document: WCC-SPEC-2026-REV01 Master Benchmark Manual
 * Pure JavaScript (.js only)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { PIPE_CATALOG } from '../data/pipesData.js';
import { BASE_MATERIALS } from '../data/materialsData.js';
import { JOINT_GEOMETRIES, SHIELDING_GASES } from '../data/jointsAndGasesData.js';
import CalculatorService from '../engine/calculatorService.js';

const DEFAULT_PIPE =
  PIPE_CATALOG.find((p) => p.nps === '2"' && (p.schedule === 'SCH STD' || p.schedule === 'SCH 40')) ||
  PIPE_CATALOG[0];

const DEFAULT_MATERIAL =
  BASE_MATERIALS.find((m) => m.p_no === '1') || BASE_MATERIALS[0];

export function useWeldCalculator() {
  // Static Local Engineering Catalogs
  const [pipes] = useState(PIPE_CATALOG);
  const [materials] = useState(BASE_MATERIALS);
  const [joints] = useState(JOINT_GEOMETRIES);
  const [gases] = useState(SHIELDING_GASES);

  const [selectedPipeId, setSelectedPipeId] = useState(DEFAULT_PIPE?.id || '');
  const [selectedMaterialId, setSelectedMaterialId] = useState(DEFAULT_MATERIAL?.id || '');

  // Primary Joint Type, Geometry & Batch Quantity Selection
  const [jointType, setJointType] = useState('pipe'); // 'pipe' | 'plate'
  const [weldGeometry, setWeldGeometry] = useState('butt'); // 'butt' | 'double_v' | 'fillet' | 'socket'
  const [jointQuantity, setJointQuantity] = useState('1');

  // Dimensions for Butt & Double-V Welds
  const [pipeOdMm, setPipeOdMm] = useState(
    DEFAULT_PIPE ? DEFAULT_PIPE.outside_diameter_mm.toString() : '60.33'
  );
  const [wallThicknessMm, setWallThicknessMm] = useState(
    DEFAULT_PIPE ? DEFAULT_PIPE.wall_thickness_mm.toString() : '3.91'
  );
  const [weldLengthMm, setWeldLengthMm] = useState('400');
  const [bevelAngleDeg, setBevelAngleDeg] = useState('37.5');
  const [rootGapMm, setRootGapMm] = useState('3.0');
  const [rootFaceMm, setRootFaceMm] = useState('1.5');
  const [capHeightMm, setCapHeightMm] = useState('1.5');

  // Dimensions for Fillet & Socket Welds (AWS D1.1 / ASME B31.3)
  const [filletSizeType, setFilletSizeType] = useState('throat'); // 'throat' (a) | 'leg' (z)
  const [filletSizeMm, setFilletSizeMm] = useState('6.0');
  const [filletSides, setFilletSides] = useState('single'); // 'single' | 'double'

  // Metallurgy & Purge Parameters
  const [materialDensity, setMaterialDensity] = useState(
    DEFAULT_MATERIAL ? DEFAULT_MATERIAL.density_g_cm3.toFixed(3) : '7.850'
  );
  const [materialGroup, setMaterialGroup] = useState(
    DEFAULT_MATERIAL ? DEFAULT_MATERIAL.material_group : 'Carbon Steel'
  );
  const [requiresBackingGas, setRequiresBackingGas] = useState(false);
  const [isFluxCoredTig, setIsFluxCoredTig] = useState(false);

  // Process, Position, Travel Direction, Shielding & Purge Gas Parameters
  const [rootProcess, setRootProcess] = useState('GTAW');
  const [fillProcess, setFillProcess] = useState('SMAW');
  const [weldPosition, setWeldPosition] = useState('vertical_fixed'); // 'flat' | 'horizontal' | 'vertical_fixed' | 'overhead'
  const [travelDirection, setTravelDirection] = useState('uphill'); // 'uphill' | 'downhill'
  const [gasFlowRateLpm, setGasFlowRateLpm] = useState('12.0');
  const [purgeGasFlowRateLpm, setPurgeGasFlowRateLpm] = useState('10.0');
  const [purgeStrategy, setPurgeStrategy] = useState('auto'); // 'auto' | 'full' | 'root_hot' | 'gtaw_all'
  const [cylinderVolumeM3, setCylinderVolumeM3] = useState('6.0');

  // User-Selected Consumable Sizing
  const [tigWireDiaMm, setTigWireDiaMm] = useState('2.0');
  const [smawElectrodeDiaMm, setSmawElectrodeDiaMm] = useState('2.50');
  const [smawLengthMm, setSmawLengthMm] = useState('350');
  const [gmawWireDiaMm, setGmawWireDiaMm] = useState('1.0');
  const [fcawWireDiaMm, setFcawWireDiaMm] = useState('1.2');
  const [sawWireDiaMm, setSawWireDiaMm] = useState('2.5');
  const [includeShopScrap, setIncludeShopScrap] = useState(true);

  // Dynamic Custom Pass Stacking
  const [customPassGroups, setCustomPassGroups] = useState([]);
  const [useCustomPassSequencing, setUseCustomPassSequencing] = useState(false);

  // Calculation Results & Feedback
  const [calculating, setCalculating] = useState(false);
  const [calculationResult, setCalculationResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const isInitialMountRef = useRef(true);

  // Handle Pipe Catalog Selection
  const handlePipeSelect = useCallback((pipeId) => {
    setSelectedPipeId(pipeId);
    if (!pipeId) return;

    const pipe = pipes.find((p) => p.id === pipeId);
    if (pipe) {
      setPipeOdMm(pipe.outside_diameter_mm.toString());
      setWallThicknessMm(pipe.wall_thickness_mm.toString());

      if (pipe.outside_diameter_mm <= 73.0) {
        setTigWireDiaMm('2.0');
        setSmawElectrodeDiaMm('2.50');
        setSmawLengthMm('350');
      } else if (pipe.wall_thickness_mm <= 7.5) {
        setTigWireDiaMm('2.4');
        setSmawElectrodeDiaMm('2.50');
        setSmawLengthMm('350');
      } else if (pipe.wall_thickness_mm > 12.0) {
        setTigWireDiaMm('2.4');
        setSmawElectrodeDiaMm('4.00');
        setSmawLengthMm('450');
      } else {
        setTigWireDiaMm('2.4');
        setSmawElectrodeDiaMm('3.25');
        setSmawLengthMm('350');
      }
    }
  }, [pipes]);

  // Handle Base Material Selection & Metallurgy Purge Rules
  const handleMaterialSelect = useCallback((materialId) => {
    setSelectedMaterialId(materialId);
    if (!materialId) return;

    const mat = materials.find((m) => m.id === materialId);
    if (mat) {
      setMaterialDensity(mat.density_g_cm3.toFixed(3));
      setMaterialGroup(mat.material_group);

      const isCorrosionResistant =
        mat.p_no === '8' ||
        mat.p_no === '10H' ||
        mat.p_no === '5B' ||
        mat.p_no === '43' ||
        mat.material_group.includes('Stainless') ||
        mat.material_group.includes('Duplex') ||
        mat.material_group.includes('Nickel');

      setRequiresBackingGas(isCorrosionResistant);

      if (mat.material_group.includes('Stainless') || mat.material_group.includes('Duplex')) {
        if (parseFloat(smawElectrodeDiaMm) <= 2.50) {
          setSmawLengthMm('300');
        } else {
          setSmawLengthMm('350');
        }
      }
    }
  }, [materials, smawElectrodeDiaMm]);

  // Execute Local Weld Consumable Calculation Engine
  const executeCalculation = useCallback(() => {
    setCalculating(true);
    setErrorMessage('');

    try {
      const wt = parseFloat(wallThicknessMm);
      if (!Number.isFinite(wt) || wt <= 0) {
        setErrorMessage('Valid wall thickness is required for calculation.');
        setCalculating(false);
        return;
      }

      if (jointType === 'pipe') {
        const od = parseFloat(pipeOdMm);
        if (!Number.isFinite(od) || od <= 0) {
          setErrorMessage('Valid pipe outside diameter is required for pipe joint calculation.');
          setCalculating(false);
          return;
        }
      }

      if (jointType === 'plate') {
        const len = parseFloat(weldLengthMm);
        if (!Number.isFinite(len) || len <= 0) {
          setErrorMessage('Valid seam length is required for plate joint calculation.');
          setCalculating(false);
          return;
        }
      }

      const parsedTorchFlow = parseFloat(gasFlowRateLpm);
      const parsedPurgeFlow = parseFloat(purgeGasFlowRateLpm);

      const payload = {
        jointType,
        weldGeometry,
        jointQuantity: Math.max(1, parseInt(jointQuantity, 10) || 1),
        pipeOdMm: parseFloat(pipeOdMm),
        wallThicknessMm: wt,
        weldLengthMm: parseFloat(weldLengthMm),

        bevelAngleDeg: parseFloat(bevelAngleDeg),
        rootGapMm: parseFloat(rootGapMm),
        rootFaceMm: parseFloat(rootFaceMm),
        capHeightMm: parseFloat(capHeightMm),

        filletSizeType,
        filletSizeMm: parseFloat(filletSizeMm),
        filletSides,

        materialDensity: parseFloat(materialDensity),
        materialGroup,
        requiresBackingGas,
        isFluxCoredTig,
        rootProcess,
        fillProcess,
        weldPosition,
        travelDirection,
        gasFlowRateLpm: Number.isFinite(parsedTorchFlow) ? parsedTorchFlow : 14.0,
        purgeGasFlowRateLpm: Number.isFinite(parsedPurgeFlow) ? parsedPurgeFlow : 10.0,
        purgeStrategy,
        cylinderVolumeM3: parseFloat(cylinderVolumeM3) || 6.0,

        tigWireDiaMm: parseFloat(tigWireDiaMm),
        smawElectrodeDiaMm: parseFloat(smawElectrodeDiaMm),
        smawLengthMm: parseFloat(smawLengthMm),
        gmawWireDiaMm: parseFloat(gmawWireDiaMm) || 1.0,
        fcawWireDiaMm: parseFloat(fcawWireDiaMm) || 1.2,
        sawWireDiaMm: parseFloat(sawWireDiaMm) || 2.5,
        includeShopScrap,

        customPassGroups: useCustomPassSequencing ? customPassGroups : null,
      };

      const report = CalculatorService.calculate(payload);
      setCalculationResult(report);
    } catch (err) {
      console.error('Calculation execution error:', err);
      setErrorMessage(err.message || 'Calculation failed. Please verify your input parameters.');
    } finally {
      setCalculating(false);
    }
  }, [
    jointType,
    weldGeometry,
    jointQuantity,
    pipeOdMm,
    wallThicknessMm,
    weldLengthMm,
    bevelAngleDeg,
    rootGapMm,
    rootFaceMm,
    capHeightMm,
    filletSizeType,
    filletSizeMm,
    filletSides,
    materialDensity,
    materialGroup,
    requiresBackingGas,
    isFluxCoredTig,
    rootProcess,
    fillProcess,
    weldPosition,
    travelDirection,
    gasFlowRateLpm,
    purgeGasFlowRateLpm,
    purgeStrategy,
    cylinderVolumeM3,
    tigWireDiaMm,
    smawElectrodeDiaMm,
    smawLengthMm,
    gmawWireDiaMm,
    fcawWireDiaMm,
    sawWireDiaMm,
    includeShopScrap,
    useCustomPassSequencing,
    customPassGroups,
  ]);

  // Automatic calculation on initial mount and smooth debounced auto-recalculation on input changes
  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      executeCalculation();
      return undefined;
    }

    const timer = setTimeout(() => {
      executeCalculation();
    }, 120);

    return () => clearTimeout(timer);
  }, [executeCalculation]);

  return {
    // Local Engine Status
    engineReady: true,
    errorMessage,

    // Catalogs
    pipes,
    materials,
    joints,
    gases,
    selectedPipeId,
    selectedMaterialId,
    setSelectedMaterialId,

    // Joint Category, Geometry & Batch Quantity
    jointType,
    setJointType,
    weldGeometry,
    setWeldGeometry,
    jointQuantity,
    setJointQuantity,

    // Butt & Double-V Dimensions
    pipeOdMm,
    setPipeOdMm,
    wallThicknessMm,
    setWallThicknessMm,
    weldLengthMm,
    setWeldLengthMm,
    bevelAngleDeg,
    setBevelAngleDeg,
    rootGapMm,
    setRootGapMm,
    rootFaceMm,
    setRootFaceMm,
    capHeightMm,
    setCapHeightMm,

    // Fillet & Socket Dimensions
    filletSizeType,
    setFilletSizeType,
    filletSizeMm,
    setFilletSizeMm,
    filletSides,
    setFilletSides,

    // Material Form State & Setters
    materialDensity,
    setMaterialDensity,
    materialGroup,
    requiresBackingGas,
    setRequiresBackingGas,
    isFluxCoredTig,
    setIsFluxCoredTig,

    // Process Form State & Setters
    rootProcess,
    setRootProcess,
    fillProcess,
    setFillProcess,
    weldPosition,
    setWeldPosition,
    travelDirection,
    setTravelDirection,
    gasFlowRateLpm,
    setGasFlowRateLpm,
    purgeGasFlowRateLpm,
    setPurgeGasFlowRateLpm,
    purgeStrategy,
    setPurgeStrategy,
    cylinderVolumeM3,
    setCylinderVolumeM3,

    // User-Selected Consumables State & Setters
    tigWireDiaMm,
    setTigWireDiaMm,
    smawElectrodeDiaMm,
    setSmawElectrodeDiaMm,
    smawLengthMm,
    setSmawLengthMm,
    gmawWireDiaMm,
    setGmawWireDiaMm,
    fcawWireDiaMm,
    setFcawWireDiaMm,
    sawWireDiaMm,
    setSawWireDiaMm,
    includeShopScrap,
    setIncludeShopScrap,

    // Custom Stepped Pass Groups Management
    customPassGroups,
    setCustomPassGroups,
    useCustomPassSequencing,
    setUseCustomPassSequencing,

    // Calculation Results & Actions
    calculating,
    calculationResult,
    handlePipeSelect,
    handleMaterialSelect,
    calculate: executeCalculation,
  };
}