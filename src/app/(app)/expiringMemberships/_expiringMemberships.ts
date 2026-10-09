import axios from "@/lib/axios"

export async function getExpiringMemberships(page: number, branchID: number, window: string, sort: string, sort_direction: string) {
	let url = `/api/expiring-memberships?page=${page}&branch_id=${branchID}&window=${window}`
	if (sort != null)
		url += `&sort=${sort}&sort_direction=${sort_direction}`
	return await axios.get(url)
		.then(res => res.data)
		.catch(error => { throw error })
}
