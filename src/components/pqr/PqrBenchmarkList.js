/**
 * Welding Consumable Calculator (WCC)
 * PQR Component: PqrBenchmarkList (Standalone Local Engine Edition)
 * Standard Qualified Procedure Qualification Records (PQR) Benchmark Archive
 * Governing Document: WCC-SPEC-2026-REV01 Master Benchmark Manual (8 Core PQR Recipes)
 * Standards: ASME Sec. IX • ASME B31.3 • AWS A5.X • EN ISO 15614-1
 * Mobile-First: Edge-to-Edge Responsive Layout
 * Pure JavaScript (.js only)
 */

import React from 'react';
import { useTranslation } from '../../i18n.js';
import { FileCheck2, ShieldCheck, ArrowUpRight } from 'lucide-react';

export const PQR_BENCHMARK_PRESETS = [
  {
    reference: 'WCC-PQR-CS-001',
    title: 'Heavy Wall Plate Butt Joint (GTAW + SMAW)',
    position: '3G Vertical-Up',
    spec: 'Plate 28.00 mm (300×400 mm) • ASTM A516 Gr.60 → A573 Gr.70',
    processes: 'GTAW Root & Hot (ER70S-6 Ø2.4 mm) + SMAW Fill & Cap (E7018-1 Ø2.50 / Ø3.25 mm)',
    passes: '33 Total Passes • Preheat: 100°C • PWHT: 621°C (68 min) • Backing Gas: NONE',
    tag: 'ASME Sec. IX / TSGI-PQR-CS-005',
    badgeColor: 'bg-fluent-accent/10 text-fluent-accent dark:text-fluent-accent-dark border-fluent-accent/20',
    preset: {
      jointType: 'plate',
      weldGeometry: 'butt',
      wallThicknessMm: 28.0,
      weldLengthMm: 400,
      bevelAngleDeg: 37.5,
      rootGapMm: 2.5,
      rootFaceMm: 1.6,
      capHeightMm: 1.5,
      rootProcess: 'GTAW',
      fillProcess: 'SMAW',
      weldPosition: 'vertical_fixed',
      travelDirection: 'uphill',
      gasFlowRateLpm: 14.0,
      purgeGasFlowRateLpm: 0,
      purgeStrategy: 'auto',
      cylinderVolumeM3: '6.0',
      tigWireDiaMm: '2.4',
      smawElectrodeDiaMm: '3.25',
      smawLengthMm: '350',
      gmawWireDiaMm: '1.0',
      fcawWireDiaMm: '1.2',
      sawWireDiaMm: '2.5',
      requiresBackingGas: false,
      isFluxCoredTig: false,
      materialMatch: 'A516',
      customPassGroups: [
        { id: 1, label: 'Root Pass', process: 'GTAW', diameterMm: 2.4, lengthMm: 1000, passesCount: 1, torchGasLpm: 14.0, purgeGasLpm: 0 },
        { id: 2, label: 'Hot Pass', process: 'GTAW', diameterMm: 2.4, lengthMm: 1000, passesCount: 1, torchGasLpm: 14.0, purgeGasLpm: 0 },
        { id: 3, label: 'Deep Fill (Narrow Root)', process: 'SMAW', diameterMm: 2.5, lengthMm: 350, passesCount: 2, torchGasLpm: 0, purgeGasLpm: 0 },
        { id: 4, label: 'Main Body Fill', process: 'SMAW', diameterMm: 3.25, lengthMm: 350, passesCount: 23, torchGasLpm: 0, purgeGasLpm: 0 },
        { id: 5, label: 'Cap Cover (Stringers)', process: 'SMAW', diameterMm: 2.5, lengthMm: 350, passesCount: 6, torchGasLpm: 0, purgeGasLpm: 0 },
      ],
    },
  },
  {
    reference: 'WCC-PQR-SS-001',
    title: 'Stainless Pipe Purge-Free Full TIG',
    position: '6G Fixed Circumferential',
    spec: 'Pipe 6" Sch 40S (OD 168.28 mm, t=7.11 mm) • ASTM A312 TP316L',
    processes: '100% GTAW: Root/Hot Kobelco TG-X316L Ø2.4 mm + Fill/Cap ER316L Ø2.4 mm',
    passes: '6 Total Passes • Root: 34–40 mm/min • Fill/Cap: 80–90 mm/min • Backing Gas: NONE',
    tag: 'Purge-Free TIG / TSGI-PQR-SS-R-001',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    preset: {
      jointType: 'pipe',
      weldGeometry: 'butt',
      pipeOdMm: 168.28,
      wallThicknessMm: 7.11,
      bevelAngleDeg: 37.5,
      rootGapMm: 2.5,
      rootFaceMm: 1.6,
      capHeightMm: 1.5,
      rootProcess: 'GTAW',
      fillProcess: 'GTAW',
      weldPosition: 'vertical_fixed',
      travelDirection: 'uphill',
      gasFlowRateLpm: 14.0,
      purgeGasFlowRateLpm: 0,
      purgeStrategy: 'root_hot',
      cylinderVolumeM3: '6.0',
      tigWireDiaMm: '2.4',
      gmawWireDiaMm: '1.0',
      fcawWireDiaMm: '1.2',
      sawWireDiaMm: '2.5',
      requiresBackingGas: true,
      isFluxCoredTig: true,
      materialMatch: 'TP316L',
    },
  },
  {
    reference: 'WCC-PQR-CS-003',
    title: 'Heavy Wall Pipe Stepped Diameter Strategy',
    position: '6G Fixed Circumferential',
    spec: 'Pipe 10" Sch 120/140 (OD 273.05 mm, t=21.44 mm) • A333 Gr.6 → A350 LF2',
    processes: 'GTAW ER70S-3 (Ø2.4 / Ø3.2 mm) + Stepped SMAW E7018-1 (Ø2.50 → Ø3.25 → Ø4.00 mm)',
    passes: '21 Total Passes • Argon 12–16 L/min • Cylinder: 50L / 200 Bar (10 m³) • Backing Gas: NONE',
    tag: 'Heavy Wall ASME Sec. IX',
    badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    preset: {
      jointType: 'pipe',
      weldGeometry: 'butt',
      pipeOdMm: 273.05,
      wallThicknessMm: 21.44,
      bevelAngleDeg: 37.5,
      rootGapMm: 3.0,
      rootFaceMm: 1.5,
      capHeightMm: 1.5,
      rootProcess: 'GTAW',
      fillProcess: 'SMAW',
      weldPosition: 'vertical_fixed',
      travelDirection: 'uphill',
      gasFlowRateLpm: 14.0,
      purgeGasFlowRateLpm: 0,
      purgeStrategy: 'auto',
      cylinderVolumeM3: '10.0',
      tigWireDiaMm: '2.4',
      smawElectrodeDiaMm: '3.25',
      smawLengthMm: '450',
      gmawWireDiaMm: '1.0',
      fcawWireDiaMm: '1.2',
      sawWireDiaMm: '2.5',
      requiresBackingGas: false,
      isFluxCoredTig: false,
      materialMatch: 'A333',
      customPassGroups: [
        { id: 1, label: 'Root Pass', process: 'GTAW', diameterMm: 2.4, lengthMm: 1000, passesCount: 1, torchGasLpm: 14.0, purgeGasLpm: 0 },
        { id: 2, label: 'Hot Pass', process: 'GTAW', diameterMm: 3.2, lengthMm: 1000, passesCount: 1, torchGasLpm: 14.0, purgeGasLpm: 0 },
        { id: 3, label: 'Deep Fill (Narrow Root)', process: 'SMAW', diameterMm: 2.5, lengthMm: 350, passesCount: 2, torchGasLpm: 0, purgeGasLpm: 0 },
        { id: 4, label: 'Intermediate Fill', process: 'SMAW', diameterMm: 3.25, lengthMm: 350, passesCount: 4, torchGasLpm: 0, purgeGasLpm: 0 },
        { id: 5, label: 'Main Body Fill', process: 'SMAW', diameterMm: 4.0, lengthMm: 450, passesCount: 8, torchGasLpm: 0, purgeGasLpm: 0 },
        { id: 6, label: 'Cap Cover (Stringers)', process: 'SMAW', diameterMm: 3.25, lengthMm: 350, passesCount: 5, torchGasLpm: 0, purgeGasLpm: 0 },
      ],
    },
  },
  {
    reference: 'WCC-PQR-CS-002',
    title: 'Large Diameter Automated Submerged Arc (GTAW + SAW)',
    position: 'Root: 6G • Fill/Cap: 1G Rotated',
    spec: 'Pipe 12" (OD 323.85 mm, t=21.44 mm) • ASTM A333 Gr.6 → SA106 Gr.C',
    processes: '3 Passes GTAW (6 mm) + 13 Passes SAW (EH12K Ø2.50 mm + OK Flux 10.62)',
    passes: '16 Total Passes • SAW Speed: 480–535 mm/min (450A / 28.5V) • Flux Ratio: 1.1 kg/kg Wire',
    tag: 'High Productivity SAW / TSGI-PQR-CS-025',
    badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    preset: {
      jointType: 'pipe',
      weldGeometry: 'butt',
      pipeOdMm: 323.85,
      wallThicknessMm: 21.44,
      bevelAngleDeg: 37.5,
      rootGapMm: 2.5,
      rootFaceMm: 1.6,
      capHeightMm: 1.5,
      rootProcess: 'GTAW',
      fillProcess: 'SAW',
      weldPosition: 'flat',
      travelDirection: 'uphill',
      gasFlowRateLpm: 14.0,
      purgeGasFlowRateLpm: 0,
      purgeStrategy: 'auto',
      cylinderVolumeM3: '6.0',
      tigWireDiaMm: '2.4',
      sawWireDiaMm: '2.5',
      gmawWireDiaMm: '1.0',
      fcawWireDiaMm: '1.2',
      requiresBackingGas: false,
      isFluxCoredTig: false,
      materialMatch: 'A333',
      customPassGroups: [
        { id: 1, label: 'Root & Hot Pass (TIG Buffer)', process: 'GTAW', diameterMm: 2.4, lengthMm: 1000, passesCount: 3, torchGasLpm: 14.0, purgeGasLpm: 0 },
        { id: 2, label: 'SAW Groove Fill', process: 'SAW', diameterMm: 2.5, passesCount: 10, torchGasLpm: 0, purgeGasLpm: 0 },
        { id: 3, label: 'SAW Cap Cover', process: 'SAW', diameterMm: 2.5, passesCount: 3, torchGasLpm: 0, purgeGasLpm: 0 },
      ],
    },
  },
  {
    reference: 'WCC-PQR-AS-001',
    title: 'High-Temp Cr-Mo Alloy Pipe (P11: 1.25Cr-0.5Mo)',
    position: '6G Fixed Circumferential',
    spec: 'Pipe 16" (OD 406.40 mm, t=30.00 mm) • ASTM A335 Gr.P11',
    processes: 'GTAW ER80S-B2 + SMAW E8018-B2 (Ø2.50 / Ø3.25 mm)',
    passes: '28 Total Passes • Preheat: 150°C • Mandatory PWHT: 730°C (125 min)',
    tag: 'ASME P-No 4 / TSGI-PQR-AS-002',
    badgeColor: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
    preset: {
      jointType: 'pipe',
      weldGeometry: 'butt',
      pipeOdMm: 406.4,
      wallThicknessMm: 30.0,
      bevelAngleDeg: 37.5,
      rootGapMm: 2.5,
      rootFaceMm: 1.6,
      capHeightMm: 1.5,
      rootProcess: 'GTAW',
      fillProcess: 'SMAW',
      weldPosition: 'vertical_fixed',
      travelDirection: 'uphill',
      gasFlowRateLpm: 14.0,
      purgeGasFlowRateLpm: 0,
      purgeStrategy: 'auto',
      cylinderVolumeM3: '6.0',
      tigWireDiaMm: '2.4',
      smawElectrodeDiaMm: '3.25',
      smawLengthMm: '350',
      gmawWireDiaMm: '1.0',
      fcawWireDiaMm: '1.2',
      sawWireDiaMm: '2.5',
      requiresBackingGas: false,
      isFluxCoredTig: false,
      materialMatch: 'P11',
    },
  },
  {
    reference: 'WCC-PQR-AS-002',
    title: 'High-Temp Alloy Pipe (P9: 9Cr-1Mo)',
    position: '6G Fixed Circumferential',
    spec: 'Pipe 8" Sch 140 (OD 219.08 mm, t=20.62 mm) • ASTM A335 Gr.P9',
    processes: 'GTAW ER80S-B8 (Ø2.4 mm) + SMAW E8015-B8 (Ø3.25 mm)',
    passes: '21 Total Passes • Preheat: 200°C • PWHT: 740°C (125 min) • Argon Purge Mandatory (12–16 L/min)',
    tag: 'ASME P-No 5B / TSGI-PQR-AS-005',
    badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    preset: {
      jointType: 'pipe',
      weldGeometry: 'butt',
      pipeOdMm: 219.08,
      wallThicknessMm: 20.62,
      bevelAngleDeg: 37.5,
      rootGapMm: 2.5,
      rootFaceMm: 1.6,
      capHeightMm: 1.5,
      rootProcess: 'GTAW',
      fillProcess: 'SMAW',
      weldPosition: 'vertical_fixed',
      travelDirection: 'uphill',
      gasFlowRateLpm: 14.0,
      purgeGasFlowRateLpm: 14.0,
      purgeStrategy: 'gtaw_all',
      cylinderVolumeM3: '6.0',
      tigWireDiaMm: '2.4',
      smawElectrodeDiaMm: '3.25',
      smawLengthMm: '350',
      gmawWireDiaMm: '1.0',
      fcawWireDiaMm: '1.2',
      sawWireDiaMm: '2.5',
      requiresBackingGas: true,
      isFluxCoredTig: false,
      materialMatch: 'P9',
    },
  },
  {
    reference: 'WCC-PQR-DS-001',
    title: 'Dissimilar Metal Inconel Transition Joint',
    position: '6G Fixed Circumferential',
    spec: 'Pipe 6" Sch 80 (OD 168.28 mm, t=10.97 mm) • TP316L (SS) → A106 Gr.B (CS)',
    processes: 'Root: GTAW INCONEL 82 (ERNiCr-3 Ø2.4 mm) + Fill/Cap: SMAW INCONEL 182 (ENiCrFe-3 Ø3.25 mm)',
    passes: 'Density: 8.440 g/cm³ • Root Speed: 32.6 mm/min (Viscous Pool) • Argon Purge Mandatory (12–16 L/min)',
    tag: 'Dissimilar / TSGI-PQR-DS-004',
    badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    preset: {
      jointType: 'pipe',
      weldGeometry: 'butt',
      pipeOdMm: 168.28,
      wallThicknessMm: 10.97,
      bevelAngleDeg: 37.5,
      rootGapMm: 2.5,
      rootFaceMm: 1.6,
      capHeightMm: 1.5,
      rootProcess: 'GTAW',
      fillProcess: 'SMAW',
      weldPosition: 'vertical_fixed',
      travelDirection: 'uphill',
      gasFlowRateLpm: 14.0,
      purgeGasFlowRateLpm: 14.0,
      purgeStrategy: 'gtaw_all',
      cylinderVolumeM3: '6.0',
      tigWireDiaMm: '2.4',
      smawElectrodeDiaMm: '3.25',
      smawLengthMm: '350',
      gmawWireDiaMm: '1.0',
      fcawWireDiaMm: '1.2',
      sawWireDiaMm: '2.5',
      requiresBackingGas: true,
      isFluxCoredTig: false,
      materialMatch: 'TP316L to A106B',
    },
  },
  {
    reference: 'WCC-PQR-EN-001',
    title: 'EN Standard Structural MAG Plate (ISO 135)',
    position: 'PF Vertical-Up (Uphill)',
    spec: 'Plate 12.00 mm • EN 10025-2 S355J2+N',
    processes: 'GMAW (MAG 135): G3Si1 Ø1.0 mm Solid Wire • Mix Gas (82% Ar + 18% CO2, 12–16 L/min)',
    passes: '10 Total Passes • Root: 68 mm/min (90A) • Fill: 116–123 mm/min • EN ISO 15614 k = 0.8',
    tag: 'EN ISO 15614-1 / ILK-PQR-CS-EN-003',
    badgeColor: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
    preset: {
      jointType: 'plate',
      weldGeometry: 'butt',
      wallThicknessMm: 12.0,
      weldLengthMm: 400,
      bevelAngleDeg: 37.5,
      rootGapMm: 2.5,
      rootFaceMm: 1.6,
      capHeightMm: 1.5,
      rootProcess: 'GMAW',
      fillProcess: 'GMAW',
      weldPosition: 'vertical_fixed',
      travelDirection: 'uphill',
      gasFlowRateLpm: 14.0,
      purgeGasFlowRateLpm: 0,
      purgeStrategy: 'auto',
      cylinderVolumeM3: '10.0',
      gmawWireDiaMm: '1.0',
      fcawWireDiaMm: '1.2',
      sawWireDiaMm: '2.5',
      requiresBackingGas: false,
      isFluxCoredTig: false,
      materialMatch: 'S355J2',
    },
  },
];

export default function PqrBenchmarkList({ onLoadPreset }) {
  const { t } = useTranslation();

  return (
    <div className="fluent-card rounded-none sm:rounded-fluent-lg border-x-0 sm:border-x border-y border-black/[0.08] dark:border-white/[0.08] p-3.5 sm:p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 sm:mb-5 border-b border-black/[0.06] dark:border-white/[0.06] pb-3 sm:pb-4">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-fluent bg-fluent-accent/10 dark:bg-fluent-accent-dark/20 flex items-center justify-center text-fluent-accent dark:text-fluent-accent-dark flex-shrink-0">
          <FileCheck2 className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white">
            {t('nav.pqr_records', 'PQR Benchmarks')} (WCC-SPEC-2026-REV01)
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
            {t('pqr.subtitle', 'Qualified Procedure Qualification Records Calibrating WCC Engineering Algorithms')}
          </p>
        </div>
      </div>

      {/* PQR Cards Stack */}
      <div className="space-y-3">
        {PQR_BENCHMARK_PRESETS.map((pqr) => (
          <div
            key={pqr.reference}
            className="p-3.5 sm:p-4 rounded-fluent border border-black/[0.08] dark:border-white/[0.08] bg-white/80 dark:bg-[#303030]/80 hover:border-fluent-accent/40 dark:hover:border-fluent-accent-dark/40 transition-all shadow-sm"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                  {pqr.reference}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  — {pqr.title}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${pqr.badgeColor}`}>
                  {pqr.position}
                </span>
                <span className="text-[11px] font-medium text-slate-500 hidden md:inline">
                  {pqr.tag}
                </span>
              </div>
            </div>

            <p className="text-xs font-medium text-slate-800 dark:text-slate-200 mb-1.5">
              {pqr.spec}
            </p>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 space-y-0.5">
                <p>• {pqr.processes}</p>
                <p>• {pqr.passes}</p>
              </div>

              {onLoadPreset && pqr.preset && (
                <button
                  type="button"
                  onClick={() => onLoadPreset(pqr.preset)}
                  className="fluent-btn-primary py-1.5 px-3 text-xs font-bold gap-1.5 flex-shrink-0"
                >
                  <span>{t('pqr.btn_load_recipe', 'Load into Calculator')}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-black/[0.04] dark:border-white/[0.04] text-[11px] text-slate-400 flex items-center gap-1.5">
        <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
        <span>
          {t('pqr.compliance_note', 'All reference calibration profiles strictly comply with ASME Boiler & Pressure Vessel Code Section IX and EN ISO 15614-1.')}
        </span>
      </div>
    </div>
  );
}