import axios from "@/lib/axios"

export interface AdminUser { id:number; name:string; email:string; [key: string]: any }

export async function getRoles(branchID: number) {
	return await axios.get(`/api/get-branch-roles/${branchID}`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getUsers(page: number, sort: string, sort_direction: string) {
	let url = `/api/users?page=${page}`
	if (sort != null)
		url += `&sort=${sort}&sort_direction=${sort_direction}`
	return await axios.get(url)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getUser(id: number): Promise<{ response: AdminUser }> {
	return await axios.get(`/api/users/${id}`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function addUser(data: any) {
	return await axios.post(`/api/users`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function editUser(id: number, data: any) {
	return await axios.post(`/api/users/${id}?_method=PUT`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function deleteUser(id: number) {
	return await axios.delete(`/api/users/${id}`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function bulkDeleteUser(data: any) {
	return await axios.delete(`/api/users/delete/bulk`, data)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function saveFilters(data: any) {
	return await axios.post(`/api/save-filters`, data)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function saveVisibleColumns(data: any) {
	return await axios.post(`/api/save-visible-columns`, data)
		.then(res => res.data)
		.catch(error => { throw error })
}