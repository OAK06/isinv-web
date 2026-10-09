import axios from "@/lib/axios"

export interface ArchivedRecord {
	id: number
	label: string
	deleted_at: string
}

/**
 * Super-Admin "Archive" (trash) screen. Lists soft-deleted rows for one of the
 * archivable entities and lets the Super Admin restore or permanently erase
 * them. Backed by `GET/POST/DELETE /api/admin/archive/{entity}...`
 * (role:Super Admin) — contract fixed server-side, don't change it here.
 */
export async function getArchived(entity: string, page: number, branchID?: number) {
	let url = `/api/admin/archive/${entity}?page=${page}`
	if (branchID) url += `&branch_id=${branchID}`
	return await axios.get(url)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function restoreArchived(entity: string, id: number) {
	return await axios.post(`/api/admin/archive/${entity}/${id}/restore`, {}, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function eraseArchived(entity: string, id: number) {
	return await axios.delete(`/api/admin/archive/${entity}/${id}`)
		.then(res => res.data)
		.catch(error => { throw error })
}
