import axios from "@/lib/axios"

export interface Company { id:number; name:string; address:string|null; city:string|null; country:string|null; phone:string|null; email:string|null; contact_person?:string|null; status?:any; is_demo?:any; [key: string]: any }

export async function getCompanies(page: number, sort: string, sort_direction: string) {
	let url = `/api/companies?page=${page}`
	if (sort != null)
		url += `&sort=${sort}&sort_direction=${sort_direction}`
	return await axios.get(url)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getCompany(id: number): Promise<{ response: Company }> {
	return await axios.get(`/api/companies/${id}`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function addCompany(data: any) {
	return await axios.post(`/api/companies`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function editCompany(id: number, data: any) {
	return await axios.post(`/api/companies/${id}?_method=PUT`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function deleteCompany(id: number) {
	return await axios.delete(`/api/companies/${id}`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function bulkDeleteCompany(data: any) {
	return await axios.delete(`/api/companies/delete/bulk`, data)
		.then(res => res.data)
		.catch(error => { throw error })
}