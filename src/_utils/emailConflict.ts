import axios from "@/lib/axios"

/** Guest forms: only whether an account exists (no enumeration of who). */
export async function checkEmailPublic(email: string): Promise<{ exists: boolean }> {
	return await axios.get(`/api/public/check-email?email=${encodeURIComponent(email)}`, { headers: { 'X-SWR-Request': true } })
		.then(res => res.data)
		.catch(() => ({ exists: false }))
}

/** Authed staff forms: whether it exists + the account holder's name (for "link to X"). */
export async function checkEmailStaff(email: string): Promise<{ exists: boolean, name?: string }> {
	return await axios.get(`/api/check-email?email=${encodeURIComponent(email)}`, { headers: { 'X-SWR-Request': true } })
		.then(res => res.data)
		.catch(() => ({ exists: false }))
}
