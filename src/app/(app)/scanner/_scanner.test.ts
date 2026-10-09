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

import { getScannedMember, addEntry } from "./_scanner"

const last = () => state.rec[state.rec.length - 1]
beforeEach(() => { state.rec.length = 0 })

describe("_scanner wrappers", () => {
	it("getScannedMember builds the qr-content + branch-scoped URL", async () => {
		await getScannedMember("QR123", 4)
		expect(last()).toMatchObject({ method: "get", url: "/api/member-qr?qr_content=QR123&branch_id=4" })
	})

	it("addEntry POSTs to the collection with the form header", async () => {
		await addEntry({})
		expect(last()).toMatchObject({ method: "post", url: "/api/member-qr" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})
})
