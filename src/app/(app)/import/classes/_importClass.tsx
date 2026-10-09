import axios from "@/lib/axios"

export async function checkClassFile(data: any) {
	return await axios.post(`/api/import-classes`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getImportClasses(page: number, batchID: string, branchID: number) {
	let url = `/api/import-classes?page=${page}&batch_id=${batchID}&branch_id=${branchID}`
	return await axios.get(url, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function importClasses(batchID: string, branchID: number) {
	return await axios.get(`/api/import-classes/create?batch_id=${batchID}&branch_id=${branchID}`)
		.then(res => res.data)
		.catch(error => { throw error })
}
