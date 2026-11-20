/**
 * Welding Consumable Calculator (WCC)
 * Catalog Component: PipeCatalogTable (Standalone Local Engine Edition)
 * Windows 11 Fluent ASME B36.10M & B36.19M Pipe Dimension Table with Live Search
 * Standards: ASME B36.10M • ASME B36.19M
 * Mobile-First: Edge-to-Edge Responsive Layout
 * Pure JavaScript (.js only)
 */

import React, { useState } from 'react';
import { useTranslation } from '../../i18n.js';
import { Database, Search, X } from 'lucide-react';

export default function PipeCatalogTable({ pipes = [] }) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const q = searchQuery.trim().toLowerCase();

  const filteredPipes = pipes.filter((p) => {
    if (!q) return true;
    return (
      (p.nps || '').toLowerCase().includes(q) ||
      (p.schedule || '').toLowerCase().includes(q) ||
      String(p.outside_diameter_mm || '').includes(q) ||
      String(p.wall_thickness_mm || '').includes(q) ||
      (p.standard || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="fluent-card rounded-none sm:rounded-fluent-lg border-x-0 sm:border-x border-y border-black/[0.08] dark:border-white/[0.08] p-3.5 sm:p-6 space-y-4 transition-all duration-200">
      
      {/* 1. Catalog Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/[0.06] dark:border-white/[0.06] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-fluent bg-fluent-accent/10 dark:bg-fluent-accent-dark/20 flex items-center justify-center text-fluent-accent dark:text-fluent-accent-dark flex-shrink-0">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white">
              {t('nav.standards', 'Standards Catalog')} ({filteredPipes.length})
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
              {t('catalog.subtitle', 'ASME B36.10M / B36.19M Standard Welded & Seamless Steel Pipe Dimensions')}
            </p>
          </div>
        </div>

        {/* Live Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('catalog.search_placeholder', 'Search NPS, Schedule, OD...')}
            className="fluent-input pl-8 pr-8 py-1.5 text-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white p-0.5"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Desktop Table View (>= 640px) */}
      <div className="hidden sm:block rounded-fluent border border-black/[0.06] dark:border-white/[0.06] overflow-hidden">
        <div className="max-h-[65vh] overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-white/95 dark:bg-[#282828]/95 backdrop-blur-md z-10">
              <tr className="border-b border-black/[0.08] dark:border-white/[0.08] text-slate-700 dark:text-slate-300">
                <th className="py-2.5 px-3 font-bold">{t('joint.nps', 'NPS')}</th>
                <th className="py-2.5 px-3 font-bold">{t('joint.schedule', 'Schedule')}</th>
                <th className="py-2.5 px-3 font-bold text-right">{t('joint.outside_diameter', 'OD')} (mm)</th>
                <th className="py-2.5 px-3 font-bold text-right">{t('joint.wall_thickness', 'Wall')} (mm)</th>
                <th className="py-2.5 px-3 font-bold text-right">{t('catalog.weight_col', 'Weight (kg/m)')}</th>
                <th className="py-2.5 px-3 font-bold text-center">{t('catalog.standard_col', 'Standard')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
              {filteredPipes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                    {t('catalog.empty_search', 'No pipe dimensions matched your search.')}
                  </td>
                </tr>
              ) : (
                filteredPipes.map((p) => (
                  <tr key={p.id} className="hover:bg-fluent-accent/[0.03] transition-colors">
                    <td className="py-2 px-3 font-bold text-fluent-accent dark:text-fluent-accent-dark">
                      {p.nps}
                    </td>
                    <td className="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200">
                      {p.schedule}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                      {Number(p.outside_diameter_mm).toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {Number(p.wall_thickness_mm).toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-slate-600 dark:text-slate-400">
                      {Number(p.weight_kg_per_meter).toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.08] text-slate-600 dark:text-slate-400">
                        {p.standard}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Mobile Card Stack View (< 640px) */}
      <div className="sm:hidden space-y-2">
        {filteredPipes.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            {t('catalog.empty_search', 'No pipe dimensions matched your search.')}
          </div>
        ) : (
          filteredPipes.map((p) => (
            <div
              key={p.id}
              className="p-3 rounded-fluent bg-white/90 dark:bg-[#303030]/90 border border-black/[0.06] dark:border-white/[0.06] space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black text-fluent-accent dark:text-fluent-accent-dark">
                    {p.nps}
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    ({p.schedule})
                  </span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06]">
                  {p.standard}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-[11px] pt-1 border-t border-black/[0.04] dark:border-white/[0.04]">
                <div>
                  <span className="text-[10px] text-slate-400 block">{t('joint.outside_diameter', 'OD')}:</span>
                  <span className="font-mono font-semibold">{p.outside_diameter_mm} mm</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">{t('joint.wall_thickness', 'Wall')}:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{p.wall_thickness_mm} mm</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">kg/m:</span>
                  <span className="font-mono text-slate-600 dark:text-slate-300">{p.weight_kg_per_meter}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}