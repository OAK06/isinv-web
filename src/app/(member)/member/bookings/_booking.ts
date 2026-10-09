import axios from "@/lib/axios"

/** One row of the member's booking history (a past/upcoming class booking). */
export interface PortalBooking {
	id: number
	class: string | null
	start: string | null
	payment_status?: string | null
	attendance_status?: string | null
	session_cancelled?: boolean
}

/** extendedProps riding on a calendar session event; loosely open — many optional fields. */
export interface SessionEventProps {
	class_name?: string | null
	price?: number | string
	[key: string]: any
}

/** A session as a FullCalendar event (public/member sessions feed). */
export interface SessionEvent {
	id: number | string
	title: string
	start: string
	end?: string
	extendedProps?: SessionEventProps
}

/** The logged-in member's booking history at one gym (active-gym branch_id). */
export async function getMyBookings(branchID: number, page: number = 1): Promise<{ response: { data: PortalBooking[] } & Record<string, any> }> {
	return await axios.get(`/api/me/bookings?branch_id=${branchID}&page=${page}`, {
			headers: { 'X-SWR-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

/**
 * A gym's publicly-bookable (available_online) sessions in a date window. Reuses the
 * public endpoint, so it works for gyms the caller isn't a member of yet.
 */
export async function getPublicSessions(branchID: number, start: string, end: string): Promise<{ response: SessionEvent[] }> {
	return await axios.get(`/api/public/sessions?branch_id=${branchID}`, {
			params: { start, end },
			headers: { 'X-SWR-Request': true }
		})
		.then(res => res.data)
		.catch(() => ({ response: [] }))
}

/**
 * Book a public class at any eligible gym. The member record is created only when
 * payment succeeds (backend returns a Stripe checkout_url, or done:true for a free class).
 */
export async function createPublicBooking(data: any) {
	return await axios.post(`/api/me/public-bookings`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

/** Member self-cancel of their own booking (soft-delete, no refund). */
export async function cancelBooking(id: number) {
	return await axios.delete(`/api/me/bookings/${id}`, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}
