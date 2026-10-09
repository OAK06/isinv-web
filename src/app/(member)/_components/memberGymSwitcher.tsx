"use client"

import { useEffect, useState } from "react"
import { useAtom } from "jotai"
import Link from "next/link"
import { useTranslation } from "next-i18next"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faLocationDot, faChevronDown, faCheck, faPlus } from "@fortawesome/free-solid-svg-icons"
import { activeMembership } from "@/_state/globalStore"
import { getMemberships, Membership } from "@/app/(member)/member/_membership"

/**
 * Global gym context for the member portal, living inline in the navbar (mirrors the
 * staff BranchSwitcher). A member can belong to several gyms; this sets the
 * `activeMembership` branch every portal page scopes to. Always shown — even with one
 * gym — so the member can see their current gym and reach "Join another gym" from
 * anywhere, instead of a picker nested inside individual pages.
 */
export default function MemberGymSwitcher() {
	const { t, i18n } = useTranslation('common')
	const isRtl = i18n.dir() === 'rtl'
	const [memberships, setMemberships] = useState<Membership[] | null>(null)
	const [active, setActive] = useAtom(activeMembership)

	useEffect(() => {
		getMemberships().then(setMemberships).catch(() => setMemberships([]))
	}, [])

	// Auto-select the first gym (or when the stored one is no longer valid).
	useEffect(() => {
		if (!memberships?.length) return
		const ids = memberships.map((m) => m.branch_id)
		if (active === -1 || !ids.includes(active)) setActive(memberships[0].branch_id)
	}, [memberships])

	// Wait for the fetch so the button doesn't flash the wrong label.
	if (memberships === null) return null

	const current = memberships.find((m) => m.branch_id === active)
	const currentLabel = current
		? `${current.company_name}${current.branch_name ? ` — ${current.branch_name}` : ''}`
		: t('memberPortal.memberships.joinAnother')

	const switchTo = (branchId: number) => {
		(document.activeElement as HTMLElement)?.blur()
		if (branchId !== active) setActive(branchId)
	}

	return (
		<div className={`dropdown ${isRtl ? 'dropdown-start' : 'dropdown-end'}`}>
			<label tabIndex={0} className="btn btn-sm btn-ghost gap-2 normal-case max-w-[12rem] flex-nowrap">
				<FontAwesomeIcon icon={faLocationDot} className="shrink-0" />
				<span className="truncate min-w-0">{currentLabel}</span>
				<FontAwesomeIcon icon={faChevronDown} className="text-xs opacity-60 shrink-0" />
			</label>
			<ul tabIndex={0} className="menu dropdown-content absolute end-0 z-[1] p-2 shadow bg-base-100 rounded-box w-60 mt-1 border border-base-200 max-h-80 overflow-y-auto">
				<li className="menu-title px-4 pt-1">{t('memberPortal.gymSwitcher.label')}</li>
				{memberships.map((m) => (
					<li key={m.member_id}>
						<button onClick={() => switchTo(m.branch_id)} className={m.branch_id === active ? 'active' : ''}>
							<span className="truncate">{m.company_name}{m.branch_name ? ` — ${m.branch_name}` : ''}</span>
							{m.branch_id === active && <FontAwesomeIcon icon={faCheck} className="ms-auto" />}
						</button>
					</li>
				))}
				<div className="divider my-1"></div>
				<li>
					<Link href="/member/memberships?join=1" onClick={() => (document.activeElement as HTMLElement)?.blur()}>
						<FontAwesomeIcon icon={faPlus} className="w-3 h-3" /> {t('memberPortal.memberships.joinAnother')}
					</Link>
				</li>
			</ul>
		</div>
	)
}
