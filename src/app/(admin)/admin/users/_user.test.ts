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

import { getRoles, getUsers, getUser, addUser, editUser, deleteUser, bulkDeleteUser, saveFilters, saveVisibleColumns } from "./_user"

const last = () => state.rec[state.rec.length - 1]
beforeEach(() => { state.rec.length = 0 })

describe("_user wrappers", () => {
	it("getRoles hits the branch-scoped roles route", async () => {
		await getRoles(7)
		expect(last()).toMatchObject({ method: "get", url: "/api/get-branch-roles/7" })
	})

	it("getUsers builds a paginated URL; omits sort when null", async () => {
		await getUsers(2, null as any, null as any)
		expect(last()).toMatchObject({ method: "get", url: "/api/users?page=2" })
	})

	it("getUsers appends sort + direction when provided", async () => {
		await getUsers(1, "name", "asc")
		expect(last().url).toBe("/api/users?page=1&sort=name&sort_direction=asc")
	})

	it("getUser hits the show route", async () => {
		await getUser(9)
		expect(last()).toMatchObject({ method: "get", url: "/api/users/9" })
	})

	it("addUser POSTs to the collection with the form header", async () => {
		await addUser({})
		expect(last()).toMatchObject({ method: "post", url: "/api/users" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("editUser POSTs with the ?_method=PUT override and the form header", async () => {
		await editUser(9, {})
		expect(last()).toMatchObject({ method: "post", url: "/api/users/9?_method=PUT" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("deleteUser DELETEs by id", async () => {
		await deleteUser(9)
		expect(last()).toMatchObject({ method: "delete", url: "/api/users/9" })
	})

	it("bulkDeleteUser DELETEs the bulk endpoint", async () => {
		await bulkDeleteUser({})
		expect(last()).toMatchObject({ method: "delete", url: "/api/users/delete/bulk" })
	})

	it("saveFilters POSTs without a form header", async () => {
		await saveFilters({})
		expect(last()).toMatchObject({ method: "post", url: "/api/save-filters" })
		expect(last().headers["X-Form-Request"]).toBeUndefined()
	})

	it("saveVisibleColumns POSTs without a form header", async () => {
		await saveVisibleColumns({})
		expect(last()).toMatchObject({ method: "post", url: "/api/save-visible-columns" })
	})
})
