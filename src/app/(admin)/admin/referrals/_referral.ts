import axios from "@/lib/axios"

export interface Referral { id:number; source_name:string; [key: string]: any }

export async function getReferrals(page: number, sort: string, sort_direction: string) {
	let url = `/api/referrals?page=${page}`
	if (sort != null)
		url += `&sort=${sort}&sort_direction=${sort_direction}`
	return await axios.get(url)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getReferral(id: number): Promise<{ response: Referral }> {
	return await axios.get(`/api/referrals/${id}`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function addReferral(data: any) {
	return await axios.post(`/api/referrals`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function editReferral(id: number, data: any) {
	return await axios.post(`/api/referrals/${id}?_method=PUT`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function deleteReferral(id: number) {
	return await axios.delete(`/api/referrals/${id}`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function bulkDeleteReferral(data: any) {
	return await axios.delete(`/api/referrals/delete/bulk`, data)
		.then(res => res.data)
		.catch(error => { throw error })
}