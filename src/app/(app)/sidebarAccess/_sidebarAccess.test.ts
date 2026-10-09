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

import { getMySidebar, getSidebarAccess, saveSidebarAccess } from "./_sidebarAccess"

const last = () => state.rec[state.rec.length - 1]
beforeEach(() => { state.rec.length = 0 })

describe("_sidebarAccess wrappers", () => {
	it("getMySidebar GETs the silent, branch-scoped route", async () => {
		await getMySidebar(7)
		expect(last()).toMatchObject({ method: "get", url: "/api/my-sidebar?branch_id=7" })
		expect(last().headers["X-SWR-Request"]).toBe(true)
	})

	it("getSidebarAccess GETs the catalog route", async () => {
		await getSidebarAccess(7)
		expect(last()).toMatchObject({ method: "get", url: "/api/sidebar-access?branch=7" })
	})

	it("saveSidebarAccess PUTs with the form header", async () => {
		await saveSidebarAccess(7, 4, ["dashboard", "members"])
		expect(last()).toMatchObject({ method: "put", url: "/api/sidebar-access" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})
})
