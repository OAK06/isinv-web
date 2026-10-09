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

import { addMyPaymentMethod, getMyPaymentMethods, deleteMyPaymentMethod, setDefaultCard } from "./_paymentMethod"

const last = () => state.rec[state.rec.length - 1]
beforeEach(() => { state.rec.length = 0 })

describe("_paymentMethod wrappers", () => {
	it("addMyPaymentMethod POSTs with the form header", async () => {
		await addMyPaymentMethod(5, "https://gymflyte.com/return")
		expect(last()).toMatchObject({ method: "post", url: "/api/me/payment-methods" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("getMyPaymentMethods hits the branch-scoped route with the SWR header", async () => {
		await getMyPaymentMethods(5).catch(() => {})
		expect(last()).toMatchObject({ method: "get", url: "/api/me/payment-methods?branch_id=5" })
		expect(last().headers["X-SWR-Request"]).toBe(true)
	})

	it("deleteMyPaymentMethod DELETEs by id with the form header", async () => {
		await deleteMyPaymentMethod(9)
		expect(last()).toMatchObject({ method: "delete", url: "/api/me/payment-methods/9" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("setDefaultCard POSTs the default route with the form header", async () => {
		await setDefaultCard(9)
		expect(last()).toMatchObject({ method: "post", url: "/api/me/payment-methods/9/default" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})
})
