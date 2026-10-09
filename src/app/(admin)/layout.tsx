"use client"

import { useAtom } from "jotai"
import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/auth"
import { appTheme, sidebarCollapsed } from "@/_state/globalStore"
import Navbar from "@/app/(app)/_components/navbar"
import Footer from "@/_components/footer"
import AdminSidebar from "@/app/(admin)/_components/adminSidebar"
import Loading from "@/app/(app)/_components/loading"
import Breadcrumb from "@/app/(app)/_components/breadcrumb"
import LoadingBar from "@/app/(app)/_components/loadingBar"
import MessageModal from "@/_components/messageModal"
import Guard from "@/_components/guard"
import TwoFactorSection from "@/app/(app)/profile/_components/twoFactorSection"
import { useTranslation } from "next-i18next"

/**
 * Shell for the Super-Admin-only admin dashboard (/admin/*). Unlike the tenant
 * (app) shell it needs NO branch/POS context — a Super Admin lands here with no
 * tenant selected. Access is the `Super Admin` role itself; anyone else is sent
 * back to the tenant dashboard.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { t } = useTranslation('common')
    const router = useRouter()
    const pathname = usePathname()
    const [collapsed] = useAtom(sidebarCollapsed)
    const [theme, setTheme] = useAtom(appTheme)
    const { user, mutate } = useAuth({ middleware: "auth" })

    const isSuperAdmin = user?.roles?.includes('Super Admin')
    // Super Admins must have 2FA set up before they can use the admin app.
    const needsTwoFactorSetup = !!user?.two_factor_required

    useEffect(() => {
        const drawer = document.getElementById("sidebar-drawer") as HTMLInputElement
        if (drawer) drawer.checked = false
    }, [pathname])

    // Theme the whole body while inside the app (covers portaled modals).
    useEffect(() => {
        document.body.dataset.theme = theme
        return () => { delete document.body.dataset.theme }
    }, [theme])

    useEffect(() => {
        if (user?.theme) setTheme(user.theme === 'dark' ? 'gymFlyteDark' : 'gymFlyte')
    }, [user?.theme, setTheme])

    // Only Super Admins belong in the admin area.
    useEffect(() => {
        if (user && !isSuperAdmin) router.replace('/dashboard')
    }, [user, isSuperAdmin])

    if (!user || !isSuperAdmin) return <Loading />

    // Blocking screen, not a redirect: nothing else in the admin app is reachable
    // (sidebar/nav intentionally not rendered) until 2FA is confirmed, at which
    // point mutate() (fired from within TwoFactorSection) flips this off.
    if (needsTwoFactorSetup) return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-base-200">
            <div className="w-full max-w-lg">
                <h1 className="text-xl font-bold text-center mb-2">{t('twoFactor.required.title')}</h1>
                <p className="text-sm text-base-content/70 text-center mb-6">{t('twoFactor.required.message')}</p>
                <TwoFactorSection user={user} mutate={mutate} />
            </div>
        </div>
    )

    return <Guard user={user}>
        <div className="drawer min-h-screen w-full max-w-full overflow-x-clip">
            <input id="sidebar-drawer" type="checkbox" className="peer hidden" />

            <div className={`${collapsed ? 'lg:ps-16' : 'lg:ps-52'} drawer-content min-w-0 flex flex-col justify-between transition-[padding] duration-300`}>
                <div className="sticky top-0 z-40 flex flex-col">
                    <Navbar user={user} admin />
                    <LoadingBar />
                </div>
                {pathname !== '/admin/dashboard' && <Breadcrumb homeHref="/admin/dashboard" />}
                <main className="w-full min-w-0 h-full p-3">
                    <MessageModal />
                    {children}
                </main>
                <Footer minimal />
            </div>

            <label htmlFor="sidebar-drawer" className="peer-checked:block lg:hidden hidden fixed inset-0 bg-black/30 z-50" />
            <div className="
                fixed top-0 z-50 h-full bg-secondary overflow-y-auto transition-transform duration-300
                ltr:left-0 rtl:right-0
                peer-checked:translate-x-0
                lg:peer-checked:translate-x-0
                ltr:-translate-x-full rtl:translate-x-full
                lg:ltr:translate-x-0 lg:rtl:translate-x-0
            ">
                <AdminSidebar user={user} />
            </div>
        </div>
    </Guard>
}
