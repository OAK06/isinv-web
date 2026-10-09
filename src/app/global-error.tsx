"use client"

import { useEffect } from "react"

/**
 * Last-resort boundary: catches errors in the ROOT layout itself. It replaces the
 * whole document, so it must render its own <html>/<body> and can't rely on the
 * app's Tailwind/daisyUI theme or i18n provider being mounted — hence inline styles
 * and English copy (brand primary #0284c7). This should almost never render.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
	useEffect(() => {
		console.error(error)
	}, [error])

	return (
		<html>
			<body style={{ margin: 0, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, -apple-system, sans-serif", background: "#f8fafc", color: "#0f172a" }}>
				<div style={{ textAlign: "center", padding: "2rem", maxWidth: "28rem" }}>
					<h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 0.5rem" }}>Something went wrong</h1>
					<p style={{ color: "#64748b", margin: "0 0 1.5rem" }}>An unexpected error occurred. Please try again.</p>
					<button onClick={() => reset()} style={{ background: "#0284c7", color: "#fff", border: "none", padding: "0.6rem 1.4rem", borderRadius: "9999px", cursor: "pointer", fontSize: "1rem" }}>
						Try again
					</button>
				</div>
			</body>
		</html>
	)
}
