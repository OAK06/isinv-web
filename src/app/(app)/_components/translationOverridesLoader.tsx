"use client"

import { useEffect, useState } from "react"
import { useAtom } from "jotai"
import { branch } from "@/_state/globalStore"
import i18n from "@/i18n/client"
import { getTranslationOverrides } from "@/app/(app)/translations/_translations"

/**
 * Merges the current tenant's custom string overrides on top of the base locale
 * bundle at runtime (renders nothing). Any key the tenant hasn't overridden — or
 * the whole set if the fetch fails — falls back to the base translation, so this
 * can never blank out the UI. Only active inside the tenant (app) shell; the
 * admin shell never mounts it, so Super Admin strings are untouched.
 */
export default function TranslationOverridesLoader() {
	const [branchID] = useAtom(branch)
	const [lang, setLang] = useState(i18n.language)

	// Track the active language so overrides re-load when the user switches locale.
	useEffect(() => {
		const onLang = (l: string) => setLang(l)
		i18n.on("languageChanged", onLang)
		return () => { i18n.off("languageChanged", onLang) }
	}, [])

	useEffect(() => {
		if (!branchID || branchID === -1 || !lang) return

		let cancelled = false
		getTranslationOverrides(branchID, lang)
			.then(res => {
				const overrides = res?.response?.overrides
				if (cancelled || !overrides || typeof overrides !== "object") return

				let applied = false
				for (const [key, value] of Object.entries(overrides)) {
					if (typeof value === "string") {
						i18n.addResource(lang, "common", key, value)
						applied = true
					}
				}
				// addResource doesn't re-render on its own; nudge react-i18next
				// consumers to re-read the merged bundle (same lang = no loop).
				if (applied) i18n.changeLanguage(lang)
			})
			.catch(() => { /* silent: keep base locale */ })

		return () => { cancelled = true }
	}, [branchID, lang])

	return null
}
