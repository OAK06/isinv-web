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

import { getApps, getApplication, approveApplication, rejectApplication, archiveApplication } from "./_application"

const last = () => state.rec[state.rec.length - 1]
beforeEach(() => { state.rec.length = 0 })

describe("_application wrappers", () => {
	it("getApps builds a paginated, branch-scoped URL; omits sort when null", async () => {
		await getApps(2, 7, null as any, null as any)
		expect(last()).toMatchObject({ method: "get", url: "/api/applications?page=2&branch_id=7" })
	})

	it("getApps appends sort + direction when provided", async () => {
		await getApps(1, 3, "fname", "asc")
		expect(last().url).toBe("/api/applications?page=1&branch_id=3&sort=fname&sort_direction=asc")
	})

	it("getApplication hits the show route", async () => {
		await getApplication(9)
		expect(last()).toMatchObject({ method: "get", url: "/api/applications/9" })
	})

	it("approveApplication POSTs with the ?_method=PUT override and the form header", async () => {
		await approveApplication(9, {})
		expect(last()).toMatchObject({ method: "post", url: "/api/applications/9?_method=PUT" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("rejectApplication POSTs to the reject sub-route with the form header", async () => {
		await rejectApplication(9, {})
		expect(last()).toMatchObject({ method: "post", url: "/api/applications/9/reject" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("archiveApplication DELETEs by id", async () => {
		await archiveApplication(9)
		expect(last()).toMatchObject({ method: "delete", url: "/api/applications/9" })
	})
})
