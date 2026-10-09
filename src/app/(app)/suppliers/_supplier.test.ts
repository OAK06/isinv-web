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

import { getCompanyBranches, getBranchPosRegisters, getSuppliers, getSupplier, addSupplier, editSupplier, deleteSupplier, bulkDeleteSupplier } from "./_supplier"

const last = () => state.rec[state.rec.length - 1]
beforeEach(() => { state.rec.length = 0 })

describe("_supplier wrappers", () => {
	it("getCompanyBranches GETs the company-scoped branches route", async () => {
		await getCompanyBranches(5)
		expect(last()).toMatchObject({ method: "get", url: "/api/company/5/branches" })
	})

	it("getBranchPosRegisters includes ?scope= but omits &active= when not provided", async () => {
		await getBranchPosRegisters(7, undefined, "suppliers")
		expect(last()).toMatchObject({ method: "get", url: "/api/branch/7/pos-registers?scope=suppliers" })
	})

	it("getBranchPosRegisters appends &active= when provided", async () => {
		await getBranchPosRegisters(7, true, "suppliers")
		expect(last().url).toBe("/api/branch/7/pos-registers?scope=suppliers&active=true")
	})

	it("getSuppliers builds a paginated, branch+register-scoped URL; omits sort when null", async () => {
		await getSuppliers(2, 7, 2, null as any, null as any)
		expect(last()).toMatchObject({ method: "get", url: "/api/suppliers?page=2&branch_id=7&pos_register_id=2" })
	})

	it("getSuppliers appends sort + direction when provided", async () => {
		await getSuppliers(1, 3, 2, "name", "asc")
		expect(last().url).toBe("/api/suppliers?page=1&branch_id=3&pos_register_id=2&sort=name&sort_direction=asc")
	})

	it("getSupplier hits the show route", async () => {
		await getSupplier(9)
		expect(last()).toMatchObject({ method: "get", url: "/api/suppliers/9" })
	})

	it("addSupplier POSTs to the collection with the form header", async () => {
		await addSupplier({})
		expect(last()).toMatchObject({ method: "post", url: "/api/suppliers" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("editSupplier POSTs with the ?_method=PUT override and the form header", async () => {
		await editSupplier(9, {})
		expect(last()).toMatchObject({ method: "post", url: "/api/suppliers/9?_method=PUT" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("deleteSupplier DELETEs by id", async () => {
		await deleteSupplier(9)
		expect(last()).toMatchObject({ method: "delete", url: "/api/suppliers/9" })
	})

	it("bulkDeleteSupplier DELETEs the bulk endpoint", async () => {
		await bulkDeleteSupplier({})
		expect(last()).toMatchObject({ method: "delete", url: "/api/suppliers/delete/bulk" })
	})
})
