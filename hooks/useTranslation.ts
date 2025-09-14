
import { useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }

  const { translations, ...rest } = context;

  // FIX: The `t` function has been updated to accept an optional `variables` argument for string interpolation. This resolves a TypeScript error where `t` was called with more than one argument.
  const t = (key: string, variables?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let result: any = translations;
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        return key; // Return the key if translation is not found
      }
    }
    
    if (typeof result === 'string') {
      if (variables) {
        return Object.entries(variables).reduce(
          (str, [varKey, varValue]) => str.replace(new RegExp(`{{${varKey}}}`, 'g'), String(varValue)),
          result
        );
      }
      return result;
    }

    return key;
  };

  return { t, ...rest };
};
