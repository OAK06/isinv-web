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

import { getRefunds } from "./_refund"

const last = () => state.rec[state.rec.length - 1]
beforeEach(() => { state.rec.length = 0 })

describe("_refund wrappers", () => {
	it("getRefunds builds a paginated, scoped URL; omits sort when null", async () => {
		await getRefunds(2, 7, 3, null as any, null as any)
		expect(last()).toMatchObject({ method: "get", url: "/api/refunds?page=2&branch_id=7&pos_register_id=3" })
	})

	it("getRefunds appends sort + direction when provided", async () => {
		await getRefunds(1, 3, 2, "created_at", "desc")
		expect(last().url).toBe("/api/refunds?page=1&branch_id=3&pos_register_id=2&sort=created_at&sort_direction=desc")
	})
})
