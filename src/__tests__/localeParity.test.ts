import { describe, it, expect } from "vitest"
import fs from "fs"
import path from "path"

// Enforces Hard Rule #4: every UI string key exists in ALL supported locales.
// Scope reduced to en + ar for the IS Inventory build (other locales dropped).
const LOCALES = ["en", "ar"]
const dir = path.resolve(__dirname, "../../public/locales")

function flatten(obj: any, prefix = "", out: Set<string> = new Set()): Set<string> {
	for (const [k, v] of Object.entries(obj)) {
		const key = prefix ? `${prefix}.${k}` : k
		if (v && typeof v === "object" && !Array.isArray(v)) flatten(v, key, out)
		else out.add(key)
	}
	return out
}

const keysByLocale: Record<string, Set<string>> = Object.fromEntries(
	LOCALES.map(l => [
		l,
		flatten(JSON.parse(fs.readFileSync(path.join(dir, l, "common.json"), "utf8"))),
	]),
)

describe("i18n locale key parity (hard rule #4)", () => {
	const ref = keysByLocale.en

	it("every locale has the same key count as en", () => {
		for (const l of LOCALES) {
			expect(keysByLocale[l].size, `${l} key count`).toBe(ref.size)
		}
	})

	for (const l of LOCALES.filter(x => x !== "en")) {
		it(`${l} matches en key-for-key`, () => {
			const missing = Array.from(ref).filter(k => !keysByLocale[l].has(k))
			const extra = Array.from(keysByLocale[l]).filter(k => !ref.has(k))
			expect({ missing, extra }).toEqual({ missing: [], extra: [] })
		})
	}
})
