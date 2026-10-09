import axios from "@/lib/axios"

/** Top-level nav entries the current user should see (union of their roles' selections). */
export async function getMySidebar(branchID: number) {
	return await axios.get(`/api/my-sidebar?branch_id=${branchID}`, { headers: { 'X-SWR-Request': true } })
		.then(res => res.data)
		.catch(error => { throw error })
}

/** Catalog + every company role's effective sidebar selection (owner admin). */
export async function getSidebarAccess(branchID: number) {
	return await axios.get(`/api/sidebar-access?branch=${branchID}`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function saveSidebarAccess(branchID: number, roleId: number, sidebar: string[]) {
	return await axios.put(`/api/sidebar-access`, { branch: branchID, role_id: roleId, sidebar }, {
			headers: { 'X-Form-Request': true },
		})
		.then(res => res.data)
		.catch(error => { throw error })
}
