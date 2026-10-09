import axios from "@/lib/axios"

export async function getDashboardCards(branchID: number) {
	return await axios.get(`/api/dashboard-cards?branch=${branchID}`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function saveDashboardCards(branchID: number, roleId: number, cards: string[]) {
	return await axios.put(`/api/dashboard-cards`, { branch: branchID, role_id: roleId, cards }, {
			headers: { 'X-Form-Request': true },
		})
		.then(res => res.data)
		.catch(error => { throw error })
}
