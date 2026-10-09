import axios from "@/lib/axios"

export async function checkProductFile(data: any) {
	return await axios.post(`/api/import-products`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getImportProducts(page: number, batchID: string, branchID: number) {
	let url = `/api/import-products?page=${page}&batch_id=${batchID}&branch_id=${branchID}`
	return await axios.get(url, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function importProducts(batchID: string, branchID: number) {
	return await axios.get(`/api/import-products/create?batch_id=${batchID}&branch_id=${branchID}`)
		.then(res => res.data)
		.catch(error => { throw error })
}
