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

import { getSubscriptionTransactions } from "./_subscriptionTransactions"

const last = () => state.rec[state.rec.length - 1]
beforeEach(() => { state.rec.length = 0 })

describe("_subscriptionTransactions wrappers", () => {
	it("getSubscriptionTransactions builds a paginated, branch+date-range-scoped URL; omits sort when null", async () => {
		await getSubscriptionTransactions(2, 7, "2026-01-01", "2026-01-31", null as any, null as any)
		expect(last()).toMatchObject({ method: "get", url: "/api/subscription-transactions?page=2&branch_id=7&from_date=2026-01-01&to_date=2026-01-31" })
	})

	it("getSubscriptionTransactions appends sort + direction when provided", async () => {
		await getSubscriptionTransactions(1, 3, "2026-01-01", "2026-01-31", "amount", "desc")
		expect(last().url).toBe("/api/subscription-transactions?page=1&branch_id=3&from_date=2026-01-01&to_date=2026-01-31&sort=amount&sort_direction=desc")
	})
})
