"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslation } from "next-i18next"
import { responseMessage, store } from "@/_state/globalStore"
import { getInvoice } from "@/app/(member)/member/bills/_bill"
import { createPaymentSession } from "@/app/(app)/memberPlans/_memberPlan"
import { usePaymentReturn } from "@/hooks/usePaymentReturn"
import Header from "@/app/(app)/_components/header"
import Loading from "@/app/(app)/_components/loading"

export default function MemberBillDetail({ params }: any) {
	const { t } = useTranslation('common')
	const router = useRouter()
	const { invoice: invoiceId } = params
	const [data, setData] = useState<any>(null)
	const [isPaying, setIsPaying] = useState(false)

	const invoice = data?.invoice
	const isPending = invoice?.state_name === 'pending'

	// On Stripe return the webhook flips the invoice state; refresh to reflect it.
	usePaymentReturn({
		branchId: invoice?.branch_id ?? -1,
		redirectTo: `/member/bills/${invoiceId}`,
		successMessage: t('memberPortal.bills.paidMessage'),
		failedMessage: t('memberPortal.bills.payFailed'),
	})

	useEffect(() => {
		getInvoice(invoiceId).then(setData).catch(() => setData({}))
	}, [])

	const pay = async () => {
		setIsPaying(true)
		try {
			const res = await createPaymentSession({
				branch_id: invoice.branch_id,
				invoice_id: invoice.id,
				member_id: invoice.member_id,
				success_url: window.location.href,
				cancel_url: window.location.href + '?payment_status=canceled',
			})
			router.push(res.response.checkout_url)
		} catch (e) {
			setIsPaying(false)
			store.set(responseMessage, { type: 'alert', text: t('memberPortal.bills.payFailed') })
		}
	}

	if (data === null) return <Loading />
	if (!invoice) return <div className="text-center py-16 text-base-content/60">{t('memberPortal.bills.notFound')}</div>

	const items = data.items ?? []
	const payments = data.payments ?? []

	return <>
		<Header title={<div className="flex items-center gap-3 flex-wrap">
			<h1 className="text-2xl font-bold font-mono">{invoice.reference}</h1>
			<span className={`badge badge-lg ${isPending ? 'badge-warning' : invoice.state_name === 'succeeded' ? 'badge-success' : 'badge-ghost'}`}>
				{t(`memberPortal.bills.state.${invoice.state_name}`, { defaultValue: invoice.state_name })}
			</span>
			<span className="badge badge-lg badge-outline">{t(`memberPortal.bills.opType.${invoice.operation_type_name}`, { defaultValue: invoice.operation_type_name })}</span>
		</div>} />

		<div className="mt-6 space-y-6">
			<div className="card bg-base-100 border border-base-200 shadow-sm">
				<div className="card-body">
					<h2 className="card-title text-xl mb-2"><div className="w-1 h-6 bg-primary rounded me-2"></div>{t('memberPortal.bills.items')}</h2>
					{items.length === 0
						? <p className="text-base-content/60">{t('memberPortal.bills.noItems')}</p>
						: <div className="overflow-x-auto">
							<table className="table">
								<thead>
									<tr>
										<th>{t('memberPortal.bills.itemsTable.name')}</th>
										<th>{t('memberPortal.bills.itemsTable.qty')}</th>
										<th>{t('memberPortal.bills.itemsTable.price')}</th>
										<th>{t('memberPortal.bills.itemsTable.tax')}</th>
										<th>{t('memberPortal.bills.itemsTable.total')}</th>
									</tr>
								</thead>
								<tbody>
									{items.map((it: any) => (
										<tr key={it.id}>
											<td>{it.name}</td>
											<td>{it.quantity}</td>
											<td>${it.price}</td>
											<td>${it.tax}</td>
											<td className="font-semibold">${it.total_price}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					}
					<div className="flex justify-end gap-8 pt-4 border-t border-base-200 mt-2">
						<div className="text-base-content/60">{t('memberPortal.bills.table.total')}</div>
						<div className="text-2xl font-bold text-primary">${invoice.total_price}</div>
					</div>
				</div>
			</div>

			{payments.length > 0 && <div className="card bg-base-100 border border-base-200 shadow-sm">
				<div className="card-body">
					<h2 className="card-title text-xl mb-2"><div className="w-1 h-6 bg-primary rounded me-2"></div>{t('memberPortal.bills.payments')}</h2>
					<div className="overflow-x-auto">
						<table className="table">
							<thead><tr>
								<th>{t('memberPortal.bills.paymentsTable.amount')}</th>
								<th>{t('memberPortal.bills.paymentsTable.status')}</th>
								<th>{t('memberPortal.bills.paymentsTable.date')}</th>
							</tr></thead>
							<tbody>
								{payments.map((p: any) => (
									<tr key={p.id}>
										<td>${p.amount}{p.refund && <span className="badge badge-ghost badge-sm ms-2">{t('memberPortal.bills.state.refunded')}</span>}</td>
										<td><span className="badge badge-ghost badge-sm">{t(`memberPortal.bills.state.${p.state}`, { defaultValue: p.state })}</span></td>
										<td className="text-sm">{p.created_at ? new Date(p.created_at).toLocaleDateString() : '-'}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>}

			{isPending && <div className="flex justify-end">
				<button className="btn btn-primary rounded-full" onClick={pay} disabled={isPaying}>
					{isPaying && <span className="loading loading-spinner"></span>}
					{t('memberPortal.bills.pay')}
				</button>
			</div>}
		</div>
	</>
}
