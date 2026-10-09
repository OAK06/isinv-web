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

import { getArchived, restoreArchived, eraseArchived } from "./_archive"

const last = () => state.rec[state.rec.length - 1]
beforeEach(() => { state.rec.length = 0 })

describe("_archive wrappers", () => {
	it("getArchived builds a paginated URL; omits branch_id when not provided", async () => {
		await getArchived("products", 2)
		expect(last()).toMatchObject({ method: "get", url: "/api/admin/archive/products?page=2" })
	})

	it("getArchived appends branch_id when provided", async () => {
		await getArchived("work-orders", 1, 7)
		expect(last().url).toBe("/api/admin/archive/work-orders?page=1&branch_id=7")
	})

	it("restoreArchived POSTs to the restore action route with the form header", async () => {
		await restoreArchived("suppliers", 9)
		expect(last()).toMatchObject({ method: "post", url: "/api/admin/archive/suppliers/9/restore" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("eraseArchived DELETEs by entity + id", async () => {
		await eraseArchived("stocktakes", 9)
		expect(last()).toMatchObject({ method: "delete", url: "/api/admin/archive/stocktakes/9" })
	})
})
