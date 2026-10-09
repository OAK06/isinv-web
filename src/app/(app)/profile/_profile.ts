import axios from "@/lib/axios"

export async function editProfile(data: any) {
	return await axios.post(`/api/profiles`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getPaymentMethods(branchID: number, memberID: number) {
	return await axios.get(`/api/payments/member-payment-methods?branch_id=${branchID}&member_id=${memberID}`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function managePaymentMethods(data: any) {
	return await axios.post(`/api/payments/payment-method/save`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

// X-SWR-Request keeps these silent: no loading bar, no global error toasts
// (a failed pref sync should never interrupt the user).
export async function updateThemePreference(theme: "light" | "dark") {
	return await axios.post(`/api/user/theme`, { theme }, {
			headers: { 'X-SWR-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

// Persist the user's language to their account. Silent (X-SWR-Request) so a
// guest's 401 on the public site is ignored rather than redirecting to login.
export async function updateLocalePreference(locale: string) {
	return await axios.post(`/api/user/locale`, { locale }, {
			headers: { 'X-SWR-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}
