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

import { getCompanyBranches, getPosRegisters, getPosRegister, addPosRegister, editPosRegister, deletePosRegister, bulkDeleteRegister } from "./_posRegister"

const last = () => state.rec[state.rec.length - 1]
beforeEach(() => { state.rec.length = 0 })

describe("_posRegister wrappers", () => {
	it("getCompanyBranches GETs the company-scoped branches route", async () => {
		await getCompanyBranches(4)
		expect(last()).toMatchObject({ method: "get", url: "/api/company/4/branches" })
	})

	it("getPosRegisters builds a paginated, branch-scoped URL; omits sort when null", async () => {
		await getPosRegisters(2, 7, null as any, null as any)
		expect(last()).toMatchObject({ method: "get", url: "/api/pos-registers?page=2&branch_id=7" })
	})

	it("getPosRegisters appends sort + direction when provided", async () => {
		await getPosRegisters(1, 3, "name", "asc")
		expect(last().url).toBe("/api/pos-registers?page=1&branch_id=3&sort=name&sort_direction=asc")
	})

	it("getPosRegister hits the show route", async () => {
		await getPosRegister(9)
		expect(last()).toMatchObject({ method: "get", url: "/api/pos-registers/9" })
	})

	it("addPosRegister POSTs to the collection with the form header", async () => {
		await addPosRegister({})
		expect(last()).toMatchObject({ method: "post", url: "/api/pos-registers" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("editPosRegister POSTs with the ?_method=PUT override and the form header", async () => {
		await editPosRegister(9, {})
		expect(last()).toMatchObject({ method: "post", url: "/api/pos-registers/9?_method=PUT" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("deletePosRegister DELETEs by id", async () => {
		await deletePosRegister(9)
		expect(last()).toMatchObject({ method: "delete", url: "/api/pos-registers/9" })
	})

	it("bulkDeleteRegister DELETEs the bulk endpoint", async () => {
		await bulkDeleteRegister({})
		expect(last()).toMatchObject({ method: "delete", url: "/api/pos-registers/delete/bulk" })
	})
})
