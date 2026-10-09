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

import { getAttendance } from "./_attendance"

const last = () => state.rec[state.rec.length - 1]
beforeEach(() => { state.rec.length = 0 })

describe("_attendance wrappers", () => {
	it("getAttendance builds a paginated, branch-scoped URL; omits from/to/sort when null", async () => {
		await getAttendance(2, 7, null as any, null as any, null as any, null as any)
		expect(last()).toMatchObject({ method: "get", url: "/api/attendance-report?page=2&branch_id=7" })
	})

	it("getAttendance appends from/to when provided", async () => {
		await getAttendance(1, 3, "2026-01-01", "2026-01-31", null as any, null as any)
		expect(last().url).toBe("/api/attendance-report?page=1&branch_id=3&from=2026-01-01&to=2026-01-31")
	})

	it("getAttendance appends sort + direction after from/to when provided", async () => {
		await getAttendance(1, 3, "2026-01-01", "2026-01-31", "name", "asc")
		expect(last().url).toBe("/api/attendance-report?page=1&branch_id=3&from=2026-01-01&to=2026-01-31&sort=name&sort_direction=asc")
	})
})
