import axios from "@/lib/axios"

export interface Role { id:number; name:string; company_id?:number|null; branch_id?:number|null; permissions?:any[]; sidebar_items?:any; dashboard_cards?:any; reports?:any; [key: string]: any }

export async function getCompanies() {
	return await axios.get(`/api/getCompanies`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getCompanyBranches(companyID: number) {
	return await axios.get(`/api/company/${companyID}/branches`, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getRoles(page: number, branchID: number, sort: string, sort_direction: string) {
	let url = `/api/roles?page=${page}&branch_id=${branchID}`
	if (sort != null)
		url += `&sort=${sort}&sort_direction=${sort_direction}`
	return await axios.get(url)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getRole(id: number): Promise<{ response: Role }> {
	return await axios.get(`/api/roles/${id}`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function addRole(data: any) {
	return await axios.post(`/api/roles`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function editRole(id: number, data: any) {
	return await axios.post(`/api/roles/${id}?_method=PUT`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function deleteRole(id: number) {
	return await axios.delete(`/api/roles/${id}`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function bulkDeleteRole(data: any) {
	return await axios.delete(`/api/roles/delete/bulk`, data)
		.then(res => res.data)
		.catch(error => { throw error })
}