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

import { getReferrals, getReferral, addReferral, editReferral, deleteReferral, bulkDeleteReferral } from "./_referral"

const last = () => state.rec[state.rec.length - 1]
beforeEach(() => { state.rec.length = 0 })

describe("_referral wrappers", () => {
	it("getReferrals builds a paginated URL; omits sort when null", async () => {
		await getReferrals(2, null as any, null as any)
		expect(last()).toMatchObject({ method: "get", url: "/api/referrals?page=2" })
	})

	it("getReferrals appends sort + direction when provided", async () => {
		await getReferrals(1, "source_name", "asc")
		expect(last().url).toBe("/api/referrals?page=1&sort=source_name&sort_direction=asc")
	})

	it("getReferral hits the show route", async () => {
		await getReferral(9)
		expect(last()).toMatchObject({ method: "get", url: "/api/referrals/9" })
	})

	it("addReferral POSTs to the collection with the form header", async () => {
		await addReferral({})
		expect(last()).toMatchObject({ method: "post", url: "/api/referrals" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("editReferral POSTs with the ?_method=PUT override and the form header", async () => {
		await editReferral(9, {})
		expect(last()).toMatchObject({ method: "post", url: "/api/referrals/9?_method=PUT" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("deleteReferral DELETEs by id", async () => {
		await deleteReferral(9)
		expect(last()).toMatchObject({ method: "delete", url: "/api/referrals/9" })
	})

	it("bulkDeleteReferral DELETEs the bulk endpoint", async () => {
		await bulkDeleteReferral({})
		expect(last()).toMatchObject({ method: "delete", url: "/api/referrals/delete/bulk" })
	})
})
