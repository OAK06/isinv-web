"use client"

import { usePathname } from "next/navigation"
import { useBreadcrumbLabel } from "@/hooks/useBreadcrumbLabel"
import { useEffect, useState } from "react"

import { getBranch } from "@/app/(app)/branches/_branch"
import { Branch } from "@/app/(app)/branches/_branch"
import { fileUrl } from "@/_utils/fileUrl"
import { useTranslation } from "next-i18next"
import DOMPurify from "dompurify"
import Header from "@/app/(app)/_components/header"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBuilding, faLocationDot, faAddressCard, faSliders, faCalendarWeek, faFileContract } from "@fortawesome/free-solid-svg-icons"

export default function BranchView({ params }: any) {
    const { t } = useTranslation('common')
    const pathname = usePathname()
	const { branch_id }: any = params
	const [data, setData] = useState<Branch>({} as Branch)
	useBreadcrumbLabel(data)
	const [company, setCompany] = useState<any>([])

	useEffect(() => {
		getBranch(branch_id).then((returnData: any) => {
			setData(returnData.response)
			setCompany(returnData.company)
		})
	}, [])

	const days = [
		{ key: 'sunday', on: data.sunday }, { key: 'monday', on: data.monday },
		{ key: 'tuesday', on: data.tuesday }, { key: 'wednesday', on: data.wednesday },
		{ key: 'thursday', on: data.thursday }, { key: 'friday', on: data.friday },
		{ key: 'saturday', on: data.saturday },
	]

	return <>
		{/* Identity hero: logo (or building fallback) + name + location + status. */}
		<Header editHref={`${pathname}/edit`} editLabel={t('edit')}
			containerClass="flex flex-wrap items-center justify-between gap-4"
			title={<div className="flex items-center gap-4">
				<div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 text-primary">
					{data.file?.url
						? <img src={fileUrl(data.file.url)} alt={data.name} className="h-full w-full object-cover" />
						: <FontAwesomeIcon icon={faBuilding} className="text-2xl" />}
				</div>
				<div className="min-w-0">
					<h1 className="text-2xl font-bold leading-tight truncate">{data.name}</h1>
					<div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-base-content/60">
						{(data.city || data.country) && <span className="flex items-center gap-1.5">
							<FontAwesomeIcon icon={faLocationDot} className="text-xs" />
							{[data.city, data.country].filter(Boolean).join(', ')}
						</span>}
						<span className={`badge badge-sm ${data.open ? 'badge-success' : 'badge-error'}`}>
							{data.open ? t('branches.active') : t('branches.inactive')}
						</span>
					</div>
				</div>
			</div>}
		/>

		<div className="mt-6 space-y-6">
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
				<div className="card bg-base-100 border border-base-200 shadow-sm">
					<div className="card-body">
						<h2 className="card-title text-lg mb-4 gap-3">
							<span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
								<FontAwesomeIcon icon={faAddressCard} />
							</span>
							{t('branches.contactInfo')}
						</h2>
						<div className="space-y-1">
							{(data.address || data.city || data.country) && <div className="flex justify-between gap-3 py-2 border-b border-base-200">
								<span className="font-semibold text-base-content/70">{t('branches.address')}</span>
								<span className="text-base-content text-end">{data.address} {data.city} {data.country}</span>
							</div>}
							<div className="flex justify-between gap-3 py-2 border-b border-base-200">
								<span className="font-semibold text-base-content/70">{t('branches.contactDetails')}</span>
								<ul className="text-base-content text-end">
									<li>{data.phone}</li>
									<li>{data.email}</li>
								</ul>
							</div>
							<div className="flex justify-between gap-3 py-2">
								<span className="font-semibold text-base-content/70">{t('branches.contactPerson')}</span>
								<ul className="text-base-content text-end">
									<li>{data.contact_person}</li>
									<li>{data.contact_phone}</li>
									<li>{data.contact_email}</li>
								</ul>
							</div>
						</div>
					</div>
				</div>

				<div className="card bg-base-100 border border-base-200 shadow-sm">
					<div className="card-body">
						<h2 className="card-title text-lg mb-4 gap-3">
							<span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
								<FontAwesomeIcon icon={faSliders} />
							</span>
							{t('branches.settings')}
						</h2>
						<div className="space-y-1">
							<div className="flex justify-between gap-3 py-2 border-b border-base-200">
								<span className="font-semibold text-base-content/70">{t('branches.reentry')}</span>
								<span className="text-base-content text-end tabular-nums">{data.reentry} {t('branches.hours')}</span>
							</div>
							<div className="flex justify-between gap-3 py-2">
								<span className="font-semibold text-base-content/70">{t('branches.timezone')}</span>
								<span className="text-base-content text-end">{data.timezone ?? '-'}</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="card bg-base-100 border border-base-200 shadow-sm">
				<div className="card-body">
					<h2 className="card-title text-lg mb-4 gap-3">
						<span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
							<FontAwesomeIcon icon={faCalendarWeek} />
						</span>
						{t('branches.operatingDays')}
					</h2>
					<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
						{days.map((day) => (
							<div key={day.key} className={`flex flex-col items-center gap-2 rounded-lg p-3 border ${day.on ? 'border-success/30 bg-success/5' : 'border-base-200 bg-base-200/50'}`}>
								<span className="text-sm font-semibold">{t(`branches.${day.key}`)}</span>
								<span className={`badge badge-sm ${day.on ? 'badge-success' : 'badge-ghost'}`}>{day.on ? t('yes') : t('no')}</span>
							</div>
						))}
					</div>
				</div>
			</div>

			<div className="card bg-base-100 border border-base-200 shadow-sm">
				<div className="card-body">
					<h2 className="card-title text-lg mb-4 gap-3">
						<span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
							<FontAwesomeIcon icon={faFileContract} />
						</span>
						{t('branches.terms')}
					</h2>
					{data.terms ? (
						<div
							className="prose prose-sm max-w-none max-h-96 overflow-y-auto pt-2 border-t border-base-200"
							dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(data.terms) }}
						/>
					) : (
						<div className="text-center text-base-content/50 py-8">
							<p>{t('branches.noTerms')}</p>
						</div>
					)}
				</div>
			</div>
		</div>
	</>
}
