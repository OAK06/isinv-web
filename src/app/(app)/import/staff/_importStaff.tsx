import axios from "@/lib/axios"

export async function checkStaffFile(data: any) {
	return await axios.post(`/api/import-staff`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getImportStaff(page: number, batchID: string, branchID: number) {
	let url = `/api/import-staff?page=${page}&batch_id=${batchID}&branch_id=${branchID}`
	return await axios.get(url, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function importStaff(batchID: string, branchID: number) {
	return await axios.get(`/api/import-staff/create?batch_id=${batchID}&branch_id=${branchID}`)
		.then(res => res.data)
		.catch(error => { throw error })
}
