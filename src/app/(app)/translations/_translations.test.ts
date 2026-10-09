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

import { getTranslationOverrides, saveTranslationOverrides } from "./_translations"

const last = () => state.rec[state.rec.length - 1]
beforeEach(() => { state.rec.length = 0 })

describe("_translations wrappers", () => {
	it("getTranslationOverrides GETs the silent, branch+locale-scoped route", async () => {
		await getTranslationOverrides(7, "en")
		expect(last()).toMatchObject({ method: "get", url: "/api/translations?branch=7&locale=en" })
		expect(last().headers["X-SWR-Request"]).toBe(true)
	})

	it("saveTranslationOverrides PUTs with the form header", async () => {
		await saveTranslationOverrides(7, "en", { "hello": "hi" })
		expect(last()).toMatchObject({ method: "put", url: "/api/translations" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})
})
