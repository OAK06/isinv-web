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

import { getProducts, searchMembers, getSales, getSale, addSales, addRefund } from "./_sale"

const last = () => state.rec[state.rec.length - 1]
beforeEach(() => { state.rec.length = 0 })

describe("_sale wrappers", () => {
	it("getProducts builds the branch-products URL", async () => {
		await getProducts(5, 3)
		expect(last()).toMatchObject({ method: "get", url: "/api/branch-products?branch_id=5&pos_register_id=3" })
	})

	it("searchMembers GETs the search route with the form header (params passed separately)", async () => {
		await searchMembers(5, "john")
		expect(last()).toMatchObject({ method: "get", url: "/api/members/search" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("getSales builds a paginated, scoped URL; omits sort when null", async () => {
		await getSales(2, 7, 3, null as any, null as any)
		expect(last()).toMatchObject({ method: "get", url: "/api/sales?page=2&branch_id=7&pos_register_id=3" })
	})

	it("getSales appends sort + direction when provided", async () => {
		await getSales(1, 3, 2, "total_price", "desc")
		expect(last().url).toBe("/api/sales?page=1&branch_id=3&pos_register_id=2&sort=total_price&sort_direction=desc")
	})

	it("getSale hits the show route", async () => {
		await getSale(9)
		expect(last()).toMatchObject({ method: "get", url: "/api/sales/9" })
	})

	it("addSales POSTs to the collection with the form header", async () => {
		await addSales({})
		expect(last()).toMatchObject({ method: "post", url: "/api/sales" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("addRefund POSTs with the ?_method=PUT override and no form header", async () => {
		await addRefund(9, {})
		expect(last()).toMatchObject({ method: "post", url: "/api/sales/9?_method=PUT" })
		expect(last().headers["X-Form-Request"]).toBeUndefined()
	})
})
