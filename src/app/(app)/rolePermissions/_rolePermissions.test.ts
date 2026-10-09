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
	getRoles,
	getCompanies,
	getCompanyBranches,
	getBranchRoles,
	getPermissions,
	assignPermissionsToRole,
	getRoleWithPermissions,
} from "./_rolePermissions"

const last = () => state.rec[state.rec.length - 1]
beforeEach(() => { state.rec.length = 0 })

describe("_rolePermissions wrappers", () => {
	it("getRoles builds a paginated URL; omits sort when null", async () => {
		await getRoles(2, 7, null as any, null as any)
		expect(last()).toMatchObject({ method: "get", url: "/api/roles?page=2&branch_id=7" })
	})

	it("getRoles appends sort + direction when provided", async () => {
		await getRoles(1, 3, "name", "asc")
		expect(last().url).toBe("/api/roles?page=1&branch_id=3&sort=name&sort_direction=asc")
	})

	it("getCompanies hits the companies list route", async () => {
		await getCompanies()
		expect(last()).toMatchObject({ method: "get", url: "/api/getCompanies" })
	})

	it("getCompanyBranches hits the company branches route", async () => {
		await getCompanyBranches(4)
		expect(last()).toMatchObject({ method: "get", url: "/api/company/4/branches" })
	})

	it("getBranchRoles hits the branch roles route", async () => {
		await getBranchRoles(4)
		expect(last()).toMatchObject({ method: "get", url: "/api/get-branch-roles/4" })
	})

	it("getPermissions builds the branch-scoped URL", async () => {
		await getPermissions(4)
		expect(last()).toMatchObject({ method: "get", url: "/api/get-permissions?branch_id=4" })
	})

	it("assignPermissionsToRole POSTs with the form header", async () => {
		await assignPermissionsToRole({})
		expect(last()).toMatchObject({ method: "post", url: "/api/assignPermissionsRole" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("getRoleWithPermissions hits the show route", async () => {
		await getRoleWithPermissions(9)
		expect(last()).toMatchObject({ method: "get", url: "/api/roles/9" })
	})
})
