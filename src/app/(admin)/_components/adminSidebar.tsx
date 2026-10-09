import Link from "next/link"
import { usePathname } from "next/navigation"
import LogoWhite from "@/_components/logoWhite"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faAnglesLeft, faAnglesRight, faArrowRightArrowLeft, faBoxArchive, faBuilding, faClipboardList, faCubes, faFileLines, faGaugeHigh, faGear, faKey, faMoneyCheckDollar, faRectangleList, faShareNodes, faTags, faUsers } from "@fortawesome/free-solid-svg-icons"
import { useTranslation } from "next-i18next"
import { useAtom } from "jotai"
import { sidebarCollapsed } from "@/_state/globalStore"

/**
 * Sidebar for the Super-Admin-only admin dashboard. Flat list of platform
 * management links (all under /admin/*), gate-kept away from the tenant shell so
 * admin and tenant surfaces never overlap. Mirrors the tenant sidebar's visual
 * language (bg-secondary, collapse rail) intentionally.
 */
export default function AdminSidebar({ user }) {
    const { t } = useTranslation('common')
    const pathname = usePathname()
    const [collapsed, setCollapsed] = useAtom(sidebarCollapsed)

    const can = (perm: string) => user.permissions.includes(perm)
    // SaaS-platform / gym admin pages (signups, referrals, plans, addons,
    // subscriptions, demo tenants) are out of scope for this single-tenant shop.
    // Backend + pages stay intact; flip to restore. See memory: project-isinv-conversion-decision.
    const SAAS_ADMIN = false

    const nav = [
        { href: '/admin/dashboard', icon: faGaugeHigh, label: t('sidebar.adminDashboard'), show: true },
        { href: '/admin/tenants', icon: faArrowRightArrowLeft, label: t('sidebar.tenants'), show: SAAS_ADMIN },
        { href: '/admin/companies', icon: faBuilding, label: t('sidebar.companies'), show: SAAS_ADMIN && can('view companies') },
        { href: '/admin/users', icon: faUsers, label: t('sidebar.users'), show: can('view users') },
        { href: '/admin/permissions', icon: faKey, label: t('sidebar.permissions'), show: can('view permissions') },
        { href: '/admin/gymSignups', icon: faFileLines, label: t('sidebar.gymSignups'), show: SAAS_ADMIN && can('view signups') },
        { href: '/admin/activityLogs', icon: faRectangleList, label: t('sidebar.activityLogs'), show: can('view logs') },
        { href: '/admin/archive', icon: faBoxArchive, label: t('sidebar.archive'), show: true },
        { href: '/admin/referrals', icon: faShareNodes, label: t('sidebar.referrals'), show: SAAS_ADMIN && can('view referrals') },
        { href: '/admin/systemPlans', icon: faTags, label: t('sidebar.systemPlans'), show: SAAS_ADMIN && can('view system plans') },
        { href: '/admin/systemAddons', icon: faCubes, label: t('sidebar.systemAddons'), show: SAAS_ADMIN && can('view system addons') },
        { href: '/admin/subscriptions', icon: faMoneyCheckDollar, label: t('sidebar.subscriptions'), show: SAAS_ADMIN && can('view subscriptions') },
        { href: '/admin/demoTenants', icon: faClipboardList, label: t('sidebar.demoTenants'), show: SAAS_ADMIN && (can('create demo tenants') || can('delete demo tenants')) },
        { href: '/admin/settings', icon: faGear, label: t('sidebar.settings'), show: true },
    ].filter(entry => entry.show)

    const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')
    const hideWhenCollapsed = collapsed ? 'lg:hidden' : ''
    const itemClass = (active: boolean) =>
        `flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${active ? 'bg-white/10 text-white' : 'hover:bg-white/5 hover:text-white'}`

    return <div id="admin-sidebar" className={`h-screen min-h-max bg-secondary flex flex-col transition-[width] duration-300 w-52 ${collapsed ? 'lg:w-16' : ''}`}>
        <Link href="/admin/dashboard" className="block shrink-0">
            <div className="flex px-2 py-4 text-center text-white">
                <LogoWhite className={`w-32 h-12 mx-auto object-contain ${hideWhenCollapsed}`} />
                {collapsed && <span className="hidden lg:flex w-8 h-8 mx-auto my-2 items-center justify-center font-heading font-extrabold text-white">IS</span>}
            </div>
        </Link>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 pb-4 text-sm text-gray-300">
            <ul className="space-y-1 font-medium">
                {nav.map(entry => (
                    <li key={entry.href}>
                        <Link href={entry.href} title={entry.label} className={itemClass(isActive(entry.href))}>
                            <FontAwesomeIcon icon={entry.icon} className="w-4 shrink-0" />
                            <span className={`truncate ${hideWhenCollapsed}`}>{entry.label}</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>

        <div className="hidden lg:block shrink-0 border-t border-white/10 p-2">
            <button
                onClick={() => setCollapsed(!collapsed)}
                title={t('sidebar.collapse')}
                aria-label={t('sidebar.collapse')}
                className="w-full flex justify-center rounded-lg py-2.5 text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
            >
                <FontAwesomeIcon icon={collapsed ? faAnglesRight : faAnglesLeft} className="rtl:rotate-180" />
            </button>
        </div>
    </div>
}
