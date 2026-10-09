import axios from "@/lib/axios"

export interface WorkOrderItem {
	id?: number
	item_type: "product" | "service" | "custom" | "glass"
	product_id?: number | null
	name: string
	quantity: number | string
	width?: number | string | null
	height?: number | string | null
	unit?: string | null
	unit_price: number | string
	line_tax?: number | string | null
	line_total?: number | string
	notes?: string | null
	[key: string]: any
}

export interface WorkOrder {
	id: number
	reference?: string | null
	customer_name?: string | null
	customer_phone?: string | null
	customer_email?: string | null
	title: string
	description?: string | null
	status?: any
	status_name?: string
	job_type?: string | null
	site_address?: string | null
	vehicle_make?: string | null
	vehicle_model?: string | null
	vehicle_plate?: string | null
	property_type?: string | null
	assigned_to?: number | null
	scheduled_at?: string | null
	subtotal?: number | string
	discount?: number | string
	total_tax?: number | string
	total_price?: number | string
	notes?: string | null
	invoice_id?: number | null
	items?: WorkOrderItem[]
	assignedStaff?: any
	invoice?: any
	[key: string]: any
}

export async function getBranchStaff(branchID: number) {
	return await axios.get(`/api/get-branch-staff/${branchID}`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getWorkOrders(page: number, branchID: number, sort: string, sort_direction: string) {
	let url = `/api/work-orders?page=${page}&branch_id=${branchID}`
	if (sort != null)
		url += `&sort=${sort}&sort_direction=${sort_direction}`
	return await axios.get(url)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getWorkOrder(id: number): Promise<{ response: WorkOrder }> {
	return await axios.get(`/api/work-orders/${id}`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function addWorkOrder(data: any) {
	return await axios.post(`/api/work-orders`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function editWorkOrder(id: number, data: any) {
	return await axios.post(`/api/work-orders/${id}?_method=PUT`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function deleteWorkOrder(id: number) {
	return await axios.delete(`/api/work-orders/${id}`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function bulkDeleteWorkOrder(data: any) {
	return await axios.delete(`/api/work-orders/delete/bulk`, data)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function approveWorkOrder(id: number) {
	return await axios.post(`/api/work-orders/${id}/approve`, {}, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function rejectWorkOrder(id: number) {
	return await axios.post(`/api/work-orders/${id}/reject`, {}, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function startWorkOrder(id: number) {
	return await axios.post(`/api/work-orders/${id}/start`, {}, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function completeWorkOrder(id: number) {
	return await axios.post(`/api/work-orders/${id}/complete`, {}, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function invoiceWorkOrder(id: number, data: any = {}) {
	return await axios.post(`/api/work-orders/${id}/invoice`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}
