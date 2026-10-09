"use client"

import Link from "next/link"

import { useAtom } from "jotai"
import { site } from "@/_state/globalStore"
import Logo from "@/_components/logo"
import { useTranslation } from "next-i18next"

export default function Footer({ minimal = false }: { minimal?: boolean }) {
    const { t } = useTranslation('common')
	const [siteName] = useAtom(site)
    const currentYear = new Date().getFullYear()

    if (minimal) {
        return <footer className="py-4 text-center text-sm text-base-content/50">
                <p>{t('mainFooter.copyright', {year: currentYear})} {siteName}</p>
            </footer>
    }

	return <footer className="bg-secondary text-secondary-content">
            <div className="container mx-auto px-6 py-14 flex flex-col items-center gap-6 text-center">
                <Link href="/" className="inline-block">
                    {/* Logo.svg is navy+orange — inverted to white for the dark footer */}
                    <Logo className="w-[170px] brightness-0 invert opacity-90" />
                </Link>
                <p className="max-w-xs text-sm leading-relaxed text-secondary-content/60">{t('mainFooter.tagline')}</p>
                <Link href="/login" className="text-sm text-secondary-content/70 hover:text-secondary-content transition-colors">{t('mainNavbar.loginBtn')}</Link>
            </div>
            <div className="border-t border-secondary-content/10 py-5 text-center text-sm text-secondary-content/50">
                <p>{t('mainFooter.copyright', {year: currentYear})} {siteName}</p>
            </div>
		</footer>
}
