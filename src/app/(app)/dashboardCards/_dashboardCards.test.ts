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

import { getDashboardCards, saveDashboardCards } from "./_dashboardCards"

const last = () => state.rec[state.rec.length - 1]
beforeEach(() => { state.rec.length = 0 })

describe("_dashboardCards wrappers", () => {
	it("getDashboardCards GETs the branch-scoped route", async () => {
		await getDashboardCards(7)
		expect(last()).toMatchObject({ method: "get", url: "/api/dashboard-cards?branch=7" })
	})

	it("saveDashboardCards PUTs with the form header", async () => {
		await saveDashboardCards(7, 2, ["kpi"])
		expect(last()).toMatchObject({ method: "put", url: "/api/dashboard-cards" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})
})
