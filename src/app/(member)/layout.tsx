"use client"

import { useAtom } from "jotai"
import { useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useTranslation } from "next-i18next"
import { useAuth } from "@/hooks/auth"
import { appTheme } from "@/_state/globalStore"
import Navbar from "@/app/(app)/_components/navbar"
import Footer from "@/_components/footer"
import Loading from "@/app/(app)/_components/loading"
import Breadcrumb from "@/app/(app)/_components/breadcrumb"
import LoadingBar from "@/app/(app)/_components/loadingBar"
import MessageModal from "@/_components/messageModal"
import MemberTermsGate from "@/app/(member)/_components/memberTermsGate"

/**
 * Shell for the member self-service portal (/member/*). Like the (admin) shell it
 * is a second authenticated area with NO branch/POS/subscription tenant context —
 * a member can belong to several gyms at once and picks the active one inside the
 * portal (the `activeMembership` atom). Access is "is a pure member": holds no
 * staff/owner role and has at least one membership. Staff/owners/Super Admins are
 * sent back to the tenant app. No Guard/permission gating — members have no
 * `permissions` array; auth + the member check here is the gate.
 */
const NAV = [
    { href: '/member', key: 'overview', exact: true },
    { href: '/member/memberships', key: 'memberships', exact: false },
    { href: '/member/bookings', key: 'bookings', exact: false },
    { href: '/member/bills', key: 'bills', exact: false },
    { href: '/member/payment-methods', key: 'paymentMethods', exact: false },
    { href: '/member/profile', key: 'profile', exact: false },
    { href: '/member/help', key: 'help', exact: false },
]

export default function MemberLayout({ children }: { children: React.ReactNode }) {
    const { t } = useTranslation('common')
    const router = useRouter()
    const pathname = usePathname()
    const [theme, setTheme] = useAtom(appTheme)
    const { user } = useAuth({ middleware: "auth" })

    // The member portal is gym-independent: ANY authenticated user can switch into it
    // (a membership is only ever created when they subscribe to a plan, not by "entering"
    // the portal). Pure members land here by default; staff/owners switch in from the
    // navbar. Only a Super Admin is redirected away — they belong in the admin area.
    const isSuperAdmin = user?.roles?.includes('Super Admin')

    // Theme the whole body while inside the portal (covers portaled modals).
    useEffect(() => {
        document.body.dataset.theme = theme
        return () => { delete document.body.dataset.theme }
    }, [theme])

    useEffect(() => {
        if (user?.theme) setTheme(user.theme === 'dark' ? 'gymFlyteDark' : 'gymFlyte')
    }, [user?.theme, setTheme])

    // Super Admins belong in the admin area, not the member portal.
    useEffect(() => {
        if (isSuperAdmin) router.replace('/admin/dashboard')
    }, [isSuperAdmin])

    // Close the mobile nav drawer on navigation.
    useEffect(() => {
        const d = document.getElementById('member-drawer') as HTMLInputElement
        if (d) d.checked = false
    }, [pathname])

    if (!user || isSuperAdmin) return <Loading />

    // First-login gate: must accept GymFlyte's member terms before using the portal.
    if (!user.member_terms_accepted) return <MemberTermsGate />

    return <div className="drawer min-h-screen w-full max-w-full overflow-x-clip">
        <input id="member-drawer" type="checkbox" className="drawer-toggle" />

        <div className="drawer-content min-w-0 flex flex-col justify-between">
            <div className="sticky top-0 z-40 flex flex-col bg-base-100">
                <Navbar user={user} member />
                <LoadingBar />
                {/* Desktop: horizontal tab nav. Small screens use the drawer below. */}
                <nav className="hidden lg:block bg-base-100 border-b border-base-200">
                    <div className="flex gap-1 overflow-x-auto px-3">
                        {NAV.map((item) => {
                            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
                            return <Link
                                key={item.href}
                                href={item.href}
                                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${active ? 'border-primary text-primary' : 'border-transparent text-base-content/60 hover:text-base-content'}`}
                            >
                                {t(`memberPortal.nav.${item.key}`)}
                            </Link>
                        })}
                    </div>
                </nav>
            </div>
            {pathname !== '/member' && <Breadcrumb homeHref="/member" />}
            <main className="w-full min-w-0 h-full p-3">
                <MessageModal />
                {children}
            </main>
            <Footer minimal />
        </div>

        {/* Small-screen nav drawer (opened by the navbar hamburger). */}
        <div className="drawer-side z-50">
            <label htmlFor="member-drawer" aria-label="close" className="drawer-overlay"></label>
            <ul className="menu bg-base-100 min-h-full w-64 p-4 gap-1">
                {NAV.map((item) => {
                    const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
                    return <li key={item.href}>
                        <Link href={item.href} className={active ? 'active font-medium' : ''}>
                            {t(`memberPortal.nav.${item.key}`)}
                        </Link>
                    </li>
                })}
            </ul>
        </div>
    </div>
}
