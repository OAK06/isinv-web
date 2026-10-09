"use client"

import { useEffect, useMemo, useState } from "react"
import { useAtom } from "jotai"
import { useTranslation } from "react-i18next"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFloppyDisk } from "@fortawesome/free-solid-svg-icons"
import { branch } from "@/_state/globalStore"
import Header from "@/app/(app)/_components/header"
import { getSidebarAccess, saveSidebarAccess } from "./_sidebarAccess"

type CatalogItem = { key: string }
type RoleSidebar = { id: number; name: string; sidebar: string[] }

// Each nav key reuses the existing sidebar.* label so there are no duplicate strings.
const NAV_LABEL: Record<string, string> = {
	dashboard: "sidebar.dashboard",
	members: "sidebar.members",
	applications: "sidebar.applications",
	memberPlans: "sidebar.memberPlans",
	calendar: "sidebar.calendar",
	scanner: "sidebar.scanner",
	plans: "sidebar.plans",
	classes: "sidebar.classes",
	pos: "sidebar.pointOfSale",
	reports: "sidebar.reports",
	finances: "sidebar.finances",
	company: "sidebar.company",
	branch: "sidebar.branch",
	import: "sidebar.import",
}

/** Company-owner page: show/hide top-level sidebar entries per role (incl. custom roles). */
export default function SidebarAccessPage() {
	const { t } = useTranslation("common")
	const [branchID] = useAtom(branch)

	const [catalog, setCatalog] = useState<CatalogItem[]>([])
	const [roles, setRoles] = useState<RoleSidebar[]>([])
	const [roleId, setRoleId] = useState<number | null>(null)
	const [selected, setSelected] = useState<Set<string>>(new Set())
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [saved, setSaved] = useState(false)

	useEffect(() => {
		if (!branchID || branchID === -1) return
		setLoading(true)
		getSidebarAccess(branchID).then((res: any) => {
			const cat: CatalogItem[] = res?.response?.catalog ?? []
			const rs: RoleSidebar[] = res?.response?.roles ?? []
			setCatalog(cat)
			setRoles(rs)
			if (rs.length) {
				setRoleId(rs[0].id)
				setSelected(new Set(rs[0].sidebar))
			}
			setLoading(false)
		}).catch(() => setLoading(false))
	}, [branchID])

	const activeRole = useMemo(() => roles.find(r => r.id === roleId), [roles, roleId])

	function pickRole(id: number) {
		setRoleId(id)
		setSelected(new Set(roles.find(r => r.id === id)?.sidebar ?? []))
		setSaved(false)
	}

	function toggle(key: string) {
		setSelected(prev => {
			const next = new Set(prev)
			next.has(key) ? next.delete(key) : next.add(key)
			return next
		})
		setSaved(false)
	}

	async function save() {
		if (!roleId || !branchID) return
		setSaving(true)
		setSaved(false)
		try {
			const sidebar = Array.from(selected)
			await saveSidebarAccess(branchID, roleId, sidebar)
			setRoles(prev => prev.map(r => r.id === roleId ? { ...r, sidebar } : r))
			setSaved(true)
		} finally {
			setSaving(false)
		}
	}

	return <>
		<Header
			title={
				<div>
					<h1 className="text-2xl font-bold text-base-content">{t("sidebarAccess.title")}</h1>
					<p className="text-base-content/60">{t("sidebarAccess.subtitle")}</p>
				</div>
			}
			containerClass="flex justify-between items-start"
		/>

		{loading ? (
			<div className="flex justify-center py-16"><span className="loading loading-spinner loading-lg text-primary"></span></div>
		) : (
			<div className="mt-6 max-w-3xl">
				<div className="flex flex-col sm:flex-row sm:items-end gap-3 mb-6">
					<label className="form-control w-full sm:max-w-xs">
						<span className="label-text mb-1">{t("sidebarAccess.roleLabel")}</span>
						<select className="select select-bordered" value={roleId ?? ""} onChange={e => pickRole(Number(e.target.value))}>
							{roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
						</select>
					</label>
					<button className="btn btn-primary sm:ms-auto" onClick={save} disabled={saving || !activeRole}>
						{saving ? <span className="loading loading-spinner loading-sm" /> : <FontAwesomeIcon icon={faFloppyDisk} className="w-4 h-4" />}
						{t("sidebarAccess.save")}
					</button>
				</div>

				{saved && <div className="alert alert-success mb-4 py-2">{t("sidebarAccess.saved")}</div>}

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
					{catalog.map(item => (
						<label key={item.key} className="flex items-center gap-3 rounded-xl border border-base-300 bg-base-100 px-4 py-3 cursor-pointer hover:border-primary/40 transition-colors">
							<input type="checkbox" className="checkbox checkbox-primary checkbox-sm" checked={selected.has(item.key)} onChange={() => toggle(item.key)} />
							<span className="font-medium">{t(NAV_LABEL[item.key] ?? item.key)}</span>
						</label>
					))}
				</div>
			</div>
		)}
	</>
}
