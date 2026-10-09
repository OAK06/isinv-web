"use client"

import { useEffect, useMemo, useState } from "react"
import { useAtom } from "jotai"
import { useTranslation } from "react-i18next"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faMagnifyingGlass, faFloppyDisk } from "@fortawesome/free-solid-svg-icons"
import { branch } from "@/_state/globalStore"
import Header from "@/app/(app)/_components/header"
import i18n from "@/i18n/client"
import { languages } from "@/i18n/settings"
import { getTranslationOverrides, saveTranslationOverrides } from "./_translations"

// Top-level key families that only appear in the Super-Admin area — hidden from
// the client editor (overrides are company-scoped and can never reach the admin
// shell anyway; this just keeps the list to what the client actually sees).
const ADMIN_PREFIXES = new Set([
	"adminDashboard", "tenants", "superAdminBanner", "demoTenants",
	"subscriptions", "systemPlans", "systemAddons", "gymSignups",
])

const MAX_ROWS = 200

type Row = { key: string; base: string }

/** Flatten nested locale JSON to dotted keys, string leaves only, minus admin families. */
function flatten(obj: any, prefix = ""): Row[] {
	const rows: Row[] = []
	for (const [k, v] of Object.entries(obj ?? {})) {
		if (!prefix && ADMIN_PREFIXES.has(k)) continue
		const key = prefix ? `${prefix}.${k}` : k
		if (typeof v === "string") rows.push({ key, base: v })
		else if (v && typeof v === "object" && !Array.isArray(v)) rows.push(...flatten(v, key))
	}
	return rows
}

export default function TranslationsPage() {
	const { t } = useTranslation("common")
	const [branchID] = useAtom(branch)

	const [locale, setLocale] = useState<string>(i18n.language || "en")
	const [rows, setRows] = useState<Row[]>([])
	const [overrides, setOverrides] = useState<Record<string, string>>({})
	const [search, setSearch] = useState("")
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [saved, setSaved] = useState(false)

	useEffect(() => {
		let cancelled = false
		setLoading(true)
		setSaved(false)
		Promise.all([
			fetch(`/locales/${locale}/common.json`).then(r => r.json()).catch(() => ({})),
			branchID && branchID !== -1
				? getTranslationOverrides(branchID, locale).then(r => r?.response?.overrides ?? {}).catch(() => ({}))
				: Promise.resolve({}),
		]).then(([base, existing]) => {
			if (cancelled) return
			setRows(flatten(base))
			setOverrides({ ...(existing as Record<string, string>) })
			setLoading(false)
		})
		return () => { cancelled = true }
	}, [locale, branchID])

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase()
		if (!q) return rows
		return rows.filter(r => r.key.toLowerCase().includes(q) || r.base.toLowerCase().includes(q))
	}, [rows, search])

	const shown = filtered.slice(0, MAX_ROWS)

	const setOverride = (key: string, value: string) =>
		setOverrides(prev => ({ ...prev, [key]: value }))

	async function save() {
		if (!branchID || branchID === -1) return
		setSaving(true)
		setSaved(false)
		try {
			// Drop empties so cleared rows revert to base.
			const clean: Record<string, string> = {}
			for (const [k, v] of Object.entries(overrides)) if (v && v.trim() !== "") clean[k] = v
			await saveTranslationOverrides(branchID, locale, clean)
			// Apply live to the current language immediately.
			if (locale === i18n.language) {
				for (const [k, v] of Object.entries(clean)) i18n.addResource(locale, "common", k, v)
				i18n.changeLanguage(locale)
			}
			setSaved(true)
		} finally {
			setSaving(false)
		}
	}

	return (
		<>
			<Header title={t("translations.title")} subtitle={t("translations.subtitle")} />

			<div className="flex flex-col sm:flex-row gap-3 mb-4 mt-4">
				<div className="relative flex-1">
					<FontAwesomeIcon icon={faMagnifyingGlass} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/50" />
					<input
						type="text"
						className="input input-bordered w-full ps-10"
						placeholder={t("translations.searchPlaceholder")}
						value={search}
						onChange={e => setSearch(e.target.value)}
					/>
				</div>
				<select
					className="select select-bordered"
					value={locale}
					onChange={e => setLocale(e.target.value)}
					aria-label={t("translations.localeLabel")}
				>
					{languages.map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
				</select>
				<button className="btn btn-primary" onClick={save} disabled={saving || loading}>
					{saving
						? <span className="loading loading-spinner loading-sm" />
						: <FontAwesomeIcon icon={faFloppyDisk} className="w-4 h-4" />}
					{t("translations.save")}
				</button>
			</div>

			{saved && <div className="alert alert-success mb-4 py-2">{t("translations.saved")}</div>}

			{loading ? (
				<div className="flex justify-center py-16"><span className="loading loading-spinner loading-lg text-primary" /></div>
			) : (
				<>
					<p className="text-sm text-base-content/50 mb-2">
						{t("translations.showingCount", { count: shown.length, total: filtered.length })}
						{filtered.length > MAX_ROWS && ` — ${t("translations.refineSearch")}`}
					</p>
					<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
						{shown.map(row => (
							<div key={row.key} className="card bg-base-100 border border-base-300">
								<div className="card-body p-3 gap-1">
									<p className="text-sm text-base-content/70">{row.base}</p>
									<input
										type="text"
										className="input input-bordered input-sm w-full mt-1"
										placeholder={row.base}
										value={overrides[row.key] ?? ""}
										onChange={e => setOverride(row.key, e.target.value)}
									/>
								</div>
							</div>
						))}
						{shown.length === 0 && (
							<p className="text-center text-base-content/50 py-10">{t("translations.noResults")}</p>
						)}
					</div>
				</>
			)}
		</>
	)
}
