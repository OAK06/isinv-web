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

import { getInvoices, getInvoice } from "./_bill"

const last = () => state.rec[state.rec.length - 1]
beforeEach(() => { state.rec.length = 0 })

describe("_bill wrappers", () => {
	it("getInvoices builds branch+page url and omits optional filters when null", async () => {
		await getInvoices(5).catch(() => {})
		expect(last()).toMatchObject({ method: "get", url: "/api/me/invoices?branch_id=5&page=1" })
		expect(last().headers["X-SWR-Request"]).toBe(true)
	})

	it("getInvoices appends operation_type + state when provided", async () => {
		await getInvoices(5, 2, 3, 1).catch(() => {})
		expect(last().url).toBe("/api/me/invoices?branch_id=5&page=2&operation_type=3&state=1")
	})

	it("getInvoice hits the show route with the SWR header", async () => {
		await getInvoice(9).catch(() => {})
		expect(last()).toMatchObject({ method: "get", url: "/api/me/invoices/9" })
		expect(last().headers["X-SWR-Request"]).toBe(true)
	})
})
