import { describe, it, expect, beforeEach, vi } from "vitest"
import Axios from "axios"
import axios from "./axios"
import { store, requestCount, validationErrors, responseMessage } from "@/_state/globalStore"
import { setNextListParams, takeListParams } from "@/lib/listParams"

// Stub i18n (its real init require()s locale JSON via a webpack-only `@` alias).
// Real locale content is covered by localeParity.test.ts; here we only need t/exists.
vi.mock("@/i18n/client", () => ({
	default: {
		t: (key: string) => `t:${key}`,
		exists: (key: string) => key === "apiErrors.demo_mode",
	},
}))

// Integration test of the REAL configured axios instance (interceptors + real jotai
// store + real i18n). We swap the network adapter for a fake so we can drive any
// response/error shape and observe the store side-effects the interceptors produce.

/** Adapter that resolves with a 2xx response. */
const ok = (data: any = {}) => (config: any) =>
	Promise.resolve({ data, status: 200, statusText: "OK", headers: {}, config })

/** Adapter that rejects with an axios-style HTTP error (has `.response`). */
const httpError = (status: number, data: any = {}) => (config: any) =>
	Promise.reject(Object.assign(new Error("http"), {
		isAxiosError: true, config, response: { status, data, headers: {}, statusText: "" },
	}))

/** Adapter that rejects with no `.response` (network/CORS failure). */
const networkError = () => (config: any) =>
	Promise.reject(Object.assign(new Error("Network Error"), { isAxiosError: true, config, response: undefined }))

const setAdapter = (a: any) => { axios.defaults.adapter = a }
const setPath = (pathname: string) =>
	Object.defineProperty(window, "location", { configurable: true, writable: true, value: { pathname } })

beforeEach(() => {
	store.set(requestCount, 0)
	store.set(validationErrors, {})
	store.set(responseMessage, { type: null, text: null })
	takeListParams() // drain any one-shot list params left pending by a prior test
	setPath("/dashboard")
})

describe("axios loading-bar counter (requestCount)", () => {
	it("returns to 0 after a successful request", async () => {
		setAdapter(ok())
		await axios.get("/api/x")
		expect(store.get(requestCount)).toBe(0)
	})

	it("returns to 0 (never negative, never stuck) after every error status", async () => {
		for (const status of [400, 401, 403, 404, 422, 500]) {
			store.set(requestCount, 0)
			setAdapter(httpError(status))
			await axios.get("/api/x").catch(() => {})
			expect(store.get(requestCount), `status ${status}`).toBe(0)
		}
	})

	it("returns to 0 after a connectionless (no-response) error", async () => {
		setAdapter(networkError())
		await axios.get("/api/x").catch(() => {})
		expect(store.get(requestCount)).toBe(0)
	})

	it("leaves the counter untouched for X-Form-Request (success and error)", async () => {
		store.set(requestCount, 5)
		setAdapter(ok())
		await axios.get("/api/x", { headers: { "X-Form-Request": true } })
		expect(store.get(requestCount)).toBe(5)

		setAdapter(httpError(422))
		await axios.get("/api/x", { headers: { "X-Form-Request": true } }).catch(() => {})
		expect(store.get(requestCount)).toBe(5)
	})

	it("net-zeros a cancelled request without a toast", async () => {
		setAdapter((config: any) => Promise.reject(new Axios.Cancel("navigation")))
		await axios.get("/api/x").catch(() => {})
		expect(store.get(requestCount)).toBe(0)
		expect(store.get(responseMessage)).toEqual({ type: null, text: null })
	})
})

describe("axios validation errors (422)", () => {
	it("stores the errors payload", async () => {
		setAdapter(httpError(422, { errors: { email: ["taken"] } }))
		await axios.get("/api/x").catch(() => {})
		expect(store.get(validationErrors)).toEqual({ email: ["taken"] })
	})

	it("falls back to {} (never undefined) when no errors payload is present", async () => {
		store.set(validationErrors, { stale: true })
		setAdapter(httpError(422, {}))
		await axios.get("/api/x").catch(() => {})
		expect(store.get(validationErrors)).toEqual({})
	})

	it("resets prior validation errors at the start of a non-silent request", async () => {
		store.set(validationErrors, { old: ["x"] })
		setAdapter(ok())
		await axios.get("/api/x")
		expect(store.get(validationErrors)).toEqual({})
	})
})

describe("axios silent (X-SWR-Request) requests", () => {
	it("does NOT reset validation errors", async () => {
		store.set(validationErrors, { keep: ["1"] })
		setAdapter(ok())
		await axios.get("/api/x", { headers: { "X-SWR-Request": true } })
		expect(store.get(validationErrors)).toEqual({ keep: ["1"] })
	})

	it("does NOT show an error toast on failure", async () => {
		setAdapter(httpError(404))
		await axios.get("/api/x", { headers: { "X-SWR-Request": true } }).catch(() => {})
		expect(store.get(responseMessage)).toEqual({ type: null, text: null })
	})
})

describe("axios error routing", () => {
	it("401 redirects to /login", async () => {
		setPath("/members")
		setAdapter(httpError(401))
		await axios.get("/api/x").catch(() => {})
		expect(window.location.pathname).toBe("/login")
	})

	it("401 does not re-navigate when already on /login", async () => {
		setPath("/login")
		setAdapter(httpError(401))
		await axios.get("/api/x").catch(() => {})
		expect(window.location.pathname).toBe("/login")
	})

	it("403 shows the message but never navigates", async () => {
		setPath("/members")
		setAdapter(httpError(403, { message: "nope" }))
		await axios.get("/api/x").catch(() => {})
		expect(store.get(responseMessage)).toEqual({ type: "error", text: "nope" })
		expect(window.location.pathname).toBe("/members")
	})

	it("400 with a known code maps to a translated message (not the raw one)", async () => {
		setAdapter(httpError(400, { code: "demo_mode", message: "RAW" }))
		await axios.get("/api/x").catch(() => {})
		expect(store.get(responseMessage).text).not.toBe("RAW")
		expect(store.get(responseMessage).type).toBe("error")
	})

	it("400 with an unknown code falls back to the raw message", async () => {
		setAdapter(httpError(400, { code: "zzz_unknown", message: "RAW" }))
		await axios.get("/api/x").catch(() => {})
		expect(store.get(responseMessage).text).toBe("RAW")
	})
})

describe("axios BaseTable list-param injection", () => {
	let captured = ""
	const capture = (config: any) => {
		captured = config.url
		return Promise.resolve({ data: {}, status: 200, statusText: "OK", headers: {}, config })
	}

	it("appends one-shot per_page/search onto the next page= request only", async () => {
		setAdapter(capture)
		setNextListParams({ per_page: 50, search: "jo hn" })
		await axios.get("/api/members?page=1")
		expect(captured).toContain("per_page=50")
		expect(captured).toContain("search=jo%20hn")

		// One-shot: the following request must not inherit them.
		captured = ""
		await axios.get("/api/members?page=2")
		expect(captured).not.toContain("per_page")
		expect(captured).not.toContain("search")
	})

	it("ignores list params for non-paginated URLs", async () => {
		setAdapter(capture)
		setNextListParams({ per_page: 99 })
		await axios.get("/api/members/1")
		expect(captured).not.toContain("per_page")
	})
})
