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

import { addDemoTenant, bulkCreateDemoTenants, getDemoTenants, deleteDemoTenant, bulkDeleteDemoTenants } from "./_demoTenant"

const last = () => state.rec[state.rec.length - 1]
beforeEach(() => { state.rec.length = 0 })

describe("_demoTenant wrappers", () => {
	it("addDemoTenant POSTs to the collection with the form header", async () => {
		await addDemoTenant({})
		expect(last()).toMatchObject({ method: "post", url: "/api/demo-tenants" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("bulkCreateDemoTenants POSTs the bulk endpoint with the form header", async () => {
		await bulkCreateDemoTenants({})
		expect(last()).toMatchObject({ method: "post", url: "/api/demo-tenants/bulk" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("getDemoTenants GETs the collection with the silent SWR header", async () => {
		await getDemoTenants(2)
		expect(last()).toMatchObject({ method: "get", url: "/api/demo-tenants" })
		expect(last().headers["X-SWR-Request"]).toBe(true)
	})

	it("deleteDemoTenant DELETEs by companyID with the form header", async () => {
		await deleteDemoTenant(9)
		expect(last()).toMatchObject({ method: "delete", url: "/api/demo-tenants/9" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("bulkDeleteDemoTenants DELETEs the bulk endpoint", async () => {
		await bulkDeleteDemoTenants({})
		expect(last()).toMatchObject({ method: "delete", url: "/api/demo-tenants/delete/bulk" })
	})
})
