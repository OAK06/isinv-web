import axios from "@/lib/axios"

export interface MemberInvoice { id:number; reference?:string|null; total_price?:number|string; total_tax?:any; state?:any; payment_method?:any; created_at?:string|null; [key: string]: any }

/** The member's invoices (bills/purchases) at the active gym, optionally filtered. */
export async function getInvoices(branchID: number, page: number = 1, operationType: number | null = null, state: number | null = null) {
	const params = new URLSearchParams({ branch_id: String(branchID), page: String(page) })
	if (operationType !== null) params.set('operation_type', String(operationType))
	if (state !== null) params.set('state', String(state))
	return await axios.get(`/api/me/invoices?${params.toString()}`, { headers: { 'X-SWR-Request': true } })
		.then(res => res.data.response)
		.catch(error => { throw error })
}

/** One invoice's detail: { invoice, items, payments }. */
export async function getInvoice(id: number): Promise<{ response: MemberInvoice }> {
	return await axios.get(`/api/me/invoices/${id}`, { headers: { 'X-SWR-Request': true } })
		.then(res => res.data.response)
		.catch(error => { throw error })
}
