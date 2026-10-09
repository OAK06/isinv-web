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

import { getBranchRoles, getBranchPosRegisters, getStaffs, getStaff, addStaff, editStaff, deleteStaff, bulkDeleteStaff } from "./_staff"

const last = () => state.rec[state.rec.length - 1]
beforeEach(() => { state.rec.length = 0 })

describe("_staff wrappers", () => {
	it("getBranchRoles GETs the branch-scoped roles route", async () => {
		await getBranchRoles(7)
		expect(last()).toMatchObject({ method: "get", url: "/api/get-branch-roles/7" })
	})

	it("getBranchPosRegisters omits the active query when not provided", async () => {
		await getBranchPosRegisters(7)
		expect(last()).toMatchObject({ method: "get", url: "/api/branch/7/pos-registers" })
	})

	it("getBranchPosRegisters appends ?active= when provided", async () => {
		await getBranchPosRegisters(7, true)
		expect(last().url).toBe("/api/branch/7/pos-registers?active=true")
	})

	it("getStaffs builds a paginated, branch-scoped URL; omits sort when null", async () => {
		await getStaffs(2, 7, null as any, null as any)
		expect(last()).toMatchObject({ method: "get", url: "/api/staff?page=2&branch_id=7" })
	})

	it("getStaffs appends sort + direction when provided", async () => {
		await getStaffs(1, 3, "fname", "asc")
		expect(last().url).toBe("/api/staff?page=1&branch_id=3&sort=fname&sort_direction=asc")
	})

	it("getStaff hits the show route", async () => {
		await getStaff(9)
		expect(last()).toMatchObject({ method: "get", url: "/api/staff/9" })
	})

	it("addStaff POSTs to the collection with the form header", async () => {
		await addStaff({})
		expect(last()).toMatchObject({ method: "post", url: "/api/staff" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("editStaff POSTs with the ?_method=PUT override and the form header", async () => {
		await editStaff(9, {})
		expect(last()).toMatchObject({ method: "post", url: "/api/staff/9?_method=PUT" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("deleteStaff DELETEs by id", async () => {
		await deleteStaff(9)
		expect(last()).toMatchObject({ method: "delete", url: "/api/staff/9" })
	})

	it("bulkDeleteStaff DELETEs the bulk endpoint", async () => {
		await bulkDeleteStaff({})
		expect(last()).toMatchObject({ method: "delete", url: "/api/staff/delete/bulk" })
	})
})
