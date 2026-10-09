import { createInstance } from 'i18next';
import { fallbackLng, languages } from './settings';
import { resolveServerLocale } from './resolveServerLocale';
// import { initReactI18next } from 'react-i18next';
import fs from 'fs/promises';
import path from 'path';

export async function serverTranslation(ns: string | string[] = 'common') {
  // Same geo-based resolution the page uses, so metadata matches the rendered
  // language.
  const lng = resolveServerLocale();
  const namespaces = Array.isArray(ns) ? ns : [ns];

  const resources: any = {
    [lng]: {},
  };

//   for (const namespace of namespaces) {
//     const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/locales/${lng}/${namespace}.json`);
//     resources[lng][namespace] = await response.json();
//   }
  for (const namespace of namespaces) {
    try {
      const filePath = path.join(process.cwd(), 'public', 'locales', lng, `${namespace}.json`);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      resources[lng][namespace] = JSON.parse(fileContent);
    } catch (error) {
      console.error(`Translation file missing: ${lng}/${namespace}.json`);
      resources[lng][namespace] = {};
    }
  }

  const i18nInstance = createInstance();

  await i18nInstance
    // .use(initReactI18next)
    .init({
      lng,
      fallbackLng,
      supportedLngs: languages as unknown as string[],
      ns: namespaces,
      defaultNS: 'common',
      resources,
      interpolation: { escapeValue: false },
    });

  return {
    t: i18nInstance.t,
    i18n: i18nInstance,
    locale: lng,
  };
}
