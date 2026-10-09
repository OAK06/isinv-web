"use client"

import { useEffect, useState } from "react"
import { useBreadcrumbLabel } from "@/hooks/useBreadcrumbLabel"

import { useTranslation } from "next-i18next"
import { getMemberPlan, MemberPlan } from "@/app/(app)/memberPlans/_memberPlan"
import Header from "@/app/(app)/_components/header"

export default function MemberPlanView({ params }: any) {
    const { t } = useTranslation('common')
	const { memberPlan_id }: any = params
	const [data, setData] = useState<MemberPlan>({} as MemberPlan)
	useBreadcrumbLabel(data)

	useEffect(() => {
		getMemberPlan(memberPlan_id).then((returnData: any) => {
			setData(returnData.response)
		})
	}, [])

	return <>
		<Header
			title={<div className="flex items-start gap-4">
                {data.qr_code && (
                    <div className="flex-shrink-0">
                        <img src={`data:image/png;base64,${data.qr_code}`} alt="Membership QR Code" className="w-36 h-36" />
                    </div>
                )}
				<div className="flex-1">
					<h1 className="text-2xl font-bold">{data.plan?.name}</h1>
					<div className="flex gap-2 pt-2">
						<div className={`badge badge-lg ${data.status_name === 'active' ? 'badge-success' : data.status_name === 'dishonored' ? 'badge-warning' : 'badge-error'}`}>
							{data.status_name === 'active' ? t('active') : data.status_name === 'dishonored' ? t('memberPlans.pendingPayment') : t('inactive')}
						</div>
						{data.trial && (
							<div className="badge badge-lg badge-warning">
								{t('memberPlans.trial')}
							</div>
						)}
						{data.auto_renew_forever && (
							<div className="badge badge-lg badge-info">
								{t('memberPlans.autoRenew')}
							</div>
						)}
					</div>
				</div>
			</div>}
			containerClass={"flex justify-between"}
		/>
		<div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
			<div className="card bg-base-100 border border-base-200 shadow-sm">
				<div className="card-body">
					<h2 className="card-title text-xl mb-4">
						<div className="w-1 h-6 bg-primary rounded me-2"></div>
						{t('memberPlans.planDetails')}
					</h2>
					<div className="space-y-4">
						<div className="flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('memberPlans.duration')}</span>
							<span className="text-base-content">{data.duration_count} {data.duration}</span>
						</div>
						<div className="flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('memberPlans.membershipStart')}</span>
							<span className="text-base-content">{new Date(data.membership_start).toLocaleDateString()}</span>
						</div>
						<div className="flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('memberPlans.membershipEnd')}</span>
							<span className="text-base-content">{new Date(data.membership_end).toLocaleDateString()}</span>
						</div>
						<div className="flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('memberPlans.renewalCount')}</span>
							<span className="text-base-content">{data.renewal_count ?? 0}</span>
						</div>
						<div className="flex justify-between items-center py-2">
							<span className="font-semibold text-base-content/70">{t('memberPlans.trial')}</span>
							<span className="text-base-content">{data.trial ? t('yes') : t('no')}</span>
						</div>
					</div>
				</div>
			</div>

			<div className="card bg-base-100 border border-base-200 shadow-sm">
				<div className="card-body">
					<h2 className="card-title text-xl mb-4">
						<div className="w-1 h-6 bg-primary rounded me-2"></div>
						{t('memberPlans.pricing')}
					</h2>
					<div className="space-y-4">
						<div className="flex justify-between items-center p-4 bg-primary/5 rounded-lg">
							<span className="font-semibold text-lg">{t('memberPlans.price')}</span>
							<span className="text-2xl font-bold text-primary">${data.price}</span>
						</div>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div className="flex justify-between items-center p-3 bg-base-200 rounded-lg">
								<span className="text-base-content/70">{t('memberPlans.startupFee')}</span>
								<span className="font-semibold">${data.startup_fee}</span>
							</div>
							<div className="flex justify-between items-center p-3 bg-base-200 rounded-lg">
								<span className="text-base-content/70">{t('memberPlans.taxPercentage')}</span>
								<span className="font-semibold">{data.tax_percentage}%</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="card bg-base-100 border border-base-200 shadow-sm">
				<div className="card-body">
					<h2 className="card-title text-xl mb-4">
						<div className="w-1 h-6 bg-primary rounded me-2"></div>
						{t('memberPlans.fees')}
					</h2>
					<div className="space-y-4">
						{data.cancellation_fee > 0 && (
							<div className="flex justify-between items-center p-3 bg-error/5 rounded-lg">
								<span className="text-base-content/70">{t('memberPlans.cancellationFee')}</span>
								<span className="font-semibold text-error">${data.cancellation_fee}</span>
							</div>
						)}
						{data.initial_pause_fee > 0 && (
							<div className="flex justify-between items-center p-3 bg-warning/5 rounded-lg">
								<span className="text-base-content/70">{t('memberPlans.initialPauseFee')}</span>
								<span className="font-semibold text-warning">${data.initial_pause_fee}</span>
							</div>
						)}
						{data.recurring_pause_fee > 0 && (
							<div className="flex justify-between items-center p-3 bg-warning/5 rounded-lg">
								<span className="text-base-content/70">{t('memberPlans.recurringPauseFee')}</span>
								<span className="font-semibold text-warning">${data.recurring_pause_fee}</span>
							</div>
						)}
					</div>
				</div>
			</div>

			{(data.pause_start || data.pause_end || data.cancel_at) && (
				<div className="card bg-base-100 border border-base-200 shadow-sm">
					<div className="card-body">
						<h2 className="card-title text-xl mb-4">
							<div className="w-1 h-6 bg-primary rounded me-2"></div>
							{t('memberPlans.statusTimeline')}
						</h2>
						<div className="space-y-4">
							{data.pause_start && (
								<div className="flex justify-between items-center py-2 border-b border-base-200">
									<span className="font-semibold text-base-content/70">{t('memberPlans.pauseStart')}</span>
									<span className="text-base-content">{data.pause_start}</span>
								</div>
							)}
							{data.pause_end && (
								<div className="flex justify-between items-center py-2 border-b border-base-200">
									<span className="font-semibold text-base-content/70">{t('memberPlans.pauseEnd')}</span>
									<span className="text-base-content">{data.pause_end}</span>
								</div>
							)}
							{data.cancel_at && (
								<div className="flex justify-between items-center py-2">
									<span className="font-semibold text-base-content/70">{t('memberPlans.cancelAt')}</span>
									<span className="text-base-content">{data.cancel_at}</span>
								</div>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	</>
}