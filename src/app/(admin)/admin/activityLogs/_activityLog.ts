import axios from "@/lib/axios"

export interface ActivityLog { id:number; [key: string]: any }

export async function getActivities(page: number) {
	return await axios.get(`/api/activityLogs?page=${page}`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getActivity(id: number): Promise<{ response: ActivityLog }> {
	return await axios.get(`/api/activityLogs/${id}`)
		.then(res => res.data)
		.catch(error => { throw error })
}
