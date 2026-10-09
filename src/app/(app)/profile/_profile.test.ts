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

import { editProfile, getPaymentMethods, managePaymentMethods, updateThemePreference, updateLocalePreference } from "./_profile"

const last = () => state.rec[state.rec.length - 1]
beforeEach(() => { state.rec.length = 0 })

describe("_profile wrappers", () => {
	it("editProfile POSTs to the profiles route with the form header", async () => {
		await editProfile({})
		expect(last()).toMatchObject({ method: "post", url: "/api/profiles" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("getPaymentMethods builds a branch+member scoped URL", async () => {
		await getPaymentMethods(4, 9)
		expect(last()).toMatchObject({ method: "get", url: "/api/payments/member-payment-methods?branch_id=4&member_id=9" })
	})

	it("managePaymentMethods POSTs with the form header", async () => {
		await managePaymentMethods({})
		expect(last()).toMatchObject({ method: "post", url: "/api/payments/payment-method/save" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("updateThemePreference POSTs silently via X-SWR-Request", async () => {
		await updateThemePreference("dark")
		expect(last()).toMatchObject({ method: "post", url: "/api/user/theme" })
		expect(last().headers["X-SWR-Request"]).toBe(true)
	})

	it("updateLocalePreference POSTs silently via X-SWR-Request", async () => {
		await updateLocalePreference("en")
		expect(last()).toMatchObject({ method: "post", url: "/api/user/locale" })
		expect(last().headers["X-SWR-Request"]).toBe(true)
	})
})
