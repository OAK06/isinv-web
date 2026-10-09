import axios from "@/lib/axios"

export interface GymClass { id:number; name:string; description?:string|null; plan_id?:number|null; price:number|string; tax_percentage?:any; slots?:any; wait_list?:any; active?:any; color?:string|null; class_manager?:any; class_trainer?:any; photo_id?:number|null; [key: string]: any }

export async function getCompanyBranches(companyID: number) {
	return await axios.get(`/api/company/${companyID}/branches`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getBranchPlans(branchID: number, scope?: string) {
	return await axios.get(`/api/branch-plans/${branchID}?scope=${scope}`, {
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

export async function getClasses(page: number, branchID: number, sort: string, sort_direction: string, active: boolean) {
	let url = `/api/classes?page=${page}&branch_id=${branchID}&active=${active}`
	if (sort != null)
		url += `&sort=${sort}&sort_direction=${sort_direction}`
	return await axios.get(url)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getClass(id: number): Promise<{ response: GymClass }> {
	return await axios.get(`/api/classes/${id}`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function addClass(data: any) {
	return await axios.post(`/api/classes`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function editClass(id: number, data: any) {
	return await axios.post(`/api/classes/${id}?_method=PUT`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function deleteClass(id: number) {
	return await axios.delete(`/api/classes/${id}`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function bulkDeleteClass(data: any) {
	return await axios.delete(`/api/classes/delete/bulk`, data)
		.then(res => res.data)
		.catch(error => { throw error })
}