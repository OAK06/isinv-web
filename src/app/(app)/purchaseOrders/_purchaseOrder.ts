import axios from "@/lib/axios"

export interface PurchaseOrder { id:number; supplier_id?:number|null; notes?:string|null; [key: string]: any }

export async function getCompanyBranches(companyID: number) {
	return await axios.get(`/api/company/${companyID}/branches`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getSuppliers(branchID: number, posRegisterID: number) {
	return await axios.get(`/api/branch/${branchID}/suppliers?pos_register_id=${posRegisterID}`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getProducts(branchID: number, posRegisterID: number) {
	return await axios.get(`/api/branch-products?branch_id=${branchID}&pos_register_id=${posRegisterID}`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getPurchases(page: number, branchID: number, sort: string, sort_direction: string) {
	let url = `/api/purchases?page=${page}&branch_id=${branchID}`
	if (sort != null)
		url += `&sort=${sort}&sort_direction=${sort_direction}`
	return await axios.get(url)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getPurchase(id: number): Promise<{ response: PurchaseOrder }> {
	return await axios.get(`/api/purchases/${id}`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function addPurchase(data: any) {
	return await axios.post(`/api/purchases`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function editPurchase(id: number, data: any) {
	return await axios.post(`/api/purchases/${id}?_method=PUT`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function deletePurchase(id: number) {
	return await axios.delete(`/api/purchases/${id}`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function bulkDeletePurchase(data: any) {
	return await axios.delete(`/api/purchases/delete/bulk`, data)
		.then(res => res.data)
		.catch(error => { throw error })
}