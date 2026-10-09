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

import { getDuePayments } from "./_duePayment"

const last = () => state.rec[state.rec.length - 1]
beforeEach(() => { state.rec.length = 0 })

describe("_duePayment wrappers", () => {
	it("getDuePayments builds a paginated, branch+date-scoped URL; omits sort when null", async () => {
		await getDuePayments(2, 7, "2026-08-23", null as any, null as any)
		expect(last()).toMatchObject({ method: "get", url: "/api/due-payments?page=2&branch_id=7&date=2026-08-23" })
	})

	it("getDuePayments appends sort + direction when provided", async () => {
		await getDuePayments(1, 3, "2026-08-23", "amount", "asc")
		expect(last().url).toBe("/api/due-payments?page=1&branch_id=3&date=2026-08-23&sort=amount&sort_direction=asc")
	})
})
