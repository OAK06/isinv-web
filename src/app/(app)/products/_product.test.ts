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
	getBranchProductCategories,
	getProducts,
	getProduct,
	addProduct,
	editProduct,
	deleteProduct,
	bulkDeleteProduct,
} from "./_product"

const last = () => state.rec[state.rec.length - 1]
beforeEach(() => { state.rec.length = 0 })

describe("_product wrappers", () => {
	it("getCompanyBranches hits the company branches route", async () => {
		await getCompanyBranches(4)
		expect(last()).toMatchObject({ method: "get", url: "/api/company/4/branches" })
	})

	it("getBranchProductCategories builds the branch-scoped, pos-register + scope URL", async () => {
		await getBranchProductCategories(5, 3, "cash")
		expect(last()).toMatchObject({ method: "get", url: "/api/branch-product-categories/5?pos_register_id=3&scope=cash" })
	})

	it("getProducts builds a paginated, scoped URL; omits sort when null", async () => {
		await getProducts(2, 7, 3, null as any, null as any)
		expect(last()).toMatchObject({ method: "get", url: "/api/products?page=2&branch_id=7&pos_register_id=3" })
	})

	it("getProducts appends sort + direction when provided", async () => {
		await getProducts(1, 3, 2, "name", "asc")
		expect(last().url).toBe("/api/products?page=1&branch_id=3&pos_register_id=2&sort=name&sort_direction=asc")
	})

	it("getProduct hits the show route", async () => {
		await getProduct(9)
		expect(last()).toMatchObject({ method: "get", url: "/api/products/9" })
	})

	it("addProduct POSTs to the collection with the form header", async () => {
		await addProduct({})
		expect(last()).toMatchObject({ method: "post", url: "/api/products" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("editProduct POSTs with the ?_method=PUT override and the form header", async () => {
		await editProduct(9, {})
		expect(last()).toMatchObject({ method: "post", url: "/api/products/9?_method=PUT" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("deleteProduct DELETEs by id", async () => {
		await deleteProduct(9)
		expect(last()).toMatchObject({ method: "delete", url: "/api/products/9" })
	})

	it("bulkDeleteProduct DELETEs the bulk endpoint", async () => {
		await bulkDeleteProduct({})
		expect(last()).toMatchObject({ method: "delete", url: "/api/products/delete/bulk" })
	})
})
