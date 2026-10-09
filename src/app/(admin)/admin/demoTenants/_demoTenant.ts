import axios from "@/lib/axios"

export async function addDemoTenant(data: any) {
	return await axios.post(`/api/demo-tenants`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function bulkCreateDemoTenants(data: any) {
	return await axios.post(`/api/demo-tenants/bulk`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getDemoTenants(page: number, sort: string = null, sort_direction: string = 'asc') {
	return await axios.get(`/api/demo-tenants`, {
			params: { page, sort, sort_direction },
			headers: { 'X-SWR-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function deleteDemoTenant(companyID: number) {
	return await axios.delete(`/api/demo-tenants/${companyID}`, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function bulkDeleteDemoTenants(data: any) {
	return await axios.delete(`/api/demo-tenants/delete/bulk`, data)
		.then(res => res.data)
		.catch(error => { throw error })
}
