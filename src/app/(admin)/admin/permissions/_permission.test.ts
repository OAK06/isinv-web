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

import { getPermissions, getPermission, addPermission, editPermission, deletePermission, bulkDeletePermission } from "./_permission"

const last = () => state.rec[state.rec.length - 1]
beforeEach(() => { state.rec.length = 0 })

describe("_permission wrappers", () => {
	it("getPermissions builds a paginated URL; omits sort when null", async () => {
		await getPermissions(2, null as any, null as any)
		expect(last()).toMatchObject({ method: "get", url: "/api/permissions?page=2" })
	})

	it("getPermissions appends sort + direction when provided", async () => {
		await getPermissions(1, "name", "asc")
		expect(last().url).toBe("/api/permissions?page=1&sort=name&sort_direction=asc")
	})

	it("getPermission hits the show route", async () => {
		await getPermission(9)
		expect(last()).toMatchObject({ method: "get", url: "/api/permissions/9" })
	})

	it("addPermission POSTs to the collection with the form header", async () => {
		await addPermission({})
		expect(last()).toMatchObject({ method: "post", url: "/api/permissions" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("editPermission POSTs with the ?_method=PUT override and the form header", async () => {
		await editPermission(9, {})
		expect(last()).toMatchObject({ method: "post", url: "/api/permissions/9?_method=PUT" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("deletePermission DELETEs by id", async () => {
		await deletePermission(9)
		expect(last()).toMatchObject({ method: "delete", url: "/api/permissions/9" })
	})

	it("bulkDeletePermission DELETEs the bulk endpoint", async () => {
		await bulkDeletePermission({})
		expect(last()).toMatchObject({ method: "delete", url: "/api/permissions/delete/bulk" })
	})
})
