import axios from "@/lib/axios"

export async function checkCategoryFile(data: any) {
	return await axios.post(`/api/import-categories`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getImportCategories(page: number, batchID: string, branchID: number) {
	let url = `/api/import-categories?page=${page}&batch_id=${batchID}&branch_id=${branchID}`
	return await axios.get(url, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function importCategories(batchID: string, branchID: number) {
	return await axios.get(`/api/import-categories/create?batch_id=${batchID}&branch_id=${branchID}`)
		.then(res => res.data)
		.catch(error => { throw error })
}
