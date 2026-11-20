/**
 * Welding Consumable Calculator (WCC)
 * Calculator Component: MaterialConfigCard
 * Windows 11 Fluent Base Material Selection & Backing Gas Purge Controls
 * Mobile-First: Edge-to-Edge Flush Layout (rounded-none on mobile, rounded on desktop)
 * Standards: ASME Sec. IX (P-Numbers) • AWS A5.X • EN ISO 15608
 * Pure JavaScript (.js only)
 */

import React from 'react';
import { useTranslation } from '../../i18n.js';
import { Shield, Sparkles } from 'lucide-react';

export default function MaterialConfigCard({
  materials,
  handleMaterialSelect,
  selectedMaterialId,
  materialDensity,
  setMaterialDensity,
  requiresBackingGas,
  setRequiresBackingGas,
  isFluxCoredTig,
  setIsFluxCoredTig,
}) {
  const { t } = useTranslation();

  return (
    <div className="fluent-card rounded-none sm:rounded-fluent-lg border-x-0 sm:border-x border-y border-black/[0.08] dark:border-white/[0.08] p-3.5 sm:p-6 transition-all duration-200">
      
      {/* 1. Card Header */}
      <div className="flex items-center gap-2.5 mb-3 sm:mb-4 border-b border-black/[0.06] dark:border-white/[0.06] pb-2.5 sm:pb-3">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-fluent bg-fluent-accent/10 dark:bg-fluent-accent-dark/20 flex items-center justify-center text-fluent-accent dark:text-fluent-accent-dark flex-shrink-0">
          <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div>
          <h2 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white">
            {t('material.title', 'Base Material & Purge Control')}
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
            {t('material.subtitle', 'Material density and backing gas parameters')}
          </p>
        </div>
      </div>

      {/* 2. Material Dropdown Selection and Physical Density */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4">
        
        {/* Base Material Dropdown */}
        <div className="sm:col-span-2">
          <label className="block text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            {t('material.select', 'Base Material')}
          </label>
          <select
            value={selectedMaterialId || ''}
            onChange={(e) => handleMaterialSelect(e.target.value)}
            className="fluent-select text-xs font-medium"
          >
            <option value="" disabled>
              {t('material.select_placeholder', '-- Select Qualified Base Material --')}
            </option>
            {materials.map((mat) => (
              <option key={mat.id} value={mat.id}>
                {mat.material_name} ({mat.material_group}) - P-No: {mat.p_no}
              </option>
            ))}
          </select>
        </div>

        {/* Physical Specific Gravity / Density */}
        <div>
          <label className="block text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            {t('material.density', 'Density')} (g/cm³)
          </label>
          <input
            type="number"
            step="0.001"
            value={materialDensity}
            onChange={(e) => setMaterialDensity(e.target.value)}
            className="fluent-input text-xs font-mono font-medium"
            placeholder="7.850"
          />
        </div>
      </div>

      {/* 3. Backing Gas (Purging) & Specialty Flux-Cored TIG Controls */}
      <div className="space-y-2 sm:space-y-2.5 pt-2.5 sm:pt-3 border-t border-black/[0.04] dark:border-white/[0.04]">
        
        {/* Mandatory Backing Gas Purge Toggle */}
        <label className="flex items-center gap-2.5 cursor-pointer select-none py-0.5">
          <input
            type="checkbox"
            checked={requiresBackingGas}
            onChange={(e) => setRequiresBackingGas(e.target.checked)}
            className="w-4 h-4 rounded text-fluent-accent focus:ring-fluent-accent/40 cursor-pointer"
          />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {t('material.backing_gas_required', 'Backing Gas (Purging) Mandatory')}
          </span>
        </label>

        {/* Kobelco TG-X Flux-Cored TIG Purge-Free Banner */}
        <div className="p-2.5 sm:p-3 rounded-fluent bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/30 transition-all">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isFluxCoredTig}
              onChange={(e) => setIsFluxCoredTig(e.target.checked)}
              className="w-4 h-4 rounded text-fluent-accent focus:ring-fluent-accent/40 cursor-pointer flex-shrink-0"
            />
            <div className="flex items-center gap-1.5 min-w-0">
              <Sparkles className="w-3.5 h-3.5 text-fluent-accent dark:text-fluent-accent-dark flex-shrink-0" />
              <span className="text-xs font-bold text-blue-950 dark:text-blue-200 truncate">
                {t('material.flux_cored_tig', 'Using Flux-Cored TIG Rod (Kobelco TG-X)')}
              </span>
            </div>
          </label>
          <p className="text-[10px] sm:text-[11px] text-blue-800/90 dark:text-blue-400 mt-1 pl-6 leading-relaxed">
            {t('material.flux_cored_tig_hint', 'Eliminates root purging gas requirement on stainless steel!')}
          </p>
        </div>

      </div>
    </div>
  );
}