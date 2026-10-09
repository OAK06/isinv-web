import axios from "@/lib/axios"

export interface ProductCategory { id:number; name:string; description?:string|null; active?:any; file?:{url?:string}|null; [key: string]: any }

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

export async function getCategories(page: number, branchID: number, posRegisterID: number, sort: string, sort_direction: string) {
	let url = `/api/categories?page=${page}&branch_id=${branchID}&pos_register_id=${posRegisterID}`
	if (sort != null)
		url += `&sort=${sort}&sort_direction=${sort_direction}`
	return await axios.get(url)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getCategory(id: number): Promise<{ response: ProductCategory }> {
	return await axios.get(`/api/categories/${id}`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function addCategory(data: any) {
	return await axios.post(`/api/categories`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function editCategory(id: number, data: any) {
	return await axios.post(`/api/categories/${id}?_method=PUT`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function deleteCategory(id: number) {
	return await axios.delete(`/api/categories/${id}`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function bulkDeleteCategory(data: any) {
	return await axios.delete(`/api/categories/delete/bulk`, data)
		.then(res => res.data)
		.catch(error => { throw error })
}