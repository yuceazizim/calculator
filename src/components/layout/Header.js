/**
 * Welding Consumable Calculator (WCC)
 * Layout Component: Header (Standalone Calculator Edition)
 * Windows 11 Pro Fluent UI Navigation Bar & Acrylic Settings Flyout
 * Features: Calculator, Standards Catalog & PQR Benchmarks Tabs + Unified Settings Flyout (Language, Theme, Standards Modal)
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
  Settings,
  ChevronRight,
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

  const isTr = language === 'tr';

  // Close settings flyout on outside click / touch or Escape key
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
      <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-[#202020]/80 backdrop-blur-acrylic border-b border-black/[0.08] dark:border-white/[0.08] transition-colors duration-200">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">
          
          {/* 1. Brand Logo & Title */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-fluent bg-fluent-accent/10 dark:bg-fluent-accent-dark/15 border border-fluent-accent/25 flex items-center justify-center text-fluent-accent dark:text-fluent-accent-dark shadow-sm flex-shrink-0">
              <Flame className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white truncate">
                  {t('app.short_title', 'WCC')}
                </span>
                <span className="font-semibold text-xs sm:text-sm text-slate-600 dark:text-slate-300 truncate">
                  Engineering
                </span>
                <span className="ml-0.5 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold tracking-wide uppercase bg-fluent-accent/15 text-fluent-accent dark:text-fluent-accent-dark rounded flex-shrink-0">
                  Pro
                </span>
              </div>
              <span className="hidden sm:inline text-[11px] text-slate-400 dark:text-slate-500 font-normal leading-none mt-0.5">
                Welding Consumable &amp; Gas Engine
              </span>
            </div>
          </div>

          {/* 2. Top Right: Windows 11 Pro Fluent Settings Flyout Trigger */}
          <div className="relative flex-shrink-0" ref={settingsMenuRef}>
            <button
              type="button"
              onClick={() => setIsSettingsOpen((prev) => !prev)}
              aria-expanded={isSettingsOpen}
              aria-haspopup="menu"
              aria-label={isTr ? 'Ayarlar' : 'Settings'}
              className={`h-9 px-2.5 sm:px-3 rounded-fluent border flex items-center gap-2 text-xs font-semibold transition-all duration-150 active:scale-[0.97] ${
                isSettingsOpen
                  ? 'bg-fluent-accent/10 dark:bg-fluent-accent-dark/15 border-fluent-accent/40 text-fluent-accent dark:text-fluent-accent-dark shadow-sm'
                  : 'bg-white/75 dark:bg-[#2d2d2d]/75 hover:bg-white dark:hover:bg-[#363636] border-black/[0.08] dark:border-white/[0.1] text-slate-700 dark:text-slate-200 shadow-sm'
              }`}
            >
              <Settings
                className={`w-4 h-4 transition-transform duration-300 ${
                  isSettingsOpen ? 'rotate-45 text-fluent-accent dark:text-fluent-accent-dark' : 'text-slate-600 dark:text-slate-300'
                }`}
              />
              <span className="hidden sm:inline">
                {isTr ? 'Ayarlar' : 'Settings'}
              </span>
              <span className="sm:hidden text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/[0.05] dark:bg-white/[0.08] text-slate-600 dark:text-slate-300">
                {language.toUpperCase()}
              </span>
            </button>

            {/* Windows 11 Pro Acrylic Settings Flyout Panel */}
            {isSettingsOpen && (
              <div
                role="menu"
                className="
                  absolute right-0 top-full mt-2
                  w-[min(calc(100vw-1.25rem),19rem)]
                  rounded-fluent-lg
                  bg-white/95 dark:bg-[#272727]/95
                  backdrop-blur-2xl
                  border border-black/[0.1] dark:border-white/[0.12]
                  shadow-fluent-modal
                  p-2.5 space-y-2
                  z-50
                  origin-top-right
                "
              >
                {/* Flyout Header */}
                <div className="px-2 pt-1 pb-2 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Settings className="w-3.5 h-3.5 text-fluent-accent dark:text-fluent-accent-dark" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white tracking-tight">
                      {isTr ? 'Uygulama Ayarları' : 'System Preferences'}
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-fluent-accent/10 text-fluent-accent dark:text-fluent-accent-dark">
                    {t('app.version', 'v1.0.0 Pro')}
                  </span>
                </div>

                {/* Section 1: Language Switcher (Segmented Fluent Pill) */}
                <div className="p-2 rounded-fluent bg-black/[0.025] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06] space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                    <Globe className="w-3.5 h-3.5 text-fluent-accent dark:text-fluent-accent-dark flex-shrink-0" />
                    <span>{t('nav.language', 'Language')}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 p-1 rounded-fluent bg-black/[0.04] dark:bg-black/30 border border-black/[0.05] dark:border-white/[0.06]">
                    <button
                      type="button"
                      onClick={() => setLanguage('en')}
                      className={`py-1.5 px-2 rounded-[6px] text-xs font-semibold transition-all duration-150 flex items-center justify-center gap-1.5 ${
                        language === 'en'
                          ? 'bg-white dark:bg-[#3a3a3a] text-fluent-accent dark:text-fluent-accent-dark shadow-sm border border-black/[0.06] dark:border-white/[0.08]'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <span className="text-[10px] font-black opacity-75">EN</span>
                      <span>English</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLanguage('tr')}
                      className={`py-1.5 px-2 rounded-[6px] text-xs font-semibold transition-all duration-150 flex items-center justify-center gap-1.5 ${
                        language === 'tr'
                          ? 'bg-white dark:bg-[#3a3a3a] text-fluent-accent dark:text-fluent-accent-dark shadow-sm border border-black/[0.06] dark:border-white/[0.08]'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <span className="text-[10px] font-black opacity-75">TR</span>
                      <span>Türkçe</span>
                    </button>
                  </div>
                </div>

                {/* Section 2: Theme Toggle (Light / Dark Segmented Fluent Pill) */}
                <div className="p-2 rounded-fluent bg-black/[0.025] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06] space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                    {darkMode ? (
                      <Moon className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    ) : (
                      <Sun className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    )}
                    <span>{t('nav.theme', 'Theme')}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 p-1 rounded-fluent bg-black/[0.04] dark:bg-black/30 border border-black/[0.05] dark:border-white/[0.06]">
                    <button
                      type="button"
                      onClick={() => setDarkMode(false)}
                      className={`py-1.5 px-2 rounded-[6px] text-xs font-semibold transition-all duration-150 flex items-center justify-center gap-1.5 ${
                        !darkMode
                          ? 'bg-white text-fluent-accent shadow-sm border border-black/[0.06]'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                      <span>{isTr ? 'Açık' : 'Light'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDarkMode(true)}
                      className={`py-1.5 px-2 rounded-[6px] text-xs font-semibold transition-all duration-150 flex items-center justify-center gap-1.5 ${
                        darkMode
                          ? 'bg-[#3a3a3a] text-fluent-accent-dark shadow-sm border border-white/[0.08]'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isTr ? 'Koyu' : 'Dark'}</span>
                    </button>
                  </div>
                </div>

                {/* Section 3: Standards & Specifications Action Row */}
                <div className="pt-1 border-t border-black/[0.06] dark:border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSettingsOpen(false);
                      setIsInfoModalOpen(true);
                    }}
                    className="w-full p-2.5 rounded-fluent hover:bg-black/[0.04] dark:hover:bg-white/[0.06] active:scale-[0.99] transition-all flex items-center justify-between gap-2 text-left group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-fluent bg-fluent-accent/10 dark:bg-fluent-accent-dark/15 flex items-center justify-center text-fluent-accent dark:text-fluent-accent-dark flex-shrink-0">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                          {t('nav.standards_info', 'Standards & Specifications')}
                        </span>
                        <span className="block text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {t('nav.standards_info_desc', 'ASME Sec. IX, B31.3, AWS & EN')}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-fluent-accent dark:group-hover:text-fluent-accent-dark group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </button>
                </div>
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
            className="w-full max-w-lg max-h-[88vh] overflow-y-auto rounded-fluent-lg bg-white/95 dark:bg-[#282828]/95 backdrop-blur-2xl border border-black/[0.1] dark:border-white/[0.12] shadow-fluent-modal p-5 sm:p-6 text-slate-800 dark:text-slate-100 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.08] dark:border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-fluent bg-fluent-accent/10 dark:bg-fluent-accent-dark/15 flex items-center justify-center text-fluent-accent dark:text-fluent-accent-dark">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  {t('nav.standards_info', 'Standards & Specifications')}
                </h3>
              </div>
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
                {isTr ? (
                  <>
                    <strong>Kaynak Sarf Malzeme Hesaplayıcı (WCC)</strong>; kaynak metali hacmini, elektrot/tel ağırlık ve adetlerini, ark yanma sürelerini ve koruyucu/kök gazı tüketimini sertifikalı uluslararası kaynak mühendisliği standartlarına tam uyumlu olarak hesaplar:
                  </>
                ) : (
                  <>
                    The <strong>Welding Consumable Calculator (WCC)</strong> calculates weld metal volume, consumable weights, arc-on times, and shielding/purge gas consumption in strict conformance with certified international welding engineering standards:
                  </>
                )}
              </p>

              <div className="p-3 rounded-fluent bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08] space-y-1.5 font-mono text-[11px]">
                <p>
                  • <strong>ASME Section IX:</strong>{' '}
                  {isTr ? 'Kaynak ve Lehimleme Prosedürü Nitelendirme Standardı' : 'Qualification Standard for Welding & Brazing'}
                </p>
                <p>
                  • <strong>ASME B31.3:</strong>{' '}
                  {isTr ? 'Proses Borulama Kodu (Ağız Detayı, Soket Cx & PWHT)' : 'Process Piping Code (Joint Details, Socket Cx & PWHT)'}
                </p>
                <p>
                  • <strong>ASME B36.10M / B36.19M:</strong>{' '}
                  {isTr ? 'Standart Dikişli ve Dikişsiz Çelik Boru Ölçüleri' : 'Standard Welded & Seamless Wrought Steel Pipe'}
                </p>
                <p>
                  • <strong>AWS D1.1 / AWS A5.X:</strong>{' '}
                  {isTr ? 'Yapısal Çelik Kaynağı ve Sarf Malzeme Sınıflandırması' : 'Structural Welding & Consumable Specifications'}
                </p>
                <p>
                  • <strong>EN ISO 15614-1:</strong>{' '}
                  {isTr ? 'Kaynak Prosedürü Testleri (k-faktör Isı Girdisi)' : 'Welding Procedure Tests (k-factor Heat Input)'}
                </p>
              </div>

              <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between gap-2 flex-wrap">
                <span>
                  {isTr ? 'Referans Şartname:' : 'Governing Spec:'}{' '}
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