'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import fr, { type TranslationKey } from './translations/fr';
import en from './translations/en';

export type Lang = 'fr' | 'en';

const dictionaries: Record<Lang, Record<TranslationKey, string>> = { fr, en };

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey, replacements?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = 'coup-de-tete-lang';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('fr');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (stored === 'en' || stored === 'fr') {
      setLangState(stored);
    }
    setMounted(true);
  }, []);

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem(STORAGE_KEY, newLang);
    document.documentElement.lang = newLang;
  }, []);

  const t = useCallback((key: TranslationKey, replacements?: Record<string, string | number>): string => {
    let text = dictionaries[lang][key] ?? dictionaries['fr'][key] ?? key;
    if (replacements) {
      for (const [k, v] of Object.entries(replacements)) {
        text = text.replace(`{${k}}`, String(v));
      }
    }
    return text;
  }, [lang]);

  // Prevent hydration mismatch by rendering children only after mount
  // But still render them server-side with default (fr)
  const value = { lang: mounted ? lang : 'fr', setLang, t };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
