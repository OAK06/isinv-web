"use client"

import { FormEvent, useEffect, useState } from "react"
import { useBreadcrumbLabel } from "@/hooks/useBreadcrumbLabel"
import { editSubscription, getSubscription, markSubscriptionPaid } from "@/app/(admin)/admin/subscriptions/_subscription"
import { useAuth } from "@/hooks/auth"
import { useAtom } from "jotai"
import { responseMessage, store, validationErrors } from "@/_state/globalStore"
import InputError from "@/_components/inputError"
import { useTranslation } from "next-i18next"
import Header from "@/app/(app)/_components/header"

const STATUS_BADGES: Record<string, string> = {
    Trial: 'badge-info',
    PendingPayment: 'badge-warning',
    Active: 'badge-success',
    PastDue: 'badge-warning',
    Suspended: 'badge-error',
    Canceled: 'badge-ghost',
}

const STATUS_KEYS: Record<number, string> = {
    0: 'trial', 1: 'pendingPayment', 2: 'active', 3: 'pastDue', 4: 'suspended', 5: 'canceled'
}

// PaymentState enum values actually used by platform billing
const PAYMENT_STATE_KEYS: Record<number, string> = {
    1: 'pending', 4: 'succeeded', 7: 'error'
}

export default function SubscriptionManage({ params }: any) {
    const { t } = useTranslation('common')
	const { subscription_id }: any = params
	const { user } = useAuth({ middleware: "auth" })
	const [data, setData] = useState<any>(null)
	useBreadcrumbLabel(data)
	const [isSubmitting , setIsSubmitting] = useState(false)
	const [confirmingPaid, setConfirmingPaid] = useState(false)
	const [validErrors] = useAtom(validationErrors)
	const canUpdate = user.permissions.includes('update subscriptions')

	const load = () => {
		getSubscription(subscription_id).then((returnData: any) => {
			setData(returnData.response)
		})
	}

	useEffect(() => {
		load()
	}, [])

	const formSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const formData = new FormData(event.currentTarget)
		setIsSubmitting(true)
		await editSubscription(subscription_id, formData).then(() => {
			store.set(responseMessage, { type: 'success', text: t('subscriptions.updatedMessage') });
			load()
		})
		.finally(() => setIsSubmitting(false))
	}

	const markPaid = async () => {
		setConfirmingPaid(false)
		setIsSubmitting(true)
		await markSubscriptionPaid(subscription_id).then(() => {
			store.set(responseMessage, { type: 'success', text: t('subscriptions.markedPaidMessage') });
			load()
		})
		.finally(() => setIsSubmitting(false))
	}

	if (!data) return null

	const statusName = STATUS_KEYS[data.status] ?? String(data.status)

	return <>
		<Header
			title={data.company?.name}
			subtitle={t('subscriptions.manageSubtitle')}
			containerClass={"flex justify-between"}
		/>
		<div className="mt-6 card bg-base-100 border border-base-200 shadow-sm">
			<div className="card-body">
				<h2 className="card-title text-xl mb-4">
					<div className="w-1 h-6 bg-primary rounded me-2"></div>
					{t('subscriptions.details')}
				</h2>
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10">
					<div className="flex justify-between items-center py-2 border-b border-base-200">
						<span className="font-semibold text-base-content/70">{t('subscriptions.plan')}</span>
						<span className="text-base-content text-end">{data.system_plan?.slug} ({data.months} {t('subscriptions.months')})</span>
					</div>
					<div className="flex justify-between items-center py-2 border-b border-base-200">
						<span className="font-semibold text-base-content/70">{t('subscriptions.status')}</span>
						<span className={`badge badge-lg ${STATUS_BADGES[statusName.charAt(0).toUpperCase() + statusName.slice(1)] ?? 'badge-ghost'}`}>
							{t(`subscriptions.statuses.${statusName}`)}
						</span>
					</div>
					<div className="flex justify-between items-center py-2 border-b border-base-200">
						<span className="font-semibold text-base-content/70">{t('subscriptions.basePrice')}</span>
						<span className="text-base-content text-end">{data.base_price} {data.currency}</span>
					</div>
					<div className="flex justify-between items-center py-2 border-b border-base-200">
						<span className="font-semibold text-base-content/70">{t('subscriptions.addonsPrice')}</span>
						<span className="text-base-content text-end">{data.addons_price} {data.currency}</span>
					</div>
					<div className="flex justify-between items-center py-2 border-b border-base-200">
						<span className="font-semibold text-base-content/70">{t('subscriptions.totalPrice')}</span>
						<span className="text-base-content font-bold text-end">{data.total_price} {data.currency}</span>
					</div>
					<div className="flex justify-between items-center py-2 border-b border-base-200">
						<span className="font-semibold text-base-content/70">{t('subscriptions.country')}</span>
						<span className="text-base-content text-end">{data.country_code}</span>
					</div>
					<div className="flex justify-between items-center py-2 border-b border-base-200">
						<span className="font-semibold text-base-content/70">{t('subscriptions.trialEndsAt')}</span>
						<span className="text-base-content text-end">{data.trial_ends_at ? data.trial_ends_at.substring(0, 10) : '—'}</span>
					</div>
					<div className="flex justify-between items-center py-2 border-b border-base-200">
						<span className="font-semibold text-base-content/70">{t('subscriptions.periodEnd')}</span>
						<span className="text-base-content text-end">{data.current_period_end ? data.current_period_end.substring(0, 10) : '—'}</span>
					</div>
				</div>

				<div className="mt-4">
					<span className="font-semibold text-base-content/70 me-2">{t('subscriptions.addons')}:</span>
					{data.addons?.length > 0
						? data.addons.map((addon: any) => (
							<span key={addon.id} className="badge badge-primary badge-outline me-2">{addon.slug} · {addon.monthly_price} {data.currency}/{t('subscriptions.month')}</span>
						))
						: <span className="text-base-content/60">{t('subscriptions.noAddons')}</span>}
				</div>
			</div>
		</div>

		{canUpdate && (
		<div className="mt-6 card bg-base-100 border border-base-200 shadow-sm">
			<div className="card-body">
				<h3 className="card-title text-lg mb-4">
					<div className="w-1 h-5 bg-primary rounded me-2"></div>
					{t('subscriptions.manageTitle')}
				</h3>
				<form onSubmit={formSubmit}>
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('subscriptions.status')}</span>
							</label>
							<select name="status" className="select select-sm select-bordered w-full" defaultValue={data.status}>
								{Object.entries(STATUS_KEYS).map(([value, key]) => (
									<option key={value} value={value}>{t(`subscriptions.statuses.${key}`)}</option>
								))}
							</select>
							<InputError messages={validErrors.status} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('subscriptions.trialEndsAt')}</span>
							</label>
							<input name="trial_ends_at" type="date" className="input input-bordered input-sm w-full" defaultValue={data.trial_ends_at ? data.trial_ends_at.substring(0, 10) : ''} />
							<InputError messages={validErrors.trial_ends_at} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('subscriptions.basePrice')}</span>
							</label>
							<input name="base_price" type="number" step="any" className="input input-bordered input-sm w-full" defaultValue={data.base_price} />
							<InputError messages={validErrors.base_price} />
						</div>
					</div>
					<div className="flex flex-wrap justify-end gap-2 mt-6">
						{confirmingPaid
							? <>
								<span className="self-center text-sm text-base-content/70">{t('subscriptions.markPaidConfirm')}</span>
								<button type="button" className="btn btn-sm" onClick={() => setConfirmingPaid(false)}>{t('cancel')}</button>
								<button type="button" className="btn btn-sm btn-success" disabled={isSubmitting} onClick={markPaid}>{t('subscriptions.markPaidBtn')}</button>
							</>
							: <button type="button" className="btn btn-sm btn-outline btn-success" disabled={isSubmitting} onClick={() => setConfirmingPaid(true)}>{t('subscriptions.markPaidBtn')}</button>}
						<button className="btn btn-primary" type="submit" disabled={isSubmitting}>
							{isSubmitting && <span className="loading loading-spinner"></span>}
							{t('subscriptions.updateFormBtn')}
						</button>
					</div>
				</form>
			</div>
		</div>
		)}

		<div className="mt-6 card bg-base-100 border border-base-200 shadow-sm">
			<div className="card-body">
				<h3 className="card-title text-lg mb-4">
					<div className="w-1 h-5 bg-primary rounded me-2"></div>
					{t('subscriptions.paymentsTitle')}
				</h3>
				{data.payments?.length > 0
					? <div className="overflow-x-auto">
						<table className="table table-sm">
							<thead>
								<tr>
									<th>{t('subscriptions.paymentAmount')}</th>
									<th>{t('subscriptions.paymentState')}</th>
									<th>{t('subscriptions.paymentPeriod')}</th>
									<th>{t('subscriptions.paymentDate')}</th>
								</tr>
							</thead>
							<tbody>
								{data.payments.map((payment: any) => (
									<tr key={payment.id}>
										<td>{payment.amount} {payment.currency}</td>
										<td>{t(`subscriptions.paymentStates.${PAYMENT_STATE_KEYS[payment.state] ?? 'pending'}`)}</td>
										<td dir="ltr">{payment.period_start?.substring(0, 10)} → {payment.period_end?.substring(0, 10)}</td>
										<td>{payment.created_at?.substring(0, 10)}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
					: <span className="text-base-content/60">{t('subscriptions.noPayments')}</span>}
			</div>
		</div>
	</>
}
