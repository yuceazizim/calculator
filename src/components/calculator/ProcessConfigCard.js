/**
 * Welding Consumable Calculator (WCC)
 * Calculator Component: ProcessConfigCard
 * Windows 11 Fluent Process Partitioning, Welding Position (1G/2G/3G-5G-6G/4G), Travel Direction,
 * Shielding & Purge Gas Controls, Cylinder Spec, Multi-Process Consumable Sizing (GTAW/SMAW/GMAW/FCAW/SAW)
 * & Per-Pass Diameter + Length + Gas Stacker
 * Mobile-First: Edge-to-Edge Flush Layout (rounded-none on mobile, rounded on desktop)
 * Standards: ASME Sec. IX • AWS D1.1 (Structural Steel) • EN 1090
 * Pure JavaScript (.js only)
 */

import React from 'react';
import { useTranslation } from '../../i18n.js';
import {
  isGasShieldedProcess,
  getDefaultLengthMm,
  getDiameterOptions,
  getRawUnitWeightGrams,
  getUnitDepositWeightGrams,
} from '../../engine/processSpecs.js';
import {
  Activity,
  Sparkles,
  RefreshCw,
  Layers,
  Plus,
  Trash2,
  Wand2,
  SlidersHorizontal,
  Building2,
  TrendingUp,
  TrendingDown,
  Flame,
  Shield,
  Compass,
  AlertTriangle,
} from 'lucide-react';

export default function ProcessConfigCard({
  jointType = 'pipe',
  weldGeometry = 'butt',
  wallThicknessMm = '10.97',
  requiresBackingGas = false,
  isFluxCoredTig = false,
  rootProcess,
  setRootProcess,
  fillProcess,
  setFillProcess,
  weldPosition = 'vertical_fixed',
  setWeldPosition,
  travelDirection = 'uphill',
  setTravelDirection,
  gasFlowRateLpm,
  setGasFlowRateLpm,
  purgeGasFlowRateLpm = '10.0',
  setPurgeGasFlowRateLpm,
  purgeStrategy = 'auto',
  setPurgeStrategy,
  cylinderVolumeM3 = '6.0',
  setCylinderVolumeM3,
  tigWireDiaMm,
  setTigWireDiaMm,
  smawElectrodeDiaMm,
  setSmawElectrodeDiaMm,
  smawLengthMm,
  setSmawLengthMm,
  gmawWireDiaMm = '1.0',
  setGmawWireDiaMm,
  fcawWireDiaMm = '1.2',
  setFcawWireDiaMm,
  sawWireDiaMm = '2.5',
  setSawWireDiaMm,
  includeShopScrap = true,
  setIncludeShopScrap,
  customPassGroups = [],
  setCustomPassGroups,
  useCustomPassSequencing = false,
  setUseCustomPassSequencing,
  calculate,
  calculating,
}) {
  const { t } = useTranslation();

  const isPlateMode = jointType === 'plate';
  const isFillet = weldGeometry === 'fillet';
  const isGrooveButt = weldGeometry === 'butt' || weldGeometry === 'double_v';
  const isPurgeActive = !isPlateMode && isGrooveButt && Boolean(requiresBackingGas) && !Boolean(isFluxCoredTig);
  const parsedWallThk = parseFloat(wallThicknessMm) || 0;
  const isThinWallFullPurge = parsedWallThk > 0 && parsedWallThk <= 6.0;

  const isTigActive = rootProcess === 'GTAW' || fillProcess === 'GTAW';
  const isSmawActive = rootProcess === 'SMAW' || fillProcess === 'SMAW';
  const isGmawActive = rootProcess === 'GMAW' || fillProcess === 'GMAW';
  const isFcawActive = rootProcess === 'FCAW' || fillProcess === 'FCAW';
  const isSawActive = fillProcess === 'SAW';
  const hasAnyConsumableSizing = isTigActive || isSmawActive || isGmawActive || isFcawActive || isSawActive;

  const isVerticalFixed = weldPosition === 'vertical_fixed';
  const showSawPositionAdvisory = isSawActive && weldPosition !== 'flat';

  const activeSmawLen = parseFloat(smawLengthMm) || 350;

  const getSelectedDiameterForProcess = (proc) => {
    const p = String(proc || '').toUpperCase();
    if (p === 'GTAW') return parseFloat(tigWireDiaMm) || 2.4;
    if (p === 'SMAW') return parseFloat(smawElectrodeDiaMm) || 3.25;
    if (p === 'GMAW') return parseFloat(gmawWireDiaMm) || 1.0;
    if (p === 'FCAW') return parseFloat(fcawWireDiaMm) || 1.2;
    if (p === 'SAW') return parseFloat(sawWireDiaMm) || 2.5;
    return 3.25;
  };

  const getDefaultTorchFlow = () => {
    const val = parseFloat(gasFlowRateLpm);
    return Number.isFinite(val) && val >= 0 ? val : 14.0;
  };

  const getDefaultPurgeFlow = () => {
    const val = parseFloat(purgeGasFlowRateLpm);
    return Number.isFinite(val) && val >= 0 ? val : 10.0;
  };

  const formatTigOptionLabel = (dia) => {
    const rawGrams = getRawUnitWeightGrams('GTAW', dia, 1000, { isFluxCoredTig });
    return `Ø ${dia.toFixed(1)} mm (${rawGrams.toFixed(1)} g)`;
  };

  const formatSmawOptionLabel = (dia) => {
    const netDepositGrams = getUnitDepositWeightGrams('SMAW', dia, activeSmawLen, {});
    return `Ø ${dia.toFixed(2)} mm (~${netDepositGrams.toFixed(1)} g)`;
  };

  const handleAddPassGroup = () => {
    if (!setCustomPassGroups) return;
    const defaultProc = (fillProcess || 'SMAW').toUpperCase();
    const defaultDia = getSelectedDiameterForProcess(defaultProc);
    const defaultLen = getDefaultLengthMm(defaultProc, defaultDia);
    const defaultTorch = isGasShieldedProcess(defaultProc) ? getDefaultTorchFlow() : 0;
    const shouldPurge =
      isPurgeActive &&
      (purgeStrategy === 'full' ||
        (purgeStrategy === 'auto' && isThinWallFullPurge) ||
        (purgeStrategy === 'gtaw_all' && defaultProc === 'GTAW'));

    const newGroup = {
      id: Date.now(),
      label: `${t('process.fill_layer_default', 'Fill Layer')} ${customPassGroups.length + 1}`,
      process: defaultProc,
      diameterMm: defaultDia,
      lengthMm: defaultLen,
      passesCount: 2,
      torchGasLpm: defaultTorch,
      purgeGasLpm: shouldPurge ? getDefaultPurgeFlow() : 0,
    };
    setCustomPassGroups([...customPassGroups, newGroup]);
  };

  const handleUpdatePassGroup = (index, field, value) => {
    if (!setCustomPassGroups) return;
    const updated = [...customPassGroups];

    if (field === 'process') {
      const proc = value.toUpperCase();
      const defaultDia = getSelectedDiameterForProcess(proc);
      const prevTorch = updated[index].torchGasLpm;
      const nextTorch = isGasShieldedProcess(proc)
        ? (Number(prevTorch) > 0 ? prevTorch : getDefaultTorchFlow())
        : 0;

      updated[index] = {
        ...updated[index],
        process: value,
        diameterMm: defaultDia,
        lengthMm: getDefaultLengthMm(proc, defaultDia),
        torchGasLpm: nextTorch,
      };
    } else if (field === 'diameterMm') {
      const currentProc = (updated[index].process || 'SMAW').toUpperCase();
      updated[index] = {
        ...updated[index],
        diameterMm: value,
        lengthMm: currentProc === 'SMAW' ? getDefaultLengthMm(currentProc, value) : updated[index].lengthMm,
      };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }

    setCustomPassGroups(updated);
  };

  const handleRemovePassGroup = (index) => {
    if (!setCustomPassGroups) return;
    const updated = customPassGroups.filter((_, i) => i !== index);
    setCustomPassGroups(updated);
  };

  // Auto-Suggest intelligent pass & gas sequence scaled by wall thickness
  const handleApplyAutoSuggest = () => {
    if (!setCustomPassGroups || !setUseCustomPassSequencing) return;

    const torchVal = getDefaultTorchFlow();
    const purgeVal = isPurgeActive ? getDefaultPurgeFlow() : 0;
    const fullPurgeActive =
      isPurgeActive &&
      (purgeStrategy === 'full' ||
        purgeStrategy === 'gtaw_all' ||
        (purgeStrategy === 'auto' && isThinWallFullPurge));
    const hybridGtawPurgeActive = isPurgeActive && purgeVal > 0;
    const hybridFillPurgeActive =
      isPurgeActive && (purgeStrategy === 'full' || (purgeStrategy === 'auto' && isThinWallFullPurge));

    const selTigDia = getSelectedDiameterForProcess('GTAW');
    const selSmawDia = getSelectedDiameterForProcess('SMAW');
    const selGmawDia = getSelectedDiameterForProcess('GMAW');
    const selFcawDia = getSelectedDiameterForProcess('FCAW');
    const selSawDia = getSelectedDiameterForProcess('SAW');

    let suggested = [];

    // Case 1: Full TIG
    if (rootProcess === 'GTAW' && fillProcess === 'GTAW') {
      suggested = [
        {
          id: 1,
          label: t('schedule.layer_root', 'Root Pass'),
          process: 'GTAW',
          diameterMm: selTigDia,
          lengthMm: 1000,
          passesCount: 1,
          torchGasLpm: torchVal,
          purgeGasLpm: purgeVal,
        },
        {
          id: 2,
          label: t('schedule.layer_hot', 'Hot Pass'),
          process: 'GTAW',
          diameterMm: selTigDia,
          lengthMm: 1000,
          passesCount: 1,
          torchGasLpm: torchVal,
          purgeGasLpm: purgeVal,
        },
        {
          id: 3,
          label: t('schedule.layer_groove_fill', 'Groove Fill'),
          process: 'GTAW',
          diameterMm: selTigDia,
          lengthMm: 1000,
          passesCount: parsedWallThk > 10 ? 4 : 2,
          torchGasLpm: torchVal,
          purgeGasLpm: fullPurgeActive ? purgeVal : 0,
        },
        {
          id: 4,
          label: t('schedule.layer_cap_cover', 'Cap Cover (Stringers)'),
          process: 'GTAW',
          diameterMm: selTigDia,
          lengthMm: 1000,
          passesCount: 2,
          torchGasLpm: torchVal,
          purgeGasLpm: fullPurgeActive ? purgeVal : 0,
        },
      ];
    } else if (rootProcess === 'GTAW' && fillProcess !== 'GTAW') {
      // Case 2: Hybrid GTAW Root/Hot + Fill Process
      if (fillProcess === 'SMAW') {
        if (parsedWallThk > 0 && parsedWallThk <= 8.5) {
          suggested = [
            {
              id: 1,
              label: t('schedule.layer_root', 'Root Pass'),
              process: 'GTAW',
              diameterMm: selTigDia,
              lengthMm: 1000,
              passesCount: 1,
              torchGasLpm: torchVal,
              purgeGasLpm: hybridGtawPurgeActive ? purgeVal : 0,
            },
            {
              id: 2,
              label: t('schedule.layer_hot', 'Hot Pass'),
              process: 'GTAW',
              diameterMm: selTigDia,
              lengthMm: 1000,
              passesCount: 1,
              torchGasLpm: torchVal,
              purgeGasLpm: hybridGtawPurgeActive ? purgeVal : 0,
            },
            {
              id: 3,
              label: t('schedule.layer_groove_fill', 'Groove Fill'),
              process: 'SMAW',
              diameterMm: selSmawDia,
              lengthMm: activeSmawLen,
              passesCount: 1,
              torchGasLpm: 0,
              purgeGasLpm: hybridFillPurgeActive ? purgeVal : 0,
            },
            {
              id: 4,
              label: t('process.auto_cap_cover', 'Cap Cover (Stringers)'),
              process: 'SMAW',
              diameterMm: selSmawDia,
              lengthMm: activeSmawLen,
              passesCount: 3,
              torchGasLpm: 0,
              purgeGasLpm: hybridFillPurgeActive ? purgeVal : 0,
            },
          ];
        } else if (parsedWallThk > 8.5 && parsedWallThk <= 16.0) {
          suggested = [
            {
              id: 1,
              label: t('schedule.layer_root', 'Root Pass'),
              process: 'GTAW',
              diameterMm: selTigDia,
              lengthMm: 1000,
              passesCount: 1,
              torchGasLpm: torchVal,
              purgeGasLpm: hybridGtawPurgeActive ? purgeVal : 0,
            },
            {
              id: 2,
              label: t('schedule.layer_hot', 'Hot Pass'),
              process: 'GTAW',
              diameterMm: selTigDia,
              lengthMm: 1000,
              passesCount: 1,
              torchGasLpm: torchVal,
              purgeGasLpm: hybridGtawPurgeActive ? purgeVal : 0,
            },
            {
              id: 3,
              label: t('process.auto_main_fill', 'Main Body Fill'),
              process: 'SMAW',
              diameterMm: 3.25,
              lengthMm: 350,
              passesCount: 4,
              torchGasLpm: 0,
              purgeGasLpm: hybridFillPurgeActive ? purgeVal : 0,
            },
            {
              id: 4,
              label: t('process.auto_cap_cover', 'Cap Cover (Stringers)'),
              process: 'SMAW',
              diameterMm: 3.25,
              lengthMm: 350,
              passesCount: 3,
              torchGasLpm: 0,
              purgeGasLpm: hybridFillPurgeActive ? purgeVal : 0,
            },
          ];
        } else {
          suggested = [
            {
              id: 1,
              label: t('schedule.layer_root', 'Root Pass'),
              process: 'GTAW',
              diameterMm: selTigDia,
              lengthMm: 1000,
              passesCount: 1,
              torchGasLpm: torchVal,
              purgeGasLpm: hybridGtawPurgeActive ? purgeVal : 0,
            },
            {
              id: 2,
              label: t('schedule.layer_hot', 'Hot Pass'),
              process: 'GTAW',
              diameterMm: selTigDia,
              lengthMm: 1000,
              passesCount: 1,
              torchGasLpm: torchVal,
              purgeGasLpm: hybridGtawPurgeActive ? purgeVal : 0,
            },
            {
              id: 3,
              label: t('process.auto_root_layer_fill', 'Root-Layer Fill'),
              process: 'SMAW',
              diameterMm: 2.50,
              lengthMm: 300,
              passesCount: 2,
              torchGasLpm: 0,
              purgeGasLpm: hybridFillPurgeActive ? purgeVal : 0,
            },
            {
              id: 4,
              label: t('process.auto_intermediate_fill', 'Intermediate Fill'),
              process: 'SMAW',
              diameterMm: 3.25,
              lengthMm: 350,
              passesCount: 4,
              torchGasLpm: 0,
              purgeGasLpm: hybridFillPurgeActive ? purgeVal : 0,
            },
            {
              id: 5,
              label: t('process.auto_main_high_dep', 'Main Body Fill (High Deposition)'),
              process: 'SMAW',
              diameterMm: 4.00,
              lengthMm: 450,
              passesCount: 6,
              torchGasLpm: 0,
              purgeGasLpm: hybridFillPurgeActive ? purgeVal : 0,
            },
            {
              id: 6,
              label: t('process.auto_cap_cover', 'Cap Cover (Stringers)'),
              process: 'SMAW',
              diameterMm: 3.25,
              lengthMm: 350,
              passesCount: 6,
              torchGasLpm: 0,
              purgeGasLpm: hybridFillPurgeActive ? purgeVal : 0,
            },
          ];
        }
      } else {
        const fillProc = (fillProcess || 'FCAW').toUpperCase();
        const fillDia = fillProc === 'SAW' ? selSawDia : (fillProc === 'FCAW' ? selFcawDia : selGmawDia);
        const fillTorch = isGasShieldedProcess(fillProc) ? torchVal : 0;
        suggested = [
          {
            id: 1,
            label: t('schedule.layer_root', 'Root Pass'),
            process: 'GTAW',
            diameterMm: selTigDia,
            lengthMm: 1000,
            passesCount: 1,
            torchGasLpm: torchVal,
            purgeGasLpm: hybridGtawPurgeActive ? purgeVal : 0,
          },
          {
            id: 2,
            label: t('schedule.layer_hot', 'Hot Pass'),
            process: 'GTAW',
            diameterMm: selTigDia,
            lengthMm: 1000,
            passesCount: 1,
            torchGasLpm: torchVal,
            purgeGasLpm: hybridGtawPurgeActive ? purgeVal : 0,
          },
          {
            id: 3,
            label: t('process.auto_main_fill', 'Main Body Fill'),
            process: fillProc,
            diameterMm: fillDia,
            lengthMm: null,
            passesCount: 4,
            torchGasLpm: fillTorch,
            purgeGasLpm: hybridFillPurgeActive ? purgeVal : 0,
          },
          {
            id: 4,
            label: t('process.auto_cap_cover', 'Cap Cover (Stringers)'),
            process: fillProc,
            diameterMm: fillDia,
            lengthMm: null,
            passesCount: 2,
            torchGasLpm: fillTorch,
            purgeGasLpm: hybridFillPurgeActive ? purgeVal : 0,
          },
        ];
      }
    } else if (fillProcess === 'FCAW' || fillProcess === 'GMAW' || fillProcess === 'SAW') {
      // Case 3: Wire / Flux-Cored / SAW Sequence
      const rProc = (rootProcess || 'SMAW').toUpperCase();
      const fProc = (fillProcess || 'FCAW').toUpperCase();
      const rDia = getSelectedDiameterForProcess(rProc);
      const fDia = fProc === 'SAW' ? selSawDia : (fProc === 'FCAW' ? selFcawDia : selGmawDia);
      suggested = [
        {
          id: 1,
          label: t('process.auto_root_hot', 'Root & Hot Pass'),
          process: rProc,
          diameterMm: rDia,
          lengthMm: rProc === 'SMAW' ? (parseInt(smawLengthMm, 10) || 350) : null,
          passesCount: 1,
          torchGasLpm: isGasShieldedProcess(rProc) ? torchVal : 0,
          purgeGasLpm: hybridGtawPurgeActive ? purgeVal : 0,
        },
        {
          id: 2,
          label: t('process.auto_main_fill', 'Main Body Fill'),
          process: fProc,
          diameterMm: fDia,
          lengthMm: null,
          passesCount: 4,
          torchGasLpm: isGasShieldedProcess(fProc) ? torchVal : 0,
          purgeGasLpm: hybridFillPurgeActive ? purgeVal : 0,
        },
        {
          id: 3,
          label: t('process.auto_cap_cover', 'Cap Cover (Stringers)'),
          process: fProc,
          diameterMm: fDia,
          lengthMm: null,
          passesCount: 2,
          torchGasLpm: isGasShieldedProcess(fProc) ? torchVal : 0,
          purgeGasLpm: hybridFillPurgeActive ? purgeVal : 0,
        },
      ];
    } else {
      // Case 4: Full SMAW Structural Mode
      suggested = [
        { id: 1, label: t('process.auto_root_hot', 'Root & Hot Pass'), process: 'SMAW', diameterMm: 3.25, lengthMm: 350, passesCount: 2, torchGasLpm: 0, purgeGasLpm: 0 },
        { id: 2, label: t('process.auto_main_fill', 'Main Body Fill'), process: 'SMAW', diameterMm: 4.00, lengthMm: 450, passesCount: 5, torchGasLpm: 0, purgeGasLpm: 0 },
        { id: 3, label: t('process.auto_cap_cover', 'Cap Cover (Stringers)'), process: 'SMAW', diameterMm: 3.25, lengthMm: 350, passesCount: 4, torchGasLpm: 0, purgeGasLpm: 0 },
      ];
    }

    setCustomPassGroups(suggested);
    setUseCustomPassSequencing(true);
  };

  return (
    <div className="fluent-card rounded-none sm:rounded-fluent-lg border-x-0 sm:border-x border-y border-black/[0.08] dark:border-white/[0.08] p-3.5 sm:p-6 transition-all duration-200">
      
      {/* 1. Card Header */}
      <div className="flex items-center gap-2.5 mb-3 sm:mb-4 border-b border-black/[0.06] dark:border-white/[0.06] pb-2.5 sm:pb-3">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-fluent bg-fluent-accent/10 dark:bg-fluent-accent-dark/20 flex items-center justify-center text-fluent-accent dark:text-fluent-accent-dark flex-shrink-0">
          <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div>
          <h2 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white">
            {t('process.title', 'Welding Processes & Passes')}
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
            {isPlateMode
              ? t('process.structural_mode_desc', 'Structural Steel Mode (AWS D1.1 / EN 1090)')
              : t('process.subtitle', 'Partitioning root, fill and cap layers')}
          </p>
        </div>
      </div>

      {/* Plate / Structural Mode Info Banner */}
      {isPlateMode && (
        <div className="mb-3 p-2.5 rounded-fluent bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <span className="text-[11px] font-semibold text-amber-900 dark:text-amber-300">
            {t('process.plate_mode_notice', 'Plate Mode (ASME Sec. IX / AWS D1.1 / EN 1090): Choose SMAW, GTAW, GMAW, FCAW or SAW for root and fill layers.')}
          </span>
        </div>
      )}

      {/* 2. Process Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-3">
        <div>
          <label className="block text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            {t('process.root_process', 'Root & Hot Pass Process')}
          </label>
          <select
            value={rootProcess}
            onChange={(e) => setRootProcess(e.target.value)}
            className="fluent-select text-xs font-medium"
          >
            <option value="GTAW">GTAW (TIG / ISO 141)</option>
            <option value="SMAW">SMAW (Stick MMA / ISO 111)</option>
            <option value="GMAW">GMAW (MIG/MAG / ISO 135)</option>
            <option value="FCAW">FCAW (GSFCAW Flux-Cored / ISO 136)</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            {t('process.fill_process', 'Fill & Cap Pass Process')}
          </label>
          <select
            value={fillProcess}
            onChange={(e) => setFillProcess(e.target.value)}
            className="fluent-select text-xs font-medium"
          >
            <option value="SMAW">SMAW (Stick MMA / ISO 111)</option>
            <option value="GTAW">GTAW (Full TIG / ISO 141)</option>
            <option value="FCAW">FCAW (GSFCAW Flux-Cored / ISO 136)</option>
            <option value="SAW">SAW (Submerged Arc / ISO 121)</option>
            <option value="GMAW">GMAW (MIG/MAG / ISO 135)</option>
          </select>
        </div>
      </div>

      {/* 2B. Welding Position, Travel Direction, Torch Gas Flow Rate & Cylinder Spec */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3 mb-3">
        {setWeldPosition && (
          <div className="sm:col-span-6">
            <label className="flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              <Compass className="w-3.5 h-3.5 text-fluent-accent flex-shrink-0" />
              <span>{t('process.weld_position_label', 'Welding Position (ASME / AWS)')}</span>
            </label>
            <select
              value={weldPosition}
              onChange={(e) => setWeldPosition(e.target.value)}
              className="fluent-select text-xs font-medium py-2"
            >
              <option value="flat">
                {isPlateMode
                  ? (isFillet ? t('process.pos_1f_plate', '1F (Flat Fillet • 1.20×)') : t('process.pos_1g_plate', '1G (Flat • 1.20×)'))
                  : (isFillet ? t('process.pos_1f_pipe', '1F (Rotated Pipe Fillet • 1.20×)') : t('process.pos_1g_pipe', '1G (Rotated Pipe • 1.20×)'))}
              </option>
              <option value="horizontal">
                {isFillet ? t('process.pos_2f', '2F (Horizontal Fillet • 1.05×)') : t('process.pos_2g', '2G (Horizontal • 1.05×)')}
              </option>
              <option value="vertical_fixed">
                {isPlateMode
                  ? (isFillet ? t('process.pos_3f_plate', '3F (Vertical Fillet • 1.00×)') : t('process.pos_3g_plate', '3G (Vertical • 1.00×)'))
                  : t('process.pos_5g_6g_pipe', '5G / 6G (Fixed Pipe • 1.00×)')}
              </option>
              <option value="overhead">
                {isFillet ? t('process.pos_4f', '4F (Overhead Fillet • 0.90×)') : t('process.pos_4g', '4G (Overhead • 0.90×)')}
              </option>
            </select>
          </div>
        )}

        {setTravelDirection && (
          <div className="sm:col-span-6">
            <label className="block text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              {t('process.travel_direction', 'Travel Direction')}
            </label>
            <div className="grid grid-cols-2 gap-1 p-1 rounded-fluent bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06]">
              <button
                type="button"
                disabled={!isVerticalFixed}
                onClick={() => setTravelDirection('uphill')}
                className={`py-1.5 px-1.5 rounded-fluent text-[11px] font-semibold flex items-center justify-center gap-1 transition-all disabled:opacity-60 ${
                  !isVerticalFixed || travelDirection === 'uphill'
                    ? 'bg-white dark:bg-[#383838] text-fluent-accent dark:text-fluent-accent-dark shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <TrendingUp className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{t('process.uphill', 'Uphill (1.0×)')}</span>
              </button>
              <button
                type="button"
                disabled={!isVerticalFixed}
                onClick={() => setTravelDirection('downhill')}
                className={`py-1.5 px-1.5 rounded-fluent text-[11px] font-semibold flex items-center justify-center gap-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                  isVerticalFixed && travelDirection === 'downhill'
                    ? 'bg-white dark:bg-[#383838] text-fluent-accent dark:text-fluent-accent-dark shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <TrendingDown className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{t('process.downhill', 'Downhill (2.2×)')}</span>
              </button>
            </div>
          </div>
        )}

        {/* Torch Shielding Gas Flow Rate */}
        <div className="sm:col-span-6">
          <label className="block text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 truncate">
            {t('process.gas_flow_rate', 'Torch Gas Flow Rate')} ({t('units.lpm', 'L/min')})
          </label>
          <input
            type="number"
            step="0.5"
            min="0"
            value={gasFlowRateLpm}
            onChange={(e) => setGasFlowRateLpm(e.target.value)}
            className="fluent-input text-xs font-medium py-2"
            placeholder="14.0"
          />
        </div>

        {/* Standard Gas Cylinder Spec */}
        {setCylinderVolumeM3 && (
          <div className="sm:col-span-6">
            <label className="block text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              {t('process.cylinder_size', 'Cylinder Capacity')}
            </label>
            <select
              value={cylinderVolumeM3}
              onChange={(e) => setCylinderVolumeM3(e.target.value)}
              className="fluent-select text-xs font-medium py-2"
            >
              <option value="6.0">{t('process.cyl_150bar', '50L / 150 Bar (6,000 L)')}</option>
              <option value="10.0">{t('process.cyl_200bar', '50L / 200 Bar (10,000 L)')}</option>
            </select>
          </div>
        )}
      </div>

      {/* SAW Flat Position Advisory */}
      {showSawPositionAdvisory && (
        <div className="mb-3 p-2.5 rounded-fluent bg-amber-50/80 dark:bg-amber-950/20 border border-amber-300/60 dark:border-amber-800/40 flex items-center gap-2 text-[11px] font-semibold text-amber-900 dark:text-amber-300">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <span>
            {t('process.saw_position_advisory', 'Note: Submerged Arc Welding (SAW) is normally performed in Flat (1G / 1F) position.')}
          </span>
        </div>
      )}

      {/* 2C. BACKING / PURGE GAS FLOW RATE & STRATEGY PANEL */}
      {isPurgeActive && setPurgeGasFlowRateLpm && setPurgeStrategy && (
        <div className="p-3 sm:p-3.5 rounded-fluent bg-sky-50/70 dark:bg-sky-950/20 border border-sky-200/70 dark:border-sky-800/40 mb-3 sm:mb-4 space-y-2 animate-in fade-in duration-150">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs font-bold text-sky-950 dark:text-sky-200">
              <Shield className="w-3.5 h-3.5 text-fluent-accent flex-shrink-0" />
              <span>{t('process.purge_controls_title', 'Backing / Purge Gas Control')}</span>
            </div>

            {purgeStrategy === 'auto' && isThinWallFullPurge && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-fluent-accent/15 text-fluent-accent dark:text-fluent-accent-dark border border-fluent-accent/25">
                {t('process.thin_wall_full_purge_badge', 'Wall ≤ 6 mm: Full Purge Active')}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3">
            <div className="sm:col-span-5">
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 truncate">
                {t('process.purge_flow_rate', 'Purge Gas Flow Rate')} ({t('units.lpm', 'L/min')})
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={purgeGasFlowRateLpm}
                onChange={(e) => setPurgeGasFlowRateLpm(e.target.value)}
                className="fluent-input text-xs font-medium py-2"
                placeholder="10.0"
              />
            </div>

            <div className="sm:col-span-7">
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {t('process.purge_strategy_label', 'Purge Coverage Scope')}
              </label>
              <select
                value={purgeStrategy}
                onChange={(e) => setPurgeStrategy(e.target.value)}
                className="fluent-select text-xs font-medium py-2"
              >
                <option value="auto">
                  {t('process.purge_opt_auto', 'Auto (≤ 6mm Full Purge / > 6mm Root+TIG)')}
                </option>
                <option value="full">
                  {t('process.purge_opt_full', 'Full Purge (All Passes Until Weld Finishes)')}
                </option>
                <option value="root_hot">
                  {t('process.purge_opt_root_hot', 'Root & Hot Pass Only (Pass 1-2)')}
                </option>
                <option value="gtaw_all">
                  {t('process.purge_opt_gtaw_all', 'All TIG (GTAW) Passes')}
                </option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* 3. Dynamic Consumable Sizing Subsection */}
      {hasAnyConsumableSizing && (
        <div className="p-3 sm:p-3.5 rounded-fluent bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] mb-3 sm:mb-4 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
            <Layers className="w-3.5 h-3.5 text-fluent-accent flex-shrink-0" />
            <span className="truncate">
              {t('process.consumable_specs_title', 'Consumable Sizing & Specifications (User Configurable)')}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
            {isTigActive && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  {t('process.tig_diameter', 'TIG Wire Diameter (Ø)')}
                </label>
                <select
                  value={tigWireDiaMm}
                  onChange={(e) => setTigWireDiaMm(e.target.value)}
                  className="fluent-select text-xs font-medium"
                >
                  <option value="1.6">{formatTigOptionLabel(1.6)}</option>
                  <option value="2.0">{formatTigOptionLabel(2.0)}</option>
                  <option value="2.4">{formatTigOptionLabel(2.4)}</option>
                  <option value="3.2">{formatTigOptionLabel(3.2)}</option>
                </select>
              </div>
            )}

            {isSmawActive && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  {t('process.smaw_diameter', 'Stick Electrode Diameter (Ø)')}
                </label>
                <select
                  value={smawElectrodeDiaMm}
                  onChange={(e) => setSmawElectrodeDiaMm(e.target.value)}
                  className="fluent-select text-xs font-medium"
                >
                  <option value="2.00">{formatSmawOptionLabel(2.00)}</option>
                  <option value="2.50">{formatSmawOptionLabel(2.50)}</option>
                  <option value="3.25">{formatSmawOptionLabel(3.25)}</option>
                  <option value="4.00">{formatSmawOptionLabel(4.00)}</option>
                  <option value="5.00">{formatSmawOptionLabel(5.00)}</option>
                </select>
              </div>
            )}

            {isSmawActive && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  {t('process.smaw_length', 'Stick Electrode Length')}
                </label>
                <select
                  value={smawLengthMm}
                  onChange={(e) => setSmawLengthMm(e.target.value)}
                  className="fluent-select text-xs font-medium"
                >
                  <option value="300">{t('process.length_300', '300 mm (Stainless & Special)')}</option>
                  <option value="350">{t('process.length_350', '350 mm Standard')}</option>
                  <option value="450">{t('process.length_450', '450 mm Heavy Duty')}</option>
                </select>
              </div>
            )}

            {isGmawActive && setGmawWireDiaMm && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  {t('process.gmaw_diameter', 'MIG/MAG Wire Diameter (Ø)')}
                </label>
                <select
                  value={gmawWireDiaMm}
                  onChange={(e) => setGmawWireDiaMm(e.target.value)}
                  className="fluent-select text-xs font-medium"
                >
                  <option value="0.8">Ø 0.8 mm ({t('process.spool_15kg', '15 kg Spool')})</option>
                  <option value="1.0">Ø 1.0 mm ({t('process.spool_15kg', '15 kg Spool')})</option>
                  <option value="1.2">Ø 1.2 mm ({t('process.spool_15kg', '15 kg Spool')})</option>
                  <option value="1.6">Ø 1.6 mm ({t('process.spool_15kg', '15 kg Spool')})</option>
                </select>
              </div>
            )}

            {isFcawActive && setFcawWireDiaMm && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  {t('process.fcaw_diameter', 'FCAW Flux-Cored Wire (Ø)')}
                </label>
                <select
                  value={fcawWireDiaMm}
                  onChange={(e) => setFcawWireDiaMm(e.target.value)}
                  className="fluent-select text-xs font-medium"
                >
                  <option value="1.0">Ø 1.0 mm ({t('process.spool_15kg', '15 kg Spool')})</option>
                  <option value="1.2">Ø 1.2 mm ({t('process.spool_15kg', '15 kg Spool')})</option>
                  <option value="1.4">Ø 1.4 mm ({t('process.spool_15kg', '15 kg Spool')})</option>
                  <option value="1.6">Ø 1.6 mm ({t('process.spool_15kg', '15 kg Spool')})</option>
                </select>
              </div>
            )}

            {isSawActive && setSawWireDiaMm && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  {t('process.saw_diameter', 'SAW Wire Diameter (Ø)')}
                </label>
                <select
                  value={sawWireDiaMm}
                  onChange={(e) => setSawWireDiaMm(e.target.value)}
                  className="fluent-select text-xs font-medium"
                >
                  <option value="2.5">Ø 2.5 mm ({t('process.spool_25kg_flux', '25 kg + Flux')})</option>
                  <option value="3.2">Ø 3.2 mm ({t('process.spool_25kg_flux', '25 kg + Flux')})</option>
                  <option value="4.0">Ø 4.0 mm ({t('process.spool_25kg_flux', '25 kg + Flux')})</option>
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. DYNAMIC MULTI-PROCESS STEPPED PASS STACKER */}
      {setUseCustomPassSequencing && (
        <div className="p-3 sm:p-3.5 rounded-fluent bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40 mb-3 sm:mb-4 space-y-3">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-200/40 dark:border-blue-800/30 pb-2">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-fluent-accent flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  {t('process.pass_stacking_title', 'Stepped Pass Stacking Sequence (ASME 3×d Rule)')}
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {t('process.pass_stacking_subtitle', 'Define specific runs per diameter (e.g. 2×2.50mm, 4×3.20mm, 6×4.00mm)')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleApplyAutoSuggest}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-fluent bg-fluent-accent/10 text-fluent-accent hover:bg-fluent-accent/20 transition-all"
                title={t('process.btn_auto_suggest_title', 'Automatically populate optimal sequence based on groove width')}
              >
                <Wand2 className="w-3 h-3" />
                <span>{t('process.btn_auto_suggest', 'Auto-Suggest')}</span>
              </button>

              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={useCustomPassSequencing}
                  onChange={(e) => setUseCustomPassSequencing(e.target.checked)}
                  className="w-4 h-4 rounded text-fluent-accent focus:ring-fluent-accent/40 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {t('process.custom_mode', 'Custom Mode')}
                </span>
              </label>
            </div>
          </div>

          {/* Multi-Process Pass Group Rows List */}
          {useCustomPassSequencing && (
            <div className="space-y-2 animate-in fade-in duration-150">
              {customPassGroups.length === 0 ? (
                <div className="p-3 text-center rounded-fluent bg-white/60 dark:bg-[#2c2c2c]/60 text-xs text-slate-500">
                  {t('process.no_custom_layers', 'No custom layers added yet. Click Auto-Suggest or Add Layer below.')}
                </div>
              ) : (
                customPassGroups.map((group, idx) => {
                  const currentProc = (group.process || 'SMAW').toUpperCase();
                  const diameterOptions = getDiameterOptions(currentProc);
                  const currentDia = parseFloat(group.diameterMm) || getSelectedDiameterForProcess(currentProc);
                  const currentLen = parseInt(group.lengthMm, 10) || getDefaultLengthMm(currentProc, currentDia) || 350;
                  const rowSupportsTorch = isGasShieldedProcess(currentProc);
                  const torchDisplayVal =
                    group.torchGasLpm !== undefined && group.torchGasLpm !== null && group.torchGasLpm !== ''
                      ? group.torchGasLpm
                      : (rowSupportsTorch ? (gasFlowRateLpm || '14') : '0');
                  const purgeDisplayVal =
                    group.purgeGasLpm !== undefined && group.purgeGasLpm !== null
                      ? group.purgeGasLpm
                      : '';

                  return (
                    <div
                      key={group.id || idx}
                      className="p-2.5 rounded-fluent bg-white dark:bg-[#282828] border border-black/[0.08] dark:border-white/[0.08] shadow-sm space-y-2"
                    >
                      {/* Row 1: Layer Index, Name Input & Delete Button */}
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-fluent-accent px-1.5 py-0.5 rounded bg-fluent-accent/10 flex-shrink-0">
                          #{idx + 1}
                        </span>
                        <input
                          type="text"
                          value={group.label || ''}
                          onChange={(e) => handleUpdatePassGroup(idx, 'label', e.target.value)}
                          placeholder={t('process.layer_name_placeholder', 'Layer Name')}
                          className="fluent-input text-xs py-1 px-2.5 font-semibold min-w-0 flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePassGroup(idx)}
                          className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 transition-colors flex-shrink-0"
                          title={t('process.remove_layer_title', 'Remove this layer')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Row 2: Method, Diameter, Length & Runs */}
                      <div className="grid grid-cols-12 gap-1.5 sm:gap-2">
                        <div className="col-span-6 sm:col-span-3">
                          <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">
                            {t('process.method_label', 'Method:')}
                          </label>
                          <select
                            value={currentProc}
                            onChange={(e) => handleUpdatePassGroup(idx, 'process', e.target.value)}
                            className="fluent-select text-xs py-1.5 px-2 font-bold bg-slate-50 dark:bg-slate-800"
                          >
                            <option value="GTAW">GTAW (TIG)</option>
                            <option value="SMAW">SMAW (Stick)</option>
                            <option value="GMAW">GMAW (MIG)</option>
                            <option value="FCAW">FCAW (Flux)</option>
                            <option value="SAW">SAW</option>
                          </select>
                        </div>

                        <div className="col-span-6 sm:col-span-4">
                          <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">
                            {t('process.dia_label', 'Dia:')}
                          </label>
                          <select
                            value={Number(currentDia).toFixed(2)}
                            onChange={(e) => handleUpdatePassGroup(idx, 'diameterMm', parseFloat(e.target.value))}
                            className="fluent-select text-xs py-1.5 px-2 font-medium"
                          >
                            {diameterOptions.map((opt) => (
                              <option key={opt.value} value={Number(opt.value).toFixed(2)}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-span-7 sm:col-span-3">
                          <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">
                            {t('process.length_label', 'Length:')}
                          </label>
                          {currentProc === 'SMAW' ? (
                            <select
                              value={currentLen}
                              onChange={(e) => handleUpdatePassGroup(idx, 'lengthMm', parseInt(e.target.value, 10))}
                              className="fluent-select text-xs py-1.5 px-2 font-semibold"
                            >
                              <option value={300}>300 mm</option>
                              <option value={350}>350 mm</option>
                              <option value={450}>450 mm</option>
                            </select>
                          ) : currentProc === 'GTAW' ? (
                            <select
                              value={currentLen}
                              onChange={(e) => handleUpdatePassGroup(idx, 'lengthMm', parseInt(e.target.value, 10))}
                              className="fluent-select text-xs py-1.5 px-2 font-medium"
                            >
                              <option value={1000}>1000 mm</option>
                            </select>
                          ) : (
                            <div className="fluent-input text-xs py-1.5 px-2 text-center font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60">
                              {t('process.spool_label', 'Spool')}
                            </div>
                          )}
                        </div>

                        <div className="col-span-5 sm:col-span-2">
                          <label className="block text-[10px] font-semibold text-slate-400 mb-0.5 text-center truncate">
                            {t('process.runs_label', 'Runs:')}
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="30"
                            value={group.passesCount || 1}
                            onChange={(e) => handleUpdatePassGroup(idx, 'passesCount', parseInt(e.target.value, 10) || 1)}
                            className="fluent-input text-xs py-1.5 px-1 text-center font-bold"
                          />
                        </div>
                      </div>

                      {/* Row 3: Per-Layer Torch Gas & Purge Gas */}
                      <div className="grid grid-cols-2 gap-1.5 sm:gap-2 pt-1 border-t border-black/[0.04] dark:border-white/[0.05]">
                        <div>
                          <label className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 mb-0.5">
                            <Flame className="w-3 h-3 text-sky-500 flex-shrink-0" />
                            <span className="truncate">
                              {t('process.layer_torch_gas', 'Torch Gas')} ({t('units.lpm', 'L/min')})
                            </span>
                          </label>
                          {rowSupportsTorch ? (
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              value={torchDisplayVal}
                              onChange={(e) => handleUpdatePassGroup(idx, 'torchGasLpm', e.target.value)}
                              className="fluent-input text-xs py-1 px-2 font-medium"
                              placeholder={gasFlowRateLpm || '14.0'}
                            />
                          ) : (
                            <div className="fluent-input text-[11px] py-1 px-2 text-center font-medium text-slate-400 bg-slate-50 dark:bg-slate-800/60">
                              {t('process.gas_na', 'N/A (No Gas)')}
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 mb-0.5">
                            <Shield className="w-3 h-3 text-blue-500 flex-shrink-0" />
                            <span className="truncate">
                              {t('process.layer_purge_gas', 'Purge Gas')} ({t('units.lpm', 'L/min')})
                            </span>
                          </label>
                          {isPurgeActive ? (
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              value={purgeDisplayVal}
                              onChange={(e) => handleUpdatePassGroup(idx, 'purgeGasLpm', e.target.value)}
                              className="fluent-input text-xs py-1 px-2 font-medium"
                              placeholder={t('process.purge_placeholder', 'Auto (0 = Off)')}
                            />
                          ) : (
                            <div className="fluent-input text-[11px] py-1 px-2 text-center font-medium text-slate-400 bg-slate-50 dark:bg-slate-800/60">
                              {t('process.purge_na', 'N/A (Off)')}
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })
              )}

              <button
                type="button"
                onClick={handleAddPassGroup}
                className="fluent-btn-secondary w-full py-1.5 text-xs font-bold gap-1 mt-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('process.btn_add_layer', 'Add Layer')}</span>
              </button>
            </div>
          )}

        </div>
      )}

      {/* 5. Site Scrap / Safety Allowance Toggle */}
      {setIncludeShopScrap && (
        <div className="mb-4 p-2.5 sm:p-3 rounded-fluent bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05] flex items-center justify-between gap-2">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeShopScrap}
              onChange={(e) => setIncludeShopScrap(e.target.checked)}
              className="w-4 h-4 rounded text-fluent-accent focus:ring-fluent-accent/40 cursor-pointer"
            />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t('process.shop_scrap', 'Include 15% Site Scrap / Stub Loss Factor')}
            </span>
          </label>
          <span className="text-[10px] text-slate-400 hidden sm:inline">
            {includeShopScrap
              ? t('process.procurement_mode', 'Procurement / Site Safety Mode')
              : t('process.lab_pqr_mode', 'Theoretical Lab / PQR Mode')}
          </span>
        </div>
      )}

      {/* 6. Primary Calculation Action Button */}
      <button
        type="button"
        onClick={calculate}
        disabled={calculating}
        className="fluent-btn-primary w-full py-2.5 sm:py-3 text-xs sm:text-sm font-bold gap-2 shadow-md hover:shadow-lg active:scale-[0.99] transition-all"
      >
        {calculating ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin flex-shrink-0" />
            <span>{t('buttons.calculating', 'Calculating...')}</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 flex-shrink-0" />
            <span>{t('buttons.calculate', 'Calculate Consumables')}</span>
          </>
        )}
      </button>

    </div>
  );
}