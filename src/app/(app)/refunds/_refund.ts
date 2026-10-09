import axios from "@/lib/axios"

export async function getRefunds(page: number, branchID: number, posRegisterID: number, sort: string, sort_direction: string) {
	let url = `/api/refunds?page=${page}&branch_id=${branchID}&pos_register_id=${posRegisterID}`
	if (sort != null)
		url += `&sort=${sort}&sort_direction=${sort_direction}`
	return await axios.get(url)
		.then(res => res.data)
		.catch(error => { throw error })
}
