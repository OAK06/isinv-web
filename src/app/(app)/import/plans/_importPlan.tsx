import axios from "@/lib/axios"

export async function checkPlanFile(data: any) {
	return await axios.post(`/api/import-plans`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getImportPlans(page: number, batchID: string, branchID: number) {
	let url = `/api/import-plans?page=${page}&batch_id=${batchID}&branch_id=${branchID}`
	return await axios.get(url, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function importPlans(batchID: string, branchID: number) {
	return await axios.get(`/api/import-plans/create?batch_id=${batchID}&branch_id=${branchID}`)
		.then(res => res.data)
		.catch(error => { throw error })
}