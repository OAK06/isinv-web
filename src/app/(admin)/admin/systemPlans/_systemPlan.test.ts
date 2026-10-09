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

import { getSystemPlans, getSystemPlan, addSystemPlan, editSystemPlan, deleteSystemPlan, BASE_COUNTRIES } from "./_systemPlan"

const last = () => state.rec[state.rec.length - 1]
beforeEach(() => { state.rec.length = 0 })

describe("_systemPlan wrappers", () => {
	it("getSystemPlans builds a paginated URL; omits sort when null", async () => {
		await getSystemPlans(2, null as any, null as any)
		expect(last()).toMatchObject({ method: "get", url: "/api/system-plans?page=2" })
	})

	it("getSystemPlans appends sort + direction when provided", async () => {
		await getSystemPlans(1, "slug", "asc")
		expect(last().url).toBe("/api/system-plans?page=1&sort=slug&sort_direction=asc")
	})

	it("getSystemPlan hits the show route", async () => {
		await getSystemPlan(9)
		expect(last()).toMatchObject({ method: "get", url: "/api/system-plans/9" })
	})

	it("addSystemPlan POSTs to the collection with the form header", async () => {
		await addSystemPlan({})
		expect(last()).toMatchObject({ method: "post", url: "/api/system-plans" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("editSystemPlan POSTs with the ?_method=PUT override and the form header", async () => {
		await editSystemPlan(9, {})
		expect(last()).toMatchObject({ method: "post", url: "/api/system-plans/9?_method=PUT" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("deleteSystemPlan DELETEs by id", async () => {
		await deleteSystemPlan(9)
		expect(last()).toMatchObject({ method: "delete", url: "/api/system-plans/9" })
	})

	it("BASE_COUNTRIES leads with the XX default-country fallback row", () => {
		expect(BASE_COUNTRIES[0]).toEqual({ code: "XX", label: "defaultCountry" })
	})
})
