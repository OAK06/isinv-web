import axios from "@/lib/axios"

/**
 * Paginated, searchable list of ALL branches (real + demo) for the Super-Admin
 * tenant switcher. Backed by `GET /api/admin/tenants` (role:Super Admin).
 */
export async function getTenants(page: number, search: string = '') {
	let url = `/api/admin/tenants?page=${page}`
	if (search) url += `&search=${encodeURIComponent(search)}`
	return await axios.get(url)
		.then(res => res.data)
		.catch(error => { throw error })
}
