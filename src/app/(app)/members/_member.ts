import axios from "@/lib/axios"

/**
 * A gym member. Mirrors the Member model / MemberController@show. The index sig keeps
 * it tolerant of extra columns (created_by, gateway, …) and loaded relations while still
 * type-checking the fields the UI reads.
 */
export interface Member {
	id: number
	company_id: number
	branch_id: number
	user_id: number | null
	fname: string
	sname: string
	fullname?: string
	birth_date: string | null
	gender: string | null
	email: string
	mobile_phone: string | null
	home_phone: string | null
	address: string | null
	city: string | null
	country: string | null
	emg_contact_name: string | null
	emg_contact_relation: string | null
	emg_contact_mobilenumber: string | null
	emg_contact_email: string | null
	status: any
	status_name?: string
	notes: string | null
	has_health_conditions: any
	health_conditions: string | null
	medications: string | null
	block_booking: any
	referred_by: number | null
	qr_code: string | null
	file?: { url?: string } | null
	member_plans?: any[]
	invoices?: any[]
	member_notes?: any[]
	[key: string]: any
}

export async function getMembers(page: number, branchID: number, sort: string, sort_direction: string) {
	let url = `/api/members?page=${page}&branch_id=${branchID}`
	if (sort != null)
		url += `&sort=${sort}&sort_direction=${sort_direction}`
	return await axios.get(url)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getMember(id: number): Promise<{ response: Member }> {
	return await axios.get(`/api/members/${id}`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function exportMemberData(id: number) {
	return await axios.get(`/api/members/${id}/export`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function eraseMember(id: number) {
	return await axios.delete(`/api/members/${id}/erase`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function addMember(data: any) {
	return await axios.post(`/api/members`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function addMemberPlan(data: any, memberID: number) {
	return await axios.post(`/api/memberPlans?member_id=${memberID}`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function addMemberNote(data: any) {
	return await axios.post(`/api/memberNotes`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function editMember(id: number, data: any) {
	return await axios.post(`/api/members/${id}?_method=PUT`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function deleteMemberNote(id: number) {
	return await axios.delete(`/api/memberNotes/${id}`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getBranchPlans(branchID: number) {
	return await axios.get(`/api/branch-plans/${branchID}`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function editMemberPlan(id: number, data: any) {
	return await axios.post(`/api/memberPlans/${id}?_method=PUT`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function pauseMemberPlan(data: any) {
	return await axios.post(`/api/pauses`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function unpauseMemberPlan(memberPlanID: number, data: any) {
	return await axios.post(`/api/pauses/${memberPlanID}?_method=PUT`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function cancelMemberPlan(id: number, data: any) {
	return await axios.post(`/api/memberPlans/${id}/cancel`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function addEntry(data: any) {
	return await axios.post(`/api/member-qr`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function payMemberPlan(id: number, data: any) {
	return await axios.post(`/api/memberPlans/${id}/pay`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function sendSignatureMail(id: number) {
	return await axios.get(`/api/signatures/${id}`)
		.then(res => res.data)
		.catch(error => { throw error })
}