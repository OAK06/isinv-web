import axios from "@/lib/axios"

export async function getBranchSettings(branchID: number) {
	let url = `/api/branch_settings?branch_id=${branchID}`
	return await axios.get(url)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function editBranchSettings(data: any) {
	return await axios.post(`/api/branch_settings/update`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function saveApiKeys(data: any) {
	return await axios.post(`/api/payments/connect-keys`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

// Stripe Connect OAuth onboarding — used only when the platform has a
// STRIPE_CLIENT_ID configured (stripe_connect_enabled). Otherwise the direct
// keys flow (saveApiKeys) is used.
export async function handleOnboarding(data: any) {
	return await axios.post(`/api/payments/onboard`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}