import axios from "@/lib/axios"

export interface Staff { id:number; user_id:number|null; fname:string; sname:string; fullname?:string; birth_date:string|null; gender:string|null; email:string; mobile_phone:string|null; home_phone:string|null; address:string|null; city:string|null; country:string|null; blacklist?:any; notes:string|null; file?:{url?:string}|null; [key: string]: any }

export async function getBranchRoles(branchID: number) {
	return await axios.get(`/api/get-branch-roles/${branchID}`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getBranchPosRegisters(branchID: number, active?: boolean) {
    let url = `/api/branch/${branchID}/pos-registers`
    if (active != null)
        url += `?active=${active}`
	return await axios.get(url)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getStaffs(page: number, branchID: number, sort: string, sort_direction: string) {
	let url = `/api/staff?page=${page}&branch_id=${branchID}`
	if (sort != null)
		url += `&sort=${sort}&sort_direction=${sort_direction}`
	return await axios.get(url)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getStaff(id: number): Promise<{ response: Staff }> {
	return await axios.get(`/api/staff/${id}`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function addStaff(data: any) {
	return await axios.post(`/api/staff`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function editStaff(id: number, data: any) {
	return await axios.post(`/api/staff/${id}?_method=PUT`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function deleteStaff(id: number) {
	return await axios.delete(`/api/staff/${id}`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function bulkDeleteStaff(data: any) {
	return await axios.delete(`/api/staff/delete/bulk`, data)
		.then(res => res.data)
		.catch(error => { throw error })
}