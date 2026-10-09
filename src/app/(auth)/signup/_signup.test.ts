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

import {
	getHashedBranch,
	getOnlineBranchPlans,
	addApplication,
	getHashedApplication,
	bookingByLogin,
	bookingByRegister,
	getBranchStaff,
	getBranchClasses,
	managePaymentMethods,
	verifyPaymentSession,
} from "./_signup"

const last = () => state.rec[state.rec.length - 1]
beforeEach(() => { state.rec.length = 0 })

describe("_signup wrappers", () => {
	it("getHashedBranch hits the hashed-branch route", async () => {
		await getHashedBranch("hash1")
		expect(last()).toMatchObject({ method: "get", url: "/api/get-hashed-branch/hash1" })
	})

	it("getOnlineBranchPlans hits the public branch-plans route", async () => {
		await getOnlineBranchPlans(5)
		expect(last()).toMatchObject({ method: "get", url: "/api/public/branch-plans/5" })
	})

	it("addApplication POSTs to the collection with the form header", async () => {
		await addApplication({})
		expect(last()).toMatchObject({ method: "post", url: "/api/applications" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("getHashedApplication hits the hashed-application route", async () => {
		await getHashedApplication(9)
		expect(last()).toMatchObject({ method: "get", url: "/api/get-hashed-application/9" })
	})

	it("bookingByLogin POSTs with the form header", async () => {
		await bookingByLogin({})
		expect(last()).toMatchObject({ method: "post", url: "/api/booking-with-credentials" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("bookingByRegister POSTs with the form header", async () => {
		await bookingByRegister({})
		expect(last()).toMatchObject({ method: "post", url: "/api/booking-without-credentials" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("getBranchStaff hits the branch-staff route", async () => {
		await getBranchStaff(5)
		expect(last()).toMatchObject({ method: "get", url: "/api/get-branch-staff/5" })
	})

	it("getBranchClasses hits the branch-classes route", async () => {
		await getBranchClasses(5)
		expect(last()).toMatchObject({ method: "get", url: "/api/get-branch-classes/5" })
	})

	it("managePaymentMethods POSTs with the form header", async () => {
		await managePaymentMethods({})
		expect(last()).toMatchObject({ method: "post", url: "/api/payments/payment-method/save" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("verifyPaymentSession POSTs with the form header", async () => {
		await verifyPaymentSession({})
		expect(last()).toMatchObject({ method: "post", url: "/api/payments/payment-session/verify" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})
})
