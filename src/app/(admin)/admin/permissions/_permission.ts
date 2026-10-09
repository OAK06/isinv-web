import axios from "@/lib/axios"

export interface Permission { id:number; name:string; [key: string]: any }

export async function getPermissions(page: number, sort: string, sort_direction: string) {
	let url = `/api/permissions?page=${page}`
	if (sort != null)
		url += `&sort=${sort}&sort_direction=${sort_direction}`
	return await axios.get(url)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getPermission(id: number): Promise<{ response: Permission }> {
	return await axios.get(`/api/permissions/${id}`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function addPermission(data: any) {
	return await axios.post(`/api/permissions`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function editPermission(id: number, data: any) {
	return await axios.post(`/api/permissions/${id}?_method=PUT`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function deletePermission(id: number) {
	return await axios.delete(`/api/permissions/${id}`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function bulkDeletePermission(data: any) {
	return await axios.delete(`/api/permissions/delete/bulk`, data)
		.then(res => res.data)
		.catch(error => { throw error })
}