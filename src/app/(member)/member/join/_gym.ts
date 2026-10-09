import axios from "@/lib/axios"
// Resolve a gym by its share code (branch hashed id) — reuses the public endpoint.
export { getHashedBranch } from "@/app/(auth)/signup/_signup"

/** A gym as it appears in the public directory / find-a-gym search. */
export interface DirectoryGym {
	branch_id: number
	company_name: string
	name: string
	city?: string | null
}

/** Public gym directory (gyms that opted into listing), optionally searched. */
export async function getGyms(search: string = ''): Promise<DirectoryGym[]> {
	return await axios.get(`/api/me/gyms?search=${encodeURIComponent(search)}`, { headers: { 'X-SWR-Request': true } })
		.then(res => res.data.response)
		.catch(() => [])
}

/** Join a gym: creates the caller's member profile there (no plan needed). */
export async function joinGym(data: any) {
	return await axios.post(`/api/me/join`, data, { headers: { 'X-Form-Request': true } })
		.then(res => res.data)
		.catch(error => { throw error })
}
