"use client"

import { ReactNode, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
	faMoneyBillTrendUp, faUserPlus, faUsers, faUserCheck, faDoorOpen, faCashRegister, faBuildingColumns,
} from "@fortawesome/free-solid-svg-icons"
import RenewalChart from "@/app/(app)/dashboard/_components/renewalChart"
import SalesChart from "@/app/(app)/dashboard/_components/salesChart"
import { DashboardService } from "@/app/(app)/dashboard/_dashboard"

type CardProps = { branchID: number }

/** Fetch a single widget once per branch. */
function useWidget<T>(fetcher: (id: number) => Promise<any>, branchID: number, pick: (res: any) => T) {
	const [val, setVal] = useState<T | undefined>(undefined)
	useEffect(() => {
		if (!branchID) return
		let cancelled = false
		fetcher(branchID).then(res => { if (!cancelled) setVal(pick(res)) }).catch(() => {})
		return () => { cancelled = true }
	}, [branchID])
	return val
}

const Spinner = () => (
	<div className="h-[300px] flex items-center justify-center"><span className="loading loading-spinner loading-md text-primary"></span></div>
)

/** Titled card shell. `bar` must be a literal Tailwind class so JIT keeps it. */
function Shell({ cardKey, bar = "bg-primary", titleClass = "", children }: { cardKey: string, bar?: string, titleClass?: string, children: ReactNode }) {
	const { t } = useTranslation("common")
	return (
		<div className="card bg-base-100 border border-base-200 shadow-sm h-full">
			<div className="card-body">
				<h2 className={`card-title text-xl mb-4 ${titleClass}`}>
					<div className={`w-1 h-6 ${bar} rounded me-2`}></div>
					{t(`dashboardCards.card.${cardKey}`)}
				</h2>
				{children}
			</div>
		</div>
	)
}

function StatCard({ cardKey, icon, value }: { cardKey: string, icon: any, value: ReactNode }) {
	const { t } = useTranslation("common")
	return (
		<div className="card group bg-base-100 border border-base-200 shadow-sm h-full transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
			<div className="card-body flex-row items-center gap-4 p-5">
				<div className="bg-primary/10 text-primary rounded-xl w-12 h-12 flex items-center justify-center shrink-0 transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-content">
					<FontAwesomeIcon icon={icon} className="text-xl" />
				</div>
				<div className="min-w-0">
					<div className="text-sm text-base-content/60 truncate">{t(`dashboardCards.card.${cardKey}`)}</div>
					<div className="text-2xl font-bold font-heading">{value ?? <span className="loading loading-spinner loading-xs"></span>}</div>
				</div>
			</div>
		</div>
	)
}

// ---- KPI / stat cards -----------------------------------------------------
const RevenuesCard = ({ branchID }: CardProps) => <StatCard cardKey="kpi_revenues" icon={faMoneyBillTrendUp} value={useWidget(DashboardService.getPlanRevenues, branchID, r => r.value)} />
const SubscriptionsCard = ({ branchID }: CardProps) => <StatCard cardKey="kpi_subscriptions" icon={faUserPlus} value={useWidget(DashboardService.getNewSubscriptions, branchID, r => r.value)} />
const TotalMembersCard = ({ branchID }: CardProps) => <StatCard cardKey="kpi_total_members" icon={faUsers} value={useWidget(DashboardService.getTotalMembers, branchID, r => r.value)} />
const ActiveMembersCard = ({ branchID }: CardProps) => <StatCard cardKey="kpi_active_members" icon={faUserCheck} value={useWidget(DashboardService.getActiveMembers, branchID, r => r.value)} />
const CheckinsTodayCard = ({ branchID }: CardProps) => <StatCard cardKey="checkins_today" icon={faDoorOpen} value={useWidget(DashboardService.getCheckinsToday, branchID, r => r.value)} />
const TodaysSalesCard = ({ branchID }: CardProps) => <StatCard cardKey="todays_sales" icon={faCashRegister} value={useWidget(DashboardService.getTodaysSales, branchID, r => r.value)} />
const CompanyRevenueCard = ({ branchID }: CardProps) => <StatCard cardKey="company_total_revenue" icon={faBuildingColumns} value={useWidget(DashboardService.getCompanyRevenue, branchID, r => r.value)} />

// ---- Charts ---------------------------------------------------------------
const RenewalCard = ({ branchID }: CardProps) => {
	const d = useWidget<any>(DashboardService.getRenewalsRate, branchID, r => r.data)
	return <Shell cardKey="renewal_chart">{d ? <RenewalChart data={d} /> : <Spinner />}</Shell>
}
const SalesCard = ({ branchID }: CardProps) => {
	const d = useWidget<any>(DashboardService.getPlanSales, branchID, r => r)
	return <Shell cardKey="sales_chart">{d ? <SalesChart data={d} /> : <Spinner />}</Shell>
}

// ---- Lists / custom -------------------------------------------------------
const LeadFunnelCard = ({ branchID }: CardProps) => {
	const { t } = useTranslation("common")
	const leadFunnel = useWidget<any[]>(DashboardService.getLeadFunnel, branchID, r => r.data)
	return (
		<Shell cardKey="lead_funnel">
			{leadFunnel ? (
				leadFunnel.length ? (
					<div className="flex flex-col gap-4">
						{(() => {
							const max = Math.max(...leadFunnel.map((l: any) => Number(l.count) || 0), 1)
							return leadFunnel.map((lead: any, i: number) => (
								<div key={i}>
									<div className="mb-1 flex items-center justify-between text-sm">
										<span>{t(`ownerDashboard.leadFunnel.${lead.label}`)}</span>
										<span className="font-semibold">{lead.count}</span>
									</div>
									<div className="h-2.5 overflow-hidden rounded-full bg-base-200">
										<div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${((Number(lead.count) || 0) / max) * 100}%`, opacity: Math.max(0.4, 1 - i * 0.15) }}></div>
									</div>
								</div>
							))
						})()}
					</div>
				) : <p className="text-sm text-base-content/50">{t("ownerDashboard.leadFunnel.noData")}</p>
			) : <span className="loading loading-spinner loading-xs text-primary"></span>}
		</Shell>
	)
}

const InventoryAlertsCard = ({ branchID }: CardProps) => {
	const { t } = useTranslation("common")
	const inventoryAlerts = useWidget<any[]>(DashboardService.getInventoryAlerts, branchID, r => r.data)
	return (
		<Shell cardKey="inventory_alerts" bar="bg-error" titleClass="text-error">
			{inventoryAlerts?.length ? (
				<ul className="list-disc ps-5">
					{inventoryAlerts.map((item: any, i: number) => (
						<li key={i} className="text-sm">{item.name}: <strong>{item.stock_level}</strong> {t("ownerDashboard.inventoryAlerts.remaining")}</li>
					))}
				</ul>
			) : <p className="text-sm text-base-content/50">{t("ownerDashboard.inventoryAlerts.noData")}</p>}
		</Shell>
	)
}

const PeakHoursCard = ({ branchID }: CardProps) => {
	const { t } = useTranslation("common")
	const peakHours = useWidget<any[]>(DashboardService.getPeakHours, branchID, r => r.data)
	return (
		<Shell cardKey="peak_hours">
			{peakHours ? (() => {
				const countOf = (row: any) => Number(row.count ?? row.entries ?? row.total ?? 0)
				const rows = [...peakHours].sort((a: any, b: any) => a.hour - b.hour)
				const max = Math.max(...rows.map(countOf), 0)
				const peakHour = peakHours[0]?.hour
				if (!rows.length) return <p className="text-sm text-base-content/50">{t("ownerDashboard.peakHours.noData")}</p>
				return <>
					<p className="text-sm text-base-content/60">{t("ownerDashboard.peakHours.subtitle")}: {peakHour != null ? `${peakHour}:00` : "-"}</p>
					{max > 0 && (
						<div className="mt-4 flex h-40 items-end gap-1" dir="ltr">
							{rows.map((row: any) => (
								<div key={row.hour} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1">
									<div className="tooltip flex w-full flex-1 items-end justify-center" data-tip={`${row.hour}:00 — ${countOf(row)}`}>
										<div className={`w-full max-w-6 rounded-t ${row.hour === peakHour ? "bg-primary" : "bg-primary/30"} transition-colors hover:bg-primary/70`} style={{ height: `${Math.max(6, (countOf(row) / max) * 100)}%` }}></div>
									</div>
									<span className="text-[10px] leading-none text-base-content/50">{row.hour}</span>
								</div>
							))}
						</div>
					)}
				</>
			})() : <span className="loading loading-spinner loading-xs text-primary"></span>}
		</Shell>
	)
}

const RecentEntriesCard = ({ branchID }: CardProps) => {
	const entries = useWidget<any[]>(DashboardService.getRecentEntries, branchID, r => r.data)
	return (
		<Shell cardKey="recent_entries" bar="bg-secondary">
			<div className="space-y-3">
				{entries?.map((entry: any, i: number) => (
					<div key={i} className="flex justify-between text-sm border-b border-base-200 pb-2">
						<span>{entry.fname} {entry.sname}</span>
						<span className="text-base-content/50">{new Date(entry.created_at).toLocaleTimeString()}</span>
					</div>
				)) || <span className="loading loading-spinner loading-xs text-secondary"></span>}
			</div>
		</Shell>
	)
}

const MyClassesCard = ({ branchID }: CardProps) => {
	const { t } = useTranslation("common")
	const classes = useWidget<any[]>(DashboardService.getMyClasses, branchID, r => r.data)
	return (
		<Shell cardKey="my_classes_today">
			{classes ? (
				classes.length ? (
					<div className="space-y-3">
						{classes.map((c: any, i: number) => (
							<div key={i} className="flex justify-between text-sm border-b border-base-200 pb-2">
								<span className="font-medium">{c.name}</span>
								<span className="text-base-content/50" dir="ltr">{new Date(c.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
							</div>
						))}
					</div>
				) : <p className="text-sm text-base-content/50">{t("dashboardCards.noClasses")}</p>
			) : <span className="loading loading-spinner loading-xs text-primary"></span>}
		</Shell>
	)
}

const NewApplicationsCard = ({ branchID }: CardProps) => {
	const { t } = useTranslation("common")
	const apps = useWidget<any[]>(DashboardService.getNewApplications, branchID, r => r.data)
	return (
		<Shell cardKey="new_applications">
			{apps ? (
				apps.length ? (
					<div className="space-y-3">
						{apps.map((a: any, i: number) => (
							<div key={i} className="flex justify-between text-sm border-b border-base-200 pb-2">
								<span>{a.fname} {a.sname}</span>
								<span className="text-base-content/50">{new Date(a.created_at).toLocaleDateString()}</span>
							</div>
						))}
					</div>
				) : <p className="text-sm text-base-content/50">{t("dashboardCards.noApplications")}</p>
			) : <span className="loading loading-spinner loading-xs text-primary"></span>}
		</Shell>
	)
}

const BranchRevenueBreakdownCard = ({ branchID }: CardProps) => {
	const { t } = useTranslation("common")
	const rows = useWidget<any[]>(DashboardService.getBranchRevenueBreakdown, branchID, r => r.data)
	return (
		<Shell cardKey="branch_revenue_breakdown">
			{rows ? (
				rows.length ? (
					<div className="space-y-3">
						{rows.map((row: any) => (
							<div key={row.branch_id} className="flex justify-between text-sm border-b border-base-200 pb-2">
								<span className="font-medium truncate">{row.branch_name}</span>
								<span className="font-semibold" dir="ltr">{row.total}</span>
							</div>
						))}
					</div>
				) : <p className="text-sm text-base-content/50">{t("dashboardCards.noData")}</p>
			) : <span className="loading loading-spinner loading-xs text-primary"></span>}
		</Shell>
	)
}

export const SMALL_CARD_REGISTRY: Record<string, { Component: (p: CardProps) => JSX.Element }> = {
	kpi_revenues: { Component: RevenuesCard },
	kpi_subscriptions: { Component: SubscriptionsCard },
	kpi_total_members: { Component: TotalMembersCard },
	kpi_active_members: { Component: ActiveMembersCard },
	checkins_today: { Component: CheckinsTodayCard },
	todays_sales: { Component: TodaysSalesCard },
	company_total_revenue: { Component: CompanyRevenueCard },
}

/** key → component + whether it spans 2 columns. Object order = render order. */
export const WIDE_CARD_REGISTRY: Record<string, { Component: (p: CardProps) => JSX.Element }> = {
	renewal_chart: { Component: RenewalCard },
	sales_chart: { Component: SalesCard },
	lead_funnel: { Component: LeadFunnelCard },
	inventory_alerts: { Component: InventoryAlertsCard },
	peak_hours: { Component: PeakHoursCard },
	recent_entries: { Component: RecentEntriesCard },
	my_classes_today: { Component: MyClassesCard },
	new_applications: { Component: NewApplicationsCard },
	branch_revenue_breakdown: { Component: BranchRevenueBreakdownCard },
}
