"use client"

import { useState } from "react"
import { store } from "@/_state/globalStore"
import { Provider as JotaiProvider } from "jotai"
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/client';

export default function Providers({
  children,
  locale,
}: {
  children: React.ReactNode
  locale: string
}) {
  // Align the i18n language with the server-resolved locale on the first render
  // (runs once, synchronously, on both SSR and client hydration with the same
  // value) so the client-rendered UI matches the server HTML and shows the right
  // language immediately — no English flash, no hydration mismatch.
  useState(() => {
    if (locale && i18n.language !== locale) i18n.changeLanguage(locale)
  })

  return (
    <JotaiProvider store={store}>
      <I18nextProvider i18n={i18n}>
        {children}
      </I18nextProvider>
    </JotaiProvider>
  )
}