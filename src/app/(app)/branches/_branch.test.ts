import { describe, it, expect, vi, beforeEach } from "vitest"

// Depth sample #2 (member is #1): pins the mutation CONTRACT on a second entity —
// endpoint, HTTP verb, the ?_method=PUT edit override, the /delete/bulk path, and the
// X-Form-Request header on add/edit. Plain-delegate mock (see emailConflict.test.ts).
const state = vi.hoisted(() => ({ rec: [] as { method: string; url: string; headers: any }[] }))
vi.mock("@/lib/axios", () => {
	const cap = (method: string) => (url: string, ...rest: any[]) => {
		const cfg = rest.find(x => x && typeof x === "object" && "headers" in x)
		state.rec.push({ method, url, headers: cfg?.headers ?? {} })
		return Promise.resolve({ data: {} })
	}
	return { default: { get: cap("get"), post: cap("post"), put: cap("put"), delete: cap("delete") } }
})

import { getBranches, getBranch, addBranch, editBranch, deleteBranch, bulkDeleteBranch } from "./_branch"

const last = () => state.rec[state.rec.length - 1]
beforeEach(() => { state.rec.length = 0 })

describe("_branch wrappers", () => {
	it("getBranches builds a paginated, branch-scoped URL; omits sort when null", async () => {
		await getBranches(2, 7, null as any, null as any)
		expect(last()).toMatchObject({ method: "get", url: "/api/branches?page=2&branch_id=7" })
	})

	it("getBranches appends sort + direction when provided", async () => {
		await getBranches(1, 3, "name", "asc")
		expect(last().url).toBe("/api/branches?page=1&branch_id=3&sort=name&sort_direction=asc")
	})

	it("getBranch hits the show route", async () => {
		await getBranch(9)
		expect(last()).toMatchObject({ method: "get", url: "/api/branches/9" })
	})

	it("addBranch POSTs to the collection with the form header", async () => {
		await addBranch({})
		expect(last()).toMatchObject({ method: "post", url: "/api/branches" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("editBranch POSTs with the ?_method=PUT override and the form header", async () => {
		await editBranch(9, {})
		expect(last()).toMatchObject({ method: "post", url: "/api/branches/9?_method=PUT" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("deleteBranch DELETEs by id", async () => {
		await deleteBranch(9)
		expect(last()).toMatchObject({ method: "delete", url: "/api/branches/9" })
	})

	it("bulkDeleteBranch DELETEs the bulk endpoint", async () => {
		await bulkDeleteBranch({})
		expect(last()).toMatchObject({ method: "delete", url: "/api/branches/delete/bulk" })
	})
})
