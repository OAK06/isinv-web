import axios from "@/lib/axios"

export interface Product { id:number; name:string; type?:any; category_id?:number|null; cost_price?:number|string; sell_price?:number|string; fixed_price?:any; active?:any; allow_negative?:any; low_stock_notice?:any; file?:{url?:string}|null; [key: string]: any }

export async function getCompanyBranches(companyID: number) {
	return await axios.get(`/api/company/${companyID}/branches`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getBranchProductCategories(branchID: number, posRegisterID: number, scope?: string) {
	return await axios.get(`/api/branch-product-categories/${branchID}?pos_register_id=${posRegisterID}&scope=${scope}`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getProducts(page: number, branchID: number, posRegisterID: number, sort: string, sort_direction: string) {
	let url = `/api/products?page=${page}&branch_id=${branchID}&pos_register_id=${posRegisterID}`
	if (sort != null)
		url += `&sort=${sort}&sort_direction=${sort_direction}`
	return await axios.get(url)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getProduct(id: number): Promise<{ response: Product }> {
	return await axios.get(`/api/products/${id}`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function addProduct(data: any) {
	return await axios.post(`/api/products`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function editProduct(id: number, data: any) {
	return await axios.post(`/api/products/${id}?_method=PUT`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function deleteProduct(id: number) {
	return await axios.delete(`/api/products/${id}`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function bulkDeleteProduct(data: any) {
	return await axios.delete(`/api/products/delete/bulk`, data)
		.then(res => res.data)
		.catch(error => { throw error })
}