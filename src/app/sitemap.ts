import type { MetadataRoute } from "next"

// SEO is intentionally DISABLED — no sitemap is published while the site is
// non-discoverable (internal / marketing-only). The old route + per-vertical
// entries live in git history; restore and rebuild for the glass-shop pages
// when going public. See memory: project-isinv-seo-geo-disabled.
export default function sitemap(): MetadataRoute.Sitemap {
	return []
}
