import axios from "@/lib/axios"

export interface RoleWithPermissions { id:number; name:string; permissions?:any[]; [key: string]: any }

export async function getRoles(page: number, branchID: number, sort: string, sort_direction: string) {
	let url = `/api/roles?page=${page}&branch_id=${branchID}`
	if (sort != null)
		url += `&sort=${sort}&sort_direction=${sort_direction}`
	return await axios.get(url)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getCompanies() {
	return await axios.get(`/api/getCompanies`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getCompanyBranches(companyID: number) {
	return await axios.get(`/api/company/${companyID}/branches`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getBranchRoles(branchID: number) {
	return await axios.get(`/api/get-branch-roles/${branchID}`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getPermissions(branchID: number) {
	return await axios.get(`/api/get-permissions?branch_id=${branchID}`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function assignPermissionsToRole(data: any) {
	return await axios.post(`/api/assignPermissionsRole`, data, {
		headers: { 'X-Form-Request': true }
	})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getRoleWithPermissions(id: number): Promise<{ response: RoleWithPermissions }> {
	return await axios.get(`/api/roles/${id}`)
		.then(res => res.data)
		.catch(error => { throw error })
}