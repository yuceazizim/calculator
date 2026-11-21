/**
 * Welding Consumable Calculator (WCC)
 * Layout Component: Header (Standalone Calculator Edition)
 * Windows 11 Pro Fluent UI Navigation Bar & Minimalist Settings Flyout
 * Standards: ASME Sec. IX • ASME B31.3 • AWS A5.X • EN ISO 15614-1
 * Pure JavaScript (.js only)
 */

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation, AVAILABLE_LANGUAGES } from '../../i18n.js';
import {
  Calculator,
  Database,
  FileCheck2,
  Settings,
  X,
} from 'lucide-react';

export default function Header({
  activeTab,
  setActiveTab,
  darkMode,
  setDarkMode,
}) {
  const { t, language, setLanguage } = useTranslation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const settingsMenuRef = useRef(null);

  // Close flyout on outside click/touch or Escape
  useEffect(() => {
    if (!isSettingsOpen && !isInfoModalOpen) return;

    const handleOutsideClick = (e) => {
      if (
        isSettingsOpen &&
        settingsMenuRef.current &&
        !settingsMenuRef.current.contains(e.target)
      ) {
        setIsSettingsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsSettingsOpen(false);
        setIsInfoModalOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSettingsOpen, isInfoModalOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/85 dark:bg-[#202020]/85 backdrop-blur-acrylic border-b border-black/[0.08] dark:border-white/[0.08] transition-colors duration-200">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-12 sm:h-14 flex items-center justify-between gap-2">
          
          {/* 1. Minimalist Fluent WCC Brand Mark (Matches PWA Icon) */}
          <button
            type="button"
            onClick={() => setActiveTab('calculator')}
            aria-label={t('app.title', 'Welding Consumable Calculator')}
            className="relative h-8 px-2.5 rounded-[7px] bg-fluent-accent hover:bg-fluent-accent-hover active:scale-[0.98] flex items-center justify-center shadow-sm transition-all duration-150 select-none overflow-hidden"
          >
            <span className="text-[13px] font-extrabold tracking-wider text-white leading-none -mt-0.5">
              WCC
            </span>
            <span
              aria-hidden="true"
              className="absolute bottom-1 left-2 right-2 h-[2.5px] rounded-full bg-[#4cc2ff]"
            />
          </button>

          {/* 2. Top Right: Clean Windows 11 Settings Trigger & MenuFlyout */}
          <div className="relative flex-shrink-0" ref={settingsMenuRef}>
            <button
              type="button"
              onClick={() => setIsSettingsOpen((prev) => !prev)}
              aria-expanded={isSettingsOpen}
              aria-haspopup="menu"
              aria-label={t('nav.settings', 'Settings')}
              title={t('nav.settings', 'Settings')}
              className={`w-9 h-9 rounded-fluent flex items-center justify-center transition-colors duration-150 ${
                isSettingsOpen
                  ? 'bg-black/[0.06] dark:bg-white/[0.1] text-fluent-accent dark:text-fluent-accent-dark'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-black/[0.05] dark:hover:bg-white/[0.07]'
              }`}
            >
              <Settings className="w-[18px] h-[18px]" />
            </button>

            {/* Minimalist Windows 11 Pro MenuFlyout */}
            {isSettingsOpen && (
              <div
                role="menu"
                className="
                  absolute right-0 top-full mt-1.5
                  w-[min(calc(100vw-1.5rem),16.5rem)]
                  rounded-fluent-lg
                  bg-white dark:bg-[#2c2c2c]
                  border border-black/[0.09] dark:border-white/[0.1]
                  shadow-fluent-flyout
                  p-1.5
                  z-50
                "
              >
                {/* Language Select (Scales cleanly to 40+ languages) */}
                <div className="px-2.5 py-2 space-y-1.5">
                  <label
                    htmlFor="wcc-language-select"
                    className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400"
                  >
                    {t('nav.language', 'Language')}
                  </label>
                  <select
                    id="wcc-language-select"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="fluent-select py-1.5 text-xs font-medium bg-white dark:bg-[#202020]"
                  >
                    {AVAILABLE_LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Windows 11 Native-Style Dark Mode Toggle Switch */}
                <button
                  type="button"
                  role="menuitemcheckbox"
                  aria-checked={darkMode}
                  onClick={() => setDarkMode(!darkMode)}
                  className="w-full px-2.5 py-2.5 rounded-fluent hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-colors flex items-center justify-between gap-3 text-left"
                >
                  <span className="text-xs font-medium text-slate-800 dark:text-slate-100">
                    {t('nav.theme_dark', 'Dark Mode')}
                  </span>

                  {/* WinUI 3 ToggleSwitch */}
                  <span
                    aria-hidden="true"
                    className={`relative inline-flex h-5 w-10 flex-shrink-0 items-center rounded-full border transition-colors duration-200 ${
                      darkMode
                        ? 'bg-fluent-accent border-fluent-accent'
                        : 'bg-transparent border-slate-500/70 dark:border-slate-400/60'
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full transition-transform duration-200 ${
                        darkMode
                          ? 'translate-x-[22px] bg-white'
                          : 'translate-x-[3px] bg-slate-600 dark:bg-slate-300'
                      }`}
                    />
                  </span>
                </button>

                {/* Subtle Divider */}
                <div className="my-1 border-t border-black/[0.06] dark:border-white/[0.08]" />

                {/* Standards & Specifications Row */}
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setIsSettingsOpen(false);
                    setIsInfoModalOpen(true);
                  }}
                  className="w-full px-2.5 py-2 rounded-fluent hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-colors text-left"
                >
                  <span className="block text-xs font-medium text-slate-800 dark:text-slate-100">
                    {t('nav.standards_info', 'Standards & Specifications')}
                  </span>
                  <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {t('nav.standards_info_desc', 'ASME Sec. IX, B31.3, AWS & EN')}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 3. Segmented Navigation Tabs (Calculator, Catalog, PQR) */}
        <div className="w-full max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 flex gap-1 border-t border-black/[0.04] dark:border-white/[0.04] py-1 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('calculator')}
            className={`px-3 py-1.5 rounded-fluent text-xs sm:text-sm font-semibold transition-all duration-150 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'calculator'
                ? 'bg-white dark:bg-[#333333] text-fluent-accent dark:text-fluent-accent-dark shadow-sm border border-black/[0.08] dark:border-white/[0.08]'
                : 'text-slate-600 dark:text-slate-400 hover:bg-black/[0.03] dark:hover:bg-white/[0.03]'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>{t('nav.calculator', 'Calculator')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('catalog')}
            className={`px-3 py-1.5 rounded-fluent text-xs sm:text-sm font-semibold transition-all duration-150 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'catalog'
                ? 'bg-white dark:bg-[#333333] text-fluent-accent dark:text-fluent-accent-dark shadow-sm border border-black/[0.08] dark:border-white/[0.08]'
                : 'text-slate-600 dark:text-slate-400 hover:bg-black/[0.03] dark:hover:bg-white/[0.03]'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>{t('nav.standards', 'Standards Catalog')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pqr')}
            className={`px-3 py-1.5 rounded-fluent text-xs sm:text-sm font-semibold transition-all duration-150 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'pqr'
                ? 'bg-white dark:bg-[#333333] text-fluent-accent dark:text-fluent-accent-dark shadow-sm border border-black/[0.08] dark:border-white/[0.08]'
                : 'text-slate-600 dark:text-slate-400 hover:bg-black/[0.03] dark:hover:bg-white/[0.03]'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>{t('nav.pqr_records', 'PQR Benchmarks')}</span>
          </button>
        </div>
      </header>

      {/* Windows 11 Fluent ContentDialog: Standards & Specifications Modal */}
      {isInfoModalOpen && (
        <div
          onClick={() => setIsInfoModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/45 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg max-h-[88vh] overflow-y-auto rounded-fluent-lg bg-white dark:bg-[#2c2c2c] border border-black/[0.1] dark:border-white/[0.12] shadow-fluent-modal p-5 sm:p-6 text-slate-800 dark:text-slate-100 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.08] dark:border-white/[0.08]">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                {t('nav.standards_info', 'Standards & Specifications')}
              </h3>
              <button
                type="button"
                onClick={() => setIsInfoModalOpen(false)}
                className="p-1.5 rounded-fluent text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.06] transition-colors"
                aria-label={t('buttons.close', 'Close')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              <p>
                {t(
                  'standards_modal.intro',
                  'The Welding Consumable Calculator (WCC) calculates weld metal volume, consumable weights, arc-on times, and shielding/purge gas consumption in strict conformance with certified international welding engineering standards:'
                )}
              </p>

              <div className="p-3 rounded-fluent bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08] space-y-1.5 font-mono text-[11px]">
                <p>• <strong>ASME Section IX:</strong> {t('standards_modal.asme_ix_desc', 'Qualification Standard for Welding & Brazing')}</p>
                <p>• <strong>ASME B31.3:</strong> {t('standards_modal.asme_b313_desc', 'Process Piping Code (Joint Details, Socket Cx & PWHT)')}</p>
                <p>• <strong>ASME B36.10M / B36.19M:</strong> {t('standards_modal.asme_b36_desc', 'Standard Welded & Seamless Wrought Steel Pipe')}</p>
                <p>• <strong>AWS D1.1 / AWS A5.X:</strong> {t('standards_modal.aws_desc', 'Structural Welding & Consumable Specifications')}</p>
                <p>• <strong>EN ISO 15614-1:</strong> {t('standards_modal.iso_15614_desc', 'Welding Procedure Tests (k-factor Heat Input)')}</p>
              </div>

              <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between gap-2 flex-wrap">
                <span>
                  {t('standards_modal.governing_spec', 'Governing Spec:')}{' '}
                  <strong className="text-slate-600 dark:text-slate-300">WCC-SPEC-2026-REV01</strong>
                </span>
                <span className="font-semibold text-fluent-accent dark:text-fluent-accent-dark">
                  {t('app.version', 'v1.0.0 Pro')}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.06] flex justify-end">
              <button
                type="button"
                onClick={() => setIsInfoModalOpen(false)}
                className="fluent-btn-primary px-5 py-2 text-xs font-semibold"
              >
                {t('buttons.close', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}