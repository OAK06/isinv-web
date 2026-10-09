import { describe, it, expect, vi } from "vitest"

// Breadth test over EVERY per-entity `_<entity>.ts` wrapper (~59 of them). Each wrapper
// hand-builds its own URL, so each can break independently (a fluffed template →
// `/api/undefined`, a missing `/api`, a wrong method). Rather than restate ~200 URLs by
// hand, we import all wrappers, call each exported fn with dummy scalar args (all URL
// interpolations in this layer are bare scalars — ${id}/${branchID}/…, never object
// fields), and assert every resulting URL is well-formed. Contract specifics (X-Form
// header, ?_method=PUT) are pinned per-entity in _member.test.ts / _branch.test.ts.

const h = vi.hoisted(() => {
	const calls: { method: string; url: string; headers: any }[] = []
	const rec = (method: string) => (...args: any[]) => {
		const cfg = args.slice(1).find(x => x && typeof x === "object" && "headers" in x)
		calls.push({ method, url: String(args[0]), headers: cfg?.headers ?? {} })
		return Promise.resolve({ data: {} })
	}
	return { calls, rec }
})
vi.mock("@/lib/axios", () => ({
	default: { get: h.rec("get"), post: h.rec("post"), put: h.rec("put"), delete: h.rec("delete"), patch: h.rec("patch") },
}))
const calls = h.calls

// eager import of all wrappers, excluding the colocated *.test.ts files.
const modules = (import.meta as any).glob(["../app/**/_*.ts", "!**/*.test.ts"], { eager: true }) as Record<string, any>

describe("API wrapper URL sanity (all entity wrappers)", () => {
	it("discovered the wrapper layer", () => {
		expect(Object.keys(modules).length).toBeGreaterThan(40)
	})

	it("every wrapper builds a well-formed URL (no undefined/NaN/unrendered template/malformed)", async () => {
		for (const mod of Object.values(modules)) {
			for (const fn of Object.values(mod)) {
				if (typeof fn !== "function") continue
				// URL is captured synchronously in the mock before any .then() transform runs,
				// so a transform choking on the empty mock payload can't hide the URL. Pure
				// non-axios helpers may throw on dummy args — irrelevant, we only assert URLs.
				try {
					const r = (fn as any)(1, 2, 3, 4, 5, 6)
					if (r && typeof r.then === "function") await r.catch(() => {})
				} catch { /* sync-throwing helper, not a request builder */ }
			}
		}
		expect(calls.length).toBeGreaterThan(0)

		const malformed = calls.filter(c =>
			!c.url.startsWith("/") ||          // must be a root-relative path
			/undefined|NaN|\$\{/.test(c.url) || // unrendered / undefined interpolation
			/\/\/{1,}/.test(c.url.replace(/^https?:\/\//, "")) || // accidental double slash
			/\s/.test(c.url)                    // stray whitespace
		)
		expect(malformed.map(c => `${c.method.toUpperCase()} ${c.url}`)).toEqual([])
	})

	it("Laravel PUT-override calls use POST (Sanctum's ?_method=PUT convention)", () => {
		const wrongVerb = calls.filter(c => c.url.includes("_method=PUT") && c.method !== "post")
		expect(wrongVerb.map(c => `${c.method.toUpperCase()} ${c.url}`)).toEqual([])
	})
})
