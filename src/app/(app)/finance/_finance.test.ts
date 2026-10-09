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

import { getAccountMappings, saveAccountMappings, exportJournal } from "./_finance"

const last = () => state.rec[state.rec.length - 1]
beforeEach(() => { state.rec.length = 0 })

describe("_finance wrappers", () => {
	it("getAccountMappings GETs the branch-scoped route silently (X-SWR-Request)", async () => {
		await getAccountMappings(7)
		expect(last()).toMatchObject({ method: "get", url: "/api/finance/account-mappings?branch=7" })
		expect(last().headers["X-SWR-Request"]).toBe(true)
	})

	it("saveAccountMappings PUTs with the form header", async () => {
		await saveAccountMappings(7, [])
		expect(last()).toMatchObject({ method: "put", url: "/api/finance/account-mappings" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("exportJournal GETs the date-ranged export route with the form header", async () => {
		await exportJournal(7, "2024-01-01", "2024-01-31").catch(() => {})
		expect(last()).toMatchObject({ method: "get", url: "/api/finance/export?branch=7&from=2024-01-01&to=2024-01-31" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})
})
