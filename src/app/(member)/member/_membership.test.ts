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

import { getMemberships } from "./_membership"

const last = () => state.rec[state.rec.length - 1]
beforeEach(() => { state.rec.length = 0 })

describe("_membership wrappers", () => {
	it("getMemberships hits the self-scoped memberships route with the SWR header", async () => {
		await getMemberships()
		expect(last()).toMatchObject({ method: "get", url: "/api/me/memberships" })
		expect(last().headers["X-SWR-Request"]).toBe(true)
	})
})
