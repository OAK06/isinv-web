import axios from "@/lib/axios"

/** Reports the current user should see (union of their roles' selections, permission-gated). */
export async function getMyReports(branchID: number) {
	return await axios.get(`/api/my-reports?branch_id=${branchID}`, { headers: { 'X-SWR-Request': true } })
		.then(res => res.data)
		.catch(error => { throw error })
}

/** Catalog + every company role's effective report selection (owner admin). */
export async function getReportsAccess(branchID: number) {
	return await axios.get(`/api/reports-access?branch=${branchID}`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function saveReportsAccess(branchID: number, roleId: number, reports: string[]) {
	return await axios.put(`/api/reports-access`, { branch: branchID, role_id: roleId, reports }, {
			headers: { 'X-Form-Request': true },
		})
		.then(res => res.data)
		.catch(error => { throw error })
}
