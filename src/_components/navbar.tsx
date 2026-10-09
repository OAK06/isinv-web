"use client"

import Link from "next/link"

import Logo from "@/_components/logo"
import { useTranslation } from "next-i18next"
import LanguageSwitcher from "@/app/(app)/_components/languageSwitcher"

export default function Navbar() {
    const { t } = useTranslation('common')

    return <nav className="sticky top-0 z-50 navbar px-5 md:px-10 lg:px-20 bg-base-100/85 backdrop-blur border-b border-base-200 flex justify-between items-center">
        <Link href="/" className="shrink-0">
            <Logo className="w-28 sm:w-[170px]" />
        </Link>

        <div className="flex items-center gap-4 sm:gap-6">
            <LanguageSwitcher />
            <Link href="/login" className="font-bold hover:text-primary transition-colors">{t('mainNavbar.loginBtn')}</Link>
        </div>
    </nav>
}
