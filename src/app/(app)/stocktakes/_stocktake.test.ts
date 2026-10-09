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

import { branchProductCategories, getStocktakes, getStocktake, addStocktake, addStocktakeItem, editStocktake, finishStocktake, getActiveStocktake } from "./_stocktake"

const last = () => state.rec[state.rec.length - 1]
beforeEach(() => { state.rec.length = 0 })

describe("_stocktake wrappers", () => {
	it("branchProductCategories GETs the branch+register-scoped route", async () => {
		await branchProductCategories(7, 2)
		expect(last()).toMatchObject({ method: "get", url: "/api/branch-product-categories/7?pos_register_id=2" })
	})

	it("getStocktakes builds a paginated, branch+register-scoped URL; omits sort when null", async () => {
		await getStocktakes(2, 7, 2, null as any, null as any)
		expect(last()).toMatchObject({ method: "get", url: "/api/stocktakes?page=2&branch_id=7&pos_register_id=2" })
	})

	it("getStocktakes appends sort + direction when provided", async () => {
		await getStocktakes(1, 3, 2, "name", "asc")
		expect(last().url).toBe("/api/stocktakes?page=1&branch_id=3&pos_register_id=2&sort=name&sort_direction=asc")
	})

	it("getStocktake hits the show route", async () => {
		await getStocktake(9)
		expect(last()).toMatchObject({ method: "get", url: "/api/stocktakes/9" })
	})

	it("addStocktake POSTs to the collection with the form header", async () => {
		await addStocktake({})
		expect(last()).toMatchObject({ method: "post", url: "/api/stocktakes" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("addStocktakeItem POSTs to the item collection with the form header", async () => {
		await addStocktakeItem({})
		expect(last()).toMatchObject({ method: "post", url: "/api/stocktakeItems" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("editStocktake POSTs with the ?_method=PUT override and the form header", async () => {
		await editStocktake(9, {})
		expect(last()).toMatchObject({ method: "post", url: "/api/stocktakes/9?_method=PUT" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("finishStocktake POSTs to the finish route with ?_method=PUT and NO form header", async () => {
		await finishStocktake(9, {})
		expect(last()).toMatchObject({ method: "post", url: "/api/stocktakes/9/finish?_method=PUT" })
		expect(last().headers["X-Form-Request"]).toBeUndefined()
	})

	it("getActiveStocktake GETs the create route with branch + register query", async () => {
		await getActiveStocktake(7, 2)
		expect(last()).toMatchObject({ method: "get", url: "/api/stocktakes/create?branch_id=7&pos_register_id=2" })
	})
})
