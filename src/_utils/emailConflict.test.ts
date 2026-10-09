import { describe, it, expect, vi, beforeEach } from "vitest"

// The mocked axios `.get` delegates to a swappable `state.get`. Happy-path tests
// point it at a vi.fn (to assert call args); the fail-open test points it at a
// PLAIN function returning a rejection — routing the rejection through a spy trips
// Vitest v4's settled-result tracking (fulfill-only handler → false "unhandled").
const state = vi.hoisted(() => ({ get: (..._a: any[]): any => Promise.resolve({ data: {} }) }))
vi.mock("@/lib/axios", () => ({ default: { get: (...a: any[]) => state.get(...a) } }))

import { checkEmailPublic, checkEmailStaff } from "./emailConflict"

describe("emailConflict", () => {
	beforeEach(() => { state.get = () => Promise.resolve({ data: {} }) })

	it("checkEmailPublic returns the API payload from the public endpoint", async () => {
		const spy = vi.fn().mockResolvedValue({ data: { exists: true } })
		state.get = spy
		await expect(checkEmailPublic("a@b.co")).resolves.toEqual({ exists: true })
		expect(spy).toHaveBeenCalledWith(
			expect.stringContaining("/api/public/check-email?email=a%40b.co"),
			expect.anything(),
		)
	})

	it("fails open (exists:false) when the request throws", async () => {
		state.get = () => Promise.reject(new Error("network"))
		await expect(checkEmailPublic("a@b.co")).resolves.toEqual({ exists: false })
	})

	it("checkEmailStaff hits the authed endpoint and returns the holder name", async () => {
		const spy = vi.fn().mockResolvedValue({ data: { exists: true, name: "Joe" } })
		state.get = spy
		await expect(checkEmailStaff("a@b.co")).resolves.toEqual({ exists: true, name: "Joe" })
		expect(spy).toHaveBeenCalledWith(
			expect.stringContaining("/api/check-email?email=a%40b.co"),
			expect.anything(),
		)
	})
})
