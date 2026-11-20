/**
 * Welding Consumable Calculator (WCC)
 * Layout Component: Header (Standalone Calculator Edition)
 * Windows 11 Pro Fluent UI Navigation Bar
 * Features: Calculator, Standards Catalog & PQR Benchmarks Tabs, Language Switcher (EN/TR), Theme Toggle & Standards Info Modal
 * Standards: ASME Sec. IX • ASME B31.3 • AWS A5.X • EN ISO 15614-1
 * Pure JavaScript (.js only)
 */

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../../i18n.js';
import {
  Flame,
  Calculator,
  Database,
  FileCheck2,
  Globe,
  Moon,
  Sun,
  ShieldCheck,
  Info,
  X,
  Check,
} from 'lucide-react';

export default function Header({
  activeTab,
  setActiveTab,
  darkMode,
  setDarkMode,
}) {
  const { t, language, setLanguage } = useTranslation();
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const langMenuRef = useRef(null);

  // Close language dropdown on outside click
  useEffect(() => {
    if (!isLangMenuOpen) return;
    const handleOutsideClick = (e) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target)) {
        setIsLangMenuOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsLangMenuOpen(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLangMenuOpen]);

  const activeLangLabel = language === 'tr' ? 'TR' : 'EN';

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-[#202020]/80 backdrop-blur-acrylic border-b border-black/[0.08] dark:border-white/[0.08] transition-colors duration-200">
        <div className="w-full px-2.5 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">
          
          {/* 1. Brand Logo & Title */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-fluent bg-fluent-accent/10 dark:bg-fluent-accent-dark/15 border border-fluent-accent/25 flex items-center justify-center text-fluent-accent dark:text-fluent-accent-dark shadow-sm">
              <Flame className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white">
                  {t('app.short_title', 'WCC')}
                </span>
                <span className="font-semibold text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  Engineering
                </span>
                <span className="ml-1 px-1.5 py-0.2 text-[9px] sm:text-[10px] font-bold tracking-wide uppercase bg-fluent-accent/15 text-fluent-accent dark:text-fluent-accent-dark rounded">
                  Pro
                </span>
              </div>
              <span className="hidden xs:inline text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 font-normal leading-none">
                Welding Consumable & Gas Engine
              </span>
            </div>
          </div>

          {/* 2. Top Right Actions: Standards Info + Language Switcher + Theme Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            
            {/* Standards Info Button */}
            <button
              type="button"
              onClick={() => setIsInfoModalOpen(true)}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-fluent text-slate-600 dark:text-slate-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] flex items-center gap-1.5 text-xs font-semibold transition-colors"
              title={t('nav.standards_info', 'Standards & Specifications')}
            >
              <ShieldCheck className="w-4 h-4 text-fluent-accent" />
              <span className="hidden md:inline">{t('nav.standards_info', 'Standards')}</span>
            </button>

            {/* Language Selector Dropdown */}
            <div className="relative" ref={langMenuRef}>
              <button
                type="button"
                onClick={() => setIsLangMenuOpen((prev) => !prev)}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-fluent text-slate-700 dark:text-slate-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] flex items-center gap-1 text-xs font-bold transition-colors"
                title={t('nav.language', 'Language')}
              >
                <Globe className="w-3.5 h-3.5 text-fluent-accent" />
                <span>{activeLangLabel}</span>
              </button>

              {isLangMenuOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-36 rounded-fluent-lg bg-white/95 dark:bg-[#282828]/95 backdrop-blur-acrylic border border-black/[0.1] dark:border-white/[0.1] shadow-fluent-modal p-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <button
                    type="button"
                    onClick={() => {
                      setLanguage('en');
                      setIsLangMenuOpen(false);
                    }}
                    className={`w-full px-2.5 py-1.5 rounded-fluent text-xs font-semibold flex items-center justify-between transition-colors ${
                      language === 'en'
                        ? 'bg-fluent-accent/10 text-fluent-accent dark:text-fluent-accent-dark font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.05]'
                    }`}
                  >
                    <span>English (US)</span>
                    {language === 'en' && <Check className="w-3.5 h-3.5 text-fluent-accent" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLanguage('tr');
                      setIsLangMenuOpen(false);
                    }}
                    className={`w-full px-2.5 py-1.5 rounded-fluent text-xs font-semibold flex items-center justify-between transition-colors ${
                      language === 'tr'
                        ? 'bg-fluent-accent/10 text-fluent-accent dark:text-fluent-accent-dark font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.05]'
                    }`}
                  >
                    <span>Türkçe (TR)</span>
                    {language === 'tr' && <Check className="w-3.5 h-3.5 text-fluent-accent" />}
                  </button>
                </div>
              )}
            </div>

            {/* Dark / Light Theme Toggle Button */}
            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 sm:p-2 rounded-fluent text-slate-600 dark:text-slate-300 hover:bg-black/[0.05] dark:hover:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] transition-colors"
              title={darkMode ? t('nav.theme_light', 'Light Mode') : t('nav.theme_dark', 'Dark Mode')}
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

          </div>
        </div>

        {/* 3. Segmented Navigation Tabs (Calculator, Catalog, PQR) */}
        <div className="w-full px-2 sm:px-6 lg:px-8 flex gap-1 border-t border-black/[0.04] dark:border-white/[0.04] py-1 overflow-x-auto no-scrollbar">
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

      {/* Standards & Specifications Info Modal */}
      {isInfoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-fluent-lg bg-white dark:bg-[#282828] border border-black/[0.1] dark:border-white/[0.1] shadow-fluent-modal p-5 sm:p-6 text-slate-800 dark:text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.08] dark:border-white/[0.08]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-fluent-accent" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t('nav.standards_info', 'Standards & Specifications')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsInfoModalOpen(false)}
                className="p-1 rounded-fluent text-slate-400 hover:text-slate-700 dark:hover:text-white"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              <p>
                The <strong>Welding Consumable Calculator (WCC)</strong> calculates weld metal volume, consumable weights, arc-on times, and shielding/purge gas consumption in strict conformance with certified international welding engineering standards:
              </p>

              <div className="p-3 rounded-fluent bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] space-y-1.5 font-mono text-[11px]">
                <p>• <strong>ASME Section IX:</strong> Qualification Standard for Welding & Brazing</p>
                <p>• <strong>ASME B31.3:</strong> Process Piping Code (Joint Details & Socket Cx)</p>
                <p>• <strong>ASME B36.10M / B36.19M:</strong> Standard Welded & Seamless Wrought Steel Pipe</p>
                <p>• <strong>AWS D1.1 / AWS A5.X:</strong> Structural Welding & Consumable Specifications</p>
                <p>• <strong>EN ISO 15614-1:</strong> Welding Procedure Tests (k-factor Heat Input)</p>
              </div>

              <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Governing Spec: <strong>WCC-SPEC-2026-REV01</strong></span>
                <span className="font-semibold text-fluent-accent">Version 1.0.0 Pro</span>
              </div>
            </div>

            <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.06] flex justify-end">
              <button
                type="button"
                onClick={() => setIsInfoModalOpen(false)}
                className="fluent-btn-primary px-4 py-2 text-xs font-semibold"
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