"use client"

import Link from "next/link"

import Logo from "@/_components/logo"
import Footer from "@/_components/footer"

export default function Layout({ children }: { children: React.ReactNode }) {
	return <>
		<main className="font-sans antialiased">
			<div className="min-h-screen relative overflow-hidden flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-gradient-to-b from-base-200 to-base-300">
				{/* Soft brand glows behind the card — same accent language as the marketing pages */}
				<div className="absolute -top-24 -start-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl" aria-hidden="true"></div>
				<div className="absolute -bottom-24 -end-24 h-96 w-96 rounded-full bg-info/20 blur-3xl" aria-hidden="true"></div>
				<div className="relative w-full sm:max-w-md my-6 px-8 py-6 bg-base-100 shadow-xl overflow-hidden sm:rounded-2xl border border-base-200">
					<div className="py-8">
						<Link href="/" className="flex justify-center">
							<Logo className="w-40" />
						</Link>
					</div>

					{children}
				</div>
				<div className="relative">
					<Footer minimal />
				</div>
			</div>
		</main>
	</>
}
