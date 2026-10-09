import type { NextRequest } from 'next/server';
import { fallbackLng, languages } from './settings';

/**
 * Geo-based locale detection.
 *
 * Reads the visitor's country from the edge/CDN headers and maps it to one of
 * our supported UI languages, falling back to Accept-Language, then English.
 */

/**
 * Resolve the visitor's ISO country code from the request.
 *
 * Cloudflare sets `CF-IPCountry` automatically; we also accept Vercel's edge
 * header. Returns 'XX' when the country is unknown (local/private requests).
 */
export function getCountryFromRequest(request: NextRequest): string {
  const cf = request.headers.get('cf-ipcountry');
  if (cf && cf !== 'XX') {
    return cf.toUpperCase();
  }

  const vercel = request.headers.get('x-vercel-ip-country');
  if (vercel) {
    return vercel.toUpperCase();
  }

  return 'XX';
}

/** Map an ISO country code to one of our supported languages. */
export function countryToLanguage(code: string): (typeof languages)[number] | null {
  const arabic = [
    'SA', 'AE', 'KW', 'QA', 'BH', 'OM', 'EG', 'JO', 'LB', 'IQ',
    'SY', 'YE', 'PS', 'DZ', 'MA', 'TN', 'LY', 'SD', 'MR',
  ];

  if (arabic.includes(code)) return 'ar';

  // Only en + ar are supported; everything else falls back to English (null).
  return null;
}

/**
 * Best-effort locale for the request, in priority order:
 *   1. country (CDN geo header)
 *   2. Accept-Language header
 *   3. fallbackLng
 *
 * Note: an explicit NEXT_LOCALE cookie (the user's manual choice via the
 * language switcher) is handled in middleware and always wins over this.
 */
export function detectLocale(request: NextRequest): string {
  const country = getCountryFromRequest(request);
  if (country !== 'XX') {
    const byCountry = countryToLanguage(country);
    if (byCountry) return byCountry;
  }

  const header = request.headers
    .get('accept-language')
    ?.split(',')[0]
    .split('-')[0]
    .toLowerCase();

  if (header && (languages as readonly string[]).includes(header)) {
    return header;
  }

  return fallbackLng;
}
