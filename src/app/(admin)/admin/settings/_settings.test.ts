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

import { getPaymentProvider, setPaymentProvider } from "./_settings"

const last = () => state.rec[state.rec.length - 1]
beforeEach(() => { state.rec.length = 0 })

describe("_settings wrappers", () => {
	it("getPaymentProvider GETs the payment-provider route", async () => {
		await getPaymentProvider()
		expect(last()).toMatchObject({ method: "get", url: "/api/admin/payment-provider" })
	})

	it("setPaymentProvider POSTs the provider with the form header", async () => {
		await setPaymentProvider("paddle", true)
		expect(last()).toMatchObject({ method: "post", url: "/api/admin/payment-provider" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})
})
