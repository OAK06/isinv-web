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

import { getBranchSettings, editBranchSettings, saveApiKeys, handleOnboarding } from "./_branchSetting"

const last = () => state.rec[state.rec.length - 1]
beforeEach(() => { state.rec.length = 0 })

describe("_branchSetting wrappers", () => {
	it("getBranchSettings GETs the branch-scoped route", async () => {
		await getBranchSettings(7)
		expect(last()).toMatchObject({ method: "get", url: "/api/branch_settings?branch_id=7" })
	})

	it("editBranchSettings POSTs to the update route with the form header", async () => {
		await editBranchSettings({})
		expect(last()).toMatchObject({ method: "post", url: "/api/branch_settings/update" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("saveApiKeys POSTs to the connect-keys route with the form header", async () => {
		await saveApiKeys({})
		expect(last()).toMatchObject({ method: "post", url: "/api/payments/connect-keys" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("handleOnboarding POSTs to the onboard route with the form header", async () => {
		await handleOnboarding({})
		expect(last()).toMatchObject({ method: "post", url: "/api/payments/onboard" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})
})
