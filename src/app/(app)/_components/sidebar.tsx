import Link from "next/link"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import LogoWhite from "@/_components/logoWhite"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faAnglesLeft, faAnglesRight, faBuilding, faCalendar, faCashRegister, faChartColumn, faChevronDown, faClipboardList, faDumbbell, faFileImport, faFileLines, faHome, faPeopleGroup, faQrcode, faFileInvoiceDollar, faLock, faScrewdriverWrench, faStore, faTags } from "@fortawesome/free-solid-svg-icons"
import { useTranslation } from "next-i18next"
import { useAtom } from "jotai"
import { branch, posRegister, sidebarCollapsed } from "@/_state/globalStore"
import { getMyReports } from "@/app/(app)/reportsAccess/_reportsAccess"
import { getMySidebar } from "@/app/(app)/sidebarAccess/_sidebarAccess"

export default function Sidebar({ user }) {
    const { t } = useTranslation('common')
    const pathname = usePathname()
	const [ posRegisterID ] = useAtom(posRegister)
    const [ collapsed, setCollapsed ] = useAtom(sidebarCollapsed)
    const [ branchID ] = useAtom(branch)

    const can = (perm: string) => user.permissions.includes(perm)
    // Gym-only + other non-inventory features hidden for this glass-shop build
    // (gym pages, bookkeeping/finance export, member-signup URLs, and the
    // subscription/due-payments reports). Backend stays intact (dormant); flip
    // to true to restore these nav entries.
    const GYM_FEATURES = false
    // Platform subscriptions / online payments are out of scope for this single-tenant
    // shop (customers don't pay online). Backend stays intact; flip to restore.
    const SUBSCRIPTIONS = false
    const isSuperAdmin = user.roles.includes('Super Admin')
    const hasPosAccess = isSuperAdmin || posRegisterID !== -1
    // Paid-addon modules: locked entries stay visible as an upsell (lock icon
    // linking to /billing) instead of silently disappearing.
    const hasModule = (module: string) => !user.modules || user.modules.includes(module)
    const posLocked = !hasModule('pos')
    const reportsLocked = !hasModule('reports')

    // Which reports this user's role(s) are allowed to see (owner-managed per
    // role, permission-gated on the backend). Mirrors dashboard-card gating.
    const [reportKeys, setReportKeys] = useState<Set<string>>(new Set())
    useEffect(() => {
        if (!branchID || branchID === -1) return
        getMyReports(branchID).then((res: any) => setReportKeys(new Set(res?.reports ?? []))).catch(() => {})
    }, [branchID])
    const hasReport = (key: string) => reportKeys.has(key)

    // Which top-level nav entries the owner enabled for this user's role(s). An empty set
    // (still loading, misconfig, or a role with none) means "no restriction" — show all
    // permitted entries, so navigation is never accidentally nuked. Permission gating below
    // still applies on top of this.
    const [navKeys, setNavKeys] = useState<Set<string>>(new Set())
    useEffect(() => {
        if (!branchID || branchID === -1) return
        getMySidebar(branchID).then((res: any) => setNavKeys(new Set(res?.sidebar ?? []))).catch(() => {})
    }, [branchID])
    const hasNav = (key: string) => navKeys.size === 0 || navKeys.has(key)

    // Single ordered nav: groups (with items) and flat links interleaved in display order.
    const nav: any[] = [
        { type: 'link', href: '/dashboard', icon: faHome, label: t('sidebar.dashboard'), show: hasNav('dashboard') },
        // New inventory feature (glass-shop jobs) — deliberately NOT behind GYM_FEATURES.
        { type: 'link', href: '/workOrders', icon: faScrewdriverWrench, label: t('sidebar.workOrders'), show: can('view work orders') && hasNav('workOrders') },
        // NOTE: platform-admin nav (companies, users, permissions, gymSignups,
        // activityLogs, referrals, systemPlans/Addons, subscriptions,
        // demoTenants) now lives in the dedicated Super-Admin shell at /admin/*
        // (see (admin)/_components/adminSidebar) — deliberately NOT shown in the
        // tenant sidebar so admin and tenant surfaces don't overlap.
        // Daily member operations first (Reception / Trainer live here).
        { type: 'link', href: '/members', icon: faPeopleGroup, label: t('sidebar.members'), show: can('view members') && hasNav('members') },
        { type: 'link', href: '/applications', icon: faFileLines, label: t('sidebar.applications'), show: GYM_FEATURES && can('view applications') && hasNav('applications') },
        { type: 'link', href: '/memberPlans', icon: faClipboardList, label: t('sidebar.memberPlans'), show: GYM_FEATURES && can('view memberPlans') && hasNav('memberPlans') },
        { type: 'link', href: '/calendar', icon: faCalendar, label: t('sidebar.calendar'), show: GYM_FEATURES && can('view sessions') && hasNav('calendar') },
        { type: 'link', href: '/scanner', icon: faQrcode, label: t('sidebar.scanner'), show: GYM_FEATURES && can('scanner') && hasNav('scanner') },
        // Offerings: plans then classes (per Omar), then POS.
        { type: 'link', href: '/plans', icon: faTags, label: t('sidebar.plans'), show: GYM_FEATURES && can('view plans') && hasNav('plans') },
        { type: 'link', href: '/classes', icon: faDumbbell, label: t('sidebar.classes'), show: GYM_FEATURES && can('view classes') && hasNav('classes') },
        {
            type: 'group', key: 'pos', icon: faCashRegister, label: t('sidebar.pointOfSale'), show: hasNav('pos'),
            items: [
                { href: '/pos-registers', label: t('sidebar.posRegisters'), show: can('view pos registers'), locked: posLocked },
                { href: '/pos-sessions', label: t('sidebar.posSessions'), show: hasPosAccess && can('view pos sessions'), locked: posLocked },
                { href: '/sales', label: t('sidebar.sales'), show: hasPosAccess && can('view sales'), locked: posLocked },
                { href: '/refunds', label: t('sidebar.refunds'), show: hasPosAccess && can('view refunds'), locked: posLocked },
                { href: '/suppliers', label: t('sidebar.suppliers'), show: hasPosAccess && can('view suppliers'), locked: posLocked },
                { href: '/products', label: t('sidebar.products'), show: hasPosAccess && can('view products'), locked: posLocked },
                { href: '/productCategories', label: t('sidebar.productCategories'), show: hasPosAccess && can('view categories'), locked: posLocked },
                { href: '/inventories', label: t('sidebar.inventories'), show: hasPosAccess && can('view inventories'), locked: posLocked },
                { href: '/purchaseOrders', label: t('sidebar.purchaseOrders'), show: hasPosAccess && can('view purchases'), locked: posLocked },
                { href: '/stocktakes', label: t('sidebar.stocktakes'), show: hasPosAccess && can('view stocktakes'), locked: posLocked },
                { href: '/dailySales', label: t('sidebar.dailySalesReport'), show: hasPosAccess && hasReport('daily_sales') && can('view daily sales report'), locked: posLocked },
            ],
        },
        {
            type: 'group', key: 'reports', icon: faChartColumn, label: t('sidebar.reports'), show: hasNav('reports'),
            items: [
                { href: '/duePaymentsReport', label: t('sidebar.duePaymentsReport'), show: GYM_FEATURES && hasReport('due_payments') && can('view upcoming billing report'), locked: reportsLocked },
                { href: '/subscriptionTransactions', label: t('sidebar.subscriptionTransactionsReport'), show: GYM_FEATURES && hasReport('subscription_transactions') && can('view daily subscriptions report'), locked: reportsLocked },
                { href: '/revenueSummary', label: t('sidebar.revenueSummaryReport'), show: hasReport('revenue_summary') && can('view revenue report'), locked: reportsLocked },
                { href: '/expiringMemberships', label: t('sidebar.expiringMembershipsReport'), show: GYM_FEATURES && hasReport('expiring_memberships') && can('view expiring memberships report') },
                { href: '/attendanceReport', label: t('sidebar.attendanceReport'), show: GYM_FEATURES && hasReport('attendance') && can('view attendance report') },
                { href: '/lowStock', label: t('sidebar.lowStockReport'), show: hasReport('low_stock') && can('view low stock report'), locked: posLocked },
                { href: '/refundsReport', label: t('sidebar.refundsReport'), show: hasReport('refunds_report') && can('view refunds report'), locked: posLocked },
            ],
        },
        {
            type: 'group', key: 'finances', icon: faFileInvoiceDollar, label: t('sidebar.finances'), show: hasNav('finances'),
            items: [
                { href: '/billing', label: t('sidebar.billing'), show: SUBSCRIPTIONS && can('view billing') },
                { href: '/finance', label: t('sidebar.finance'), show: GYM_FEATURES && can('manage finance export') },
            ],
        },
        // Administration / setup (infrequent) sinks to the bottom.
        {
            type: 'group', key: 'company', icon: faBuilding, label: t('sidebar.company'), show: hasNav('company'),
            items: [
                { href: '/roles', label: t('sidebar.roles'), show: can('view roles') },
                { href: '/rolePermissions', label: t('sidebar.rolePermissions'), show: can('view rolePermissions') },
                { href: '/branches', label: t('sidebar.branches'), show: can('view branches') },
                { href: '/translations', label: t('sidebar.translations'), show: can('manage translations') },
                { href: '/dashboardCards', label: t('sidebar.dashboardCards'), show: can('manage dashboard cards') },
                { href: '/reportsAccess', label: t('sidebar.manageReports'), show: can('manage reports') },
                { href: '/sidebarAccess', label: t('sidebar.sidebarAccess'), show: can('manage sidebar') },
            ],
        },
        {
            type: 'group', key: 'branch', icon: faStore, label: t('sidebar.branch'), show: hasNav('branch'),
            items: [
                { href: '/branch_settings', label: t('sidebar.settings'), show: can('branch settings') },
                { href: '/branch-urls', label: t('sidebar.signupUrls'), show: GYM_FEATURES && can('view branch urls') },
                { href: '/staff', label: t('sidebar.staff'), show: can('view staff') },
            ],
        },
        {
            type: 'group', key: 'import', icon: faFileImport, label: t('sidebar.import'), show: can('import') && hasNav('import'),
            items: [
                { href: '/import/plans', label: t('sidebar.importPlans'), show: GYM_FEATURES && can('import plans') },
                { href: '/import/classes', label: t('sidebar.importClasses'), show: GYM_FEATURES && can('import classes') },
                { href: '/import/members', label: t('sidebar.importMembers'), show: can('import members') },
                { href: '/import/suppliers', label: t('sidebar.importSuppliers'), show: can('import suppliers') },
                { href: '/import/categories', label: t('sidebar.importCategories'), show: can('import categories') },
                { href: '/import/products', label: t('sidebar.importProducts'), show: can('import products') },
                { href: '/import/staff', label: t('sidebar.importStaff'), show: can('import staff') },
            ],
        },
    ]
        .map(entry => entry.type === 'group' ? { ...entry, items: entry.items.filter((i: any) => i.show) } : entry)
        .filter(entry => entry.type === 'group' ? (entry.show && entry.items.length > 0) : entry.show)

    const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

    // Accordion: only one group open at a time; start with the group of the current page
    const [openGroup, setOpenGroup] = useState<string | null>(
        () => nav.find(e => e.type === 'group' && e.items.some((i: any) => isActive(i.href)))?.key ?? null
    )

    const isDesktop = () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches

    const toggleGroup = (key: string) => {
        if (collapsed && isDesktop()) {
            setCollapsed(false)
            setOpenGroup(key)
        } else {
            setOpenGroup(openGroup === key ? null : key)
        }
    }

    const toggleCollapse = () => {
        if (!collapsed) setOpenGroup(null)
        setCollapsed(!collapsed)
    }

    const hideWhenCollapsed = collapsed ? 'lg:hidden' : ''
    const itemClass = (active: boolean) =>
        `flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${active ? 'bg-white/10 text-white' : 'hover:bg-white/5 hover:text-white'}`

    const renderLink = (entry: any) => (
        <li key={entry.href}>
            <Link href={entry.href} title={entry.label} className={itemClass(isActive(entry.href))}>
                <FontAwesomeIcon icon={entry.icon} className="w-4 shrink-0" />
                <span className={`truncate ${hideWhenCollapsed}`}>{entry.label}</span>
            </Link>
        </li>
    )

    const renderGroup = (entry: any) => {
        const open = openGroup === entry.key && !(collapsed && isDesktop())
        const groupActive = entry.items.some((i: any) => isActive(i.href))
        return <li key={entry.key}>
            <button
                onClick={() => toggleGroup(entry.key)}
                title={entry.label}
                className={`w-full ${itemClass(groupActive && collapsed)}`}
            >
                <FontAwesomeIcon icon={entry.icon} className="w-4 shrink-0" />
                <span className={`flex-1 truncate text-start ${hideWhenCollapsed}`}>{entry.label}</span>
                <span className={`shrink-0 ${hideWhenCollapsed}`}>
                    <FontAwesomeIcon icon={faChevronDown} className={`w-3 text-xs opacity-60 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
                </span>
            </button>
            <div className={`grid transition-[grid-template-rows] duration-300 ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'} ${hideWhenCollapsed}`}>
                <ul className="overflow-hidden ps-6 pt-1 space-y-1">
                    {entry.items.map((item: any) => (
                        <li key={item.href}>
                            <Link href={item.locked ? '/billing' : item.href} className={`${itemClass(isActive(item.href))} ${item.locked ? 'opacity-60' : ''}`} title={item.locked ? t('sidebar.moduleLocked') : item.label}>
                                <span className="truncate">{item.label}</span>
                                {item.locked && <FontAwesomeIcon icon={faLock} className="w-3 text-xs opacity-70 ms-auto shrink-0" />}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </li>
    }

	return <div id="app-sidebar" className={`h-screen min-h-max bg-secondary flex flex-col transition-[width] duration-300 w-52 ${collapsed ? 'lg:w-16' : ''}`}>
            <Link href="/dashboard" className="block shrink-0">
                <div className="flex px-2 py-4 text-center text-white">
                    <LogoWhite className={`w-32 h-12 mx-auto object-contain ${hideWhenCollapsed}`} />
                    {collapsed && <span className="hidden lg:flex w-8 h-8 mx-auto my-2 items-center justify-center font-heading font-extrabold text-white">IS</span>}
                </div>
            </Link>

            <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 pb-4 text-sm text-gray-300">
                <ul className="space-y-1 font-medium">
                    {nav.map(entry => entry.type === 'link' ? renderLink(entry) : renderGroup(entry))}
                </ul>
            </nav>

            <div className="hidden lg:block shrink-0 border-t border-white/10 p-2">
                <button
                    onClick={toggleCollapse}
                    title={t('sidebar.collapse')}
                    aria-label={t('sidebar.collapse')}
                    className="w-full flex justify-center rounded-lg py-2.5 text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
                >
                    <FontAwesomeIcon icon={collapsed ? faAnglesRight : faAnglesLeft} className="rtl:rotate-180" />
                </button>
            </div>
		</div>

}
