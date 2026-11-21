/**
 * Welding Consumable Calculator (WCC)
 * Layout Component: Header (Standalone Calculator Edition)
 * Windows 11 Pro Fluent UI Navigation Bar, Minimalist Settings Flyout &
 * Custom Theme-Aware Fluent Language Select (Google Language Style, 40+ Languages Ready)
 * Standards: ASME Sec. IX • ASME B31.3 • AWS A5.X • EN ISO 15614-1
 * Pure JavaScript (.js only)
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useTranslation, AVAILABLE_LANGUAGES } from '../../i18n.js';
import { Settings, X, Globe, ChevronDown, Check, Search } from 'lucide-react';

export default function Header({
  activeTab,
  setActiveTab,
  darkMode,
  setDarkMode,
}) {
  const { t, language, setLanguage } = useTranslation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [langSearch, setLangSearch] = useState('');
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const settingsMenuRef = useRef(null);

  const currentLanguageObj = useMemo(
    () => AVAILABLE_LANGUAGES.find((l) => l.code === language) || AVAILABLE_LANGUAGES[0],
    [language]
  );

  const filteredLanguages = useMemo(() => {
    const q = langSearch.trim().toLowerCase();
    if (!q) return AVAILABLE_LANGUAGES;
    return AVAILABLE_LANGUAGES.filter(
      (l) =>
        l.label.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q)
    );
  }, [langSearch]);

  // Reset language dropdown state when Settings flyout closes
  useEffect(() => {
    if (!isSettingsOpen) {
      setIsLangDropdownOpen(false);
      setLangSearch('');
    }
  }, [isSettingsOpen]);

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
        if (isLangDropdownOpen) {
          setIsLangDropdownOpen(false);
        } else {
          setIsSettingsOpen(false);
          setIsInfoModalOpen(false);
        }
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
  }, [isSettingsOpen, isLangDropdownOpen, isInfoModalOpen]);

  const handleSelectLanguage = (code) => {
    setLanguage(code);
    setIsLangDropdownOpen(false);
    setLangSearch('');
  };

  const navTabs = [
    { id: 'calculator', label: t('nav.calculator', 'Calculator') },
    { id: 'catalog', label: t('nav.standards', 'Standards Catalog') },
    { id: 'pqr', label: t('nav.pqr_records', 'PQR Benchmarks') },
  ];

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
                  w-[min(calc(100vw-1.5rem),17rem)]
                  rounded-fluent-lg
                  bg-white dark:bg-[#2c2c2c]
                  border border-black/[0.09] dark:border-white/[0.1]
                  shadow-fluent-flyout
                  p-1.5
                  z-50
                "
              >
                {/* Custom Windows 11 Pro Fluent + Google Language Select (Scales to 40+ languages) */}
                <div className="px-2.5 py-2 space-y-1.5 relative">
                  <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    {t('nav.language', 'Language')}
                  </span>

                  <button
                    type="button"
                    onClick={() => setIsLangDropdownOpen((prev) => !prev)}
                    aria-haspopup="listbox"
                    aria-expanded={isLangDropdownOpen}
                    aria-label={t('nav.language', 'Language')}
                    className={`w-full px-2.5 py-2 rounded-fluent border text-xs font-medium flex items-center justify-between gap-2 transition-all duration-150 bg-white dark:bg-[#202020] text-slate-800 dark:text-slate-100 ${
                      isLangDropdownOpen
                        ? 'border-fluent-accent ring-2 ring-fluent-accent/25'
                        : 'border-black/[0.14] dark:border-white/[0.14] hover:border-fluent-accent/60'
                    }`}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <Globe className="w-3.5 h-3.5 text-fluent-accent dark:text-fluent-accent-dark flex-shrink-0" />
                      <span className="truncate font-semibold">
                        {currentLanguageObj?.label || language}
                      </span>
                    </span>

                    <span className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-black/[0.04] dark:bg-white/[0.07] text-slate-500 dark:text-slate-400">
                        {currentLanguageObj?.code || language}
                      </span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-slate-500 dark:text-slate-400 transition-transform duration-150 ${
                          isLangDropdownOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </span>
                  </button>

                  {/* Theme-Aware Fluent Select Dropdown List */}
                  {isLangDropdownOpen && (
                    <div
                      role="listbox"
                      aria-label={t('nav.language', 'Language')}
                      className="
                        absolute left-2.5 right-2.5 top-[calc(100%-2px)]
                        mt-1 z-50
                        rounded-fluent-lg
                        bg-white dark:bg-[#252525]
                        border border-black/[0.1] dark:border-white/[0.12]
                        shadow-fluent-flyout
                        p-1
                        animate-in fade-in duration-100
                      "
                    >
                      {/* Auto-enabled Google-style quick filter when > 6 languages */}
                      {AVAILABLE_LANGUAGES.length > 6 && (
                        <div className="p-1 pb-1.5 border-b border-black/[0.06] dark:border-white/[0.08] mb-1">
                          <div className="relative">
                            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <input
                              type="text"
                              value={langSearch}
                              onChange={(e) => setLangSearch(e.target.value)}
                              placeholder={t('nav.language_search', 'Search language...')}
                              className="w-full pl-7 pr-2 py-1 text-xs rounded-[6px] bg-black/[0.03] dark:bg-[#1c1c1c] text-slate-800 dark:text-slate-100 border border-black/[0.08] dark:border-white/[0.1] focus:outline-none focus:border-fluent-accent"
                            />
                          </div>
                        </div>
                      )}

                      <div className="max-h-60 overflow-y-auto space-y-0.5">
                        {filteredLanguages.map((lang) => {
                          const isSelected = lang.code === language;
                          return (
                            <button
                              key={lang.code}
                              type="button"
                              role="option"
                              aria-selected={isSelected}
                              onClick={() => handleSelectLanguage(lang.code)}
                              className={`relative w-full px-2.5 py-2 rounded-[6px] text-xs flex items-center justify-between gap-2 text-left transition-colors ${
                                isSelected
                                  ? 'bg-fluent-accent/[0.08] dark:bg-fluent-accent-dark/[0.14] text-slate-900 dark:text-white font-semibold'
                                  : 'text-slate-700 dark:text-slate-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                              }`}
                            >
                              {isSelected && (
                                <span
                                  aria-hidden="true"
                                  className="absolute left-0.5 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-full bg-fluent-accent dark:bg-fluent-accent-dark"
                                />
                              )}
                              <span className="pl-1.5 truncate">{lang.label}</span>
                              <span className="flex items-center gap-1.5 flex-shrink-0">
                                <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500">
                                  {lang.code}
                                </span>
                                {isSelected && (
                                  <Check className="w-3.5 h-3.5 text-fluent-accent dark:text-fluent-accent-dark" />
                                )}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
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

        {/* 3. Centered Windows 11 Pro Fluent Navigation Tabs (Icon-Free, Mobile-First) */}
        <nav
          aria-label="Primary Navigation"
          className="w-full border-t border-black/[0.04] dark:border-white/[0.04] overflow-x-auto no-scrollbar"
        >
          <div className="w-max min-w-full max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-1.5 flex items-center justify-center">
            <div
              role="tablist"
              className="inline-flex items-center gap-1 p-1 rounded-fluent bg-black/[0.03] dark:bg-white/[0.035] border border-black/[0.05] dark:border-white/[0.06]"
            >
              {navTabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative px-3.5 sm:px-5 py-1.5 rounded-[6px] text-xs sm:text-[13px] tracking-tight transition-all duration-150 whitespace-nowrap select-none active:scale-[0.98] ${
                      isActive
                        ? 'bg-white dark:bg-[#333333] text-slate-900 dark:text-white font-semibold shadow-sm border border-black/[0.07] dark:border-white/[0.08]'
                        : 'text-slate-600 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-slate-100 hover:bg-black/[0.035] dark:hover:bg-white/[0.04] border border-transparent'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="absolute bottom-[3px] left-1/2 -translate-x-1/2 w-5 h-[2.5px] rounded-full bg-fluent-accent dark:bg-fluent-accent-dark"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>
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