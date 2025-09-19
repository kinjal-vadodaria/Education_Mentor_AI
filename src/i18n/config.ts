import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enTranslations from './locales/en.json';
import esTranslations from './locales/es.json';
import hiTranslations from './locales/hi.json';
import zhTranslations from './locales/zh.json';
import arTranslations from './locales/ar.json';
import frTranslations from './locales/fr.json';

const resources = {
  en: { translation: enTranslations },
  es: { translation: esTranslations },
  hi: { translation: hiTranslations },
  zh: { translation: zhTranslations },
  ar: { translation: arTranslations },
  fr: { translation: frTranslations },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;