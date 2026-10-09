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

import { getMemberPlans, getMemberPlan, getBranchPlans, subscribePlan, createPaymentSession, verifyPaymentSession } from "./_memberPlan"

const last = () => state.rec[state.rec.length - 1]
beforeEach(() => { state.rec.length = 0 })

describe("_memberPlan wrappers", () => {
	it("getMemberPlans builds a paginated, branch-scoped URL; omits sort when null", async () => {
		await getMemberPlans(2, 7, null as any, null as any)
		expect(last()).toMatchObject({ method: "get", url: "/api/me/plans?page=2&branch_id=7" })
	})

	it("getMemberPlans appends sort + direction when provided", async () => {
		await getMemberPlans(1, 3, "status", "asc")
		expect(last().url).toBe("/api/me/plans?page=1&branch_id=3&sort=status&sort_direction=asc")
	})

	it("getMemberPlan hits the show route", async () => {
		await getMemberPlan(9)
		expect(last()).toMatchObject({ method: "get", url: "/api/me/plans/9" })
	})

	it("getBranchPlans GETs the branch-scoped plans route", async () => {
		await getBranchPlans(7)
		expect(last()).toMatchObject({ method: "get", url: "/api/branch-plans/7" })
	})

	it("subscribePlan POSTs to the collection without extra headers", async () => {
		await subscribePlan({})
		expect(last()).toMatchObject({ method: "post", url: "/api/me/plans" })
		expect(last().headers["X-Form-Request"]).toBeUndefined()
	})

	it("createPaymentSession POSTs with the form header", async () => {
		await createPaymentSession({})
		expect(last()).toMatchObject({ method: "post", url: "/api/payments/payment-session" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("verifyPaymentSession POSTs with the form header", async () => {
		await verifyPaymentSession({})
		expect(last()).toMatchObject({ method: "post", url: "/api/payments/payment-session/verify" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})
})
