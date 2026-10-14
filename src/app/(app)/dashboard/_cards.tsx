"use client"

import { ReactNode, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
	faMoneyBillTrendUp, faCashRegister, faFileInvoiceDollar, faCalendarDay,
} from "@fortawesome/free-solid-svg-icons"
import { DashboardService } from "@/app/(app)/dashboard/_dashboard"
import { formatCurrency } from "@/_helpers/currency"

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
const TodaysSalesCard = ({ branchID }: CardProps) => <StatCard cardKey="todays_sales" icon={faCashRegister} value={useWidget(DashboardService.getTodaysSales, branchID, r => r.value)} />
const PoCostsMonthCard = ({ branchID }: CardProps) => <StatCard cardKey="po_costs_month" icon={faFileInvoiceDollar} value={useWidget(DashboardService.getPoCostsMonth, branchID, r => r.value)} />
const PoCostsTodayCard = ({ branchID }: CardProps) => <StatCard cardKey="po_costs_today" icon={faCalendarDay} value={useWidget(DashboardService.getPoCostsToday, branchID, r => r.value)} />

// ---- Lists / custom -------------------------------------------------------
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

const CategoryCostSalesCard = ({ branchID }: CardProps) => {
	const { t } = useTranslation("common")
	const rows = useWidget<any[]>(DashboardService.getCategoryCostSales, branchID, r => r.data)
	return (
		<Shell cardKey="category_cost_sales">
			{rows ? (
				rows.length ? (
					<>
						{/* Per-category totals (name + cost + sales, like the listing page) */}
						<div className="space-y-2">
							{rows.map((row: any, i: number) => (
								<div key={i} className="flex flex-wrap justify-between gap-x-4 text-sm border-b border-base-200 pb-2">
									<span className="font-medium truncate">{row.name}</span>
									<span className="flex gap-4 shrink-0" dir="ltr">
										<span className="text-base-content/60">{t("categories.totalCost")}: <strong className="text-base-content">{formatCurrency(row.total_cost)}</strong></span>
										<span className="text-base-content/60">{t("categories.totalSell")}: <strong className="text-primary">{formatCurrency(row.total_sell)}</strong></span>
									</span>
								</div>
							))}
						</div>

						{/* Grouped bar chart: cost vs sales per category (shared scale) */}
						<div className="mt-6 flex items-center gap-4 text-xs text-base-content/60">
							<span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-base-300"></span>{t("categories.totalCost")}</span>
							<span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-primary"></span>{t("categories.totalSell")}</span>
						</div>
						<div className="mt-3 flex items-end gap-3 overflow-x-auto pb-2" dir="ltr">
							{(() => {
								const max = Math.max(...rows.flatMap((r: any) => [Number(r.total_cost) || 0, Number(r.total_sell) || 0]), 1)
								return rows.map((row: any, i: number) => (
									<div key={i} className="flex min-w-14 flex-1 flex-col items-center gap-1">
										<div className="flex h-40 w-full items-end justify-center gap-1">
											<div className="tooltip flex h-full items-end" data-tip={`${t("categories.totalCost")}: ${formatCurrency(row.total_cost)}`}>
												<div className="w-3 min-h-[2px] rounded-t bg-base-300 transition-all duration-500" style={{ height: `${((Number(row.total_cost) || 0) / max) * 100}%` }}></div>
											</div>
											<div className="tooltip flex h-full items-end" data-tip={`${t("categories.totalSell")}: ${formatCurrency(row.total_sell)}`}>
												<div className="w-3 min-h-[2px] rounded-t bg-primary transition-all duration-500" style={{ height: `${((Number(row.total_sell) || 0) / max) * 100}%` }}></div>
											</div>
										</div>
										<span className="w-full truncate text-center text-xs text-base-content/60" title={row.name}>{row.name}</span>
									</div>
								))
							})()}
						</div>
					</>
				) : <p className="text-sm text-base-content/50">{t("dashboardCards.noData")}</p>
			) : <span className="loading loading-spinner loading-xs text-primary"></span>}
		</Shell>
	)
}

export const SMALL_CARD_REGISTRY: Record<string, { Component: (p: CardProps) => JSX.Element }> = {
	kpi_revenues: { Component: RevenuesCard },
	po_costs_month: { Component: PoCostsMonthCard },
	po_costs_today: { Component: PoCostsTodayCard },
	todays_sales: { Component: TodaysSalesCard },
}

/** key → component (wide = spans 2 columns). Object order = render order. */
export const WIDE_CARD_REGISTRY: Record<string, { Component: (p: CardProps) => JSX.Element }> = {
	category_cost_sales: { Component: CategoryCostSalesCard },
	inventory_alerts: { Component: InventoryAlertsCard },
}
