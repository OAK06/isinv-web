"use client"

import { usePathname } from "next/navigation"
import { useBreadcrumbLabel } from "@/hooks/useBreadcrumbLabel"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTag } from "@fortawesome/free-solid-svg-icons"
import { useEffect, useState } from "react"

import { getPlan } from "@/app/(app)/plans/_plan"
import { Plan } from "@/app/(app)/plans/_plan"
import { useTranslation } from "next-i18next"
import DOMPurify from "dompurify"
import Header from "@/app/(app)/_components/header"

export default function PlanView({ params }: any) {
    const { t } = useTranslation('common')
    const pathname = usePathname()
	const { plan_id }: any = params
	const [data, setData] = useState<Plan>({} as Plan)
	useBreadcrumbLabel(data)

	useEffect(() => {
		getPlan(plan_id).then((returnData: any) => {
			setData(returnData.response)
		})
	}, [])

	return <>
		<Header editHref={`${pathname}/edit`} editLabel={t('edit')}
			title={<div className="flex items-center gap-4"><div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"><FontAwesomeIcon icon={faTag} className="text-2xl" /></div><div className="min-w-0"><h1 className="text-2xl font-bold leading-tight truncate">{data.name}</h1><div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-base-content/60"><div className={`badge badge-lg ${data.active ? 'badge-success' : 'badge-error'}`}>
						{data.active ? t('active') : t('inactive')}
					</div>
					{data.trial && <div className="badge badge-lg badge-warning">{t('trial')}</div>}</div></div></div>}
			containerClass="flex flex-wrap items-center justify-between gap-4"
		/>
		<div className="mt-6 space-y-4">
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
				<div className="card bg-base-100 border border-base-200 shadow-sm">
					<div className="card-body">
						<h2 className="card-title text-lg mb-4 gap-3">
							<span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><FontAwesomeIcon icon={faTag} /></span>
							{t('plans.basicInfo')}
						</h2>
						<div className="space-y-4">
							<div className="flex justify-between items-center py-2 border-b border-base-200">
								<span className="font-semibold text-base-content/70">{t('plans.branch')}</span>
								<span className="text-base-content text-end">{data.branch?.name || t('plans.allBranches')}</span>
							</div>
							<div className="flex justify-between items-center py-2 border-b border-base-200">
								<span className="font-semibold text-base-content/70">{t('plans.defaultAccessType')}</span>
								<span className="text-base-content text-end">{data.default_access_type}</span>
							</div>
							<div className="flex justify-between items-center py-2 border-b border-base-200">
								<span className="font-semibold text-base-content/70">{t('plans.duration')}</span>
								<span className="text-base-content text-end">{data.duration_count} {data.duration}</span>
							</div>
							{data.description && <div>
								<span className="font-semibold text-base-content/70 block mb-2">{t('plans.description')}</span>
								<p className="text-base-content/60 bg-base-200 rounded-lg p-3">{data.description}</p>
							</div>}
						</div>
					</div>
				</div>
				<div className="card bg-base-100 border border-base-200 shadow-sm">
					<div className="card-body">
						<h2 className="card-title text-lg mb-4 gap-3">
							<span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><FontAwesomeIcon icon={faTag} /></span>
							{t('plans.pricing')}
						</h2>
						<div className="space-y-4">
							<div className="items-center p-4 bg-primary/5 rounded-lg">
								<div className="mb-2 flex justify-between">
									<span className="font-semibold text-lg">{t('plans.price')}</span>
									<span className="text-2xl font-bold text-primary">${data.price}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-base-content/70">{t('plans.taxPercentage')}</span>
									<span className="font-semibold">{data.tax_percentage}%</span>
								</div>
								<div className="flex justify-between">
									<span className="text-base-content/70">{t('plans.startupFee')}</span>
									<span className="font-semibold">${data.startup_fee}</span>
								</div>
							</div>
							{(data.initial_pause_fee > 0 || data.recurring_pause_fee > 0) && <div className="items-center p-4 bg-warning/5 rounded-lg border-s-4 border-warning">
								<div className="flex justify-between">
									<span className="text-base-content/70 text-sm">{t('plans.initialPauseFee')}</span>
									<span className="font-semibold ">${data.initial_pause_fee}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-base-content/70 text-sm">{t('plans.recurringPauseFee')}</span>
									<span className="font-semibold ">${data.recurring_pause_fee}</span>
								</div>
							</div>}
							{data.cancellation_fee > 0 && <div className="items-center p-4 bg-error/5 rounded-lg border-s-4 border-error">
								<div className="flex justify-between">
									<span className="text-base-content/70 text-sm">{t('plans.cancellationFee')}</span>
									<span className="font-semibold ">${data.cancellation_fee}</span>
								</div>
							</div>}
						</div>
					</div>
				</div>
			</div>
			<div className="card bg-base-100 border border-base-200 shadow-sm">
				<div className="card-body">
					<h2 className="card-title text-lg mb-4 gap-3">
						<span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><FontAwesomeIcon icon={faTag} /></span>
						{t('plans.terms')}
					</h2>
					<div
						className="prose prose-sm max-w-none bg-base-200 rounded-xl p-4 max-h-96 overflow-y-auto"
						dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(data.terms || "") }}
					/>
					{!data.terms && <div className="text-center text-base-content/50 py-8">
						<p>{t('plans.noTerms')}</p>
					</div>}
				</div>
			</div>
		</div>
	</>
}