"use client"

import Link from "next/link"
import { useTranslation } from "next-i18next"
import { useAuth } from "@/hooks/auth"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowRightArrowLeft, faBuilding, faClipboardList, faCubes, faFileLines, faKey, faMoneyCheckDollar, faRectangleList, faShareNodes, faTags, faUsers } from "@fortawesome/free-solid-svg-icons"

/**
 * Super-Admin landing. Tenant-free overview + quick links into every platform
 * management area. The tenant switcher is the primary CTA (enter any tenant to
 * act with full powers).
 */
export default function AdminDashboard() {
    const { t } = useTranslation('common')
    const { user } = useAuth({ middleware: "auth" })

    const can = (perm: string) => user?.permissions?.includes(perm)

    const cards = [
        { href: '/admin/tenants', icon: faArrowRightArrowLeft, label: t('sidebar.tenants'), desc: t('adminDashboard.tenantsDesc'), show: true, primary: true },
        { href: '/admin/companies', icon: faBuilding, label: t('sidebar.companies'), desc: t('adminDashboard.companiesDesc'), show: can('view companies') },
        { href: '/admin/users', icon: faUsers, label: t('sidebar.users'), desc: t('adminDashboard.usersDesc'), show: can('view users') },
        { href: '/admin/permissions', icon: faKey, label: t('sidebar.permissions'), desc: t('adminDashboard.permissionsDesc'), show: can('view permissions') },
        { href: '/admin/gymSignups', icon: faFileLines, label: t('sidebar.gymSignups'), desc: t('adminDashboard.gymSignupsDesc'), show: can('view signups') },
        { href: '/admin/subscriptions', icon: faMoneyCheckDollar, label: t('sidebar.subscriptions'), desc: t('adminDashboard.subscriptionsDesc'), show: can('view subscriptions') },
        { href: '/admin/systemPlans', icon: faTags, label: t('sidebar.systemPlans'), desc: t('adminDashboard.systemPlansDesc'), show: can('view system plans') },
        { href: '/admin/systemAddons', icon: faCubes, label: t('sidebar.systemAddons'), desc: t('adminDashboard.systemAddonsDesc'), show: can('view system addons') },
        { href: '/admin/demoTenants', icon: faClipboardList, label: t('sidebar.demoTenants'), desc: t('adminDashboard.demoTenantsDesc'), show: can('create demo tenants') || can('delete demo tenants') },
        { href: '/admin/referrals', icon: faShareNodes, label: t('sidebar.referrals'), desc: t('adminDashboard.referralsDesc'), show: can('view referrals') },
        { href: '/admin/activityLogs', icon: faRectangleList, label: t('sidebar.activityLogs'), desc: t('adminDashboard.activityLogsDesc'), show: can('view logs') },
    ].filter(c => c.show)

    return <>
        <div className="mb-6">
            <h1 className="text-2xl font-bold">{t('adminDashboard.title', { name: user?.name ?? '' })}</h1>
            <p className="text-sm text-base-content/60 mt-1">{t('adminDashboard.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map(card => (
                <Link
                    key={card.href}
                    href={card.href}
                    className={`group card border shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${card.primary ? 'bg-primary/5 border-primary/30' : 'bg-base-100 border-base-200'}`}
                >
                    <div className="card-body flex-row items-center gap-4">
                        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-colors ${card.primary ? 'bg-primary text-primary-content' : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-content'}`}>
                            <FontAwesomeIcon icon={card.icon} className="text-lg" />
                        </span>
                        <div className="min-w-0">
                            <h2 className="font-bold truncate">{card.label}</h2>
                            <p className="text-sm text-base-content/60">{card.desc}</p>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    </>
}
