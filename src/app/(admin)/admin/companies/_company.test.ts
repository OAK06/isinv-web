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

import { getCompanies, getCompany, addCompany, editCompany, deleteCompany, bulkDeleteCompany } from "./_company"

const last = () => state.rec[state.rec.length - 1]
beforeEach(() => { state.rec.length = 0 })

describe("_company wrappers", () => {
	it("getCompanies builds a paginated URL; omits sort when null", async () => {
		await getCompanies(2, null as any, null as any)
		expect(last()).toMatchObject({ method: "get", url: "/api/companies?page=2" })
	})

	it("getCompanies appends sort + direction when provided", async () => {
		await getCompanies(1, "name", "asc")
		expect(last().url).toBe("/api/companies?page=1&sort=name&sort_direction=asc")
	})

	it("getCompany hits the show route", async () => {
		await getCompany(9)
		expect(last()).toMatchObject({ method: "get", url: "/api/companies/9" })
	})

	it("addCompany POSTs to the collection with the form header", async () => {
		await addCompany({})
		expect(last()).toMatchObject({ method: "post", url: "/api/companies" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("editCompany POSTs with the ?_method=PUT override and the form header", async () => {
		await editCompany(9, {})
		expect(last()).toMatchObject({ method: "post", url: "/api/companies/9?_method=PUT" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("deleteCompany DELETEs by id", async () => {
		await deleteCompany(9)
		expect(last()).toMatchObject({ method: "delete", url: "/api/companies/9" })
	})

	it("bulkDeleteCompany DELETEs the bulk endpoint", async () => {
		await bulkDeleteCompany({})
		expect(last()).toMatchObject({ method: "delete", url: "/api/companies/delete/bulk" })
	})
})
