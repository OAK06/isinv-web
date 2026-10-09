import { NextRequest, NextResponse } from 'next/server';
import { languages } from '@/i18n/settings';
import { detectLocale } from '@/i18n/geo';

export function middleware(request: NextRequest) {
  // Only an *explicit* pick from the language switcher pins the locale (the
  // switcher sets LANG_MANUAL=1 alongside NEXT_LOCALE). Everything else is
  // re-detected by geo on every request, so a visitor's language follows their
  // location until they choose one themselves — and a stale auto-set cookie can
  // never freeze them onto the wrong language.
  const manualChoice = request.cookies.get('LANG_MANUAL')?.value === '1';
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  const cookieValid =
    cookieLocale && (languages as readonly string[]).includes(cookieLocale);

  // Auto-detect by visitor location (CDN geo header), then Accept-Language,
  // then fall back to English.
  const detected = detectLocale(request);
  const locale = manualChoice && cookieValid ? cookieLocale! : detected;

  // Persist the resolved locale so the client i18n initial value and the
  // language switcher's selected option reflect it. The page resolves the locale
  // itself in the render (resolveServerLocale) from the same CDN header, so this
  // only keeps the cookie in sync.
  const response = NextResponse.next();
  response.cookies.set('NEXT_LOCALE', locale, { path: '/' });
  return response;
}

export const config = {
  // Skip Next internals and static assets.
  matcher: ['/((?!_next|api|favicon.ico|.*\\..*).*)'],
};
