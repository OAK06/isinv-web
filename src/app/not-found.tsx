import Link from "next/link"
import Logo from "@/_components/logo"
import NotFoundMessage from "@/_components/notFoundMessage"

// Server component on purpose: the root not-found is dual-compiled by Next into
// the pages-router 404 boundary, where `next/headers` isn't allowed. Keeping this
// shell a server component with NO serverTranslation import (translated copy lives
// in the <NotFoundMessage> client child) keeps next/headers out of the not-found
// module graph while staying the shape Next expects for the root not-found.
export default function NotFound() {
	return <main className="marketing relative min-h-screen overflow-hidden bg-base-100 flex items-center justify-center px-6">
			<div className="absolute -top-24 -start-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl" aria-hidden="true"></div>
			<div className="absolute -bottom-24 -end-24 h-96 w-96 rounded-full bg-info/20 blur-3xl" aria-hidden="true"></div>
			<div className="relative text-center py-16">
				<Link href="/" className="inline-block mb-10">
					<Logo className="w-40 mx-auto" />
				</Link>
				<p className="text-7xl md:text-8xl font-bold font-heading text-primary mb-4">404</p>
				<NotFoundMessage />
			</div>
		</main>
}
