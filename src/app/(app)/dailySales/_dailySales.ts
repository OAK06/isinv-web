import axios from "@/lib/axios"

export async function getDailySales(page: number, branchID: number, date: string, sort: string, sort_direction: string) {
	let url = `/api/daily-sales?page=${page}&branch_id=${branchID}&date=${date}`
	if (sort != null)
		url += `&sort=${sort}&sort_direction=${sort_direction}`
	return await axios.get(url)
		.then(res => res.data)
		.catch(error => { throw error })
}
