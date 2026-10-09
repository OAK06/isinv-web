"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useBreadcrumbLabel } from "@/hooks/useBreadcrumbLabel"

import { getWorkOrder, approveWorkOrder, rejectWorkOrder, startWorkOrder, completeWorkOrder, invoiceWorkOrder } from "@/app/(app)/workOrders/_workOrder"
import { WorkOrder } from "@/app/(app)/workOrders/_workOrder"
import { useTranslation } from "next-i18next"
import Header from "@/app/(app)/_components/header"
import { useAuth } from "@/hooks/auth"
import { useConfirm } from "@/_components/useConfirm"
import { formatCurrency } from "@/_helpers/currency"
import { responseMessage, store } from "@/_state/globalStore"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faScrewdriverWrench } from "@fortawesome/free-solid-svg-icons"

const STATUS_BADGE: Record<string, string> = {
	quote: "badge-ghost",
	approved: "badge-info",
	inProgress: "badge-warning",
	completed: "badge-success",
	invoiced: "badge-primary",
	cancelled: "badge-error",
	rejected: "badge-error",
}

export default function WorkOrderView({ params }: any) {
    const { t } = useTranslation('common')
	const router = useRouter()
	const { workOrder_id }: any = params
	const [data, setData] = useState<WorkOrder>({} as WorkOrder)
	const [isBusy, setIsBusy] = useState(false)
	const { user } = useAuth({ middleware: "auth" })
	const { confirm, confirmModal } = useConfirm()
	useBreadcrumbLabel(data.title)

	const load = () => {
		getWorkOrder(workOrder_id).then((returnData: any) => setData(returnData.response))
	}

	useEffect(() => {
		load()
	}, [])

	const runAction = async (action: () => Promise<any>, successKey: string) => {
		setIsBusy(true)
		await action().then(() => {
			store.set(responseMessage, { type: "success", text: t(successKey) })
			load()
		})
		.finally(() => setIsBusy(false))
	}

	const handleReject = async () => {
		if (!await confirm(t('workOrders.rejectConfirm'))) return
		runAction(() => rejectWorkOrder(workOrder_id), 'workOrders.rejectedMessage')
	}

	const handleInvoice = async () => {
		await invoiceWorkOrder(workOrder_id).then((returnData: any) => {
			store.set(responseMessage, { type: "success", text: t('workOrders.invoicedMessage') })
			router.push(`/sales/${returnData.response.id}`)
		})
	}

	const status = data.status_name
	const can = (perm: string) => user.permissions.includes(perm)

	return <>
		{confirmModal}
		<Header
			title={<div className="flex items-center gap-4">
				<div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"><FontAwesomeIcon icon={faScrewdriverWrench} className="text-2xl" /></div>
				<div className="min-w-0">
					<h1 className="text-2xl font-bold leading-tight truncate">{data.title}</h1>
					<div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-base-content/60">
						<span>{data.reference}</span>
						{status && <div className={`badge badge-lg ${STATUS_BADGE[status] ?? 'badge-ghost'}`}>{t(`workOrders.statuses.${status}`)}</div>}
					</div>
				</div>
			</div>}
			containerClass="flex flex-wrap items-center justify-between gap-4"
		/>

		<div className="mt-6 space-y-6">
			<div className="card bg-base-100 border border-base-200 shadow-sm">
				<div className="card-body">
					<h2 className="card-title text-lg mb-4 gap-3">
						<span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><FontAwesomeIcon icon={faScrewdriverWrench} /></span>
						{t('workOrders.jobDetails')}
					</h2>
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
						<div className="flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('workOrders.customerName')}</span>
							<span className="text-base-content">{data.customer_name || '-'}</span>
						</div>
						<div className="flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('workOrders.customerPhone')}</span>
							<span className="text-base-content">{data.customer_phone || '-'}</span>
						</div>
						<div className="flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('workOrders.customerEmail')}</span>
							<span className="text-base-content">{data.customer_email || '-'}</span>
						</div>
						<div className="flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('workOrders.assignedTo')}</span>
							<span className="text-base-content">{data.assignedStaff ? (data.assignedStaff.fullname ?? `${data.assignedStaff.fname} ${data.assignedStaff.sname}`) : t('workOrders.unassigned')}</span>
						</div>
						<div className="flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('workOrders.jobType')}</span>
							<span className="text-base-content">{data.job_type || '-'}</span>
						</div>
						<div className="flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('workOrders.siteAddress')}</span>
							<span className="text-base-content">{data.site_address || '-'}</span>
						</div>
						<div className="flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('workOrders.propertyType')}</span>
							<span className="text-base-content">{data.property_type || '-'}</span>
						</div>
						<div className="flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('workOrders.vehicleMake')}</span>
							<span className="text-base-content">{data.vehicle_make || '-'}</span>
						</div>
						<div className="flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('workOrders.vehicleModel')}</span>
							<span className="text-base-content">{data.vehicle_model || '-'}</span>
						</div>
						<div className="flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('workOrders.vehiclePlate')}</span>
							<span className="text-base-content">{data.vehicle_plate || '-'}</span>
						</div>
						<div className="lg:col-span-2 flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('workOrders.scheduledAt')}</span>
							<span className="text-base-content">{data.scheduled_at ? new Date(data.scheduled_at).toLocaleString() : '-'}</span>
						</div>
						{data.description && (
							<div className="lg:col-span-2">
								<span className="font-semibold text-base-content/70 block mb-2">{t('workOrders.description')}</span>
								<p className="text-base-content bg-base-200 rounded-lg p-3">{data.description}</p>
							</div>
						)}
						{data.notes && (
							<div className="lg:col-span-2">
								<span className="font-semibold text-base-content/70 block mb-2">{t('workOrders.notes')}</span>
								<p className="text-base-content bg-base-200 rounded-lg p-3">{data.notes}</p>
							</div>
						)}
					</div>
				</div>
			</div>

			<div className="card bg-base-100 border border-base-200 shadow-sm">
				<div className="card-body">
					<h2 className="card-title text-lg mb-4 gap-3">
						<span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><FontAwesomeIcon icon={faScrewdriverWrench} /></span>
						{t('workOrders.lineItems')}
					</h2>
					<div className="overflow-x-auto">
						<table className="table table-sm w-full">
							<thead>
								<tr>
									<th>{t('workOrders.itemType')}</th>
									<th>{t('workOrders.itemDescription')}</th>
									<th>{t('workOrders.quantity')}</th>
									<th>{t('workOrders.width')}</th>
									<th>{t('workOrders.height')}</th>
									<th>{t('workOrders.unitPrice')}</th>
									<th>{t('workOrders.lineTax')}</th>
									<th>{t('workOrders.lineTotal')}</th>
								</tr>
							</thead>
							<tbody>
								{data.items?.map((item: any) => (
									<tr key={item.id}>
										<td>{t(`workOrders.itemTypes.${item.item_type}`)}</td>
										<td>{item.product?.name || item.name}</td>
										<td>{item.quantity}</td>
										<td>{item.width || '-'}</td>
										<td>{item.height || '-'}</td>
										<td>{formatCurrency(item.unit_price)}</td>
										<td>{formatCurrency(item.line_tax)}</td>
										<td className="font-semibold">{formatCurrency(item.line_total)}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
					<div className="flex justify-end mt-4">
						<div className="w-full max-w-xs space-y-2">
							<div className="flex justify-between text-sm">
								<span className="text-base-content/70">{t('workOrders.subtotal')}</span>
								<span>{formatCurrency(data.subtotal)}</span>
							</div>
							<div className="flex justify-between text-sm">
								<span className="text-base-content/70">{t('workOrders.totalTax')}</span>
								<span>{formatCurrency(data.total_tax)}</span>
							</div>
							<div className="flex justify-between text-sm">
								<span className="text-base-content/70">{t('workOrders.discount')}</span>
								<span>-{formatCurrency(data.discount)}</span>
							</div>
							<div className="flex justify-between font-bold text-lg border-t border-base-300 pt-2">
								<span>{t('workOrders.grandTotal')}</span>
								<span className="text-primary">{formatCurrency(data.total_price)}</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="flex flex-wrap justify-end gap-2">
				{status === 'quote' && can('approve work orders') && (
					<button className="btn btn-success btn-sm" disabled={isBusy} onClick={() => runAction(() => approveWorkOrder(workOrder_id), 'workOrders.approvedMessage')}>{t('workOrders.approveBtn')}</button>
				)}
				{(status === 'quote' || status === 'approved') && can('update work orders') && (
					<button className="btn btn-error btn-sm" disabled={isBusy} onClick={handleReject}>{t('workOrders.rejectBtn')}</button>
				)}
				{status === 'approved' && can('update work orders') && (
					<button className="btn btn-warning btn-sm" disabled={isBusy} onClick={() => runAction(() => startWorkOrder(workOrder_id), 'workOrders.startedMessage')}>{t('workOrders.startBtn')}</button>
				)}
				{status === 'inProgress' && can('update work orders') && (
					<button className="btn btn-success btn-sm" disabled={isBusy} onClick={() => runAction(() => completeWorkOrder(workOrder_id), 'workOrders.completedMessage')}>{t('workOrders.completeBtn')}</button>
				)}
				{(status === 'approved' || status === 'completed') && can('invoice work orders') && (
					<button className="btn btn-primary btn-sm" disabled={isBusy} onClick={handleInvoice}>{t('workOrders.invoiceBtn')}</button>
				)}
				{status === 'invoiced' && data.invoice_id && can('view sales') && (
					<Link href={`/sales/${data.invoice_id}`} className="btn btn-primary btn-sm">{t('workOrders.viewInvoiceBtn')}</Link>
				)}
			</div>
		</div>
	</>
}
