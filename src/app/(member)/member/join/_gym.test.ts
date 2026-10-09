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

import { getHashedBranch, getGyms, joinGym } from "./_gym"

const last = () => state.rec[state.rec.length - 1]
beforeEach(() => { state.rec.length = 0 })

describe("_gym wrappers", () => {
	it("getHashedBranch (re-exported) hits the hashed-branch route", async () => {
		await getHashedBranch("hash1")
		expect(last()).toMatchObject({ method: "get", url: "/api/get-hashed-branch/hash1" })
	})

	it("getGyms hits the directory route with an empty search by default", async () => {
		await getGyms().catch(() => {})
		expect(last()).toMatchObject({ method: "get", url: "/api/me/gyms?search=" })
		expect(last().headers["X-SWR-Request"]).toBe(true)
	})

	it("getGyms URL-encodes an explicit search term", async () => {
		await getGyms("cross fit").catch(() => {})
		expect(last().url).toBe("/api/me/gyms?search=cross%20fit")
	})

	it("joinGym POSTs with the form header", async () => {
		await joinGym({})
		expect(last()).toMatchObject({ method: "post", url: "/api/me/join" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})
})
