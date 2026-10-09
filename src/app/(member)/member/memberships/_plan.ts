import axios from "@/lib/axios"

/** An online-available plan a member can subscribe to at a gym (from the gym policy). */
export interface PlanOption {
	id: number
	name: string
	duration: string
	duration_count: number
	price: number | string
	terms?: string
}

/** A gym's member-facing signup policy + its online plans. */
export interface GymPolicy {
	self_subscribe: boolean
	online_payments: boolean
	sign_required: boolean
	terms: string
	phone: string
	plans: PlanOption[]
}

/** A member's pending plan application (awaiting staff approval), across all gyms. */
export interface PendingApplication {
	id: number
	company_name: string | null
	branch_name: string
	plan_name: string
	membership_start: string | null
	price: number | string
}

/**
 * Member requests a plan via an application (used when the gym has
 * member_self_subscribe OFF). Identity is derived server-side from the member's
 * own record; staff approve to create the membership.
 */
export async function createMemberApplication(data: any) {
	return await axios.post(`/api/me/applications`, data, { headers: { 'X-Form-Request': true } })
		.then(res => res.data)
		.catch(error => { throw error })
}

/** Member self-cancel of their own membership (gym-setting gated server-side). */
export async function cancelPlan(id: number) {
	return await axios.post(`/api/me/plans/${id}/cancel`, {}, { headers: { 'X-Form-Request': true } })
		.then(res => res.data)
		.catch(error => { throw error })
}

/** Member self-pause of their own membership (gym-setting gated server-side). */
export async function pausePlan(id: number, pauseStart: string, pauseEnd: string) {
	return await axios.post(`/api/me/plans/${id}/pause`, { pause_start: pauseStart, pause_end: pauseEnd }, { headers: { 'X-Form-Request': true } })
		.then(res => res.data)
		.catch(error => { throw error })
}

/** Member self-resume (unpause) of their own membership. */
export async function unpausePlan(id: number) {
	return await axios.post(`/api/me/plans/${id}/unpause`, {}, { headers: { 'X-Form-Request': true } })
		.then(res => res.data)
		.catch(error => { throw error })
}

/**
 * The ON feature flags for the member's active gym. /user-branches already returns
 * each branch the user has a role at with its enabled settings (feature_name only),
 * so no dedicated endpoint is needed to know if member_self_cancel/pause are on.
 */
export async function getGymFeatures(branchID: number): Promise<string[]> {
	return (await getGymBranch(branchID)).features
}

/** The active gym's enabled features, member-facing terms text, and public phone (from /user-branches). */
export async function getGymBranch(branchID: number): Promise<{ terms: string, features: string[], phone: string }> {
	return await axios.get(`/user-branches`, { headers: { 'X-SWR-Request': true } })
		.then(res => {
			const branch = (res.data.response ?? []).find((b: any) => b.id === branchID)
			return {
				terms: branch?.terms ?? '',
				features: (branch?.settings ?? []).map((s: any) => s.feature_name),
				phone: branch?.phone ?? '',
			}
		})
		.catch(() => ({ terms: '', features: [], phone: '' }))
}

/**
 * A gym's member-facing signup policy + online plans, readable BEFORE the caller is a
 * member (directory gym or one they already belong to). Drives the new-membership flow:
 * `self_subscribe` picks pay-online-now vs submit-an-application; `plans` are the
 * online-available plans only. See backend MyGymController::gymPolicy.
 */
export async function getGymPolicy(branchID: number, branchCode = ''): Promise<GymPolicy> {
	// branchCode: the share code for an unlisted gym reached by code — proves reach so the
	// gate returns the policy instead of 404ing. Omitted (blank) for directory / own gyms.
	const query = branchCode ? `?branch_code=${encodeURIComponent(branchCode)}` : ''
	return await axios.get(`/api/me/gym-policy/${branchID}${query}`, { headers: { 'X-SWR-Request': true } })
		.then(res => res.data.response)
		.catch(() => ({ self_subscribe: false, online_payments: false, sign_required: false, terms: '', phone: '', plans: [] }))
}

/** The caller's pending plan signups — applications awaiting staff approval, across all gyms. */
export async function getPendingApplications(): Promise<PendingApplication[]> {
	return await axios.get(`/api/me/applications`, { headers: { 'X-SWR-Request': true } })
		.then(res => res.data.response)
		.catch(() => [])
}

/** Record the member's one-time acceptance of GymFlyte's member Terms of Service. */
export async function acceptMemberTerms() {
	return await axios.post(`/api/me/accept-terms`, {}, { headers: { 'X-Form-Request': true } })
		.then(res => res.data)
		.catch(error => { throw error })
}
