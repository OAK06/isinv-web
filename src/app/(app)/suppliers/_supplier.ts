import axios from "@/lib/axios"

export interface Supplier { id:number; name:string; email:string|null; phone:string|null; address:string|null; pos_register_id?:number|null; [key: string]: any }

export async function getCompanyBranches(companyID: number) {
	return await axios.get(`/api/company/${companyID}/branches`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getBranchPosRegisters(branchID: number, active?: boolean, scope?: string) {
    let url = `/api/branch/${branchID}/pos-registers?scope=${scope}`
    if (active != null)
        url += `&active=${active}`
	return await axios.get(url)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getSuppliers(page: number, branchID: number, posRegisterID: number, sort: string, sort_direction: string) {
	let url = `/api/suppliers?page=${page}&branch_id=${branchID}&pos_register_id=${posRegisterID}`
	if (sort != null)
		url += `&sort=${sort}&sort_direction=${sort_direction}`
	return await axios.get(url)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getSupplier(id: number): Promise<{ response: Supplier }> {
	return await axios.get(`/api/suppliers/${id}`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function addSupplier(data: any) {
	return await axios.post(`/api/suppliers`, data, {
		headers: { 'X-Form-Request': true }
	})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function editSupplier(id: number, data: any) {
	return await axios.post(`/api/suppliers/${id}?_method=PUT`, data, {
		headers: { 'X-Form-Request': true }
	})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function deleteSupplier(id: number) {
	return await axios.delete(`/api/suppliers/${id}`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function bulkDeleteSupplier(data: any) {
	return await axios.delete(`/api/suppliers/delete/bulk`, data)
		.then(res => res.data)
		.catch(error => { throw error })
}