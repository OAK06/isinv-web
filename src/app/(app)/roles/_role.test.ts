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
	getCompanies,
	getCompanyBranches,
	getRoles,
	getRole,
	addRole,
	editRole,
	deleteRole,
	bulkDeleteRole,
} from "./_role"

const last = () => state.rec[state.rec.length - 1]
beforeEach(() => { state.rec.length = 0 })

describe("_role wrappers", () => {
	it("getCompanies hits the companies list route", async () => {
		await getCompanies()
		expect(last()).toMatchObject({ method: "get", url: "/api/getCompanies" })
	})

	it("getCompanyBranches GETs the company branches route with the form header", async () => {
		await getCompanyBranches(4)
		expect(last()).toMatchObject({ method: "get", url: "/api/company/4/branches" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("getRoles builds a paginated URL; omits sort when null", async () => {
		await getRoles(2, 7, null as any, null as any)
		expect(last()).toMatchObject({ method: "get", url: "/api/roles?page=2&branch_id=7" })
	})

	it("getRoles appends sort + direction when provided", async () => {
		await getRoles(1, 3, "name", "asc")
		expect(last().url).toBe("/api/roles?page=1&branch_id=3&sort=name&sort_direction=asc")
	})

	it("getRole hits the show route", async () => {
		await getRole(9)
		expect(last()).toMatchObject({ method: "get", url: "/api/roles/9" })
	})

	it("addRole POSTs to the collection with the form header", async () => {
		await addRole({})
		expect(last()).toMatchObject({ method: "post", url: "/api/roles" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("editRole POSTs with the ?_method=PUT override and the form header", async () => {
		await editRole(9, {})
		expect(last()).toMatchObject({ method: "post", url: "/api/roles/9?_method=PUT" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("deleteRole DELETEs by id", async () => {
		await deleteRole(9)
		expect(last()).toMatchObject({ method: "delete", url: "/api/roles/9" })
	})

	it("bulkDeleteRole DELETEs the bulk endpoint", async () => {
		await bulkDeleteRole({})
		expect(last()).toMatchObject({ method: "delete", url: "/api/roles/delete/bulk" })
	})
})
