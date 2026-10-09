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

import { getSystemAddons, getSystemAddon, addSystemAddon, editSystemAddon, deleteSystemAddon } from "./_systemAddon"

const last = () => state.rec[state.rec.length - 1]
beforeEach(() => { state.rec.length = 0 })

describe("_systemAddon wrappers", () => {
	it("getSystemAddons builds a paginated URL; omits sort when null", async () => {
		await getSystemAddons(2, null as any, null as any)
		expect(last()).toMatchObject({ method: "get", url: "/api/system-addons?page=2" })
	})

	it("getSystemAddons appends sort + direction when provided", async () => {
		await getSystemAddons(1, "slug", "asc")
		expect(last().url).toBe("/api/system-addons?page=1&sort=slug&sort_direction=asc")
	})

	it("getSystemAddon hits the show route", async () => {
		await getSystemAddon(9)
		expect(last()).toMatchObject({ method: "get", url: "/api/system-addons/9" })
	})

	it("addSystemAddon POSTs to the collection with the form header", async () => {
		await addSystemAddon({})
		expect(last()).toMatchObject({ method: "post", url: "/api/system-addons" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("editSystemAddon POSTs with the ?_method=PUT override and the form header", async () => {
		await editSystemAddon(9, {})
		expect(last()).toMatchObject({ method: "post", url: "/api/system-addons/9?_method=PUT" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("deleteSystemAddon DELETEs by id", async () => {
		await deleteSystemAddon(9)
		expect(last()).toMatchObject({ method: "delete", url: "/api/system-addons/9" })
	})
})
