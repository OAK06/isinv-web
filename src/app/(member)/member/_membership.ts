import axios from "@/lib/axios"

/** A member's current plan summary at one gym (soonest-ending active plan). */
export interface MembershipPlanSummary {
	name: string
	ends_at: string | null
	remaining_entries: number | null
}

/** A member's soonest upcoming booking at one gym. */
export interface MembershipBookingSummary {
	class: string | null
	start: string | null
}

/**
 * One gym the logged-in member belongs to. Mirrors MyMembershipController::index —
 * keep in sync if that resource changes.
 */
export interface Membership {
	member_id: number
	company_id: number
	branch_id: number
	company_name: string | null
	branch_name: string | null
	fullname: string
	email: string
	status: string
	active_plans: number
	outstanding_count: number
	qr_code: string | null
	active_plan: MembershipPlanSummary | null
	next_booking: MembershipBookingSummary | null
}

/**
 * The logged-in member's memberships across every gym they belong to.
 * Backend scopes to the authenticated user (never a client-supplied id).
 */
export async function getMemberships(): Promise<Membership[]> {
	return await axios.get(`/api/me/memberships`, {
			headers: { 'X-SWR-Request': true }
		})
		.then(res => res.data.response)
		.catch(error => { throw error })
}
