import axios from "@/lib/axios"
import { Branch } from "@/app/(app)/branches/_branch"

const getWidget = (path: string, branchID: number) => axios.get(`/api/dashboard/${path}?branch_id=${branchID}`).then(res => res.data)

export const DashboardService = {
    getPlanRevenues: (id: number) => getWidget('plan-revenues', id),
    getInventoryAlerts: (id: number) => getWidget('inventory-alerts', id),
    getTodaysSales: (id: number) => getWidget('todays-sales', id),
    getPoCostsMonth: (id: number) => getWidget('po-costs-month', id),
    getPoCostsToday: (id: number) => getWidget('po-costs-today', id),
    getCategoryCostSales: (id: number) => getWidget('category-cost-sales', id),
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
