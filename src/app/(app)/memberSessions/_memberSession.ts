import axios from "@/lib/axios"

export async function getMemberSessions(branchID: number, start: string, end: string) {
	return await axios.get(`/api/me/sessions?branch_id=${branchID}`, { params: {start, end}})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getBranchStaff(branchID: number) {
	return await axios.get(`/api/get-branch-staff/${branchID}`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getBranchClasses(branchID: number) {
	return await axios.get(`/api/get-branch-classes/${branchID}`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function bookSession(data: any) {
	return await axios.post(`/api/me/sessions`, data)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function verifyPaymentSession(data: any) {
	return await axios.post(`/api/payments/payment-session/verify`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}