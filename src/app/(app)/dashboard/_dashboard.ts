import axios from "@/lib/axios"
import { Branch } from "@/app/(app)/branches/_branch"

const getWidget = (path: string, branchID: number) => axios.get(`/api/dashboard/${path}?branch_id=${branchID}`).then(res => res.data)

export const DashboardService = {
    getPlanRevenues: (id: number) => getWidget('plan-revenues', id),
    getNewSubscriptions: (id: number) => getWidget('new-subscriptions', id),
    getTotalMembers: (id: number) => getWidget('total-members', id),
    getActiveMembers: (id: number) => getWidget('active-members', id),
    getRenewalsRate: (id: number) => getWidget('renewals-rate', id),
    getPlanSales: (id: number) => getWidget('plan-sales', id),
    getPeakHours: (id: number) => getWidget('peak-hours', id),
    getInventoryAlerts: (id: number) => getWidget('inventory-alerts', id),
    getLeadFunnel: (id: number) => getWidget('lead-funnel', id),
    getRecentEntries: (id: number) => getWidget('recent-entries', id),
    getMyClasses: (id: number) => getWidget('my-classes', id),
    getCheckinsToday: (id: number) => getWidget('checkins-today', id),
    getNewApplications: (id: number) => getWidget('new-applications', id),
    getTodaysSales: (id: number) => getWidget('todays-sales', id),
    getCompanyRevenue: (id: number) => getWidget('company-revenue', id),
    getBranchRevenueBreakdown: (id: number) => getWidget('branch-revenue-breakdown', id),
}

/** Card keys the current user should see on this branch (silent — falls back to none). */
export async function getMyDashboardCards(branchID: number): Promise<string[]> {
    return await axios.get(`/api/dashboard/my-cards?branch_id=${branchID}`, { headers: { 'X-SWR-Request': true } })
        .then(res => res.data?.cards ?? [])
        .catch(() => [])
}

export async function getBranch(id: number): Promise<{ response: Branch }> {
	return await axios.get(`/api/branches/${id}`)
		.then(res => res.data)
		.catch(error => { throw error })
}
