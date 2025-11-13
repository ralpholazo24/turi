import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import en from './locales/en.json';
import es from './locales/es.json';

const resources = {
  en: {
    translation: en,
  },
  es: {
    translation: es,
  },
};

// Get initial language from device (will be overridden by language store if saved preference exists)
const getInitialLanguage = () => {
  try {
    const deviceLocale = Localization.getLocales()[0]?.languageCode;
    const supportedLanguages = ['en', 'es'];
    return deviceLocale && supportedLanguages.includes(deviceLocale) ? deviceLocale : 'en';
  } catch (error) {
    return 'en';
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    compatibilityJSON: 'v4',
  });

export default i18n;

