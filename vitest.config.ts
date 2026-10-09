import { defineConfig } from "vitest/config"
import path from "path"

// Minimal Vitest setup: jsdom (only validateForm needs a DOM) + the `@/` alias
// so tests import exactly like the app does. No React plugin / RTL — nothing here
// renders components; the value is in pure logic + i18n parity.
export default defineConfig({
	test: {
		environment: "jsdom",
		include: ["src/**/*.test.ts"],
	},
	resolve: {
		alias: { "@": path.resolve(__dirname, "src") },
	},
})
