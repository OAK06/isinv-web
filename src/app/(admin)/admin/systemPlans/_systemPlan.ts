import axios from "@/lib/axios"

export interface SystemPlan { id:number; slug:string; edition?:any; months?:any; active?:any; [key: string]: any }

interface Country {code: string, label: string}

export const BASE_COUNTRIES: Country[] = [
    // XX = default/fallback pricing used for any country without its own row —
    // required for charging (subscriptions) to work worldwide.
    { code: "XX", label: 'defaultCountry' },
    { code: "EG", label: 'egypt' },
    { code: "SA", label: 'saudiArabia' },
    { code: "AE", label: 'unitedArabEmirates' },
    { code: "DE", label: 'germany' }
]

export async function getSystemPlans(page: number, sort: string, sort_direction: string) {
	let url = `/api/system-plans?page=${page}`
	if (sort != null)
		url += `&sort=${sort}&sort_direction=${sort_direction}`
	return await axios.get(url)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getSystemPlan(id: number): Promise<{ response: SystemPlan }> {
	return await axios.get(`/api/system-plans/${id}`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function addSystemPlan(data: any) {
	return await axios.post(`/api/system-plans`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function editSystemPlan(id: number, data: any) {
	return await axios.post(`/api/system-plans/${id}?_method=PUT`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function deleteSystemPlan(id: number) {
	return await axios.delete(`/api/system-plans/${id}`)
		.then(res => res.data)
		.catch(error => { throw error })
}