import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { fallbackLng, languages } from './settings';

const getInitialLocale = () => {
  if (typeof window !== 'undefined') {
    const match = document.cookie.match(/(?:^|; )NEXT_LOCALE=([^;]*)/);
    return match?.[1] || 'en';
  }
  return 'en';
};

const resources = {}
for (const language of languages) {
  resources[language] = { common: require(`@/../public/locales/${language}/common.json`) }
}

i18n
  .use(initReactI18next)
  .init({
    lng: getInitialLocale(),
    fallbackLng: fallbackLng,
    supportedLngs: languages,
    ns: ['common'],
    defaultNS: 'common',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false,
    },
    resources: resources,
  });

export default i18n;
