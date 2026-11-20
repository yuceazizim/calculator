/**
 * Welding Consumable Calculator (WCC)
 * Layout Component: Footer (Standalone Calculator Edition)
 * Windows 11 Pro Fluent UI Bottom Status Bar
 * Standards: ASME Sec. IX • ASME B31.3 • AWS A5.X • EN ISO 15614-1
 * Pure JavaScript (.js only)
 */

import React from 'react';
import { useTranslation } from '../../i18n.js';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-white/60 dark:bg-[#252525]/60 border-t border-black/[0.06] dark:border-white/[0.06] py-3 text-center text-xs text-slate-500 dark:text-slate-400 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {t('app.title', 'Welding Consumable Calculator')}
          </span>
          <span>•</span>
          <span className="text-[11px] font-medium text-fluent-accent dark:text-fluent-accent-dark">
            {t('app.version', 'v1.0.0 Pro')}
          </span>
        </div>

        <span className="text-[11px] text-slate-500 dark:text-slate-400">
          {t(
            'app.footer_note',
            'Calibrated with Certified Engineering PQR Datasets (ASME Sec. IX & EN ISO 15614-1)'
          )}
        </span>
      </div>
    </footer>
  );
}