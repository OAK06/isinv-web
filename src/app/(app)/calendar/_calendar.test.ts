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

import { getEvents, getOnlineEvents, getBranchStaff, getBranchClasses, getSession, addSession, deleteSession, searchMembers, attachMember, detachMember } from "./_calendar"

const last = () => state.rec[state.rec.length - 1]
beforeEach(() => { state.rec.length = 0 })

describe("_calendar wrappers", () => {
	it("getEvents GETs the branch-scoped sessions route", async () => {
		await getEvents(7, "2024-01-01", "2024-01-31")
		expect(last()).toMatchObject({ method: "get", url: "/api/sessions?branch_id=7" })
	})

	it("getOnlineEvents GETs the public sessions route", async () => {
		await getOnlineEvents(7, "2024-01-01", "2024-01-31")
		expect(last()).toMatchObject({ method: "get", url: "/api/public/sessions?branch_id=7" })
	})

	it("getBranchStaff GETs the branch staff route", async () => {
		await getBranchStaff(7)
		expect(last()).toMatchObject({ method: "get", url: "/api/get-branch-staff/7" })
	})

	it("getBranchClasses GETs the branch classes route", async () => {
		await getBranchClasses(7)
		expect(last()).toMatchObject({ method: "get", url: "/api/get-branch-classes/7" })
	})

	it("getSession hits the show route", async () => {
		await getSession(9)
		expect(last()).toMatchObject({ method: "get", url: "/api/sessions/9" })
	})

	it("addSession POSTs to the collection with the form header", async () => {
		await addSession({})
		expect(last()).toMatchObject({ method: "post", url: "/api/sessions" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("deleteSession DELETEs by id", async () => {
		await deleteSession(9)
		expect(last()).toMatchObject({ method: "delete", url: "/api/sessions/9" })
	})

	it("searchMembers GETs the session-scoped search route with the form header", async () => {
		await searchMembers(9, 7, "john")
		expect(last()).toMatchObject({ method: "get", url: "/api/sessions/9/members/search" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("attachMember POSTs to bookings with the form header", async () => {
		await attachMember({})
		expect(last()).toMatchObject({ method: "post", url: "/api/bookings" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("detachMember GETs the bookings/create route with the form header", async () => {
		await detachMember(9, 4, true)
		expect(last()).toMatchObject({ method: "get", url: "/api/bookings/create" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})
})
