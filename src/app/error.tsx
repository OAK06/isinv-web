"use client"

import { useEffect } from "react"
import i18n from "@/i18n/client"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTriangleExclamation, faRotateRight } from "@fortawesome/free-solid-svg-icons"

/**
 * Route-segment error boundary (App Router). Catches render/runtime errors thrown
 * below the root layout and shows a branded fallback instead of a blank screen.
 * `reset()` re-renders the failed segment. i18n via the client instance with English
 * defaults so it still reads correctly even if translations aren't ready.
 */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
	useEffect(() => {
		// Single funnel for whatever monitoring gets wired later (e.g. Sentry).
		console.error(error)
	}, [error])

	const t = (key: string, fallback: string) => i18n.t(key, { defaultValue: fallback }) as string

	return (
		<div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-6 text-center">
			<span className="text-accent text-5xl">
				<FontAwesomeIcon icon={faTriangleExclamation} />
			</span>
			<div className="space-y-2">
				<h1 className="text-2xl md:text-3xl font-heading font-bold text-base-content">
					{t("errorBoundary.title", "Something went wrong")}
				</h1>
				<p className="text-base-content/60 max-w-md">
					{t("errorBoundary.body", "An unexpected error occurred. You can try again, and if it keeps happening please contact support.")}
				</p>
			</div>
			<button onClick={() => reset()} className="btn btn-primary rounded-full gap-2">
				<FontAwesomeIcon icon={faRotateRight} />
				{t("errorBoundary.retry", "Try again")}
			</button>
		</div>
	)
}
