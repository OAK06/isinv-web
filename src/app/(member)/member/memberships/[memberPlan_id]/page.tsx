"use client"

import { FormEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAtom } from "jotai"
import { useTranslation } from "next-i18next"
import MemberPlanView from "@/app/(app)/memberPlans/[memberPlan_id]/page"
import { createPaymentSession, getMemberPlan } from "@/app/(app)/memberPlans/_memberPlan"
import { cancelPlan, getGymFeatures, pausePlan, unpausePlan } from "@/app/(member)/member/memberships/_plan"
import { activeMembership, responseMessage, store } from "@/_state/globalStore"
import { useConfirm } from "@/_components/useConfirm"
import { usePaymentReturn } from "@/hooks/usePaymentReturn"

/**
 * Membership detail: reuses the (app) view for the body (atom-free), and adds a
 * self-cancel action — shown only when the gym enabled `member_self_cancel` and the
 * plan is active. The backend gate is the real enforcement; this just hides the button.
 */
export default function MemberMembershipDetail({ params }: any) {
	const { t } = useTranslation('common')
	const router = useRouter()
	const { memberPlan_id } = params
	const [branchID] = useAtom(activeMembership)
	const [plan, setPlan] = useState<any>(null)
	const [features, setFeatures] = useState<string[]>([])
	const [busy, setBusy] = useState(false)
	const { confirm, confirmModal } = useConfirm()

	useEffect(() => {
		getMemberPlan(memberPlan_id).then((r: any) => setPlan(r.response)).catch(() => {})
		if (branchID !== -1) getGymFeatures(branchID).then(setFeatures).catch(() => {})
	}, [branchID])

	const canCancel = features.includes('member_self_cancel') && plan?.status_name === 'active'
	const canPause = features.includes('member_self_pause') && plan?.status_name === 'active'
	const canResume = features.includes('member_self_pause') && plan?.status_name === 'paused'
	// Dishonored = created-but-unpaid (e.g. staff approved with "pay online"). The webhook
	// flips it to active once this payment succeeds.
	const canPay = plan?.status_name === 'dishonored'

	usePaymentReturn({
		branchId: plan?.branch_id ?? -1,
		redirectTo: `/member/memberships/${memberPlan_id}`,
		successMessage: t('memberPlans.createdMessage'),
		failedMessage: t('memberPlans.createdWithoutPaidMessage'),
	})

	const doPay = async () => {
		setBusy(true)
		try {
			const res = await createPaymentSession({
				branch_id: plan.branch_id,
				invoice_id: plan.invoice_id,
				member_id: plan.member_id,
				success_url: window.location.href,
				cancel_url: window.location.href + '?payment_status=canceled',
			})
			router.push(res.response.checkout_url)
		} catch (e) {
			setBusy(false)
			store.set(responseMessage, { type: 'alert', text: t('memberPlans.createdWithoutPaidMessage') })
		}
	}

	const doCancel = async () => {
		if (!(await confirm(t('memberPortal.memberships.cancelConfirm')))) return
		setBusy(true)
		await cancelPlan(memberPlan_id).then(() => {
			store.set(responseMessage, { type: 'success', text: t('memberPortal.memberships.cancelled') })
			router.push('/member/memberships')
		}).catch(() => setBusy(false))
	}

	const doResume = async () => {
		if (!(await confirm(t('memberPortal.memberships.resumeConfirm')))) return
		setBusy(true)
		await unpausePlan(memberPlan_id).then(() => {
			store.set(responseMessage, { type: 'success', text: t('memberPortal.memberships.resumed') })
			router.push('/member/memberships')
		}).catch(() => setBusy(false))
	}

	const doPause = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const form = event.currentTarget
		const pauseStart = form.pause_start.value
		const pauseEnd = form.pause_end.value
		if (!pauseStart || !pauseEnd) return
		setBusy(true)
		await pausePlan(memberPlan_id, pauseStart, pauseEnd).then(() => {
			store.set(responseMessage, { type: 'success', text: t('memberPortal.memberships.paused') })
			router.push('/member/memberships')
		}).catch(() => setBusy(false))
	}

	return <>
		{(canCancel || canPause || canResume || canPay) && <div className="flex justify-end gap-2 mb-3">
			{canPay && <button className="btn btn-sm btn-primary rounded-full" onClick={doPay} disabled={busy}>
				{busy && <span className="loading loading-spinner loading-xs"></span>}
				{t('memberPortal.memberships.payNow')}
			</button>}
			{canPause && <label htmlFor="member-pause-modal" className="btn btn-sm btn-warning btn-outline">{t('memberPortal.memberships.pause')}</label>}
			{canResume && <button className="btn btn-sm btn-success btn-outline" onClick={doResume} disabled={busy}>
				{busy && <span className="loading loading-spinner loading-xs"></span>}
				{t('memberPortal.memberships.resume')}
			</button>}
			{canCancel && <button className="btn btn-sm btn-error btn-outline" onClick={doCancel} disabled={busy}>
				{busy && <span className="loading loading-spinner loading-xs"></span>}
				{t('memberPortal.memberships.cancel')}
			</button>}
		</div>}

		<MemberPlanView params={params} />

		{/* Pause modal — collect the pause window. */}
		<input type="checkbox" id="member-pause-modal" className="modal-toggle" />
		<div className="modal modal-middle">
			<div className="modal-box">
				<h3 className="text-lg font-bold mb-1">{t('memberPortal.memberships.pauseTitle')}</h3>
				<p className="text-sm text-base-content/60 mb-4">{t('memberPortal.memberships.pauseFeeNote')}</p>
				<form onSubmit={doPause} className="space-y-3">
					<div>
						<label className="label justify-start"><span className="label-text">{t('memberPortal.memberships.pauseStart')}</span></label>
						<input name="pause_start" type="date" required className="input input-bordered w-full" />
					</div>
					<div>
						<label className="label justify-start"><span className="label-text">{t('memberPortal.memberships.pauseEnd')}</span></label>
						<input name="pause_end" type="date" required className="input input-bordered w-full" />
					</div>
					<div className="modal-action">
						<label htmlFor="member-pause-modal" className="btn btn-ghost">{t('close')}</label>
						<button type="submit" className="btn btn-warning" disabled={busy}>
							{busy && <span className="loading loading-spinner loading-xs"></span>}
							{t('memberPortal.memberships.pauseSubmit')}
						</button>
					</div>
				</form>
			</div>
			<label className="modal-backdrop" htmlFor="member-pause-modal"></label>
		</div>

		{confirmModal}
	</>
}
