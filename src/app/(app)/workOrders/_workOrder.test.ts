import { describe, it, expect, vi, beforeEach } from "vitest"

const state = vi.hoisted(() => ({ rec: [] as { method: string; url: string; headers: any }[] }))
vi.mock("@/lib/axios", () => {
	const cap = (method: string) => (url: string, ...rest: any[]) => {
		const cfg = rest.find(x => x && typeof x === "object" && "headers" in x)
		state.rec.push({ method, url, headers: cfg?.headers ?? {} })
		return Promise.resolve({ data: {} })
	}
	return { default: { get: cap("get"), post: cap("post"), put: cap("put"), delete: cap("delete"), patch: cap("patch") } }
})

import {
	getWorkOrders,
	getWorkOrder,
	addWorkOrder,
	editWorkOrder,
	deleteWorkOrder,
	bulkDeleteWorkOrder,
	approveWorkOrder,
	rejectWorkOrder,
	startWorkOrder,
	completeWorkOrder,
	invoiceWorkOrder,
	getBranchStaff,
} from "./_workOrder"

const last = () => state.rec[state.rec.length - 1]
beforeEach(() => { state.rec.length = 0 })

describe("_workOrder wrappers", () => {
	it("getWorkOrders builds a paginated URL; omits sort when null", async () => {
		await getWorkOrders(2, 7, null as any, null as any)
		expect(last()).toMatchObject({ method: "get", url: "/api/work-orders?page=2&branch_id=7" })
	})

	it("getWorkOrders appends sort + direction when provided", async () => {
		await getWorkOrders(1, 3, "title", "asc")
		expect(last().url).toBe("/api/work-orders?page=1&branch_id=3&sort=title&sort_direction=asc")
	})

	it("getWorkOrder hits the show route", async () => {
		await getWorkOrder(9)
		expect(last()).toMatchObject({ method: "get", url: "/api/work-orders/9" })
	})

	it("addWorkOrder POSTs to the collection with the form header", async () => {
		await addWorkOrder({})
		expect(last()).toMatchObject({ method: "post", url: "/api/work-orders" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("editWorkOrder POSTs with the ?_method=PUT override and the form header", async () => {
		await editWorkOrder(9, {})
		expect(last()).toMatchObject({ method: "post", url: "/api/work-orders/9?_method=PUT" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("deleteWorkOrder DELETEs by id", async () => {
		await deleteWorkOrder(9)
		expect(last()).toMatchObject({ method: "delete", url: "/api/work-orders/9" })
	})

	it("bulkDeleteWorkOrder DELETEs the bulk endpoint", async () => {
		await bulkDeleteWorkOrder({})
		expect(last()).toMatchObject({ method: "delete", url: "/api/work-orders/delete/bulk" })
	})

	it("approveWorkOrder POSTs to the approve action route", async () => {
		await approveWorkOrder(9)
		expect(last()).toMatchObject({ method: "post", url: "/api/work-orders/9/approve" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("rejectWorkOrder POSTs to the reject action route", async () => {
		await rejectWorkOrder(9)
		expect(last()).toMatchObject({ method: "post", url: "/api/work-orders/9/reject" })
	})

	it("startWorkOrder POSTs to the start action route", async () => {
		await startWorkOrder(9)
		expect(last()).toMatchObject({ method: "post", url: "/api/work-orders/9/start" })
	})

	it("completeWorkOrder POSTs to the complete action route", async () => {
		await completeWorkOrder(9)
		expect(last()).toMatchObject({ method: "post", url: "/api/work-orders/9/complete" })
	})

	it("invoiceWorkOrder POSTs to the invoice action route with an optional payload", async () => {
		await invoiceWorkOrder(9, { payment_method: "cash" })
		expect(last()).toMatchObject({ method: "post", url: "/api/work-orders/9/invoice" })
		expect(last().headers["X-Form-Request"]).toBe(true)
	})

	it("getBranchStaff hits the branch staff route", async () => {
		await getBranchStaff(7)
		expect(last()).toMatchObject({ method: "get", url: "/api/get-branch-staff/7" })
	})
})
