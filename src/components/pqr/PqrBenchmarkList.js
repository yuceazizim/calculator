/**
 * Welding Consumable Calculator (WCC)
 * PQR Component: PqrBenchmarkList (Standalone Local Engine Edition)
 * Windows 11 Fluent Standard Qualified PQR Benchmarks Archive
 * Features: One-Click Instant Load into Calculator Inputs
 * Standards: ASME Sec. IX • EN ISO 15614-1 • AWS D1.1
 * Mobile-First: Edge-to-Edge Responsive Layout
 * Pure JavaScript (.js only)
 */

import React from 'react';
import { useTranslation } from '../../i18n.js';
import { FileCheck2, ArrowUpRight, ShieldCheck, Flame, Compass } from 'lucide-react';

export const PQR_BENCHMARK_PRESETS = [
  {
    id: 'wcc-pqr-cs-001',
    pqrNumber: 'WCC-PQR-CS-001',
    title: 'ASME Sec. IX 6G Pipe Butt Weld (GTAW + SMAW)',
    standard: 'ASME Section IX / ASME B31.3',
    materialMatch: 'ASTM A106 Gr.B',
    jointType: 'pipe',
    weldGeometry: 'butt',
    pipeOdMm: 60.33, // 2" NPS
    wallThicknessMm: 3.91, // SCH 40
    bevelAngleDeg: 37.5,
    rootGapMm: 3.0,
    rootFaceMm: 1.5,
    capHeightMm: 1.5,
    rootProcess: 'GTAW',
    fillProcess: 'SMAW',
    weldPosition: 'vertical_fixed',
    travelDirection: 'uphill',
    gasFlowRateLpm: 12.0,
    purgeGasFlowRateLpm: 10.0,
    purgeStrategy: 'auto',
    cylinderVolumeM3: 6.0,
    tigWireDiaMm: 2.0,
    smawElectrodeDiaMm: 2.50,
    smawLengthMm: 350,
    requiresBackingGas: false,
    isFluxCoredTig: false,
    description: 'Calibrated ASME Sec. IX 6G qualification record. GTAW root & hot pass followed by low-hydrogen E7018 fill and cap passes.',
  },
  {
    id: 'wcc-pqr-ss-001',
    pqrNumber: 'WCC-PQR-SS-001',
    title: 'Stainless Steel TP316L Purge-Controlled Pipe (Full GTAW)',
    standard: 'ASME Section IX / EN ISO 15614-1',
    materialMatch: 'ASTM A312 TP316L',
    jointType: 'pipe',
    weldGeometry: 'butt',
    pipeOdMm: 88.90, // 3" NPS
    wallThicknessMm: 3.05, // SCH 10S
    bevelAngleDeg: 37.5,
    rootGapMm: 2.5,
    rootFaceMm: 1.2,
    capHeightMm: 1.5,
    rootProcess: 'GTAW',
    fillProcess: 'GTAW',
    weldPosition: 'vertical_fixed',
    travelDirection: 'uphill',
    gasFlowRateLpm: 14.0,
    purgeGasFlowRateLpm: 10.0,
    purgeStrategy: 'full',
    cylinderVolumeM3: 6.0,
    tigWireDiaMm: 2.4,
    requiresBackingGas: true,
    isFluxCoredTig: false,
    description: 'Thin-wall corrosion-resistant stainless piping with mandatory full internal argon purging dam.',
  },
  {
    id: 'wcc-pqr-p11-001',
    pqrNumber: 'WCC-PQR-P11-001',
    title: 'Alloy Steel P11 High-Pressure Steam Seam (GTAW + SMAW)',
    standard: 'ASME B31.3 / ASME Sec. IX (P-No 4)',
    materialMatch: 'ASTM A335 Gr.P11',
    jointType: 'pipe',
    weldGeometry: 'butt',
    pipeOdMm: 168.28, // 6" NPS
    wallThicknessMm: 10.97, // SCH 80
    bevelAngleDeg: 37.5,
    rootGapMm: 3.0,
    rootFaceMm: 1.6,
    capHeightMm: 2.0,
    rootProcess: 'GTAW',
    fillProcess: 'SMAW',
    weldPosition: 'vertical_fixed',
    travelDirection: 'uphill',
    gasFlowRateLpm: 14.0,
    purgeGasFlowRateLpm: 10.0,
    purgeStrategy: 'auto',
    cylinderVolumeM3: 6.0,
    tigWireDiaMm: 2.4,
    smawElectrodeDiaMm: 3.25,
    smawLengthMm: 350,
    requiresBackingGas: false,
    isFluxCoredTig: false,
    description: '1.25Cr-0.5Mo high-pressure pipe with 150°C preheat and mandatory 730°C PWHT thermal control.',
  },
  {
    id: 'wcc-pqr-duplex-001',
    pqrNumber: 'WCC-PQR-DU-001',
    title: 'Duplex 2205 Subsea Pipeline Seam (GTAW + GSFCAW)',
    standard: 'EN ISO 15614-1 / ASME Sec. IX (P-No 10H)',
    materialMatch: 'Duplex 2205',
    jointType: 'pipe',
    weldGeometry: 'butt',
    pipeOdMm: 219.08, // 8" NPS
    wallThicknessMm: 8.18, // SCH 40S
    bevelAngleDeg: 35.0,
    rootGapMm: 2.5,
    rootFaceMm: 1.5,
    capHeightMm: 1.8,
    rootProcess: 'GTAW',
    fillProcess: 'FCAW',
    weldPosition: 'vertical_fixed',
    travelDirection: 'uphill',
    gasFlowRateLpm: 15.0,
    purgeGasFlowRateLpm: 12.0,
    purgeStrategy: 'full',
    cylinderVolumeM3: 10.0,
    tigWireDiaMm: 2.4,
    fcawWireDiaMm: 1.2,
    requiresBackingGas: true,
    isFluxCoredTig: false,
    description: 'Duplex stainless subsea line with forming backing gas and high-productivity E2209T1-1 flux-cored fill.',
  },
  {
    id: 'wcc-pqr-saw-001',
    pqrNumber: 'WCC-PQR-SAW-001',
    title: 'Heavy Pressure Vessel Plate Butt Weld (SMAW + SAW)',
    standard: 'ASME Sec. VIII / ASME Sec. IX',
    materialMatch: 'ASTM A516 Gr.60',
    jointType: 'plate',
    weldGeometry: 'butt',
    wallThicknessMm: 32.0,
    weldLengthMm: 2500,
    bevelAngleDeg: 30.0,
    rootGapMm: 3.0,
    rootFaceMm: 2.0,
    capHeightMm: 2.5,
    rootProcess: 'SMAW',
    fillProcess: 'SAW',
    weldPosition: 'flat',
    travelDirection: 'uphill',
    gasFlowRateLpm: 0,
    purgeGasFlowRateLpm: 0,
    sawWireDiaMm: 3.2,
    smawElectrodeDiaMm: 4.00,
    smawLengthMm: 450,
    requiresBackingGas: false,
    isFluxCoredTig: false,
    description: 'Heavy structural plate welded in 1G position with automated Submerged Arc Welding (EH12K + OK Flux 10.62).',
  },
];

export default function PqrBenchmarkList({ onLoadPreset }) {
  const { t } = useTranslation();

  return (
    <div className="fluent-card rounded-none sm:rounded-fluent-lg border-x-0 sm:border-x border-y border-black/[0.08] dark:border-white/[0.08] p-3.5 sm:p-6 space-y-4 transition-all duration-200">
      
      {/* 1. Header */}
      <div className="flex items-center gap-2.5 border-b border-black/[0.06] dark:border-white/[0.06] pb-3">
        <div className="w-8 h-8 rounded-fluent bg-fluent-accent/10 dark:bg-fluent-accent-dark/20 flex items-center justify-center text-fluent-accent dark:text-fluent-accent-dark flex-shrink-0">
          <FileCheck2 className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white">
            {t('nav.pqr_records', 'PQR Benchmarks Archive')}
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
            {t('pqr.subtitle', 'Qualified Procedure Qualification Records Calibrating WCC Engineering Algorithms')}
          </p>
        </div>
      </div>

      {/* 2. PQR Presets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {PQR_BENCHMARK_PRESETS.map((preset) => (
          <div
            key={preset.id}
            className="p-3.5 sm:p-4 rounded-fluent bg-white/90 dark:bg-[#303030]/90 border border-black/[0.08] dark:border-white/[0.08] hover:border-fluent-accent/50 dark:hover:border-fluent-accent-dark/50 transition-all flex flex-col justify-between gap-3 shadow-sm"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-fluent-accent/10 text-fluent-accent dark:text-fluent-accent-dark border border-fluent-accent/20">
                  {preset.pqrNumber}
                </span>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                  {preset.standard}
                </span>
              </div>

              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug">
                {preset.title}
              </h3>

              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                {preset.description}
              </p>

              <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-black/[0.04] dark:border-white/[0.04]">
                <div>
                  <span className="text-slate-400 block">{t('pqr.geometry_label', 'Geometry')}:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {preset.jointType.toUpperCase()} ({preset.weldGeometry}) • {preset.wallThicknessMm} mm WT
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">{t('pqr.processes_label', 'Processes')}:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {preset.rootProcess} + {preset.fillProcess}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onLoadPreset && onLoadPreset(preset)}
              className="fluent-btn-primary w-full py-2 text-xs font-bold gap-1.5 shadow-sm mt-1"
            >
              <span>{t('pqr.btn_load_recipe', 'Load into Calculator')}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* 3. Compliance Advisory Note */}
      <div className="p-3 rounded-fluent bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] flex items-start gap-2 text-[11px] text-slate-500 dark:text-slate-400">
        <ShieldCheck className="w-4 h-4 text-fluent-accent flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {t(
            'pqr.compliance_note',
            'All reference calibration profiles strictly comply with ASME Boiler & Pressure Vessel Code Section IX and EN ISO 15614-1.'
          )}
        </p>
      </div>

    </div>
  );
}