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

import { getMyBookings, getPublicSessions, createPublicBooking, cancelBooking } from "./_booking"

const last = () => state.rec[state.rec.length - 1]
beforeEach(() => { state.rec.length = 0 })

describe("_booking wrappers", () => {
	it("getMyBookings builds a branch+page url with the SWR header, default page", async () => {
		await getMyBookings(5)
		expect(last()).toMatchObject({ method: "get", url: "/api/me/bookings?branch_id=5&page=1" })
		expect(last().headers["X-SWR-Request"]).toBe(true)
	})

	it("getMyBookings honors an explicit page", async () => {
		await getMyBookings(5, 3)
		expect(last().url).toBe("/api/me/bookings?branch_id=5&page=3")
	})

	it("getPublicSessions hits the public sessions route with the SWR header", async () => {
		await getPublicSessions(5, "2026-01-01", "2026-01-31")
		expect(last()).toMatchObject({ method: "get", url: "/api/public/sessions?branch_id=5" })
		expect(last().headers["X-SWR-Request"]).toBe(true)
	})

	it("createPublicBooking POSTs with the form header", async () => {
		await createPublicBooking({})
		expect(last()).toMatchObject({ method: "post", url: "/api/me/public-bookings" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("cancelBooking DELETEs by id with the form header", async () => {
		await cancelBooking(9)
		expect(last()).toMatchObject({ method: "delete", url: "/api/me/bookings/9" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})
})
