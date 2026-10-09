'use client';

import { useTranslation } from 'next-i18next';
import { updateLocalePreference } from '@/app/(app)/profile/_profile';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe, faChevronDown, faCheck } from '@fortawesome/free-solid-svg-icons';

const options = [
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'العربية' },
  { value: 'de', label: 'Deutsch' },
  { value: 'fr', label: 'Français' },
  { value: 'nl', label: 'Nederlands' },
  { value: 'ja', label: '日本語' },
];

export default function LanguageSwitcher({ inline = false }: { inline?: boolean }) {
  const { t, i18n } = useTranslation('common');

  // Show whatever language is actually rendering (the active i18n language, set
  // by the provider from the geo-resolved locale) rather than reading the cookie,
  // so the selected option always matches what's on screen.
  const active = (i18n.resolvedLanguage || i18n.language || 'en').split('-')[0];
  const locale = options.some((o) => o.value === active) ? active : 'en';
  const current = options.find((o) => o.value === locale) || options[0];

  const handleSelect = async (newLocale: string) => {
    if (newLocale === locale) {
      (document.activeElement as HTMLElement)?.blur();
      return;
    }
    // LANG_MANUAL marks this as an explicit choice so middleware stops
    // re-detecting by geo and honours this locale from now on.
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    document.cookie = `LANG_MANUAL=1; path=/; max-age=31536000`;
    // Persist to the user's account when logged in; best-effort and silent, so a
    // guest on the public site (401) is simply ignored.
    try { await updateLocalePreference(newLocale); } catch {}
    window.location.reload();
  };

  // Inline variant for the mobile drawer: renders as a native collapsible menu
  // entry (same pattern as the Features item) instead of a floating dropdown,
  // which clips and misaligns inside the drawer.
  if (inline) {
    return (
      <details>
        <summary className="flex items-center gap-2">
          <FontAwesomeIcon icon={faGlobe} className="text-primary w-5" />
          <span>{current.label}</span>
        </summary>
        <ul>
          {options.map((o) => (
            <li key={o.value}>
              <button
                type="button"
                onClick={() => handleSelect(o.value)}
                className={`flex items-center justify-between ${o.value === locale ? 'font-bold text-primary' : ''}`}
              >
                <span>{o.label}</span>
                {o.value === locale && <FontAwesomeIcon icon={faCheck} className="text-xs" />}
              </button>
            </li>
          ))}
        </ul>
      </details>
    );
  }

  return (
    <div className="dropdown dropdown-end">
      <label
        tabIndex={0}
        aria-label={t('changeLanguage')}
        className="btn btn-ghost btn-sm rounded-full px-3 normal-case flex items-center gap-2 font-semibold"
      >
        <FontAwesomeIcon icon={faGlobe} className="text-primary" />
        <span>{current.label}</span>
        <FontAwesomeIcon icon={faChevronDown} className="text-xs opacity-60" />
      </label>
      {/* daisyUI dropdown-end anchors with physical right:0 — flip it in RTL so the
          menu stays on screen (the ! is required to beat DaisyUI's specificity). */}
      <ul
        tabIndex={0}
        className="dropdown-content menu menu-sm z-[60] mt-2 w-44 rounded-box border border-base-200 bg-base-100 p-2 shadow-lg rtl:!right-auto rtl:!left-0"
      >
        {options.map((o) => (
          <li key={o.value}>
            <button
              type="button"
              onClick={() => handleSelect(o.value)}
              className={`flex items-center justify-between ${o.value === locale ? 'font-bold text-primary' : ''}`}
            >
              <span>{o.label}</span>
              {o.value === locale && <FontAwesomeIcon icon={faCheck} className="text-xs" />}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
