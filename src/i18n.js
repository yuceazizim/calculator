/**
 * Welding Consumable Calculator (WCC)
 * Internationalization (i18n) Engine & React Context Provider
 * Robust JSON Module Extraction with Instant Locale Re-rendering
 * Pure JavaScript Implementation (.js only)
 */

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import enTranslations from './locales/en.json';
import trTranslations from './locales/tr.json';
import ruTranslations from './locales/ru.json';

const unwrapDict = (imported) => {
  if (!imported) return {};
  return imported.default && typeof imported.default === 'object' ? imported.default : imported;
};

// Tek merkezden yönetilen dil listesi (40+ dil için buraya ekleme yapılır)
export const AVAILABLE_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'ru', label: 'Русский' },
];

const SUPPORTED_LANGUAGES = AVAILABLE_LANGUAGES.map((l) => l.code);

const dictionaries = {
  en: unwrapDict(enTranslations),
  tr: unwrapDict(trTranslations),
  ru: unwrapDict(ruTranslations),
};

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem('wcc_language');
      return SUPPORTED_LANGUAGES.includes(saved) ? saved : 'en';
    } catch {
      return 'en';
    }
  });

  const setLanguage = useCallback((lang) => {
    const targetLang = SUPPORTED_LANGUAGES.includes(lang) ? lang : 'en';
    setLanguageState(targetLang);
    try {
      localStorage.setItem('wcc_language', targetLang);
    } catch {
      // ignore storage errors
    }
    document.documentElement.lang = targetLang;
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = useCallback((keyPath, fallback = '') => {
    if (!keyPath) return fallback;

    const currentDict = dictionaries[language] || dictionaries.en || {};
    const keys = keyPath.split('.');

    let current = currentDict;
    let foundInCurrent = true;

    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        foundInCurrent = false;
        break;
      }
    }

    if (foundInCurrent && typeof current === 'string') {
      return current;
    }

    let fallbackCurrent = dictionaries.en || {};
    for (const fk of keys) {
      if (fallbackCurrent && typeof fallbackCurrent === 'object' && fk in fallbackCurrent) {
        fallbackCurrent = fallbackCurrent[fk];
      } else {
        return fallback || keyPath;
      }
    }

    return typeof fallbackCurrent === 'string' ? fallbackCurrent : (fallback || keyPath);
  }, [language]);

  const contextValue = useMemo(() => ({
    language,
    setLanguage,
    t,
  }), [language, setLanguage, t]);

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
}