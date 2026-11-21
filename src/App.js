/**
 * Welding Consumable Calculator (WCC)
 * Main Application Orchestrator - Windows 11 Pro Fluent UI (Standalone Calculator Edition)
 * Standards: ASME Sec. IX • ASME B31.3 • ASME B16.11 • AWS D1.1 • AWS A5.X • EN ISO 15614-1
 * Governing Document: WCC-SPEC-2026-REV01 Master Benchmark Manual
 * Features: Calculator Engine, Double-V X-Joint, Live SVG Cross-Section, Batch Quantity, Pipe Catalog & PQR Benchmarks
 * Mobile-First: Edge-to-Edge Layout Architecture
 * Pure JavaScript (.js only)
 */

import React, { useState, useEffect } from 'react';
import { useWeldCalculator } from './hooks/useWeldCalculator.js';
import Header from './components/layout/Header.js';
import Footer from './components/layout/Footer.js';
import JointConfigCard from './components/calculator/JointConfigCard.js';
import MaterialConfigCard from './components/calculator/MaterialConfigCard.js';
import ProcessConfigCard from './components/calculator/ProcessConfigCard.js';
import ResultsPanel from './components/calculator/ResultsPanel.js';
import PipeCatalogTable from './components/catalog/PipeCatalogTable.js';
import PqrBenchmarkList from './components/pqr/PqrBenchmarkList.js';
import { AlertCircle } from 'lucide-react';

export default function App() {
  // Navigation Views State: 'calculator' | 'catalog' | 'pqr'
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem('wcc_dark_mode') === 'true';
    } catch {
      return false;
    }
  });

  const [activeTab, setActiveTab] = useState('calculator');
  const [pendingPqrRecalc, setPendingPqrRecalc] = useState(false);

  // Centralized State & Calculation Engine Hook (Local Engine)
  const calc = useWeldCalculator();

  // Synchronize Dark Mode Class on Root Document Element & Persist Preference
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('wcc_dark_mode', String(darkMode));
    } catch {
      // ignore storage errors
    }
  }, [darkMode]);

  // Automatically trigger calculation once PQR preset state updates commit
  useEffect(() => {
    if (pendingPqrRecalc && activeTab === 'calculator') {
      setPendingPqrRecalc(false);
      calc.calculate();
    }
  }, [pendingPqrRecalc, activeTab, calc]);

  // Load a qualified PQR benchmark recipe directly into Calculator inputs
  const handleLoadPqrPreset = (preset) => {
    if (!preset) return;

    if (preset.materialMatch && Array.isArray(calc.materials) && calc.materials.length > 0) {
      const matchedMat = calc.materials.find(
        (m) =>
          m.material_name.toLowerCase().includes(preset.materialMatch.toLowerCase()) ||
          m.material_group.toLowerCase().includes(preset.materialMatch.toLowerCase())
      );
      if (matchedMat) {
        calc.handleMaterialSelect(matchedMat.id);
      }
    }

    if (preset.jointType === 'pipe' && Array.isArray(calc.pipes) && calc.pipes.length > 0) {
      const targetOd = parseFloat(preset.pipeOdMm || 0);
      const targetWt = parseFloat(preset.wallThicknessMm || 0);
      const matchedPipe = calc.pipes.find(
        (p) =>
          Math.abs(parseFloat(p.outside_diameter_mm) - targetOd) < 0.6 &&
          Math.abs(parseFloat(p.wall_thickness_mm) - targetWt) < 0.3
      );
      if (matchedPipe) {
        calc.handlePipeSelect(matchedPipe.id);
      }
    }

    if (preset.jointType) calc.setJointType(preset.jointType);
    if (preset.weldGeometry) calc.setWeldGeometry(preset.weldGeometry);
    if (preset.pipeOdMm !== undefined) calc.setPipeOdMm(preset.pipeOdMm.toString());
    if (preset.wallThicknessMm !== undefined) calc.setWallThicknessMm(preset.wallThicknessMm.toString());
    if (preset.weldLengthMm !== undefined) calc.setWeldLengthMm(preset.weldLengthMm.toString());
    if (preset.bevelAngleDeg !== undefined) calc.setBevelAngleDeg(preset.bevelAngleDeg.toString());
    if (preset.rootGapMm !== undefined) calc.setRootGapMm(preset.rootGapMm.toString());
    if (preset.rootFaceMm !== undefined) calc.setRootFaceMm(preset.rootFaceMm.toString());
    if (preset.capHeightMm !== undefined) calc.setCapHeightMm(preset.capHeightMm.toString());

    if (preset.rootProcess) calc.setRootProcess(preset.rootProcess);
    if (preset.fillProcess) calc.setFillProcess(preset.fillProcess);
    if (preset.weldPosition) {
      calc.setWeldPosition(preset.weldPosition);
    } else {
      calc.setWeldPosition('vertical_fixed');
    }
    if (preset.travelDirection) calc.setTravelDirection(preset.travelDirection);
    if (preset.gasFlowRateLpm !== undefined) calc.setGasFlowRateLpm(preset.gasFlowRateLpm.toString());
    if (preset.purgeGasFlowRateLpm !== undefined) {
      calc.setPurgeGasFlowRateLpm(preset.purgeGasFlowRateLpm.toString());
    } else {
      calc.setPurgeGasFlowRateLpm('10.0');
    }
    if (preset.purgeStrategy) {
      calc.setPurgeStrategy(preset.purgeStrategy);
    } else {
      calc.setPurgeStrategy('auto');
    }
    if (preset.cylinderVolumeM3 !== undefined) calc.setCylinderVolumeM3(preset.cylinderVolumeM3.toString());
    if (preset.tigWireDiaMm !== undefined) calc.setTigWireDiaMm(preset.tigWireDiaMm.toString());
    if (preset.smawElectrodeDiaMm !== undefined) calc.setSmawElectrodeDiaMm(preset.smawElectrodeDiaMm.toString());
    if (preset.smawLengthMm !== undefined) calc.setSmawLengthMm(preset.smawLengthMm.toString());
    if (preset.gmawWireDiaMm !== undefined) calc.setGmawWireDiaMm(preset.gmawWireDiaMm.toString());
    if (preset.fcawWireDiaMm !== undefined) calc.setFcawWireDiaMm(preset.fcawWireDiaMm.toString());
    if (preset.sawWireDiaMm !== undefined) calc.setSawWireDiaMm(preset.sawWireDiaMm.toString());

    if (typeof preset.requiresBackingGas === 'boolean') calc.setRequiresBackingGas(preset.requiresBackingGas);
    if (typeof preset.isFluxCoredTig === 'boolean') calc.setIsFluxCoredTig(preset.isFluxCoredTig);

    if (Array.isArray(preset.customPassGroups) && preset.customPassGroups.length > 0) {
      calc.setCustomPassGroups(preset.customPassGroups);
      calc.setUseCustomPassSequencing(true);
    } else {
      calc.setCustomPassGroups([]);
      calc.setUseCustomPassSequencing(false);
    }

    setActiveTab('calculator');
    setPendingPqrRecalc(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f3f3f3] dark:bg-[#1a1a1a] text-slate-800 dark:text-slate-100 transition-colors duration-200">
      
      {/* 1. Windows 11 Fluent Navigation Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* 2. Main Workspace */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 py-1.5 sm:py-6">
        
        {/* Global Error Banner */}
        {calc.errorMessage && (
          <div className="mx-2 sm:mx-0 mb-3 sm:mb-6 p-3 sm:p-4 rounded-fluent sm:rounded-fluent-lg bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 flex items-center gap-2.5 sm:gap-3 shadow-sm">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <p className="text-xs sm:text-sm font-medium">{calc.errorMessage}</p>
          </div>
        )}

        {/* ================================================================= */}
        {/* VIEW 1: Core Consumables Calculator Workspace                     */}
        {/* ================================================================= */}
        {activeTab === 'calculator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-6 items-start">
            
            {/* Left Column: Joint Geometry, Material & Process Inputs */}
            <div className="lg:col-span-7 space-y-2 sm:space-y-6">
              <JointConfigCard
                jointType={calc.jointType}
                setJointType={calc.setJointType}
                weldGeometry={calc.weldGeometry}
                setWeldGeometry={calc.setWeldGeometry}
                jointQuantity={calc.jointQuantity}
                setJointQuantity={calc.setJointQuantity}
                pipes={calc.pipes}
                joints={calc.joints}
                selectedPipeId={calc.selectedPipeId}
                handlePipeSelect={calc.handlePipeSelect}
                pipeOdMm={calc.pipeOdMm}
                setPipeOdMm={calc.setPipeOdMm}
                wallThicknessMm={calc.wallThicknessMm}
                setWallThicknessMm={calc.setWallThicknessMm}
                weldLengthMm={calc.weldLengthMm}
                setWeldLengthMm={calc.setWeldLengthMm}
                bevelAngleDeg={calc.bevelAngleDeg}
                setBevelAngleDeg={calc.setBevelAngleDeg}
                rootGapMm={calc.rootGapMm}
                setRootGapMm={calc.setRootGapMm}
                rootFaceMm={calc.rootFaceMm}
                setRootFaceMm={calc.setRootFaceMm}
                capHeightMm={calc.capHeightMm}
                setCapHeightMm={calc.setCapHeightMm}
                filletSizeType={calc.filletSizeType}
                setFilletSizeType={calc.setFilletSizeType}
                filletSizeMm={calc.filletSizeMm}
                setFilletSizeMm={calc.setFilletSizeMm}
                filletSides={calc.filletSides}
                setFilletSides={calc.setFilletSides}
              />

              <MaterialConfigCard
                materials={calc.materials}
                handleMaterialSelect={calc.handleMaterialSelect}
                selectedMaterialId={calc.selectedMaterialId}
                materialDensity={calc.materialDensity}
                setMaterialDensity={calc.setMaterialDensity}
                requiresBackingGas={calc.requiresBackingGas}
                setRequiresBackingGas={calc.setRequiresBackingGas}
                isFluxCoredTig={calc.isFluxCoredTig}
                setIsFluxCoredTig={calc.setIsFluxCoredTig}
              />

              <ProcessConfigCard
                jointType={calc.jointType}
                weldGeometry={calc.weldGeometry}
                wallThicknessMm={calc.wallThicknessMm}
                requiresBackingGas={calc.requiresBackingGas}
                isFluxCoredTig={calc.isFluxCoredTig}
                rootProcess={calc.rootProcess}
                setRootProcess={calc.setRootProcess}
                fillProcess={calc.fillProcess}
                setFillProcess={calc.setFillProcess}
                weldPosition={calc.weldPosition}
                setWeldPosition={calc.setWeldPosition}
                travelDirection={calc.travelDirection}
                setTravelDirection={calc.setTravelDirection}
                gasFlowRateLpm={calc.gasFlowRateLpm}
                setGasFlowRateLpm={calc.setGasFlowRateLpm}
                purgeGasFlowRateLpm={calc.purgeGasFlowRateLpm}
                setPurgeGasFlowRateLpm={calc.setPurgeGasFlowRateLpm}
                purgeStrategy={calc.purgeStrategy}
                setPurgeStrategy={calc.setPurgeStrategy}
                cylinderVolumeM3={calc.cylinderVolumeM3}
                setCylinderVolumeM3={calc.setCylinderVolumeM3}
                tigWireDiaMm={calc.tigWireDiaMm}
                setTigWireDiaMm={calc.setTigWireDiaMm}
                smawElectrodeDiaMm={calc.smawElectrodeDiaMm}
                setSmawElectrodeDiaMm={calc.setSmawElectrodeDiaMm}
                smawLengthMm={calc.smawLengthMm}
                setSmawLengthMm={calc.setSmawLengthMm}
                gmawWireDiaMm={calc.gmawWireDiaMm}
                setGmawWireDiaMm={calc.setGmawWireDiaMm}
                fcawWireDiaMm={calc.fcawWireDiaMm}
                setFcawWireDiaMm={calc.setFcawWireDiaMm}
                sawWireDiaMm={calc.sawWireDiaMm}
                setSawWireDiaMm={calc.setSawWireDiaMm}
                includeShopScrap={calc.includeShopScrap}
                setIncludeShopScrap={calc.setIncludeShopScrap}
                customPassGroups={calc.customPassGroups}
                setCustomPassGroups={calc.setCustomPassGroups}
                useCustomPassSequencing={calc.useCustomPassSequencing}
                setUseCustomPassSequencing={calc.setUseCustomPassSequencing}
                calculate={calc.calculate}
                calculating={calc.calculating}
              />
            </div>

            {/* Right Column: Real-time Calculation & Consumable Estimation Report */}
            <div className="lg:col-span-5 space-y-2 sm:space-y-6">
              <ResultsPanel
                calculationResult={calc.calculationResult}
                calculating={calc.calculating}
              />
            </div>

          </div>
        )}

        {/* ================================================================= */}
        {/* VIEW 2: ASME B36.10M / B36.19M Pipe Standards Catalog             */}
        {/* ================================================================= */}
        {activeTab === 'catalog' && (
          <div className="px-0 sm:px-0">
            <PipeCatalogTable pipes={calc.pipes} />
          </div>
        )}

        {/* ================================================================= */}
        {/* VIEW 3: Standard Qualified PQR Benchmarks Archive                 */}
        {/* ================================================================= */}
        {activeTab === 'pqr' && (
          <div className="px-0 sm:px-0">
            <PqrBenchmarkList onLoadPreset={handleLoadPqrPreset} />
          </div>
        )}

      </main>

      {/* 3. Windows 11 Fluent Status Bar / Footer */}
      <Footer />

    </div>
  );
}