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

import { getRefundsReport } from "./_refundsReport"

const last = () => state.rec[state.rec.length - 1]
beforeEach(() => { state.rec.length = 0 })

describe("_refundsReport wrappers", () => {
	it("getRefundsReport builds a base URL; omits from/to/sort when falsy/null", async () => {
		await getRefundsReport(2, 7, null as any, null as any, null as any, null as any)
		expect(last()).toMatchObject({ method: "get", url: "/api/refunds-report?page=2&branch_id=7" })
	})

	it("getRefundsReport appends from, to, sort + direction when provided", async () => {
		await getRefundsReport(1, 3, "2026-01-01", "2026-01-31", "total", "asc")
		expect(last().url).toBe("/api/refunds-report?page=1&branch_id=3&from=2026-01-01&to=2026-01-31&sort=total&sort_direction=asc")
	})
})
