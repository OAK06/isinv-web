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

import { getActivities, getActivity } from "./_activityLog"

const last = () => state.rec[state.rec.length - 1]
beforeEach(() => { state.rec.length = 0 })

describe("_activityLog wrappers", () => {
	it("getActivities builds a paginated URL", async () => {
		await getActivities(2)
		expect(last()).toMatchObject({ method: "get", url: "/api/activityLogs?page=2" })
	})

	it("getActivity hits the show route", async () => {
		await getActivity(9)
		expect(last()).toMatchObject({ method: "get", url: "/api/activityLogs/9" })
	})
})
