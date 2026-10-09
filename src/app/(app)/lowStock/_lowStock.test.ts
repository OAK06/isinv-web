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

import { getLowStock } from "./_lowStock"

const last = () => state.rec[state.rec.length - 1]
beforeEach(() => { state.rec.length = 0 })

describe("_lowStock wrappers", () => {
	it("getLowStock builds a paginated, branch-scoped URL; omits sort when null", async () => {
		await getLowStock(2, 7, null as any, null as any)
		expect(last()).toMatchObject({ method: "get", url: "/api/low-stock?page=2&branch_id=7" })
	})

	it("getLowStock appends sort + direction when provided", async () => {
		await getLowStock(1, 3, "qty", "asc")
		expect(last().url).toBe("/api/low-stock?page=1&branch_id=3&sort=qty&sort_direction=asc")
	})
})
