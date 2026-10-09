import axios from "@/lib/axios"

export interface Stocktake { id:number; name:string; notes?:string|null; stocktake_date?:string|null; result?:any; status?:any; [key: string]: any }

export async function branchProductCategories(branchID: number, posRegisterID: number) {
	return await axios.get(`/api/branch-product-categories/${branchID}?pos_register_id=${posRegisterID}`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getStocktakes(page: number, branchID: number, posRegisterID: number, sort: string, sort_direction: string) {
	let url = `/api/stocktakes?page=${page}&branch_id=${branchID}&pos_register_id=${posRegisterID}`
	if (sort != null)
		url += `&sort=${sort}&sort_direction=${sort_direction}`
	return await axios.get(url)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getStocktake(id: number): Promise<{ response: Stocktake }> {
	return await axios.get(`/api/stocktakes/${id}`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function addStocktake(data: any) {
	return await axios.post(`/api/stocktakes`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function addStocktakeItem(data: any) {
	return await axios.post(`/api/stocktakeItems`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function editStocktake(id: number, data: any) {
	return await axios.post(`/api/stocktakes/${id}?_method=PUT`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function finishStocktake(id: number, data: any) {
	return await axios.post(`/api/stocktakes/${id}/finish?_method=PUT`, data)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getActiveStocktake(branchID: number, posRegisterID: number) {
	return await axios.get(`/api/stocktakes/create?branch_id=${branchID}&pos_register_id=${posRegisterID}`)
		.then(res => res.data)
		.catch(error => { throw error })
}