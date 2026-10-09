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

import { getCompanyBranches, getPosSessions, getPosSession, addPosSession, endPosSession } from "./_posSession"

const last = () => state.rec[state.rec.length - 1]
beforeEach(() => { state.rec.length = 0 })

describe("_posSession wrappers", () => {
	it("getCompanyBranches hits the company branches route", async () => {
		await getCompanyBranches(4)
		expect(last()).toMatchObject({ method: "get", url: "/api/company/4/branches" })
	})

	it("getPosSessions builds a scoped URL; omits sort when null", async () => {
		await getPosSessions(2, 7, 3, null as any, null as any)
		expect(last()).toMatchObject({ method: "get", url: "/api/pos-sessions?page=2&branch_id=7&pos_register_id=3" })
	})

	it("getPosSessions appends sort + direction when provided", async () => {
		await getPosSessions(1, 3, 2, "start", "asc")
		expect(last().url).toBe("/api/pos-sessions?page=1&branch_id=3&pos_register_id=2&sort=start&sort_direction=asc")
	})

	it("getPosSession hits the show route", async () => {
		await getPosSession(9)
		expect(last()).toMatchObject({ method: "get", url: "/api/pos-sessions/9" })
	})

	it("addPosSession POSTs to the collection with the form header", async () => {
		await addPosSession({})
		expect(last()).toMatchObject({ method: "post", url: "/api/pos-sessions" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("endPosSession POSTs with the ?_method=PUT override and the form header", async () => {
		await endPosSession(9, {})
		expect(last()).toMatchObject({ method: "post", url: "/api/pos-sessions/9?_method=PUT" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})
})
