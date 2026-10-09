import axios from "@/lib/axios"

export interface CompanySubscription { id:number; company_id?:number|null; system_plan_id?:number|null; status?:any; months?:any; currency?:any; base_price?:number|string; total_price?:number|string; trial_ends_at?:string|null; current_period_end?:string|null; [key: string]: any }

export async function getSubscriptions(page: number, sort: string, sort_direction: string) {
	let url = `/api/subscriptions?page=${page}`
	if (sort != null)
		url += `&sort=${sort}&sort_direction=${sort_direction}`
	return await axios.get(url)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getSubscription(id: number): Promise<{ response: CompanySubscription }> {
	return await axios.get(`/api/subscriptions/${id}`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function addSubscription(data: any) {
	return await axios.post(`/api/subscriptions`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function editSubscription(id: number, data: any) {
	return await axios.post(`/api/subscriptions/${id}?_method=PUT`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function markSubscriptionPaid(id: number) {
	return await axios.post(`/api/subscriptions/${id}/mark-paid`, {}, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getAllSystemPlans() {
	return await axios.get(`/api/getSystemPlans`, { headers: { 'X-SWR-Request': true } })
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getAllSystemAddons() {
	return await axios.get(`/api/getSystemAddons`, { headers: { 'X-SWR-Request': true } })
		.then(res => res.data)
		.catch(error => { throw error })
}
