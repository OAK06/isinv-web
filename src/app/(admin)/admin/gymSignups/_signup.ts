import axios from "@/lib/axios"

export interface GymSignup { id:number; gym_name:string; owner_fname?:string|null; owner_sname?:string|null; email:string; mobile_phone:string|null; status?:any; [key: string]: any }

export async function getSignups(page: number, sort: string, sort_direction: string) {
	let url = `/api/signups?page=${page}`
	if (sort != null)
		url += `&sort=${sort}&sort_direction=${sort_direction}`
	return await axios.get(url)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getSignup(id: number): Promise<{ response: GymSignup }> {
	return await axios.get(`/api/signups/${id}`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function editSignup(id: number, data: any) {
	return await axios.post(`/api/signups/${id}?_method=PUT`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}
