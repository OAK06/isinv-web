import { describe, it, expect, vi, beforeEach } from "vitest"

const state = vi.hoisted(() => ({ rec: [] as { method: string; url: string; headers: any }[] }))
vi.mock("@/lib/axios", () => {
	const cap = (method: string) => (url: string, ...rest: any[]) => {
		const cfg = rest.find(x => x && typeof x === "object" && "headers" in x)
		state.rec.push({ method, url, headers: cfg?.headers ?? {} })
		return Promise.resolve({ data: {} })
	}
	return { default: { get: cap("get"), post: cap("post"), put: cap("put"), delete: cap("delete"), patch: cap("patch") } }
})

import { DashboardService, getMyDashboardCards, getBranch } from "./_dashboard"

const last = () => state.rec[state.rec.length - 1]
beforeEach(() => { state.rec.length = 0 })

describe("_dashboard wrappers", () => {
	const widgets: [keyof typeof DashboardService, string][] = [
		["getPlanRevenues", "plan-revenues"],
		["getNewSubscriptions", "new-subscriptions"],
		["getTotalMembers", "total-members"],
		["getActiveMembers", "active-members"],
		["getRenewalsRate", "renewals-rate"],
		["getPlanSales", "plan-sales"],
		["getPeakHours", "peak-hours"],
		["getInventoryAlerts", "inventory-alerts"],
		["getLeadFunnel", "lead-funnel"],
		["getRecentEntries", "recent-entries"],
		["getMyClasses", "my-classes"],
		["getCheckinsToday", "checkins-today"],
		["getNewApplications", "new-applications"],
		["getTodaysSales", "todays-sales"],
		["getCompanyRevenue", "company-revenue"],
		["getBranchRevenueBreakdown", "branch-revenue-breakdown"],
	]

	it("every DashboardService widget GETs its own /api/dashboard/<path>?branch_id=<id> URL", async () => {
		for (const [key, path] of widgets) {
			await DashboardService[key](7)
			expect(last()).toMatchObject({ method: "get", url: `/api/dashboard/${path}?branch_id=7` })
		}
	})

	it("getMyDashboardCards GETs the my-cards route silently (X-SWR-Request)", async () => {
		await getMyDashboardCards(7)
		expect(last()).toMatchObject({ method: "get", url: "/api/dashboard/my-cards?branch_id=7" })
		expect(last().headers["X-SWR-Request"]).toBe(true)
	})

	it("getBranch hits the branches show route", async () => {
		await getBranch(9)
		expect(last()).toMatchObject({ method: "get", url: "/api/branches/9" })
	})
})
