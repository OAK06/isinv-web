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
	getCompanyBranches,
	getBranchPosRegisters,
	getCategories,
	getCategory,
	addCategory,
	editCategory,
	deleteCategory,
	bulkDeleteCategory,
} from "./_productCategory"

const last = () => state.rec[state.rec.length - 1]
beforeEach(() => { state.rec.length = 0 })

describe("_productCategory wrappers", () => {
	it("getCompanyBranches hits the company branches route", async () => {
		await getCompanyBranches(4)
		expect(last()).toMatchObject({ method: "get", url: "/api/company/4/branches" })
	})

	it("getBranchPosRegisters builds a scope-only URL when active is omitted", async () => {
		await getBranchPosRegisters(5, null as any, "cash")
		expect(last()).toMatchObject({ method: "get", url: "/api/branch/5/pos-registers?scope=cash" })
	})

	it("getBranchPosRegisters appends active when provided", async () => {
		await getBranchPosRegisters(5, true, "cash")
		expect(last().url).toBe("/api/branch/5/pos-registers?scope=cash&active=true")
	})

	it("getCategories builds a paginated, scoped URL; omits sort when null", async () => {
		await getCategories(2, 7, 3, null as any, null as any)
		expect(last()).toMatchObject({ method: "get", url: "/api/categories?page=2&branch_id=7&pos_register_id=3" })
	})

	it("getCategories appends sort + direction when provided", async () => {
		await getCategories(1, 3, 2, "name", "asc")
		expect(last().url).toBe("/api/categories?page=1&branch_id=3&pos_register_id=2&sort=name&sort_direction=asc")
	})

	it("getCategory hits the show route", async () => {
		await getCategory(9)
		expect(last()).toMatchObject({ method: "get", url: "/api/categories/9" })
	})

	it("addCategory POSTs to the collection with the form header", async () => {
		await addCategory({})
		expect(last()).toMatchObject({ method: "post", url: "/api/categories" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("editCategory POSTs with the ?_method=PUT override and the form header", async () => {
		await editCategory(9, {})
		expect(last()).toMatchObject({ method: "post", url: "/api/categories/9?_method=PUT" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("deleteCategory DELETEs by id", async () => {
		await deleteCategory(9)
		expect(last()).toMatchObject({ method: "delete", url: "/api/categories/9" })
	})

	it("bulkDeleteCategory DELETEs the bulk endpoint", async () => {
		await bulkDeleteCategory({})
		expect(last()).toMatchObject({ method: "delete", url: "/api/categories/delete/bulk" })
	})
})
