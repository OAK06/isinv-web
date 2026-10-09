"use client"

import Link from "next/link"
import { useTranslation } from "react-i18next"

// Client child for the root not-found page: renders the translated copy via the
// client i18n instance so the server not-found shell never needs serverTranslation
// (→ resolveServerLocale → next/headers), which the pages-router 404 boundary
// forbids.
export default function NotFoundMessage() {
	const { t } = useTranslation("common")

	return <>
		<h1 className="text-2xl md:text-3xl font-bold mb-3">{t('notFound.title')}</h1>
		<p className="text-base-content/70 mb-8 max-w-md mx-auto">{t('notFound.text')}</p>
		<Link href="/" className="btn btn-primary rounded-full px-8 shadow-lg hover:scale-105 transition-all">
			{t('notFound.homeBtn')}
		</Link>
	</>
}
