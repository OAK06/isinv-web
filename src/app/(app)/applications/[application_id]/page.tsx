"use client"

import { usePathname } from "next/navigation"
import { useBreadcrumbLabel } from "@/hooks/useBreadcrumbLabel"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFileLines } from "@fortawesome/free-solid-svg-icons"
import { useEffect, useState } from "react"

import { getApplication } from "@/app/(app)/applications/_application"
import { Application } from "@/app/(app)/applications/_application"
import { useTranslation } from "next-i18next"
import Header from "@/app/(app)/_components/header"

export default function ApplicationView({ params }: any) {
    const { t } = useTranslation('common')
    const pathname = usePathname()
	const { application_id }: any = params
	const [data, setData] = useState<Application>({} as Application)
	useBreadcrumbLabel(data)

	useEffect(() => {
		getApplication(application_id).then((returnData: any) => {
			setData(returnData.response)
		})
	}, [])

	return <>
		<Header editHref={`${pathname}/edit`} editLabel={t('edit')}
			title={<div className="flex items-center gap-4"><div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"><FontAwesomeIcon icon={faFileLines} className="text-2xl" /></div><div className="min-w-0"><h1 className="text-2xl font-bold leading-tight truncate">{data.fname} {data.sname}</h1><div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-base-content/60"><div className="badge badge-lg badge-info">{t('applications.application')}</div></div></div></div>}
			containerClass="flex flex-wrap items-center justify-between gap-4"
		/>
		<div className="mt-6 space-y-6">
			{/* Member Information */}
			<div className="card bg-base-100 border border-base-200 shadow-sm">
				<div className="card-body">
					<h2 className="card-title text-lg mb-4 gap-3">
						<span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><FontAwesomeIcon icon={faFileLines} /></span>
						{t('applications.memberInfo')}
					</h2>
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
						<div className="flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('applications.planName')}</span>
							<span className="text-base-content">{data.plan?.name}</span>
						</div>
						<div className="flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('applications.fname')}</span>
							<span className="text-base-content">{data.fname}</span>
						</div>
						<div className="flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('applications.sname')}</span>
							<span className="text-base-content">{data.sname}</span>
						</div>
						<div className="flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('applications.birthDate')}</span>
							<span className="text-base-content">{data.birth_date}</span>
						</div>
						<div className="flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('applications.gender')}</span>
							<span className="text-base-content">{data.gender}</span>
						</div>
						<div className="flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('applications.email')}</span>
							<span className="text-base-content">{data.email}</span>
						</div>
						<div className="flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('applications.mobilePhone')}</span>
							<span className="text-base-content">{data.mobile_phone}</span>
						</div>
						<div className="flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('applications.homePhone')}</span>
							<span className="text-base-content">{data.home_phone}</span>
						</div>
						<div className="flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('applications.address')}</span>
							<span className="text-base-content">{data.address}</span>
						</div>
						<div className="flex justify-between items-center py-2">
							<span className="font-semibold text-base-content/70">{t('applications.city')}</span>
							<span className="text-base-content">{data.city}</span>
						</div>
						<div className="flex justify-between items-center py-2">
							<span className="font-semibold text-base-content/70">{t('applications.country')}</span>
							<span className="text-base-content">{data.country}</span>
						</div>
					</div>
				</div>
			</div>

			{/* Emergency Contact */}
			<div className="card bg-base-100 border border-base-200 shadow-sm">
				<div className="card-body">
					<h2 className="card-title text-lg mb-4 gap-3">
						<span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><FontAwesomeIcon icon={faFileLines} /></span>
						{t('applications.emergencyContact')}
					</h2>
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
						<div className="flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('applications.emgContactName')}</span>
							<span className="text-base-content">{data.emg_contact_name}</span>
						</div>
						<div className="flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('applications.emgContactRelation')}</span>
							<span className="text-base-content">{data.emg_contact_relation}</span>
						</div>
						<div className="flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('applications.emgContactMobileNumber')}</span>
							<span className="text-base-content">{data.emg_contact_mobilenumber}</span>
						</div>
						<div className="flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('applications.emgContactEmail')}</span>
							<span className="text-base-content">{data.emg_contact_email}</span>
						</div>
						<div className="flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('applications.emgContactAddress')}</span>
							<span className="text-base-content">{data.emg_contact_address}</span>
						</div>
						<div className="flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('applications.emgContactCity')}</span>
							<span className="text-base-content">{data.emg_contact_city}</span>
						</div>
						<div className="flex justify-between items-center py-2">
							<span className="font-semibold text-base-content/70">{t('applications.emgContactCountry')}</span>
							<span className="text-base-content">{data.emg_contact_country}</span>
						</div>
					</div>
				</div>
			</div>

			{/* Health Information */}
			<div className="card bg-base-100 border border-base-200 shadow-sm">
				<div className="card-body">
					<h2 className="card-title text-lg mb-4 gap-3">
						<span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><FontAwesomeIcon icon={faFileLines} /></span>
						{t('applications.healthInfo')}
					</h2>
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
						<div className="flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('applications.hasHealthConditions')}</span>
							<span className="text-base-content">{data.has_health_conditions ? t('true') : t('false')}</span>
						</div>
						<div className="flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('applications.medications')}</span>
							<span className="text-base-content">{data.medications}</span>
						</div>
						{data.health_conditions && (
							<div className="lg:col-span-2">
								<span className="font-semibold text-base-content/70 block mb-2">{t('applications.healthConditions')}</span>
								<p className="text-base-content bg-base-200 rounded-lg p-3">{data.health_conditions}</p>
							</div>
						)}
						{data.notes && (
							<div className="lg:col-span-2">
								<span className="font-semibold text-base-content/70 block mb-2">{t('applications.notes')}</span>
								<p className="text-base-content bg-base-200 rounded-lg p-3">{data.notes}</p>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Plan Information */}
			<div className="card bg-base-100 border border-base-200 shadow-sm">
				<div className="card-body">
					<h2 className="card-title text-lg mb-4 gap-3">
						<span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><FontAwesomeIcon icon={faFileLines} /></span>
						{t('applications.planInfo')}
					</h2>
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
						<div className="flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('applications.duration')}</span>
							<span className="text-base-content">{data.duration_count} {data.duration}</span>
						</div>
						<div className="flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('applications.startupFee')}</span>
							<span className="text-base-content">${data.startup_fee}</span>
						</div>
						<div className="flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('applications.price')}</span>
							<span className="text-base-content">${data.price}</span>
						</div>
						<div className="flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('applications.cancellationFee')}</span>
							<span className="text-base-content">${data.cancellation_fee}</span>
						</div>
						<div className="flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('applications.initialPauseFee')}</span>
							<span className="text-base-content">${data.initial_pause_fee}</span>
						</div>
						<div className="flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('applications.recurringPauseFee')}</span>
							<span className="text-base-content">${data.recurring_pause_fee}</span>
						</div>
						<div className="flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('applications.taxPercentage')}</span>
							<span className="text-base-content">{data.tax_percentage}%</span>
						</div>
						<div className="flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('applications.trial')}</span>
							<span className="text-base-content">{data.trial ? t('yes') : t('no')}</span>
						</div>
						<div className="flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('applications.autoRenewForever')}</span>
							<span className="text-base-content">{data.auto_renew_forever ? t('true') : t('false')}</span>
						</div>
						<div className="flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('applications.membershipStart')}</span>
							<span className="text-base-content">{data.membership_start}</span>
						</div>
						<div className="flex justify-between items-center py-2">
							<span className="font-semibold text-base-content/70">{t('applications.membershipEnd')}</span>
							<span className="text-base-content">{data.membership_end}</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</>
}