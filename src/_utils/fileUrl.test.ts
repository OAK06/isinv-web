import { describe, it, expect, afterEach, vi } from "vitest"
import { fileUrl } from "./fileUrl"

describe("fileUrl", () => {
	afterEach(() => vi.unstubAllEnvs())

	it("returns empty string for missing/empty input", () => {
		expect(fileUrl()).toBe("")
		expect(fileUrl(null)).toBe("")
		expect(fileUrl("")).toBe("")
	})

	it("passes absolute http(s) URLs through untouched", () => {
		vi.stubEnv("NEXT_PUBLIC_BACKEND_URL", "https://api.example.com")
		expect(fileUrl("https://spaces.example.com/x.jpg")).toBe("https://spaces.example.com/x.jpg")
		expect(fileUrl("HTTP://spaces/x.jpg")).toBe("HTTP://spaces/x.jpg")
	})

	it("prefixes the backend URL for legacy relative paths", () => {
		vi.stubEnv("NEXT_PUBLIC_BACKEND_URL", "https://api.example.com")
		expect(fileUrl("/storage/x.jpg")).toBe("https://api.example.com/storage/x.jpg")
	})

	it("tolerates a missing backend env (empty prefix, no crash)", () => {
		vi.stubEnv("NEXT_PUBLIC_BACKEND_URL", "")
		expect(fileUrl("/storage/x.jpg")).toBe("/storage/x.jpg")
	})
})
