"use client"

import { useEffect, useState } from "react"
import { useBreadcrumbLabel } from "@/hooks/useBreadcrumbLabel"

import { getCompany } from "@/app/(admin)/admin/companies/_company"
import { Company } from "@/app/(admin)/admin/companies/_company"
import { useTranslation } from "next-i18next"
import Header from "@/app/(app)/_components/header"

export default function CompanyView({ params }: any) {
    const { t } = useTranslation('common')
	const { company_id }: any = params
	const [data, setData] = useState<Company>({} as Company)
	useBreadcrumbLabel(data)
    const [logoPreview, setLogoPreview] = useState<string | null>(null)
	const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL

	useEffect(() => {
		getCompany(company_id).then((returnData: any) => {
			setData(returnData.response)
            if (returnData.response.file) {
                setLogoPreview(`${API_URL}${returnData.response.file?.url}`)
            }
		})
	}, [])

	return <>
		<Header
			title={<div className="flex items-start gap-2">
				{logoPreview && <div className="w-28 h-28 bg-base-200 border rounded-full flex items-center justify-center overflow-hidden">
					<img src={logoPreview} alt="" className="w-full h-full object-cover" />
				</div>}
				<h1 className={`${logoPreview ? 'mt-10' : ''} text-2xl font-bold`}>{data.name}</h1>
				<div className={`${logoPreview ? 'mt-10' : ''} flex gap-2 pt-2`}>
					<div className={`badge badge-lg ${data.status ? 'badge-success' : 'badge-error'}`}>
						{data.status}
					</div>
				</div>
			</div>}
			containerClass={"flex justify-between"}
		/>
		
		<div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
			<div className="card bg-base-100 border border-base-200 shadow-sm">
				<div className="card-body">
					<h2 className="card-title text-xl mb-4">
						<div className="w-1 h-6 bg-primary rounded me-2"></div>
						{t('companies.companyDetails')}
					</h2>
					<div className="space-y-4">
						{(data.address || data.city || data.country) && <div className="flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('companies.address')}</span>
							<span className="text-base-content text-end">{data.address} {data.city} {data.country}</span>
						</div>}
						<div className="flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('companies.phone')}</span>
							<span className="text-base-content text-end">{data.phone}</span>
						</div>
						<div className="flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('companies.email')}</span>
							<span className="text-base-content text-end">{data.email}</span>
						</div>
						<div className="flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('companies.contactPerson')}</span>
							<span className="text-base-content text-end">{data.contact_person}</span>
						</div>
						<div className="flex justify-between items-center py-2">
							<span className="font-semibold text-base-content/70">{t('companies.contactPhone')}</span>
							<span className="text-base-content text-end">{data.contact_phone}</span>
						</div>
						<div className="flex justify-between items-center py-2">
							<span className="font-semibold text-base-content/70">{t('companies.contactEmail')}</span>
							<span className="text-base-content text-end">{data.contact_email}</span>
						</div>
					</div>
				</div>
			</div>
			<div className="card bg-base-100 border border-base-200 shadow-sm">
				<div className="card-body">
					<h2 className="card-title text-xl mb-4">
						<div className="w-1 h-6 bg-primary rounded me-2"></div>
						{t('companies.suspensions')}
					</h2>
					<div className="grid grid-cols-2 gap-4">
						<div className="flex justify-between items-center p-3 bg-base-200 rounded-lg">
							<span className="text-base-content/70">{t('companies.owner')}</span>
							<span className={`p-3 badge rounded-lg ${data.suspend_owner ? 'badge-error' : 'badge-success'}`}>{data.suspend_owner ? t('yes') : t('no')}</span>
						</div>
						<div className="flex justify-between items-center p-3 bg-base-200 rounded-lg">
							<span className="text-base-content/70">{t('companies.staff')}</span>
							<span className={`p-3 badge rounded-lg ${data.suspend_staff ? 'badge-error' : 'badge-success'}`}>{data.suspend_staff ? t('yes') : t('no')}</span>
						</div>
						<div className="flex justify-between items-center p-3 bg-base-200 rounded-lg">
							<span className="text-base-content/70">{t('companies.member')}</span>
							<span className={`p-3 badge rounded-lg ${data.suspend_member ? 'badge-error' : 'badge-success'}`}>{data.suspend_member ? t('yes') : t('no')}</span>
						</div>
						<div className="flex justify-between items-center p-3 bg-base-200 rounded-lg">
							<span className="text-base-content/70">{t('companies.entry')}</span>
							<span className={`p-3 badge rounded-lg ${data.suspend_entry ? 'badge-error' : 'badge-success'}`}>{data.suspend_entry ? t('yes') : t('no')}</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</>
}