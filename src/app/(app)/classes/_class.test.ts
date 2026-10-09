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

import { getCompanyBranches, getBranchPlans, getBranchStaff, getClasses, getClass, addClass, editClass, deleteClass, bulkDeleteClass } from "./_class"

const last = () => state.rec[state.rec.length - 1]
beforeEach(() => { state.rec.length = 0 })

describe("_class wrappers", () => {
	it("getCompanyBranches GETs the company-scoped branches route", async () => {
		await getCompanyBranches(4)
		expect(last()).toMatchObject({ method: "get", url: "/api/company/4/branches" })
	})

	it("getBranchPlans GETs the scoped plans route with the form header", async () => {
		await getBranchPlans(7, "class")
		expect(last()).toMatchObject({ method: "get", url: "/api/branch-plans/7?scope=class" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("getBranchStaff GETs the branch staff route", async () => {
		await getBranchStaff(7)
		expect(last()).toMatchObject({ method: "get", url: "/api/get-branch-staff/7" })
	})

	it("getClasses builds a paginated, branch-scoped URL; omits sort when null", async () => {
		await getClasses(2, 7, null as any, null as any, true)
		expect(last()).toMatchObject({ method: "get", url: "/api/classes?page=2&branch_id=7&active=true" })
	})

	it("getClasses appends sort + direction when provided", async () => {
		await getClasses(1, 3, "name", "asc", false)
		expect(last().url).toBe("/api/classes?page=1&branch_id=3&active=false&sort=name&sort_direction=asc")
	})

	it("getClass hits the show route", async () => {
		await getClass(9)
		expect(last()).toMatchObject({ method: "get", url: "/api/classes/9" })
	})

	it("addClass POSTs to the collection with the form header", async () => {
		await addClass({})
		expect(last()).toMatchObject({ method: "post", url: "/api/classes" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("editClass POSTs with the ?_method=PUT override and the form header", async () => {
		await editClass(9, {})
		expect(last()).toMatchObject({ method: "post", url: "/api/classes/9?_method=PUT" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("deleteClass DELETEs by id", async () => {
		await deleteClass(9)
		expect(last()).toMatchObject({ method: "delete", url: "/api/classes/9" })
	})

	it("bulkDeleteClass DELETEs the bulk endpoint", async () => {
		await bulkDeleteClass({})
		expect(last()).toMatchObject({ method: "delete", url: "/api/classes/delete/bulk" })
	})
})
