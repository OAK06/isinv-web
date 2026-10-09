import axios from "@/lib/axios"

export async function getRefundsReport(page: number, branchID: number, from: string, to: string, sort: string, sort_direction: string) {
	let url = `/api/refunds-report?page=${page}&branch_id=${branchID}`
	if (from) url += `&from=${from}`
	if (to) url += `&to=${to}`
	if (sort != null)
		url += `&sort=${sort}&sort_direction=${sort_direction}`
	return await axios.get(url)
		.then(res => res.data)
		.catch(error => { throw error })
}
