import axios from "@/lib/axios"

export interface Plan { id:number; name:string; description?:string|null; duration:string; duration_count:number; price:number|string; type?:any; entries_count?:any; startup_fee?:any; cancellation_fee?:any; tax_percentage?:any; trial?:any; active?:any; terms?:string|null; auto_renew_forever?:any; available_online?:any; [key: string]: any }

export async function getCompanyBranches(companyID: number) {
	return await axios.get(`/api/company/${companyID}/branches`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getPlans(page: number, branchID: number, sort: string, sort_direction: string) {
	let url = `/api/plans?page=${page}&branch_id=${branchID}`
	if (sort != null)
		url += `&sort=${sort}&sort_direction=${sort_direction}`
	return await axios.get(url)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getPlan(id: number): Promise<{ response: Plan }> {
	return await axios.get(`/api/plans/${id}`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function addPlan(data: any) {
	return await axios.post(`/api/plans`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function editPlan(id: number, data: any) {
	return await axios.post(`/api/plans/${id}?_method=PUT`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function deletePlan(id: number) {
	return await axios.delete(`/api/plans/${id}`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function bulkDeletePlan(data: any) {
	return await axios.delete(`/api/plans/delete/bulk`, data)
		.then(res => res.data)
		.catch(error => { throw error })
}