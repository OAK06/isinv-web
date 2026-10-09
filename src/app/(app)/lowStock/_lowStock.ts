import axios from "@/lib/axios"

export async function getLowStock(page: number, branchID: number, sort: string, sort_direction: string) {
	let url = `/api/low-stock?page=${page}&branch_id=${branchID}`
	if (sort != null)
		url += `&sort=${sort}&sort_direction=${sort_direction}`
	return await axios.get(url)
		.then(res => res.data)
		.catch(error => { throw error })
}
