"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAtom } from "jotai"
import { useTranslation } from "next-i18next"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faQrcode, faPlus, faCalendarCheck, faFileInvoiceDollar, faCreditCard, faDumbbell, faLocationDot, faChevronRight, faCircleExclamation } from "@fortawesome/free-solid-svg-icons"
import { activeMembership } from "@/_state/globalStore"
import { getMemberships } from "@/app/(member)/member/_membership"
import { getMyPaymentMethods } from "@/app/(member)/member/payment-methods/_paymentMethod"
import Loading from "@/app/(app)/_components/loading"

/**
 * Member portal home — a dashboard for the ACTIVE gym (chosen via the layout's gym
 * switcher / `activeMembership`). Summarises each portal tab (membership, bookings,
 * bills, payment methods) with a jump-off link, plus the entry QR. When the member
 * belongs to no gym yet, it prompts them to subscribe.
 */
export default function MemberHome() {
	const { t, i18n } = useTranslation('common')
	const [active] = useAtom(activeMembership)
	const [memberships, setMemberships] = useState<any[] | null>(null)
	const [cards, setCards] = useState<{ list: any[], enabled: boolean } | null>(null)
	const [qrOpen, setQrOpen] = useState(false)

	useEffect(() => {
		getMemberships().then(setMemberships).catch(() => setMemberships([]))
	}, [])

	// The active gym (switcher-selected), falling back to the first one.
	const gym = memberships?.find((m) => m.branch_id === active) ?? memberships?.[0] ?? null

	// Default card lives per-gym (each gym has its own Stripe), so fetch on gym change.
	useEffect(() => {
		if (!gym) { setCards(null); return }
		getMyPaymentMethods(gym.branch_id)
			.then((r) => setCards({ list: r.cards ?? [], enabled: r.paymentsEnabled }))
			.catch(() => setCards(null))
	}, [gym?.branch_id])

	if (memberships === null) return <Loading />

	const fmtDate = (d?: string | null) => d ? new Date(d).toLocaleDateString(i18n.language, { day: 'numeric', month: 'short', year: 'numeric' }) : ''
	const fmtDateTime = (d?: string | null) => d ? new Date(d).toLocaleString(i18n.language, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''

	// No gyms yet → prompt to subscribe.
	if (!gym) return <div className="space-y-6">
		<div>
			<h1 className="text-2xl font-bold">{t('memberPortal.overviewTitle')}</h1>
			<p className="text-base-content/60">{t('memberPortal.overviewSubtitle')}</p>
		</div>
		<div className="text-center py-16">
			<p className="text-base-content/60 mb-4">{t('memberPortal.noMemberships')}</p>
			<Link href="/member/memberships" className="btn btn-primary rounded-full">{t('memberPortal.overview.subscribeCta')}</Link>
		</div>
	</div>

	const defaultCard = cards?.list?.find((c) => c.is_default === "true" || c.is_default === true) ?? cards?.list?.[0]

	return <div className="space-y-6">
		{/* Header: the active gym + primary actions. */}
		<div className="flex flex-wrap items-start justify-between gap-3">
			<div>
				<h1 className="text-2xl font-bold">{gym.company_name}</h1>
				<p className="text-base-content/60 flex items-center gap-2 flex-wrap mt-0.5">
					{gym.branch_name && <span className="flex items-center gap-1"><FontAwesomeIcon icon={faLocationDot} className="w-3 h-3" /> {gym.branch_name}</span>}
					<span className="badge badge-ghost badge-sm">{gym.status}</span>
				</p>
			</div>
			<div className="flex flex-wrap gap-2">
				{gym.qr_code && (
					<button className="btn btn-outline rounded-full gap-2" onClick={() => setQrOpen(true)}>
						<FontAwesomeIcon icon={faQrcode} /> {t('memberPortal.entryQr.button')}
					</button>
				)}
				<Link href="/member/memberships" className="btn btn-primary rounded-full gap-2">
					<FontAwesomeIcon icon={faPlus} className="w-3 h-3" /> {t('memberPortal.overview.subscribeCta')}
				</Link>
			</div>
		</div>

		{/* One summary card per portal tab. */}
		<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
			<SectionCard href="/member/memberships" icon={faDumbbell} title={t('memberPortal.nav.memberships')} cta={t('memberPortal.overview.manage')}>
				{gym.active_plan ? <>
					<p className="font-semibold">{gym.active_plan.name}</p>
					<div className="text-sm text-base-content/60 flex flex-wrap gap-x-3 gap-y-0.5">
						{gym.active_plan.ends_at && <span>{t('memberPortal.overview.expires', { date: fmtDate(gym.active_plan.ends_at) })}</span>}
						{gym.active_plan.remaining_entries != null && <span>{t('memberPortal.overview.entriesLeft', { n: gym.active_plan.remaining_entries })}</span>}
					</div>
					<p className="text-xs text-base-content/50 mt-1">{t('memberPortal.activePlans', { n: gym.active_plans })}</p>
				</> : <div className="flex items-center justify-between gap-2">
					<span className="text-base-content/60 flex items-center gap-1"><FontAwesomeIcon icon={faCircleExclamation} className="w-3 h-3" /> {t('memberPortal.overview.noActivePlan')}</span>
					<Link href="/member/memberships" className="btn btn-xs btn-primary rounded-full">{t('memberPortal.overview.subscribeCta')}</Link>
				</div>}
			</SectionCard>

			<SectionCard href="/member/bookings" icon={faCalendarCheck} title={t('memberPortal.nav.bookings')} cta={t('memberPortal.overview.viewAll')}>
				{gym.next_booking ? <>
					<p className="text-xs text-base-content/50">{t('memberPortal.overview.nextClass')}</p>
					<p className="font-semibold">{gym.next_booking.class}</p>
					<p className="text-sm text-base-content/60">{fmtDateTime(gym.next_booking.start)}</p>
				</> : <p className="text-base-content/60">{t('memberPortal.overview.noUpcoming')}</p>}
			</SectionCard>

			<SectionCard href="/member/bills" icon={faFileInvoiceDollar} title={t('memberPortal.nav.bills')} cta={t('memberPortal.overview.viewAll')}>
				{gym.outstanding_count > 0 ? <div className="flex items-center gap-2 flex-wrap">
					<span className="badge badge-warning">{t('memberPortal.overview.unpaid', { n: gym.outstanding_count })}</span>
					<Link href="/member/bills" className="text-sm link link-primary">{t('memberPortal.overview.payNow')}</Link>
				</div> : <p className="text-base-content/60">{t('memberPortal.overview.allPaid')}</p>}
			</SectionCard>

			{cards?.enabled !== false && (
				<SectionCard href="/member/payment-methods" icon={faCreditCard} title={t('memberPortal.nav.paymentMethods')} cta={t('memberPortal.overview.manage')}>
					{defaultCard
						? <p className="font-semibold uppercase">{defaultCard.card_brand} •••• {defaultCard.last_four}</p>
						: <p className="text-base-content/60">{t('memberPortal.overview.noCard')}</p>}
				</SectionCard>
			)}
		</div>

		{/* Entry-QR modal: big, scannable at the front desk. The member-target QR is
		    stable (never rotates), so the stored base64 image is always valid. */}
		{qrOpen && gym.qr_code && (
			<div className="modal modal-open modal-middle" onClick={() => setQrOpen(false)}>
				<div className="modal-box text-center" onClick={(e) => e.stopPropagation()}>
					<h3 className="text-lg font-bold">{t('memberPortal.entryQr.title')}</h3>
					<p className="text-sm text-base-content/60 mb-4">{t('memberPortal.entryQr.subtitle')}</p>
					<div className="flex justify-center">
						<img src={`data:image/png;base64,${gym.qr_code}`} alt={t('memberPortal.entryQr.title')} className="w-64 h-64 rounded-lg border border-base-200 bg-white p-2" />
					</div>
					<p className="mt-4 font-semibold">{gym.company_name}</p>
					<p className="text-sm text-base-content/60">{gym.fullname}</p>
					<div className="modal-action justify-center">
						<button className="btn btn-primary rounded-full" onClick={() => setQrOpen(false)}>{t('close')}</button>
					</div>
				</div>
			</div>
		)}
	</div>
}

/** Summary card with an icon header and a jump-off link to the full tab. */
function SectionCard({ href, icon, title, cta, children }: any) {
	return (
		<div className="card bg-base-100 border border-base-200 shadow-sm">
			<div className="card-body gap-2">
				<div className="flex items-center justify-between gap-2">
					<h2 className="font-bold flex items-center gap-2">
						<span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
							<FontAwesomeIcon icon={icon} className="w-4 h-4" />
						</span>
						{title}
					</h2>
					<Link href={href} className="text-xs link link-primary flex items-center gap-1 whitespace-nowrap">
						{cta} <FontAwesomeIcon icon={faChevronRight} className="w-2.5 h-2.5 rtl:rotate-180" />
					</Link>
				</div>
				<div className="min-h-[3rem]">{children}</div>
			</div>
		</div>
	)
}
