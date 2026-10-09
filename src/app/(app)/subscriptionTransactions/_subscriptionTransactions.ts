import axios from "@/lib/axios"

export async function getSubscriptionTransactions(page: number, branchID: number, fromDate: string, toDate: string, sort: string, sort_direction: string) {
	let url = `/api/subscription-transactions?page=${page}&branch_id=${branchID}&from_date=${fromDate}&to_date=${toDate}`
	if (sort != null)
		url += `&sort=${sort}&sort_direction=${sort_direction}`
	return await axios.get(url)
		.then(res => res.data)
		.catch(error => { throw error })
}
