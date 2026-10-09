import { describe, it, expect, vi, beforeEach } from "vitest"

// Representative test for the per-entity `_<entity>.ts` axios wrappers (60 of them,
// all thin URL builders). getMembers is the one with real branching — the optional
// sort params. `state.get` is a plain delegate so a rejecting case wouldn't trip
// Vitest's spy-rejection quirk (see emailConflict.test.ts).
const state = vi.hoisted(() => ({ get: (..._a: any[]): any => Promise.resolve({ data: { data: [] } }) }))
vi.mock("@/lib/axios", () => ({ default: { get: (...a: any[]) => state.get(...a) } }))

import { getMembers, getMember } from "./_member"

describe("_member wrappers", () => {
	let url = ""
	beforeEach(() => { url = ""; state.get = (u: string) => { url = u; return Promise.resolve({ data: {} }) } })

	it("getMembers builds a paginated, branch-scoped URL and omits sort when null", async () => {
		await getMembers(2, 7, null as any, null as any)
		expect(url).toBe("/api/members?page=2&branch_id=7")
	})

	it("getMembers appends sort + direction when provided", async () => {
		await getMembers(1, 3, "fname", "asc")
		expect(url).toBe("/api/members?page=1&branch_id=3&sort=fname&sort_direction=asc")
	})

	it("getMembers unwraps res.data", async () => {
		state.get = () => Promise.resolve({ data: { data: [{ id: 1 }], total: 1 } })
		await expect(getMembers(1, 1, null as any, null as any)).resolves.toEqual({ data: [{ id: 1 }], total: 1 })
	})

	it("getMember hits the show route by id", async () => {
		await getMember(42)
		expect(url).toBe("/api/members/42")
	})
})
