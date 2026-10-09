import axios from "@/lib/axios"

export interface Application { id:number; fname:string; sname:string; plan_id?:number|null; member_id?:number|null; birth_date:string|null; email:string; mobile_phone:string|null; status?:any; price?:number|string; membership_start?:string|null; [key: string]: any }

export async function getApps(page: number, branchID: number, sort: string, sort_direction: string) {
	let url = `/api/applications?page=${page}&branch_id=${branchID}`
	if (sort != null)
		url += `&sort=${sort}&sort_direction=${sort_direction}`
	return await axios.get(url)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getApplication(id: number): Promise<{ response: Application }> {
	return await axios.get(`/api/applications/${id}`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function approveApplication(id: number, data: any) {
	return await axios.post(`/api/applications/${id}?_method=PUT`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function rejectApplication(id: number, data: any) {
	return await axios.post(`/api/applications/${id}/reject`, data, {
		headers: { 'X-Form-Request': true }
	})
	.then(res => res.data)
	.catch(error => { throw error })
}

export async function archiveApplication(id: number) {
	return await axios.delete(`/api/applications/${id}`)
		.then(res => res.data)
		.catch(error => { throw error })
}