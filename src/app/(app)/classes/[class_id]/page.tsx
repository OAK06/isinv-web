"use client"

import { usePathname } from "next/navigation"
import { useBreadcrumbLabel } from "@/hooks/useBreadcrumbLabel"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faDumbbell } from "@fortawesome/free-solid-svg-icons"
import { useEffect, useState } from "react"

import { getClass, GymClass } from "@/app/(app)/classes/_class"
import { useTranslation } from "next-i18next"
import Header from "@/app/(app)/_components/header"

export default function ClassView({ params }: any) {
    const { t } = useTranslation('common')
    const pathname = usePathname()
	const { class_id }: any = params
	const [data, setData] = useState<GymClass>({} as GymClass)
	useBreadcrumbLabel(data)
    const [logoPreview, setLogoPreview] = useState<string | null>(null)
	const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL

	useEffect(() => {
		getClass(class_id).then((returnData: any) => {
			setData(returnData.response)
            if (returnData.response.file) {
                setLogoPreview(`${API_URL}${returnData.response.file?.url}`)
            }
		})
	}, [])

	return <>
		<Header editHref={`${pathname}/edit`} editLabel={t('edit')}
			title={<div className="flex items-center gap-4"><div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">{logoPreview ? <img src={logoPreview} alt="" className="h-full w-full object-cover rounded-xl" /> : <FontAwesomeIcon icon={faDumbbell} className="text-2xl" />}</div><div className="min-w-0"><h1 className="text-2xl font-bold leading-tight truncate">{data.name}</h1><div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-base-content/60"><div className={`badge badge-sm ${data.active ? 'badge-success' : 'badge-error'}`}>{data.active ? t('active') : t('inactive')}</div></div></div></div>}
			containerClass="flex flex-wrap items-center justify-between gap-4"
		/>
		<div className="mt-6 space-y-4">
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
				<div className="card bg-base-100 border border-base-200 shadow-sm">
					<div className="card-body">
						<h2 className="card-title text-lg mb-4 gap-3">
							<span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><FontAwesomeIcon icon={faDumbbell} /></span>
							{t('classes.basicInfo')}
						</h2>
						<div className="space-y-4">
							<div className="flex justify-between items-center py-2 border-b border-base-200">
								<span className="font-semibold text-base-content/70">{t('classes.branch')}</span>
								<span className="text-base-content text-end">{data.branch?.name || t('classes.allBranches')}</span>
							</div>
							<div className="flex justify-between items-center py-2 border-b border-base-200">
								<span className="font-semibold text-base-content/70">{t('classes.planName')}</span>
								<span className="text-base-content text-end">{data.plan?.name || t('classes.allPlans')}</span>
							</div>
							<div className="flex justify-between items-center py-2 border-b border-base-200">
								<span className="font-semibold text-base-content/70">{t('classes.classManager')}</span>
								<span className="text-base-content text-end">{data.manager?.fullname || '-'}</span>
							</div>
							<div className="flex justify-between items-center py-2 border-b border-base-200">
								<span className="font-semibold text-base-content/70">{t('classes.classTrainer')}</span>
								<span className="text-base-content text-end">{data.trainer?.fullname || '-'}</span>
							</div>
							{data.description && <div>
								<span className="font-semibold text-base-content/70 block mb-2">{t('classes.description')}</span>
								<p className="text-base-content/60 bg-base-200 rounded-lg p-3">{data.description}</p>
							</div>}
						</div>
					</div>
				</div>
				<div className="card bg-base-100 border border-base-200 shadow-sm">
					<div className="card-body">
						<h2 className="card-title text-lg mb-4 gap-3">
							<span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><FontAwesomeIcon icon={faDumbbell} /></span>
							{t('classes.details')}
						</h2>
						<div className="space-y-4">
							<div className="items-center p-4 bg-primary/5 rounded-lg">
								<div className="mb-2 flex justify-between">
									<span className="font-semibold text-lg">{t('classes.price')}</span>
									<span className="text-2xl font-bold text-primary">${data.price}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-base-content/70">{t('classes.taxPercentage')}</span>
									<span className="font-semibold">{data.tax_percentage}%</span>
								</div>
							</div>
							<div className="items-center p-3 bg-base-200 rounded-lg">
								<div className="flex justify-between ">
									<span className="text-base-content/70">{t('classes.slots')}</span>
									<span className="font-semibold">{data.slots || "-"}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-base-content/70">{t('classes.waitList')}</span>
									<span className="font-semibold">{data.wait_list || "-"}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-base-content/70">{t('classes.waitListTime')}</span>
									<span className="font-semibold">{data.wait_list_time || "-"}</span>
								</div>
							</div>
							<div className="flex justify-between">
								<span className="font-semibold text-base-content/70">{t('classes.color')}</span>
								<div style={{ backgroundColor: data.color }} className="w-8 h-8 rounded-full"></div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</>
}