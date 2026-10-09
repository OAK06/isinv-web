import { cookies, headers } from 'next/headers';
import { fallbackLng, languages } from './settings';
// GEO DISABLED — country->language auto-detection is off for now. Re-enable the
// import + the geo block below when geo is implemented properly.
// See memory: project-isinv-seo-geo-disabled.
// import { countryToLanguage } from './geo';

const isSupported = (v: string | undefined): v is string =>
  !!v && (languages as readonly string[]).includes(v);

/**
 * Resolve the locale for the current request, server-side, reading the CDN geo
 * header (`cf-ipcountry`) directly off the incoming request via `headers()`.
 *
 * This does NOT depend on middleware having run — it reads the same incoming
 * header the edge/CDN attaches, which is the channel that reliably reaches the
 * origin. That makes the rendered language (html lang, client i18n, metadata)
 * correct regardless of middleware quirks.
 *
 * Order:
 *   1. Explicit switcher choice (LANG_MANUAL=1 + valid NEXT_LOCALE cookie).
 *   2. Visitor country via cf-ipcountry / x-vercel-ip-country.
 *   3. Accept-Language.
 *   4. English fallback.
 *
 * The auto-set NEXT_LOCALE cookie is intentionally ignored unless it's a manual
 * choice, so a stale auto value can never override fresh geo.
 */
export function resolveServerLocale(): string {
  const h = headers();
  const c = cookies();

  // 1. Explicit manual choice wins.
  const manual = c.get('LANG_MANUAL')?.value === '1';
  const cookieLocale = c.get('NEXT_LOCALE')?.value;
  if (manual && isSupported(cookieLocale)) return cookieLocale;

  // 2. GEO DISABLED — country-based language detection is off for now.
  //    (Re-enable: read cf-ipcountry / x-vercel-ip-country and map via
  //    countryToLanguage. See memory: project-isinv-seo-geo-disabled.)

  // 3. Accept-Language.
  const accept = h
    .get('accept-language')
    ?.split(',')[0]
    ?.split('-')[0]
    ?.toLowerCase();
  if (isSupported(accept)) return accept;

  // 4. Fallback.
  return fallbackLng;
}

/**
 * Resolve the visitor's ISO country code for the current request from the CDN
 * geo header (`cf-ipcountry` / `x-vercel-ip-country`) — the exact same signal
 * the language detection above reads. Returns '' when the country is unknown
 * (local dev, private requests); callers apply their own default.
 *
 * This deliberately reads ONLY the CDN geo header — no external IP-lookup
 * service — so location detection stays in lockstep with the geo-based language
 * detection and needs no third-party plugin.
 */
export function resolveServerCountry(): string {
  // GEO DISABLED — always returns '' for now (was a CDN geo-header lookup).
  // See memory: project-isinv-seo-geo-disabled.
  return '';
}
