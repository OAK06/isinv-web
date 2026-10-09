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

import { getBilling, billingCheckout, cancelSubscription, reactivateSubscription, updateBillingAddons, updateBillingBranchAddons, closeAccount } from "./_billing"

const last = () => state.rec[state.rec.length - 1]
beforeEach(() => { state.rec.length = 0 })

describe("_billing wrappers", () => {
	it("getBilling GETs the branch-scoped route silently (X-SWR-Request)", async () => {
		await getBilling(7)
		expect(last()).toMatchObject({ method: "get", url: "/api/billing?branch=7" })
		expect(last().headers["X-SWR-Request"]).toBe(true)
	})

	it("billingCheckout POSTs with the form header", async () => {
		await billingCheckout(7)
		expect(last()).toMatchObject({ method: "post", url: "/api/billing/checkout" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("cancelSubscription POSTs with the form header", async () => {
		await cancelSubscription(7)
		expect(last()).toMatchObject({ method: "post", url: "/api/billing/cancel" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("reactivateSubscription POSTs with the form header", async () => {
		await reactivateSubscription(7)
		expect(last()).toMatchObject({ method: "post", url: "/api/billing/reactivate" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("updateBillingAddons POSTs with the form header", async () => {
		await updateBillingAddons(7, ["pos"])
		expect(last()).toMatchObject({ method: "post", url: "/api/billing/addons" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("updateBillingBranchAddons POSTs with the form header", async () => {
		await updateBillingBranchAddons(7, 3, ["pos"])
		expect(last()).toMatchObject({ method: "post", url: "/api/billing/branch-addons" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("closeAccount POSTs with the form header", async () => {
		await closeAccount("secret", "DELETE")
		expect(last()).toMatchObject({ method: "post", url: "/api/billing/close-account" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})
})
