import axios from "@/lib/axios"

export interface HashedApplication { id:number; fname?:string; sname?:string; email?:string; plan_id?:number|null; status?:any; [key: string]: any }

export async function getHashedBranch(id: any) {
	return await axios.get(`/api/get-hashed-branch/${id}`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getOnlineBranchPlans(branchID: number) {
	return await axios.get(`/api/public/branch-plans/${branchID}`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function addApplication(data: any) {
	return await axios.post(`/api/applications`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getHashedApplication(id: number): Promise<{ response: HashedApplication }> {
	return await axios.get(`/api/get-hashed-application/${id}`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function bookingByLogin(data: any) {
	return await axios.post(`/api/booking-with-credentials`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function bookingByRegister(data: any) {
	return await axios.post(`/api/booking-without-credentials`, data, {
			headers: { 'X-Form-Request': true }
		})
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

export async function managePaymentMethods(data: any) {
	return await axios.post(`/api/payments/payment-method/save`, data, {
			headers: { 'X-Form-Request': true }
		})
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