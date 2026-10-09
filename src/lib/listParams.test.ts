import { describe, it, expect, beforeEach } from "vitest"
import { setNextListParams, takeListParams } from "./listParams"

describe("listParams one-shot carrier", () => {
	beforeEach(() => { takeListParams() }) // drain any leftover from a prior test

	it("returns null when nothing is pending", () => {
		expect(takeListParams()).toBeNull()
	})

	it("hands back the params set just before", () => {
		setNextListParams({ per_page: 50, search: "joe" })
		expect(takeListParams()).toEqual({ per_page: 50, search: "joe" })
	})

	it("is consumed exactly once — no leak into the next request", () => {
		setNextListParams({ per_page: 25 })
		takeListParams()
		expect(takeListParams()).toBeNull()
	})

	it("a later set overwrites an unconsumed one", () => {
		setNextListParams({ per_page: 10 })
		setNextListParams({ per_page: 100 })
		expect(takeListParams()).toEqual({ per_page: 100 })
	})
})
