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

import { getTenants } from "./_tenant"

const last = () => state.rec[state.rec.length - 1]
beforeEach(() => { state.rec.length = 0 })

describe("_tenant wrappers", () => {
	it("getTenants builds a paginated URL; omits search when empty", async () => {
		await getTenants(2)
		expect(last()).toMatchObject({ method: "get", url: "/api/admin/tenants?page=2" })
	})

	it("getTenants appends the URL-encoded search term when provided", async () => {
		await getTenants(1, "acme gym")
		expect(last().url).toBe("/api/admin/tenants?page=1&search=acme%20gym")
	})
})
