/**
 * Welding Consumable Calculator (WCC)
 * Calculator Component: ResultsPanel (Standalone Local Engine Edition)
 * Windows 11 Fluent Results, ASME WPS Pass Schedule (Diameter × Length + Per-Pass Torch/Purge Gas + Position), Thermal Control, Heat Input & EPC Batch Summary
 * Standards: ASME Sec. IX • AWS A5.X • EN ISO 15614-1 • ASME B31.3 Table 331.1.1
 * Governing Document: WCC-SPEC-2026-REV01 Master Benchmark Manual
 * Mobile-First: Edge-to-Edge Flush Layout (rounded-none on mobile, rounded on desktop)
 * Pure JavaScript (.js only)
 */

import React, { useState } from 'react';
import { useTranslation } from '../../i18n.js';
import {
  Gauge,
  Clock,
  Flame,
  Calculator,
  Layers,
  Copy,
  Check,
  Thermometer,
  ListOrdered,
  Package,
  Zap,
  Compass,
} from 'lucide-react';

export default function ResultsPanel({ calculationResult, calculating }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  if (!calculationResult) {
    return (
      <div className="fluent-card rounded-none sm:rounded-fluent-lg border-x-0 sm:border-x border-y border-black/[0.08] dark:border-white/[0.08] p-6 sm:p-12 text-center text-slate-500 dark:text-slate-400">
        <Calculator className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-30 animate-pulse text-fluent-accent" />
        <h3 className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
          {t('buttons.calculating', 'Calculating...')}
        </h3>
        <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
          {t('results.awaiting_inputs', 'Awaiting dimensional and metallurgical inputs...')}
        </p>
      </div>
    );
  }

  const {
    inputSummary,
    geometry,
    consumables,
    productivity,
    shieldingGas,
    heatTreatment,
    projectTotals,
    wpsPassSchedule = [],
  } = calculationResult;

  const jointQty = projectTotals?.jointQuantity || inputSummary?.jointQuantity || 1;
  const isBatchMode = jointQty > 1 && Boolean(projectTotals);

  const tigDia = consumables.tig?.selectedDiameterMm || 2.4;
  const tigDiaLabel = consumables.tig?.diameterLabel || `Ø ${tigDia} mm`;
  const tigLen = consumables.tig?.standardLengthMm || 1000.0;

  const smawDia = consumables.smaw?.selectedDiameterMm || 2.50;
  const smawDiaLabel = consumables.smaw?.diameterLabel || `Ø ${smawDia} mm`;
  const smawLen = consumables.smaw?.selectedLengthMm || consumables.smaw?.standardLengthMm || 350.0;
  const smawFullSpecLabel = consumables.smaw?.includesLengthInLabel
    ? smawDiaLabel
    : `${smawDiaLabel} × ${smawLen} mm`;

  const cylBar = shieldingGas.cylinderPressureBar || (shieldingGas.cylinderVolumeM3 >= 9.5 ? 200 : 150);
  const cylCapLiters = shieldingGas.cylinderCapacityLiters || (shieldingGas.cylinderVolumeM3 >= 9.5 ? 10000 : 6000);

  const torchFlowDefault = shieldingGas.torchGasFlowRateLpm ?? inputSummary?.gasFlowRateLpm;
  const purgeFlowDefault = shieldingGas.purgeGasFlowRateLpm ?? inputSummary?.purgeGasFlowRateLpm;
  const activePurgeStrategy = shieldingGas.purgeStrategy || inputSummary?.purgeStrategy || 'auto';
  const activePosition = inputSummary?.weldPosition || 'vertical_fixed';

  const getPositionBadgeLabel = (pos) => {
    const isPipeJoint = inputSummary?.jointType === 'pipe';
    const isFilletJoint = inputSummary?.weldGeometry === 'fillet';
    switch (pos) {
      case 'flat':
        return isFilletJoint ? '1F (1.20×)' : '1G (1.20×)';
      case 'horizontal':
        return isFilletJoint ? '2F (1.05×)' : '2G (1.05×)';
      case 'overhead':
        return isFilletJoint ? '4F (0.90×)' : '4G (0.90×)';
      case 'vertical_fixed':
      default:
        return isPipeJoint ? '5G/6G (1.00×)' : isFilletJoint ? '3F (1.00×)' : '3G (1.00×)';
    }
  };

  const getPurgeStrategyShortLabel = (strategy) => {
    switch (strategy) {
      case 'full':
        return t('process.purge_strat_full_short', 'Full Purge');
      case 'root_hot':
        return t('process.purge_strat_root_hot_short', 'Root+Hot');
      case 'gtaw_all':
        return t('process.purge_strat_gtaw_short', 'All TIG');
      default:
        return t('process.purge_strat_auto_short', 'Auto');
    }
  };

  const formatLayerName = (name) => {
    if (!name) return '';
    if (name === 'Root & Hot Pass') return t('schedule.layer_root_hot', 'Root & Hot Pass');
    if (name === 'Root Pass') return t('schedule.layer_root', 'Root Pass');
    if (name === 'Hot Pass') return t('schedule.layer_hot', 'Hot Pass');
    if (name === 'Groove Fill') return t('schedule.layer_groove_fill', 'Groove Fill');
    if (name === 'Groove Fill & Cap') return t('schedule.layer_groove_fill_cap', 'Groove Fill & Cap');
    if (name === 'Fillet Fill & Cover') return t('schedule.layer_fillet_fill_cover', 'Fillet Fill & Cover');
    if (name === 'Cap Cover (Both Sides)') return t('schedule.layer_cap_both_sides', 'Cap Cover (Both Sides)');
    if (name.includes('Deep Fill')) return t('schedule.layer_deep_fill', name);
    if (name.includes('Main Body Fill')) return t('schedule.layer_main_fill', name);
    if (name.includes('Cap Cover')) return t('schedule.layer_cap_cover', name);
    return name;
  };

  const formatPassRange = (range) => {
    if (!range) return '';
    return range.replace(/Pass/g, t('schedule.pass_word', 'Pass'));
  };

  const formatRowDimension = (row) => {
    const dStr = `Ø ${Number(row.diameterMm).toFixed(2)}`;
    if (row.lengthMm) {
      return `${dStr} × ${Math.round(row.lengthMm)} mm`;
    }
    return `${dStr} mm`;
  };

  const formatRowGasText = (row) => {
    const parts = [];
    if (Number(row.torchGasLpm) > 0) {
      parts.push(`${t('schedule.torch_short', 'Torch')}: ${row.torchGasLpm} ${t('units.lpm', 'L/min')}`);
    }
    if (Number(row.purgeGasLpm) > 0) {
      parts.push(`${t('schedule.purge_short', 'Purge')}: ${row.purgeGasLpm} ${t('units.lpm', 'L/min')}`);
    }
    return parts.length > 0 ? ` | ${parts.join(', ')}` : '';
  };

  const handleCopySummary = () => {
    let scheduleText = '';
    if (wpsPassSchedule && wpsPassSchedule.length > 0) {
      scheduleText =
        `\n• ${t('results.wps_pass_schedule', 'ASME WPS Pass & Layer Schedule')}:\n` +
        wpsPassSchedule
          .map(
            (p) =>
              `  - ${formatPassRange(p.passRange)} (${formatLayerName(p.layerName)}): ${p.process} ${formatRowDimension(p)} [${p.passesCount} ${t('results.pass_count', 'Passes')}${p.heatInputKjMm ? ` | ${p.heatInputKjMm} kJ/mm` : ''}${formatRowGasText(p)}] -> ${p.pieceCount} ${t(`units.${p.unit}`, p.unit)} (${p.netWeightGrams}g)`
          )
          .join('\n');
    }

    let batchText = '';
    if (isBatchMode) {
      batchText = `\n\n=== PROJECT BATCH TOTALS (${jointQty.toLocaleString()} IDENTICAL JOINTS) ===
• Total Seam Length: ${projectTotals.totalSeamMeters.toLocaleString()} m
• Total Net Weld Metal: ${projectTotals.netWeldWeightKg.toLocaleString()} kg (${projectTotals.netWeldWeightTons} Tons)
• Total Arc-On Time: ${projectTotals.productivity.totalArcTimeHours.toLocaleString()} hrs (~${projectTotals.productivity.totalArcShifts8h.toLocaleString()} shifts @ 8h)
${projectTotals.tig?.active ? `• Total TIG Rods (${projectTotals.tig.diameterLabel || tigDiaLabel}): ${projectTotals.tig.rodsCount.toLocaleString()} rods (${projectTotals.tig.grossWeightKg.toLocaleString()} kg | ${projectTotals.tig.boxes5KgCount.toLocaleString()} boxes @ 5kg)` : ''}
${projectTotals.smaw?.active ? `• Total SMAW Electrodes (${projectTotals.smaw.diameterLabel || smawFullSpecLabel}): ${projectTotals.smaw.electrodesCount.toLocaleString()} pcs (${projectTotals.smaw.grossWeightKg.toLocaleString()} kg | ${projectTotals.smaw.boxesCount.toLocaleString()} boxes @ 4.5kg)` : ''}
${projectTotals.gmaw?.active ? `• Total GMAW Wire: ${projectTotals.gmaw.grossWeightKg.toLocaleString()} kg (${projectTotals.gmaw.spools15KgCount.toLocaleString()} spools @ 15kg)` : ''}
${projectTotals.fcaw?.active ? `• Total FCAW Wire: ${projectTotals.fcaw.grossWeightKg.toLocaleString()} kg (${projectTotals.fcaw.spools15KgCount.toLocaleString()} spools @ 15kg)` : ''}
• Total Shielding & Purge Gas: ${projectTotals.gas.totalGasLiters.toLocaleString()} L (${projectTotals.gas.totalGasM3.toLocaleString()} m³ | ${projectTotals.gas.cylindersRequired.toLocaleString()} Cylinders @ ${cylBar} bar)`;
    }

    const summaryText = `WCC Weld Consumable Estimate (Per Single Joint):
• Seam: ${inputSummary.jointType.toUpperCase()} (${inputSummary.weldGeometry}) | Position: ${getPositionBadgeLabel(activePosition)}
• Dimensions: ${inputSummary.jointType === 'pipe' ? `OD: ${inputSummary.pipeOdMm || inputSummary.meanDiameterMm}mm` : `Length: ${inputSummary.seamLengthMm}mm`} | WT: ${inputSummary.wallThicknessMm}mm
• Cross-Section Area: ${geometry.crossSectionAreaMm2} mm² | Net Metal: ${geometry.totalNetWeldWeightKg} kg (${geometry.totalNetWeldWeightGrams} g)
• Total Arc Time: ${productivity.totalArcTimeMinutes} min (~${productivity.estimatedPassCount} passes)${productivity.avgHeatInputKjMm ? ` | Avg Heat Input: ${productivity.avgHeatInputKjMm} kJ/mm` : ''}
${consumables.tig?.active ? `• TIG Rods: ${consumables.tig.rodsCount} rods (${tigDiaLabel} × ${tigLen}mm, ${consumables.tig.grossWeightKg}kg)` : ''}
${consumables.smaw?.active ? `• SMAW Electrodes: ${consumables.smaw.electrodesCount} pcs (${smawFullSpecLabel}, ${consumables.smaw.grossWeightKg}kg)` : ''}
${consumables.gmaw?.active ? `• GMAW Wire (Ø ${consumables.gmaw.recommendedDiameterMm} mm): ${consumables.gmaw.spoolWeightKg} kg (~${consumables.gmaw.spoolsCount} spools of 15kg)` : ''}
${consumables.fcaw?.active ? `• FCAW Wire (Ø ${consumables.fcaw.recommendedDiameterMm} mm): ${consumables.fcaw.spoolWeightKg} kg (~${consumables.fcaw.spoolsCount} spools of 15kg)` : ''}
${consumables.saw?.active ? `• SAW Wire (Ø ${consumables.saw.recommendedWireDiaMm} mm): ${consumables.saw.wireWeightKg} kg + Flux: ${consumables.saw.fluxWeightKg} kg` : ''}
${scheduleText}
• Torch Gas: ${shieldingGas.torchGasLiters} L | Purge Gas: ${shieldingGas.purgeGasLiters} L | Total Gas: ${shieldingGas.totalGasLiters} L (${shieldingGas.cylindersRequired} cylinders @ 50L/${cylBar} bar)
${heatTreatment?.preheatMinCelsius ? `• Thermal: Min Preheat ${heatTreatment.preheatMinCelsius}°C | Max Interpass ${heatTreatment.interpassMaxCelsius}°C` : ''}
${heatTreatment?.required ? `• PWHT: MANDATORY at ${heatTreatment.temperatureCelsius}°C (${heatTreatment.holdingTimeMin} min)` : ''}${batchText}`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-2 sm:space-y-6">
      
      {/* 1. TOP SUMMARY METRIC CARDS (PER 1 JOINT) */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 px-2 sm:px-0">
        <div className="fluent-card p-3 sm:p-4 rounded-fluent sm:rounded-fluent-lg transition-all hover:border-fluent-accent/40">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-[11px] sm:text-xs font-semibold truncate">
              {t('results.net_weld_weight', 'Net Deposited Metal')}
              {isBatchMode && <span className="text-[9px] text-slate-400 ml-1">(1×)</span>}
            </span>
            <Gauge className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-fluent-accent dark:text-fluent-accent-dark flex-shrink-0" />
          </div>
          <div className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white truncate">
            {geometry.totalNetWeldWeightGrams}
            <span className="text-[10px] sm:text-xs font-normal text-slate-500 ml-1">
              {t('units.grams', 'g')}
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            <span>{geometry.totalNetWeldWeightKg} {t('units.kg', 'kg')}</span>
            <span className="hidden sm:inline">
              {geometry.crossSectionAreaMm2} mm² • {geometry.weldVolumeCm3} cm³
            </span>
          </div>
        </div>

        <div className="fluent-card p-3 sm:p-4 rounded-fluent sm:rounded-fluent-lg transition-all hover:border-emerald-500/40">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-[11px] sm:text-xs font-semibold truncate">
              {t('results.arc_time', 'Total Arc-On Time')}
              {isBatchMode && <span className="text-[9px] text-slate-400 ml-1">(1×)</span>}
            </span>
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 flex-shrink-0" />
          </div>
          <div className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white truncate">
            {productivity.totalArcTimeMinutes}
            <span className="text-[10px] sm:text-xs font-normal text-slate-500 ml-1">
              {t('units.minutes', 'min')}
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            <span>~{productivity.estimatedPassCount} {t('results.pass_count', 'Passes')}</span>
            <span>{productivity.totalArcTimeHours} {t('units.hours', 'hrs')}</span>
          </div>
        </div>
      </div>

      {/* 2. ACTION BAR: COPY SUMMARY */}
      <div className="px-2 sm:px-0 print:hidden">
        <button
          type="button"
          onClick={handleCopySummary}
          className="fluent-btn-secondary w-full py-2 px-3 text-xs font-semibold gap-1.5 shadow-sm"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span className="text-emerald-600 dark:text-emerald-400 font-bold truncate">
                {t('results.copied', 'Copied!')}
              </span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{t('buttons.copy_summary', 'Copy Summary')}</span>
            </>
          )}
        </button>
      </div>

      {/* 2B. EPC BATCH & PROCUREMENT ORDER SUMMARY */}
      {isBatchMode && (
        <div className="fluent-card rounded-none sm:rounded-fluent-lg border-x-0 sm:border-x border-y-2 border-fluent-accent/40 bg-gradient-to-br from-blue-50/90 via-white to-indigo-50/70 dark:from-blue-950/30 dark:via-[#282828] dark:to-indigo-950/20 p-3.5 sm:p-5 space-y-3 shadow-md animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-fluent-accent/15 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-fluent bg-fluent-accent text-white flex items-center justify-center shadow-sm">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                  {t('batch.title', 'Project Batch & Procurement Order')}
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {t('batch.subtitle', 'Exact unrounded EPC scale summation across all joints')}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-fluent-accent text-white shadow-sm">
                {jointQty.toLocaleString()} × {t('batch.joints_unit', 'Joints')}
              </span>
              <span className="block text-[10px] font-semibold text-slate-500 mt-1">
                {projectTotals.totalSeamMeters.toLocaleString()} m {t('batch.total_seam', 'Total Seam')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 rounded-fluent bg-white/80 dark:bg-[#202020]/80 border border-black/[0.06] dark:border-white/[0.06]">
              <span className="text-[10px] font-semibold text-slate-500 block truncate">
                {t('batch.total_metal', 'Total Net Metal')}
              </span>
              <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                {projectTotals.netWeldWeightKg.toLocaleString()} <span className="text-[10px] font-normal">{t('units.kg', 'kg')}</span>
              </span>
              <span className="block text-[9px] text-fluent-accent font-bold">
                ({projectTotals.netWeldWeightTons} {t('batch.tons', 'Tons')})
              </span>
            </div>

            <div className="p-2.5 rounded-fluent bg-white/80 dark:bg-[#202020]/80 border border-black/[0.06] dark:border-white/[0.06]">
              <span className="text-[10px] font-semibold text-slate-500 block truncate">
                {t('batch.total_arc_hours', 'Total Arc-On')}
              </span>
              <span className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400">
                {projectTotals.productivity.totalArcTimeHours.toLocaleString()} <span className="text-[10px] font-normal">{t('units.hours', 'hrs')}</span>
              </span>
              <span className="block text-[9px] text-slate-500 font-semibold">
                ~{projectTotals.productivity.totalArcShifts8h.toLocaleString()} {t('batch.shifts_8h', 'Shifts (8h)')}
              </span>
            </div>

            <div className="p-2.5 rounded-fluent bg-white/80 dark:bg-[#202020]/80 border border-black/[0.06] dark:border-white/[0.06]">
              <span className="text-[10px] font-semibold text-slate-500 block truncate">
                {t('batch.total_cylinders', 'Gas Cylinders')}
              </span>
              <span className="text-sm sm:text-base font-black text-blue-600 dark:text-blue-400">
                {projectTotals.gas.cylindersRequired.toLocaleString()} <span className="text-[10px] font-normal">{t('batch.cyl_unit', 'Cyl')}</span>
              </span>
              <span className="block text-[9px] text-slate-500 font-semibold">
                {projectTotals.gas.totalGasM3.toLocaleString()} {t('units.m3', 'm³')} ({projectTotals.gas.totalGasLiters.toLocaleString()} L)
              </span>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            {projectTotals.tig?.active && (
              <div className="p-2.5 rounded-fluent bg-white/90 dark:bg-[#303030]/90 border border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    {t('results.tig_rods', 'TIG Rod')} ({projectTotals.tig.diameterLabel || tigDiaLabel})
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {projectTotals.tig.rodsCount.toLocaleString()} {t('units.rods', 'rods')} • {projectTotals.tig.grossWeightKg.toLocaleString()} {t('units.kg', 'kg')} {t('batch.gross', 'gross')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm sm:text-base font-black text-fluent-accent">
                    {projectTotals.tig.boxes5KgCount.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 ml-1">
                    {t('batch.boxes_5kg', 'Boxes (5kg)')}
                  </span>
                </div>
              </div>
            )}

            {projectTotals.smaw?.active && (
              <div className="p-2.5 rounded-fluent bg-white/90 dark:bg-[#303030]/90 border border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    {t('results.smaw_electrodes', 'Covered Electrode')} ({projectTotals.smaw.diameterLabel || smawFullSpecLabel})
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {projectTotals.smaw.electrodesCount.toLocaleString()} {t('units.electrodes', 'electrodes')} • {projectTotals.smaw.grossWeightKg.toLocaleString()} {t('units.kg', 'kg')} {t('batch.gross', 'gross')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm sm:text-base font-black text-amber-600 dark:text-amber-400">
                    {projectTotals.smaw.boxesCount.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 ml-1">
                    {t('batch.boxes_smaw', 'Boxes (4.5kg)')}
                  </span>
                </div>
              </div>
            )}

            {projectTotals.gmaw?.active && (
              <div className="p-2.5 rounded-fluent bg-white/90 dark:bg-[#303030]/90 border border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    {t('results.gmaw_wire', 'MIG/MAG Spool Wire')} (Ø {consumables.gmaw?.recommendedDiameterMm} mm)
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {projectTotals.gmaw.grossWeightKg.toLocaleString()} {t('units.kg', 'kg')} {t('batch.gross', 'gross')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400">
                    {projectTotals.gmaw.spools15KgCount.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 ml-1">
                    {t('batch.spools_15kg', 'Spools (15kg)')}
                  </span>
                </div>
              </div>
            )}

            {projectTotals.fcaw?.active && (
              <div className="p-2.5 rounded-fluent bg-white/90 dark:bg-[#303030]/90 border border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    {t('results.fcaw_wire', 'FCAW Flux-Cored Wire')} (Ø {consumables.fcaw?.recommendedDiameterMm} mm)
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {projectTotals.fcaw.grossWeightKg.toLocaleString()} {t('units.kg', 'kg')} {t('batch.gross', 'gross')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm sm:text-base font-black text-indigo-600 dark:text-indigo-400">
                    {projectTotals.fcaw.spools15KgCount.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 ml-1">
                    {t('batch.spools_15kg', 'Spools (15kg)')}
                  </span>
                </div>
              </div>
            )}

            {projectTotals.saw?.active && (
              <div className="p-2.5 rounded-fluent bg-white/90 dark:bg-[#303030]/90 border border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    {t('results.saw_wire_flux', 'Submerged Arc Wire & Flux')} (Ø {consumables.saw?.recommendedWireDiaMm} mm)
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {t('results.wire_label', 'Wire')}: {projectTotals.saw.wireWeightKg.toLocaleString()} {t('units.kg', 'kg')} • {t('results.flux_label', 'Flux')}: {projectTotals.saw.fluxWeightKg.toLocaleString()} {t('units.kg', 'kg')}
                  </span>
                </div>
                <div className="text-right text-[11px] font-bold text-purple-600 dark:text-purple-400">
                  {projectTotals.saw.wireSpools25KgCount.toLocaleString()} {t('batch.spools_25kg', 'Spools')} • {projectTotals.saw.fluxBags25KgCount.toLocaleString()} {t('batch.bags_25kg', 'Bags (25kg)')}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. THERMAL CONTROL ADVISORY */}
      {heatTreatment && (
        <div
          className={`mx-2 sm:mx-0 p-3 sm:p-4 rounded-fluent border space-y-2 animate-in fade-in duration-150 ${
            heatTreatment.required
              ? 'bg-amber-50/70 dark:bg-amber-950/25 border-amber-300/60 dark:border-amber-700/40'
              : 'bg-slate-50/80 dark:bg-[#2a2a2a]/80 border-black/[0.08] dark:border-white/[0.08]'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Thermometer
                className={`w-4 h-4 flex-shrink-0 ${
                  heatTreatment.required ? 'text-amber-600 dark:text-amber-400' : 'text-fluent-accent'
                }`}
              />
              <span
                className={`text-xs font-bold truncate ${
                  heatTreatment.required
                    ? 'text-amber-950 dark:text-amber-200'
                    : 'text-slate-900 dark:text-white'
                }`}
              >
                {heatTreatment.required
                  ? t('results.pwht_mandatory', 'Post-Weld Heat Treatment (PWHT) Mandatory')
                  : t('results.thermal_control_title', 'Preheat & Interpass Control')}
              </span>
            </div>
            {heatTreatment.required && (
              <span className="px-2 py-0.5 text-[10px] font-extrabold bg-amber-200 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 rounded flex-shrink-0">
                PWHT {heatTreatment.temperatureCelsius}°C
              </span>
            )}
          </div>

          {heatTreatment.preheatMinCelsius !== undefined && (
            <div className="grid grid-cols-2 gap-2">
              <div className="px-2.5 py-1.5 rounded bg-white/75 dark:bg-[#1f1f1f]/75 border border-black/[0.05] dark:border-white/[0.05] flex items-center justify-between text-[11px]">
                <span className="text-slate-500 dark:text-slate-400">
                  {t('results.min_preheat', 'Min Preheat')}:
                </span>
                <strong className="text-slate-900 dark:text-white">
                  {heatTreatment.preheatMinCelsius}°C
                </strong>
              </div>
              <div className="px-2.5 py-1.5 rounded bg-white/75 dark:bg-[#1f1f1f]/75 border border-black/[0.05] dark:border-white/[0.05] flex items-center justify-between text-[11px]">
                <span className="text-slate-500 dark:text-slate-400">
                  {t('results.max_interpass', 'Max Interpass')}:
                </span>
                <strong className="text-slate-900 dark:text-white">
                  ≤ {heatTreatment.interpassMaxCelsius}°C
                </strong>
              </div>
            </div>
          )}

          <p
            className={`text-[11px] leading-relaxed ${
              heatTreatment.required
                ? 'text-amber-900 dark:text-amber-300'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            {heatTreatment.required ? heatTreatment.note : heatTreatment.preheatNote || heatTreatment.note}
          </p>

          {heatTreatment.required && (
            <div className="flex items-center gap-3 text-[10px] text-amber-800/80 dark:text-amber-400/80 pt-1 border-t border-amber-200/60 dark:border-amber-800/40">
              <span>
                {t('results.min_holding_time', 'Minimum Holding Time')}:{' '}
                <strong>{heatTreatment.holdingTimeMin} {t('units.minutes', 'min')}</strong>
              </span>
              <span>•</span>
              <span>
                {t('results.governing_code', 'Governing Code')}: <strong>ASME B31.3 / ASME Sec. IX</strong>
              </span>
            </div>
          )}
        </div>
      )}

      {/* 4. ASME WPS PASS & LAYER SCHEDULE TABLE */}
      {wpsPassSchedule && wpsPassSchedule.length > 0 && (
        <div className="fluent-card rounded-none sm:rounded-fluent-lg border-x-0 sm:border-x border-y border-black/[0.08] dark:border-white/[0.08] p-3.5 sm:p-5 transition-all duration-200">
          <div className="flex items-center justify-between gap-2 mb-3 border-b border-black/[0.06] dark:border-white/[0.06] pb-2.5 flex-wrap">
            <div className="flex items-center gap-2">
              <ListOrdered className="w-4 h-4 text-fluent-accent" />
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                {t('results.wps_pass_schedule', 'ASME WPS Pass & Layer Schedule')}
              </h3>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold bg-slate-500/10 text-slate-700 dark:text-slate-300 border border-slate-500/20">
                <Compass className="w-3 h-3 text-fluent-accent" />
                <span>{getPositionBadgeLabel(activePosition)}</span>
              </span>
              {productivity.avgHeatInputKjMm > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                  <Zap className="w-3 h-3" />
                  <span>
                    {t('results.avg_heat_input', 'Avg')}: {productivity.avgHeatInputKjMm} kJ/mm
                  </span>
                </span>
              )}
              <span className="fluent-badge text-[9px] sm:text-[10px] font-semibold">
                {productivity.estimatedPassCount} {t('results.pass_count', 'Passes')}
              </span>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block rounded-fluent border border-black/[0.06] dark:border-white/[0.06] overflow-hidden">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr className="border-b border-black/[0.08] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.02] text-slate-700 dark:text-slate-300">
                  <th className="py-2 px-2.5 font-bold">{t('schedule.pass_range', 'Pass Range')}</th>
                  <th className="py-2 px-2 font-bold">{t('schedule.process_spec', 'Process & Spec')}</th>
                  <th className="py-2 px-2 font-bold text-center">{t('schedule.heat_input', 'Heat Input')}</th>
                  <th className="py-2 px-1.5 font-bold text-center">{t('schedule.passes', 'Passes')}</th>
                  <th className="py-2 px-2.5 font-bold text-right">{t('schedule.required_qty', 'Required Qty')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
                {wpsPassSchedule.map((row, idx) => {
                  const hasTorchGas = Number(row.torchGasLpm) > 0;
                  const hasPurgeGas = Number(row.purgeGasLpm) > 0;

                  return (
                    <tr key={idx} className="hover:bg-fluent-accent/[0.03] transition-colors">
                      <td className="py-2 px-2.5 align-top">
                        <span className="font-bold text-fluent-accent dark:text-fluent-accent-dark block whitespace-nowrap">
                          {formatPassRange(row.passRange)}
                        </span>
                        <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300 leading-tight block mt-0.5">
                          {formatLayerName(row.layerName)}
                        </span>
                      </td>
                      <td className="py-2 px-2 align-top">
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {row.process}
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 text-[10px]">
                            {row.fillerClass}
                          </span>
                        </div>
                        <span className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5 whitespace-nowrap">
                          {formatRowDimension(row)}
                        </span>
                        {(hasTorchGas || hasPurgeGas) && (
                          <div className="flex items-center gap-1.5 flex-wrap mt-0.5 text-[9px] font-semibold">
                            {hasTorchGas && (
                              <span className="text-sky-600 dark:text-sky-400 whitespace-nowrap">
                                {t('schedule.torch_short', 'Torch')}: {row.torchGasLpm} {t('units.lpm', 'L/min')}
                              </span>
                            )}
                            {hasTorchGas && hasPurgeGas && (
                              <span className="text-slate-300 dark:text-slate-600">•</span>
                            )}
                            {hasPurgeGas && (
                              <span className="text-blue-600 dark:text-blue-400 whitespace-nowrap">
                                {t('schedule.purge_short', 'Purge')}: {row.purgeGasLpm} {t('units.lpm', 'L/min')}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-2 text-center align-top whitespace-nowrap">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                          {row.heatInputKjMm ? `${row.heatInputKjMm} kJ/mm` : '-'}
                        </span>
                        {row.amperageAvg && (
                          <span className="block text-[9px] text-slate-400 mt-0.5">
                            {row.amperageAvg}A / {row.voltageAvg}V (k={row.thermalEfficiencyK})
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-1.5 text-center align-top font-bold text-slate-700 dark:text-slate-300">
                        {row.passesCount}
                      </td>
                      <td className="py-2 px-2.5 text-right align-top font-extrabold text-slate-900 dark:text-white whitespace-nowrap">
                        <span>
                          {row.pieceCount}{' '}
                          <span className="text-[9px] font-normal text-slate-500">
                            {t(`units.${row.unit}`, row.unit)}
                          </span>
                        </span>
                        <span className="block text-[9px] font-normal text-slate-400 mt-0.5">
                          ({row.netWeightGrams} g)
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Stack View */}
          <div className="sm:hidden space-y-2">
            {wpsPassSchedule.map((row, idx) => {
              const hasTorchGas = Number(row.torchGasLpm) > 0;
              const hasPurgeGas = Number(row.purgeGasLpm) > 0;

              return (
                <div
                  key={idx}
                  className="p-2.5 rounded-fluent bg-white/90 dark:bg-[#333]/90 border border-black/[0.06] dark:border-white/[0.06] space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-fluent-accent dark:text-fluent-accent-dark">
                      {formatPassRange(row.passRange)} — {formatLayerName(row.layerName)}
                    </span>
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                      {row.pieceCount} {t(`units.${row.unit}`, row.unit)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-slate-100 dark:bg-slate-800">
                        {row.process}
                      </span>
                      <span>
                        {row.fillerClass} ({formatRowDimension(row)})
                      </span>
                    </div>
                    <span className="font-semibold">{row.passesCount} {t('results.pass_count', 'Passes')}</span>
                  </div>
                  {(hasTorchGas || hasPurgeGas) && (
                    <div className="flex items-center gap-2 text-[10px] font-semibold">
                      {hasTorchGas && (
                        <span className="text-sky-600 dark:text-sky-400">
                          {t('schedule.torch_short', 'Torch')}: {row.torchGasLpm} {t('units.lpm', 'L/min')}
                        </span>
                      )}
                      {hasTorchGas && hasPurgeGas && (
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                      )}
                      {hasPurgeGas && (
                        <span className="text-blue-600 dark:text-blue-400">
                          {t('schedule.purge_short', 'Purge')}: {row.purgeGasLpm} {t('units.lpm', 'L/min')}
                        </span>
                      )}
                    </div>
                  )}
                  {row.heatInputKjMm && (
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-black/[0.04] dark:border-white/[0.04]">
                      <span>{row.amperageAvg}A / {row.voltageAvg}V (k={row.thermalEfficiencyK})</span>
                      <span className="font-semibold text-amber-600 dark:text-amber-400">
                        {row.heatInputKjMm} kJ/mm
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. CONSUMABLES REQUIREMENT CARD */}
      <div className="fluent-card rounded-none sm:rounded-fluent-lg border-x-0 sm:border-x border-y border-black/[0.08] dark:border-white/[0.08] p-3.5 sm:p-5 transition-all duration-200">
        <div className="flex items-center justify-between mb-3 border-b border-black/[0.06] dark:border-white/[0.06] pb-2.5">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-fluent-accent" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              {t('results.consumables_title', 'Required Welding Consumables')}
              {isBatchMode && (
                <span className="text-[10px] font-normal text-slate-400 ml-1">
                  ({t('results.single_joint_tag', '1× Joint')})
                </span>
              )}
            </h3>
          </div>
          <span className="fluent-badge text-[9px] sm:text-[10px] font-semibold">
            {inputSummary.includeShopScrap ? t('results.site_safety_badge', '+15% Site Safety Calibrated') : t('results.lab_pqr_badge', 'Theoretical Lab / PQR')}
          </span>
        </div>

        <div className="space-y-2.5">
          {consumables.tig && consumables.tig.active && (
            <div className="p-2.5 sm:p-3 rounded-fluent bg-white/90 dark:bg-[#333]/90 border border-black/[0.06] dark:border-white/[0.06] space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {t('results.tig_rods', 'TIG Rod')} ({tigDiaLabel} × {tigLen} mm)
                  </span>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded flex-shrink-0">
                    {consumables.tig.awsClass}
                  </span>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <span className="text-base sm:text-xl font-extrabold text-fluent-accent dark:text-fluent-accent-dark">
                    {consumables.tig.rodsCount}
                  </span>
                  <span className="text-[10px] sm:text-xs text-slate-500 ml-1">
                    {t('units.rods', 'rods')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1 text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-300 pt-1.5 border-t border-black/[0.04] dark:border-white/[0.04]">
                <div>
                  <span className="text-slate-400">{t('results.spec', 'Spec')}:</span> {tigDiaLabel}
                </div>
                <div className="text-right">
                  <span className="text-slate-400">{t('results.net_deposit', 'Net')}:</span> {consumables.tig.netWeightGrams}g
                </div>
                <div className="col-span-2 text-right font-semibold text-slate-800 dark:text-slate-200">
                  <span className="text-slate-400 font-normal">{t('results.gross_weight', 'Gross')}:</span> {consumables.tig.grossWeightGrams}g ({consumables.tig.grossWeightKg} {t('units.kg', 'kg')})
                </div>
              </div>
            </div>
          )}

          {consumables.smaw && consumables.smaw.active && (
            <div className="p-2.5 sm:p-3 rounded-fluent bg-white/90 dark:bg-[#333]/90 border border-black/[0.06] dark:border-white/[0.06] space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {t('results.smaw_electrodes', 'Covered Electrode')} ({smawFullSpecLabel})
                  </span>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded flex-shrink-0">
                    {consumables.smaw.awsClass}
                  </span>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <span className="text-base sm:text-xl font-extrabold text-amber-600 dark:text-amber-400">
                    {consumables.smaw.electrodesCount}
                  </span>
                  <span className="text-[10px] sm:text-xs text-slate-500 ml-1">
                    {t('units.electrodes', 'electrodes')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1 text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-300 pt-1.5 border-t border-black/[0.04] dark:border-white/[0.04]">
                <div className="truncate">
                  <span className="text-slate-400">{t('results.spec', 'Spec')}:</span> {smawFullSpecLabel}
                </div>
                <div className="text-right">
                  <span className="text-slate-400">{t('results.net_deposit', 'Net')}:</span> {consumables.smaw.netWeightGrams}g
                </div>
                <div className="col-span-2 text-right font-semibold text-slate-800 dark:text-slate-200">
                  <span className="text-slate-400 font-normal">{t('results.gross_weight', 'Gross')}:</span> {consumables.smaw.grossWeightGrams}g ({consumables.smaw.grossWeightKg} {t('units.kg', 'kg')})
                </div>
              </div>
            </div>
          )}

          {consumables.fcaw && consumables.fcaw.active && (
            <div className="p-2.5 sm:p-3 rounded-fluent bg-white/90 dark:bg-[#333]/90 border border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {t('results.fcaw_wire', 'FCAW Spool Wire')} (Ø {consumables.fcaw.recommendedDiameterMm} mm)
                  </span>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded">
                    {consumables.fcaw.awsClass}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {t('results.fcaw_efficiency_desc', 'Gas Shielded (85% Deposition Efficiency)')} • ~{consumables.fcaw.spoolsCount} × 15kg
                </div>
              </div>
              <div className="text-right">
                <span className="text-base sm:text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
                  {consumables.fcaw.spoolWeightKg}
                </span>
                <span className="text-[10px] sm:text-xs text-slate-500 ml-1">{t('units.kg', 'kg')}</span>
              </div>
            </div>
          )}

          {consumables.gmaw && consumables.gmaw.active && (
            <div className="p-2.5 sm:p-3 rounded-fluent bg-white/90 dark:bg-[#333]/90 border border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {t('results.gmaw_wire', 'MIG/MAG Spool Wire')} (Ø {consumables.gmaw.recommendedDiameterMm} mm)
                  </span>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded">
                    {consumables.gmaw.awsClass}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {t('results.gmaw_efficiency_desc', 'Solid Wire (88% Deposition Efficiency)')} • ~{consumables.gmaw.spoolsCount} × 15kg
                </div>
              </div>
              <div className="text-right">
                <span className="text-base sm:text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {consumables.gmaw.spoolWeightKg}
                </span>
                <span className="text-[10px] sm:text-xs text-slate-500 ml-1">{t('units.kg', 'kg')}</span>
              </div>
            </div>
          )}

          {consumables.saw && consumables.saw.active && (
            <div className="p-2.5 sm:p-3 rounded-fluent bg-white/90 dark:bg-[#333]/90 border border-black/[0.06] dark:border-white/[0.06] space-y-1.5">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-700 dark:text-slate-300">
                  {t('results.saw_wire', 'Submerged Arc Wire')} ({consumables.saw.wireAwsClass} Ø {consumables.saw.recommendedWireDiaMm} mm):
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {consumables.saw.wireWeightKg} {t('units.kg', 'kg')}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-700 dark:text-slate-300">
                  {t('results.saw_flux', 'Submerged Arc Flux')} ({consumables.saw.fluxTradeName} • 1.1×):
                </span>
                <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                  {consumables.saw.fluxWeightKg} {t('units.kg', 'kg')}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 6. SHIELDING & PURGING GAS ANALYSIS CARD */}
      <div className="fluent-card rounded-none sm:rounded-fluent-lg border-x-0 sm:border-x border-y border-black/[0.08] dark:border-white/[0.08] p-3.5 sm:p-5 transition-all duration-200">
        <div className="flex items-center justify-between gap-2 mb-3 border-b border-black/[0.06] dark:border-white/[0.06] pb-2.5 flex-wrap">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-fluent-accent dark:text-fluent-accent-dark" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              {t('results.gas_title', 'Shielding & Purge Gas Consumption')}
              {isBatchMode && (
                <span className="text-[10px] font-normal text-slate-400 ml-1">
                  ({t('results.single_joint_tag', '1× Joint')})
                </span>
              )}
            </h3>
          </div>
          {shieldingGas.purgeGasApplied && (
            <span className="px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
              {t('results.purge_applied', 'Purge Applied (40cm Dam)')} • {getPurgeStrategyShortLabel(activePurgeStrategy)}
            </span>
          )}
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between py-1 border-b border-black/[0.03] dark:border-white/[0.03]">
            <span className="text-slate-600 dark:text-slate-400">
              {t('results.torch_gas', 'Torch Shielding Gas')}
              {torchFlowDefault > 0 && (
                <span className="text-[10px] text-slate-400 ml-1">
                  ({torchFlowDefault} {t('units.lpm', 'L/min')})
                </span>
              )}
              :
            </span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {shieldingGas.torchGasLiters} {t('units.liters', 'Liters')}
            </span>
          </div>

          <div className="flex justify-between py-1 border-b border-black/[0.03] dark:border-white/[0.03]">
            <span className="text-slate-600 dark:text-slate-400">
              {t('results.purge_gas', 'Backing / Purge Gas')}
              {shieldingGas.purgeGasApplied && purgeFlowDefault > 0 && (
                <span className="text-[10px] text-slate-400 ml-1">
                  ({purgeFlowDefault} {t('units.lpm', 'L/min')})
                </span>
              )}
              :
            </span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              {shieldingGas.purgeGasLiters} {t('units.liters', 'Liters')}
            </span>
          </div>

          <div className="flex justify-between py-1.5 font-bold text-slate-900 dark:text-white">
            <span>{t('results.total_gas', 'Total Gas Volume')}:</span>
            <span>{shieldingGas.totalGasLiters} {t('units.liters', 'Liters')}</span>
          </div>

          <div className="mt-2.5 p-2.5 sm:p-3 rounded-fluent bg-fluent-accent/10 dark:bg-fluent-accent-dark/15 border border-fluent-accent/20 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-fluent-accent dark:text-fluent-accent-dark">
                {t('results.cylinders_needed', 'Standard Cylinders Needed')}:
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                {t('results.standard_cylinder_prefix', 'Standard 50L /')} {cylBar} bar ({cylCapLiters.toLocaleString()} {t('results.free_liters_label', 'Free Liters')})
              </div>
            </div>
            <span className="text-base sm:text-xl font-black text-fluent-accent dark:text-fluent-accent-dark">
              {shieldingGas.cylindersRequired}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}