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

import {
	createMemberApplication,
	cancelPlan,
	pausePlan,
	unpausePlan,
	getGymFeatures,
	getGymBranch,
	getGymPolicy,
	getPendingApplications,
	acceptMemberTerms,
} from "./_plan"

const last = () => state.rec[state.rec.length - 1]
beforeEach(() => { state.rec.length = 0 })

describe("_plan wrappers", () => {
	it("createMemberApplication POSTs with the form header", async () => {
		await createMemberApplication({})
		expect(last()).toMatchObject({ method: "post", url: "/api/me/applications" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("cancelPlan POSTs the cancel route with the form header", async () => {
		await cancelPlan(9)
		expect(last()).toMatchObject({ method: "post", url: "/api/me/plans/9/cancel" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("pausePlan POSTs the pause route with the form header", async () => {
		await pausePlan(9, "2026-01-01", "2026-01-10")
		expect(last()).toMatchObject({ method: "post", url: "/api/me/plans/9/pause" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("unpausePlan POSTs the unpause route with the form header", async () => {
		await unpausePlan(9)
		expect(last()).toMatchObject({ method: "post", url: "/api/me/plans/9/unpause" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("getGymBranch hits /user-branches with the SWR header", async () => {
		await getGymBranch(5)
		expect(last()).toMatchObject({ method: "get", url: "/user-branches" })
		expect(last().headers["X-SWR-Request"]).toBe(true)
	})

	it("getGymFeatures delegates to getGymBranch and resolves to an empty list on an empty response", async () => {
		const features = await getGymFeatures(5)
		expect(last()).toMatchObject({ method: "get", url: "/user-branches" })
		expect(features).toEqual([])
	})

	it("getGymPolicy hits the gym-policy route without a branch code", async () => {
		await getGymPolicy(5)
		expect(last()).toMatchObject({ method: "get", url: "/api/me/gym-policy/5" })
		expect(last().headers["X-SWR-Request"]).toBe(true)
	})

	it("getGymPolicy appends an encoded branch_code when provided", async () => {
		await getGymPolicy(5, "ABC 123")
		expect(last().url).toBe("/api/me/gym-policy/5?branch_code=ABC%20123")
	})

	it("getPendingApplications hits the applications route with the SWR header", async () => {
		await getPendingApplications()
		expect(last()).toMatchObject({ method: "get", url: "/api/me/applications" })
		expect(last().headers["X-SWR-Request"]).toBe(true)
	})

	it("acceptMemberTerms POSTs with the form header", async () => {
		await acceptMemberTerms()
		expect(last()).toMatchObject({ method: "post", url: "/api/me/accept-terms" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})
})
