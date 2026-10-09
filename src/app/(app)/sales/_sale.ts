import axios from "@/lib/axios"

export interface Sale { id:number; reference?:string|null; member_id?:number|null; customer_name?:string|null; customer_phone?:string|null; item_count?:any; total_price?:number|string; total_tax?:any; payment_method?:any; state?:any; notes?:string|null; operation_type?:any; [key: string]: any }

export async function getProducts(branchID: number, posRegisterID: number) {
	return await axios.get(`/api/branch-products?branch_id=${branchID}&pos_register_id=${posRegisterID}`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function searchMembers(branchID: number, query: string) {
	return await axios.get(`/api/members/search`, {
            params: {
                branch_id: branchID,
                query,
            },
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getSales(page: number, branchID: number, posRegisterID: number, sort: string, sort_direction: string) {
	let url = `/api/sales?page=${page}&branch_id=${branchID}&pos_register_id=${posRegisterID}`
	if (sort != null)
		url += `&sort=${sort}&sort_direction=${sort_direction}`
	return await axios.get(url)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getSale(id: number): Promise<{ response: Sale }> {
	return await axios.get(`/api/sales/${id}`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function addSales(data: any) {
	return await axios.post(`/api/sales`, data, {
		headers: { 'X-Form-Request': true }
	})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function addRefund(id: number, data) {
	return await axios.post(`/api/sales/${id}?_method=PUT`, data)
		.then(res => res.data)
		.catch(error => { throw error })
}