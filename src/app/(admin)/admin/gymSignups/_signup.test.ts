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

import { getSignups, getSignup, editSignup } from "./_signup"

const last = () => state.rec[state.rec.length - 1]
beforeEach(() => { state.rec.length = 0 })

describe("_signup wrappers", () => {
	it("getSignups builds a paginated URL; omits sort when null", async () => {
		await getSignups(2, null as any, null as any)
		expect(last()).toMatchObject({ method: "get", url: "/api/signups?page=2" })
	})

	it("getSignups appends sort + direction when provided", async () => {
		await getSignups(1, "email", "desc")
		expect(last().url).toBe("/api/signups?page=1&sort=email&sort_direction=desc")
	})

	it("getSignup hits the show route", async () => {
		await getSignup(9)
		expect(last()).toMatchObject({ method: "get", url: "/api/signups/9" })
	})

	it("editSignup POSTs with the ?_method=PUT override and the form header", async () => {
		await editSignup(9, {})
		expect(last()).toMatchObject({ method: "post", url: "/api/signups/9?_method=PUT" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})
})
