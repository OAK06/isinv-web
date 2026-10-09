import axios from "@/lib/axios"

export async function getBilling(branchID: number) {
	return await axios.get(`/api/billing?branch=${branchID}`, { headers: { 'X-SWR-Request': true } })
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function billingCheckout(branchID: number) {
	return await axios.post(`/api/billing/checkout`, { branch: branchID }, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function cancelSubscription(branchID: number) {
	return await axios.post(`/api/billing/cancel`, { branch: branchID }, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function reactivateSubscription(branchID: number) {
	return await axios.post(`/api/billing/reactivate`, { branch: branchID }, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function updateBillingAddons(branchID: number, addons: string[]) {
	return await axios.post(`/api/billing/addons`, { branch: branchID, addons }, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

/** Set the addons active at ONE branch (per-location gating + billing). */
export async function updateBillingBranchAddons(branchID: number, targetBranchID: number, addons: string[]) {
	return await axios.post(`/api/billing/branch-addons`, { branch: branchID, branch_id: targetBranchID, addons }, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

/**
 * IRREVERSIBLE: permanently deletes the company's operational + member/staff
 * data (billing records are kept for legal/tax reasons). Owner-only,
 * password-confirmed, requires typing "DELETE" — enforced server-side too.
 * No branch param needed: the backend resolves the owner's own company
 * regardless (same fallback every other billing endpoint relies on).
 */
export async function closeAccount(password: string, confirmation: string) {
	return await axios.post(`/api/billing/close-account`, { password, confirmation }, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}
