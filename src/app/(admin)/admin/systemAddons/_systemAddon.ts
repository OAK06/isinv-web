import axios from "@/lib/axios"

export interface SystemAddon { id:number; slug:string; active?:any; sort?:any; [key: string]: any }

export async function getSystemAddons(page: number, sort: string, sort_direction: string) {
	let url = `/api/system-addons?page=${page}`
	if (sort != null)
		url += `&sort=${sort}&sort_direction=${sort_direction}`
	return await axios.get(url)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getSystemAddon(id: number): Promise<{ response: SystemAddon }> {
	return await axios.get(`/api/system-addons/${id}`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function addSystemAddon(data: any) {
	return await axios.post(`/api/system-addons`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function editSystemAddon(id: number, data: any) {
	return await axios.post(`/api/system-addons/${id}?_method=PUT`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function deleteSystemAddon(id: number) {
	return await axios.delete(`/api/system-addons/${id}`)
		.then(res => res.data)
		.catch(error => { throw error })
}
