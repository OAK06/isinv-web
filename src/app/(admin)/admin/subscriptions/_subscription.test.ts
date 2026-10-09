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

import { getSubscriptions, getSubscription, addSubscription, editSubscription, markSubscriptionPaid, getAllSystemPlans, getAllSystemAddons } from "./_subscription"

const last = () => state.rec[state.rec.length - 1]
beforeEach(() => { state.rec.length = 0 })

describe("_subscription wrappers", () => {
	it("getSubscriptions builds a paginated URL; omits sort when null", async () => {
		await getSubscriptions(2, null as any, null as any)
		expect(last()).toMatchObject({ method: "get", url: "/api/subscriptions?page=2" })
	})

	it("getSubscriptions appends sort + direction when provided", async () => {
		await getSubscriptions(1, "status", "asc")
		expect(last().url).toBe("/api/subscriptions?page=1&sort=status&sort_direction=asc")
	})

	it("getSubscription hits the show route", async () => {
		await getSubscription(9)
		expect(last()).toMatchObject({ method: "get", url: "/api/subscriptions/9" })
	})

	it("addSubscription POSTs to the collection with the form header", async () => {
		await addSubscription({})
		expect(last()).toMatchObject({ method: "post", url: "/api/subscriptions" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("editSubscription POSTs with the ?_method=PUT override and the form header", async () => {
		await editSubscription(9, {})
		expect(last()).toMatchObject({ method: "post", url: "/api/subscriptions/9?_method=PUT" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("markSubscriptionPaid POSTs the mark-paid action with the form header", async () => {
		await markSubscriptionPaid(9)
		expect(last()).toMatchObject({ method: "post", url: "/api/subscriptions/9/mark-paid" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("getAllSystemPlans GETs with the silent SWR header", async () => {
		await getAllSystemPlans()
		expect(last()).toMatchObject({ method: "get", url: "/api/getSystemPlans" })
		expect(last().headers["X-SWR-Request"]).toBe(true)
	})

	it("getAllSystemAddons GETs with the silent SWR header", async () => {
		await getAllSystemAddons()
		expect(last()).toMatchObject({ method: "get", url: "/api/getSystemAddons" })
		expect(last().headers["X-SWR-Request"]).toBe(true)
	})
})
