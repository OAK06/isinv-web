import axios from "@/lib/axios"

export interface PosSession { id:number; pos_register_id?:number|null; start:string|null; end:string|null; open_cash?:any; close_cash?:any; status?:any; [key: string]: any }

export async function getCompanyBranches(companyID: number) {
	return await axios.get(`/api/company/${companyID}/branches`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getPosSessions(page: number, branchID: number, posRegisterID: number, sort: string, sort_direction: string) {
	let url = `/api/pos-sessions?page=${page}&branch_id=${branchID}&pos_register_id=${posRegisterID}`
	if (sort != null)
		url += `&sort=${sort}&sort_direction=${sort_direction}`
	return await axios.get(url)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getPosSession(id: number): Promise<{ response: PosSession }> {
	return await axios.get(`/api/pos-sessions/${id}`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function addPosSession(data: any) {
	return await axios.post(`/api/pos-sessions`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function endPosSession(id: number, data: any) {
	return await axios.post(`/api/pos-sessions/${id}?_method=PUT`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}