"use client"

import { useAtom } from "jotai"
import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/auth"
import { appTheme, branch, posRegister, sidebarCollapsed } from "@/_state/globalStore"
import Navbar from "@/app/(app)/_components/navbar"
import Footer from "@/_components/footer"
import Sidebar from "@/app/(app)/_components/sidebar"
import Loading from "@/app/(app)/_components/loading"
import Breadcrumb from "@/app/(app)/_components/breadcrumb"
import LoadingBar from "@/app/(app)/_components/loadingBar"
import MessageModal from "@/_components/messageModal"
import { useRouter } from "next/navigation"
import Guard from "@/_components/guard"
import { cancelPendingRequests } from "@/lib/axios"
import SubscriptionBanner from "@/app/(app)/_components/subscriptionBanner"
import SuperAdminBanner from "@/app/(app)/_components/superAdminBanner"
import TranslationOverridesLoader from "@/app/(app)/_components/translationOverridesLoader"
import { useTranslation } from "next-i18next"

export default function AppLayout({ children }: { children: React.ReactNode }) {
	const router = useRouter()
	const [ branchID ] = useAtom(branch)
	const [ posRegisterID ] = useAtom(posRegister)
	const [ collapsed ] = useAtom(sidebarCollapsed)
	const [ theme, setTheme ] = useAtom(appTheme)
	const { user } = useAuth({ middleware: "auth" })

	const pathname = usePathname()
    useEffect(() => {
        const drawer = document.getElementById("sidebar-drawer") as HTMLInputElement
        if (drawer) drawer.checked = false
        // Abort the leaving page's in-flight data requests before the next page
        // mounts (cleanup runs before the new page's effects), so its loads
        // aren't queued behind now-irrelevant ones.
        return () => cancelPendingRequests()
    }, [pathname])

    const needsBranch = branchID === -1
    const needsPosRegister = !needsBranch && !!user?.pos_registers?.length && posRegisterID === -1

    // Theme the whole body while inside the app (covers portaled modals);
    // restored on unmount so the public site keeps the light theme.
    useEffect(() => {
        document.body.dataset.theme = theme
        return () => { delete document.body.dataset.theme }
    }, [theme])

    // Sync Jotai store with user theme preference delivered via useAuth
    useEffect(() => {
        if (user?.theme) {
            setTheme(user.theme === 'dark' ? 'gymFlyteDark' : 'gymFlyte')
        }
    }, [user?.theme, setTheme])
    // Note: the user's saved language is applied centrally in useAuth, so it
    // takes effect as early as choose-branch — not only here.

    useEffect(() => {
        if (!user) return
        if (needsBranch) router.replace('/choose-branch')
        else if (needsPosRegister) router.replace('/choose-pos-register')
    }, [user, needsBranch, needsPosRegister])

    // Subscription lock: unpaid new signups (pendingPayment), expired trials and
    // failed renewals send owners to the billing page to pay/retry; other staff
    // get a notice and can't work. Super Admins are never locked.
    // Disabled for this single-tenant shop — platform subscriptions are out of scope
    // (flip SUBSCRIPTIONS_ENABLED to restore the paywall).
    const SUBSCRIPTIONS_ENABLED = false
    const subscriptionLocked =
        SUBSCRIPTIONS_ENABLED
        && !user?.roles?.includes('Super Admin')
        && ['pendingPayment', 'pastDue', 'suspended', 'canceled'].includes(user?.subscription?.status)
    const canViewBilling = user?.permissions?.includes('view billing')
    const redirectingToBilling = subscriptionLocked && canViewBilling && pathname !== '/billing'

    useEffect(() => {
        if (redirectingToBilling) router.replace('/billing')
    }, [redirectingToBilling])

	if (!user || needsBranch || needsPosRegister || redirectingToBilling) return <Loading />

	return <Guard user={user}>
        <TranslationOverridesLoader />
        <div className="drawer min-h-screen w-full max-w-full overflow-x-clip">
			<input id="sidebar-drawer" type="checkbox" className="peer hidden" />

			<div className={`${collapsed ? 'lg:ps-16' : 'lg:ps-52'} drawer-content min-w-0 flex flex-col justify-between transition-[padding] duration-300`}>
				<div className="sticky top-0 z-40 flex flex-col">
					<Navbar user={user} />
					<LoadingBar />
				</div>
				{user?.roles?.includes('Super Admin') && <SuperAdminBanner />}
				{SUBSCRIPTIONS_ENABLED && <SubscriptionBanner user={user} />}
				{pathname !== '/dashboard' && <Breadcrumb />}
				<main className={`w-full min-w-0 h-full p-3 ${pathname == '/dashboard' ? 'bg-base-200/50' : ''}`}>
					<MessageModal />
					{subscriptionLocked && !canViewBilling
						? <LockNotice />
						: children}
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
				<Sidebar user={user} />
			</div>
        </div>
    </Guard>
}

/** Shown to non-owner staff while the company's subscription is inactive. */
function LockNotice() {
	const { t } = useTranslation('common')
	return (
		<div className="flex items-center justify-center min-h-[50vh]">
			<div className="card bg-base-100 border border-base-300 shadow-md max-w-md text-center">
				<div className="card-body items-center">
					<h2 className="card-title">{t('subscriptionLock.title')}</h2>
					<p className="text-base-content/70">{t('subscriptionLock.message')}</p>
				</div>
			</div>
		</div>
	)
}
