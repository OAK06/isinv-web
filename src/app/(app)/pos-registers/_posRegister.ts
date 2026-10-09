import axios from "@/lib/axios"

export interface PosRegister { id:number; name:string; description?:string|null; active?:any; [key: string]: any }

export async function getCompanyBranches(companyID: number) {
	return await axios.get(`/api/company/${companyID}/branches`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getPosRegisters(page: number, branchID: number, sort: string, sort_direction: string) {
	let url = `/api/pos-registers?page=${page}&branch_id=${branchID}`
	if (sort != null)
		url += `&sort=${sort}&sort_direction=${sort_direction}`
	return await axios.get(url)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getPosRegister(id: number): Promise<{ response: PosRegister }> {
	return await axios.get(`/api/pos-registers/${id}`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function addPosRegister(data: any) {
	return await axios.post(`/api/pos-registers`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function editPosRegister(id: number, data: any) {
	return await axios.post(`/api/pos-registers/${id}?_method=PUT`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function deletePosRegister(id: number) {
	return await axios.delete(`/api/pos-registers/${id}`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function bulkDeleteRegister(data: any) {
	return await axios.delete(`/api/pos-registers/delete/bulk`, data)
		.then(res => res.data)
		.catch(error => { throw error })
}