import axios from "@/lib/axios"

export async function checkMemberFile(data: any) {
	return await axios.post(`/api/import-members`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getImportMembers(page: number, batchID: string, branchID: number) {
	let url = `/api/import-members?page=${page}&batch_id=${batchID}&branch_id=${branchID}`
	return await axios.get(url, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function importMembers(params: any) {
	return await axios.get(`/api/import-members/create?${params.toString()}`)
		.then(res => res.data)
		.catch(error => { throw error })
}