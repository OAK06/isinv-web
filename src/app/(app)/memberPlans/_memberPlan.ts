import axios from "@/lib/axios"

/** A plan definition a gym offers (Plan model). Index sig tolerates the many fee/flag columns. */
export interface Plan {
	id: number
	name: string
	description?: string | null
	duration: string
	duration_count: number
	price: number | string
	terms?: string | null
	available_online?: any
	[key: string]: any
}

/** A member's subscription to a plan (MemberPlan model). */
export interface MemberPlan {
	id: number
	plan_id: number
	member_id: number
	plan_name: string
	duration: string
	duration_count: number
	price: number | string
	status: any
	membership_start: string | null
	membership_end: string | null
	remaining_entries: number | null
	auto_renew_forever?: any
	[key: string]: any
}

export async function getMemberPlans(page: number, branchID: number, sort: string, sort_direction: string) {
	let url = `/api/me/plans?page=${page}&branch_id=${branchID}`
	if (sort != null)
		url += `&sort=${sort}&sort_direction=${sort_direction}`
	return await axios.get(url)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getMemberPlan(id: number): Promise<{ response: MemberPlan }> {
	return await axios.get(`/api/me/plans/${id}`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getBranchPlans(branchID: number): Promise<{ response: Plan[] }> {
	return await axios.get(`/api/branch-plans/${branchID}`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function subscribePlan(data: any) {
	return await axios.post(`/api/me/plans`, data)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function createPaymentSession(data: any) {
	return await axios.post(`/api/payments/payment-session`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function verifyPaymentSession(data: any) {
	return await axios.post(`/api/payments/payment-session/verify`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}
