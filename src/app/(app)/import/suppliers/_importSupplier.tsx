import axios from "@/lib/axios"

export async function checkSupplierFile(data: any) {
	return await axios.post(`/api/import-suppliers`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getImportSuppliers(page: number, batchID: string, branchID: number) {
	let url = `/api/import-suppliers?page=${page}&batch_id=${batchID}&branch_id=${branchID}`
	return await axios.get(url, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function importSuppliers(batchID: string, branchID: number) {
	return await axios.get(`/api/import-suppliers/create?batch_id=${batchID}&branch_id=${branchID}`)
		.then(res => res.data)
		.catch(error => { throw error })
}
