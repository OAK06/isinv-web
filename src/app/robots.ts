import type { MetadataRoute } from "next"

// SEO is intentionally DISABLED — the site is not meant to be discoverable yet
// (internal / marketing-only). This blocks ALL crawlers (search + AI). The old
// marketing allowlist + AI-crawler rules live in git history and are documented
// for re-enabling in memory: project-isinv-seo-geo-disabled.
export default function robots(): MetadataRoute.Robots {
	return {
		rules: [{ userAgent: "*", disallow: "/" }],
	}
}
