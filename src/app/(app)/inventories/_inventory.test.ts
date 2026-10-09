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

import { getInventories } from "./_inventory"

const last = () => state.rec[state.rec.length - 1]
beforeEach(() => { state.rec.length = 0 })

describe("_inventory wrappers", () => {
	it("getInventories builds a paginated, branch-scoped URL; omits sort when null", async () => {
		await getInventories(2, 7, null as any, null as any)
		expect(last()).toMatchObject({ method: "get", url: "/api/inventories?page=2&branch_id=7" })
	})

	it("getInventories appends sort + direction when provided", async () => {
		await getInventories(1, 3, "name", "asc")
		expect(last().url).toBe("/api/inventories?page=1&branch_id=3&sort=name&sort_direction=asc")
	})
})
