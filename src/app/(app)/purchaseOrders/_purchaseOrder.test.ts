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
	getSuppliers,
	getProducts,
	getPurchases,
	getPurchase,
	addPurchase,
	editPurchase,
	deletePurchase,
	bulkDeletePurchase,
} from "./_purchaseOrder"

const last = () => state.rec[state.rec.length - 1]
beforeEach(() => { state.rec.length = 0 })

describe("_purchaseOrder wrappers", () => {
	it("getCompanyBranches hits the company branches route", async () => {
		await getCompanyBranches(4)
		expect(last()).toMatchObject({ method: "get", url: "/api/company/4/branches" })
	})

	it("getSuppliers builds the branch-scoped, pos-register URL", async () => {
		await getSuppliers(5, 3)
		expect(last()).toMatchObject({ method: "get", url: "/api/branch/5/suppliers?pos_register_id=3" })
	})

	it("getProducts builds the branch-products URL", async () => {
		await getProducts(5, 3)
		expect(last()).toMatchObject({ method: "get", url: "/api/branch-products?branch_id=5&pos_register_id=3" })
	})

	it("getPurchases builds a paginated URL; omits sort when null", async () => {
		await getPurchases(2, 7, null as any, null as any)
		expect(last()).toMatchObject({ method: "get", url: "/api/purchases?page=2&branch_id=7" })
	})

	it("getPurchases appends sort + direction when provided", async () => {
		await getPurchases(1, 3, "notes", "asc")
		expect(last().url).toBe("/api/purchases?page=1&branch_id=3&sort=notes&sort_direction=asc")
	})

	it("getPurchase hits the show route", async () => {
		await getPurchase(9)
		expect(last()).toMatchObject({ method: "get", url: "/api/purchases/9" })
	})

	it("addPurchase POSTs to the collection with the form header", async () => {
		await addPurchase({})
		expect(last()).toMatchObject({ method: "post", url: "/api/purchases" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("editPurchase POSTs with the ?_method=PUT override and the form header", async () => {
		await editPurchase(9, {})
		expect(last()).toMatchObject({ method: "post", url: "/api/purchases/9?_method=PUT" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("deletePurchase DELETEs by id", async () => {
		await deletePurchase(9)
		expect(last()).toMatchObject({ method: "delete", url: "/api/purchases/9" })
	})

	it("bulkDeletePurchase DELETEs the bulk endpoint", async () => {
		await bulkDeletePurchase({})
		expect(last()).toMatchObject({ method: "delete", url: "/api/purchases/delete/bulk" })
	})
})
