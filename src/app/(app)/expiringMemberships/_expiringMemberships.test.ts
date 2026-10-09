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

import { getExpiringMemberships } from "./_expiringMemberships"

const last = () => state.rec[state.rec.length - 1]
beforeEach(() => { state.rec.length = 0 })

describe("_expiringMemberships wrappers", () => {
	it("getExpiringMemberships builds a paginated, branch+window-scoped URL; omits sort when null", async () => {
		await getExpiringMemberships(2, 7, "30", null as any, null as any)
		expect(last()).toMatchObject({ method: "get", url: "/api/expiring-memberships?page=2&branch_id=7&window=30" })
	})

	it("getExpiringMemberships appends sort + direction when provided", async () => {
		await getExpiringMemberships(1, 3, "7", "expiry_date", "asc")
		expect(last().url).toBe("/api/expiring-memberships?page=1&branch_id=3&window=7&sort=expiry_date&sort_direction=asc")
	})
})
