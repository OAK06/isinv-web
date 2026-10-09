import axios from "@/lib/axios"

export interface CalendarSession { id:number|string; title?:string; start?:string; end?:string; extendedProps?:any; [key: string]: any }

export async function getEvents(branchID: number, start: string, end: string) {
	return await axios.get(`/api/sessions?branch_id=${branchID}`, { params: {start, end}})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getOnlineEvents(branchID: number, start: string, end: string) {
	return await axios.get(`/api/public/sessions?branch_id=${branchID}`, { params: {start, end}})
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

export async function getSession(id: number): Promise<{ response: CalendarSession }> {
	return await axios.get(`/api/sessions/${id}`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function addSession(data: any) {
	return await axios.post(`/api/sessions`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function deleteSession(id: number) {
	return await axios.delete(`/api/sessions/${id}`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function searchMembers(sessionID: number, branchID: number, query: any) {
	return await axios.get(`/api/sessions/${sessionID}/members/search`, {
            params: {
                branch_id: branchID,
                query,
            },
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function attachMember(data: any) {
	return await axios.post(`/api/bookings`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function detachMember(sessionID: number, memberID: number, withRefund: any) {
	return await axios.get(`/api/bookings/create`, {
            params: {
                session_id: sessionID,
                member_id: memberID,
                with_refund: withRefund,
            },
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}