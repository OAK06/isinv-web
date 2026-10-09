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

import { getMyReports, getReportsAccess, saveReportsAccess } from "./_reportsAccess"

const last = () => state.rec[state.rec.length - 1]
beforeEach(() => { state.rec.length = 0 })

describe("_reportsAccess wrappers", () => {
	it("getMyReports GETs silently via X-SWR-Request", async () => {
		await getMyReports(4)
		expect(last()).toMatchObject({ method: "get", url: "/api/my-reports?branch_id=4" })
		expect(last().headers["X-SWR-Request"]).toBe(true)
	})

	it("getReportsAccess builds the branch-scoped URL", async () => {
		await getReportsAccess(4)
		expect(last()).toMatchObject({ method: "get", url: "/api/reports-access?branch=4" })
	})

	it("saveReportsAccess PUTs with the form header", async () => {
		await saveReportsAccess(4, 2, ["revenue"])
		expect(last()).toMatchObject({ method: "put", url: "/api/reports-access" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})
})
