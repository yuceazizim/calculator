/**
 * Welding Consumable Calculator (WCC)
 * Internationalization (i18n) Engine & React Context Provider
 * Robust JSON Module Extraction with Instant Locale Re-rendering (EN / TR)
 * Pure JavaScript Implementation (.js only)
 */

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import enTranslations from './locales/en.json';
import trTranslations from './locales/tr.json';

// Safe unwrapping for Vite JSON module imports (handles both direct object and ES default export)
const unwrapDict = (imported) => {
  if (!imported) return {};
  return imported.default && typeof imported.default === 'object' ? imported.default : imported;
};

const SUPPORTED_LANGUAGES = ['en', 'tr'];

const dictionaries = {
  en: unwrapDict(enTranslations),
  tr: unwrapDict(trTranslations),
};

const I18nContext = createContext(null);

/**
 * Provider component for global translation context
 */
export function I18nProvider({ children }) {
  // Read initial language from localStorage, default to English
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem('wcc_language');
      return SUPPORTED_LANGUAGES.includes(saved) ? saved : 'en';
    } catch {
      return 'en';
    }
  });

  // Language switcher that directly triggers state update
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

  // Sync HTML document lang attribute on mount or change
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  /**
   * Safe nested key translation resolver (e.g. t("joint.bevel_angle"))
   */
  const t = useCallback((keyPath, fallback = '') => {
    if (!keyPath) return fallback;

    const currentDict = dictionaries[language] || dictionaries.en || {};
    const keys = keyPath.split('.');

    // 1. Try to find the key in the currently active language
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

    // 2. Fallback to English dictionary if key is missing in active language
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

  // Memoize context value to guarantee immediate re-rendering of all consumers on language switch
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

/**
 * Custom Hook to access translations and language switcher
 */
export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
}