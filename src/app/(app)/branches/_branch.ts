import axios from "@/lib/axios"

export interface Branch { id:number; company_id?:number|null; name:string; address:string|null; city:string|null; country:string|null; phone:string|null; email:string|null; contact_person?:string|null; timezone?:string|null; currency?:any; terms?:string|null; [key: string]: any }

export async function getCompanies() {
	return await axios.get(`/api/getCompanies`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getBranches(page: number, branchID: number, sort: string, sort_direction: string) {
	let url = `/api/branches?page=${page}&branch_id=${branchID}`
	if (sort != null)
		url += `&sort=${sort}&sort_direction=${sort_direction}`
	return await axios.get(url)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getBranch(id: number): Promise<{ response: Branch }> {
	return await axios.get(`/api/branches/${id}`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function addBranch(data: any) {
	return await axios.post(`/api/branches`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function editBranch(id: number, data: any) {
	return await axios.post(`/api/branches/${id}?_method=PUT`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function deleteBranch(id: number) {
	return await axios.delete(`/api/branches/${id}`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function bulkDeleteBranch(data: any) {
	return await axios.delete(`/api/branches/delete/bulk`, data)
		.then(res => res.data)
		.catch(error => { throw error })
}