import axios from "@/lib/axios"

/** One saved card at a gym (the gym's own Stripe). `is_default` is a stringified bool. */
export interface PaymentMethod {
	id: number
	is_default: string
	card_brand: string
	last_four: string
	exp_month: number | string
	exp_year: number | string
}

/** Add a saved card (self-scoped) — returns the Stripe Billing Portal URL to redirect to. */
export async function addMyPaymentMethod(branchID: number, returnUrl: string) {
	return await axios.post(`/api/me/payment-methods`, { branch_id: branchID, return_url: returnUrl }, { headers: { 'X-Form-Request': true } })
		.then(res => res.data)
		.catch(error => { throw error })
}

/**
 * The member's saved cards at the active gym (self-scoped server-side), plus
 * whether this gym can actually charge cards (`paymentsEnabled` — the portal hides
 * "add card" when the gym hasn't connected its own Stripe).
 */
export async function getMyPaymentMethods(branchID: number): Promise<{ cards: PaymentMethod[], paymentsEnabled: boolean }> {
	return await axios.get(`/api/me/payment-methods?branch_id=${branchID}`, { headers: { 'X-SWR-Request': true } })
		.then(res => ({ cards: res.data.response, paymentsEnabled: !!res.data.payments_enabled }))
		.catch(error => { throw error })
}

/** Remove one of the member's saved cards (detaches it from the gym's Stripe). */
export async function deleteMyPaymentMethod(id: number) {
	return await axios.delete(`/api/me/payment-methods/${id}`, { headers: { 'X-Form-Request': true } })
		.then(res => res.data)
		.catch(error => { throw error })
}

/** Make one of the member's cards their default. */
export async function setDefaultCard(id: number) {
	return await axios.post(`/api/me/payment-methods/${id}/default`, {}, { headers: { 'X-Form-Request': true } })
		.then(res => res.data)
		.catch(error => { throw error })
}
