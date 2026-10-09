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

import { getMemberSessions, getBranchStaff, getBranchClasses, bookSession, verifyPaymentSession } from "./_memberSession"

const last = () => state.rec[state.rec.length - 1]
beforeEach(() => { state.rec.length = 0 })

describe("_memberSession wrappers", () => {
	it("getMemberSessions GETs the branch-scoped route", async () => {
		await getMemberSessions(7, "2024-01-01", "2024-01-31")
		expect(last()).toMatchObject({ method: "get", url: "/api/me/sessions?branch_id=7" })
	})

	it("getBranchStaff GETs the branch staff route", async () => {
		await getBranchStaff(7)
		expect(last()).toMatchObject({ method: "get", url: "/api/get-branch-staff/7" })
	})

	it("getBranchClasses GETs the branch classes route", async () => {
		await getBranchClasses(7)
		expect(last()).toMatchObject({ method: "get", url: "/api/get-branch-classes/7" })
	})

	it("bookSession POSTs to the collection without extra headers", async () => {
		await bookSession({})
		expect(last()).toMatchObject({ method: "post", url: "/api/me/sessions" })
		expect(last().headers["X-Form-Request"]).toBeUndefined()
	})

	it("verifyPaymentSession POSTs with the form header", async () => {
		await verifyPaymentSession({})
		expect(last()).toMatchObject({ method: "post", url: "/api/payments/payment-session/verify" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})
})
