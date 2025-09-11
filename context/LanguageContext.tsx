
import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface LanguageContextType {
  language: string;
  translations: Record<string, any>;
  changeLanguage: (lang: string) => void;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'pt');
  const [translations, setTranslations] = useState({});

  const fetchTranslations = useCallback(async (lang: string) => {
    try {
      const response = await fetch(`/locales/${lang}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load ${lang}.json`);
      }
      const data = await response.json();
      setTranslations(data);
    } catch (error) {
      console.error("Could not load translations:", error);
      // Fallback to 'pt' if the selected language file fails to load
      if (lang !== 'pt') {
        fetchTranslations('pt');
      }
    }
  }, []);

  useEffect(() => {
    fetchTranslations(language);
  }, [language, fetchTranslations]);

  const changeLanguage = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, translations, changeLanguage }}>
      {Object.keys(translations).length > 0 ? children : null}
    </LanguageContext.Provider>
  );
};
