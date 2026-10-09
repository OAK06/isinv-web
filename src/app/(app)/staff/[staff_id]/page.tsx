"use client"

import { usePathname } from "next/navigation"
import { useBreadcrumbLabel } from "@/hooks/useBreadcrumbLabel"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faIdCard } from "@fortawesome/free-solid-svg-icons"
import { useEffect, useState } from "react"

import { getStaff } from "@/app/(app)/staff/_staff"
import { Staff } from "@/app/(app)/staff/_staff"
import { useTranslation } from "next-i18next"
import Header from "@/app/(app)/_components/header"

export default function StaffView({ params }: any) {
    const { t } = useTranslation('common')
    const pathname = usePathname()
	const { staff_id }: any = params
	const [data, setData] = useState<Staff>({} as Staff)
	useBreadcrumbLabel(data)

	useEffect(() => {
		getStaff(staff_id).then((returnData: any) => {
			setData(returnData.response)
		})
	}, [])

	return <>
		<Header editHref={`${pathname}/edit`} editLabel={t('edit')}
			title={<div className="flex items-center gap-4"><div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"><FontAwesomeIcon icon={faIdCard} className="text-2xl" /></div><div className="min-w-0"><h1 className="text-2xl font-bold leading-tight truncate">{data.fname} {data.sname}</h1><div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-base-content/60"><div className={`badge badge-sm ${data.blacklist ? 'badge-error' : 'badge-success'}`}>{data.blacklist ? t('staff.blacklisted') : t('staff.active')}</div></div></div></div>}
			containerClass="flex flex-wrap items-center justify-between gap-4"
		/>
		<div className="mt-6 space-y-6">
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
				<div className="card bg-base-100 border border-base-200 shadow-sm">
					<div className="card-body">
						<h2 className="card-title text-lg mb-4 gap-3">
							<span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><FontAwesomeIcon icon={faIdCard} /></span>
							{t('staff.personalInfo')}
						</h2>
						<div className="space-y-4">
							<div className="flex justify-between items-center py-2 border-b border-base-200">
								<span className="font-semibold text-base-content/70">{t('staff.email')}</span>
								<span className="text-base-content text-end">{data.email}</span>
							</div>
							<div className="flex justify-between items-center py-2 border-b border-base-200">
								<span className="font-semibold text-base-content/70">{t('staff.birthDate')}</span>
								<span className="text-base-content text-end">{data.birth_date}</span>
							</div>
							<div className="flex justify-between items-center py-2 border-b border-base-200">
								<span className="font-semibold text-base-content/70">{t('staff.gender')}</span>
								<span className="text-base-content text-end">{data.gender}</span>
							</div>
							<div className="flex justify-between items-center py-2">
								<span className="font-semibold text-base-content/70">{t('staff.roles')}</span>
								<span className="text-base-content text-end">{data.user?.roles?.map((role: any) => role.name).join(' | ')}</span>
							</div>
						</div>
					</div>
				</div>

				<div className="card bg-base-100 border border-base-200 shadow-sm">
					<div className="card-body">
						<h2 className="card-title text-lg mb-4 gap-3">
							<span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><FontAwesomeIcon icon={faIdCard} /></span>
							{t('staff.contactInfo')}
						</h2>
						<div className="space-y-4">
							<div className="flex justify-between items-center py-2 border-b border-base-200">
								<span className="font-semibold text-base-content/70">{t('staff.address')}</span>
								<span className="text-base-content text-end">{data.address} {data.city} {data.country}</span>
							</div>
							<div className="flex justify-between items-center py-2 border-b border-base-200">
								<span className="font-semibold text-base-content/70">{t('staff.homePhone')}</span>
								<span className="text-base-content text-end">{data.home_phone}</span>
							</div>
							<div className="flex justify-between items-center py-2">
								<span className="font-semibold text-base-content/70">{t('staff.mobilePhone')}</span>
								<span className="text-base-content text-end">{data.mobile_phone}</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="card bg-base-100 border border-base-200 shadow-sm">
				<div className="card-body">
					<h2 className="card-title text-lg mb-4 gap-3">
						<span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><FontAwesomeIcon icon={faIdCard} /></span>
						{t('staff.emergencyContact')}
					</h2>
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						<div className="space-y-4">
							<div className="flex justify-between items-center py-2 border-b border-base-200">
								<span className="font-semibold text-base-content/70">{t('staff.emgContactName')}</span>
								<span className="text-base-content text-end">{data.emg_contact_name}</span>
							</div>
							<div className="flex justify-between items-center py-2 border-b border-base-200">
								<span className="font-semibold text-base-content/70">{t('staff.emgContactRelation')}</span>
								<span className="text-base-content text-end">{data.emg_contact_relation}</span>
							</div>
							<div className="flex justify-between items-center py-2">
								<span className="font-semibold text-base-content/70">{t('staff.emgContactMobileNumber')}</span>
								<span className="text-base-content text-end">{data.emg_contact_mobilenumber}</span>
							</div>
						</div>
						<div className="space-y-4">
							<div className="flex justify-between items-center py-2 border-b border-base-200">
								<span className="font-semibold text-base-content/70">{t('staff.emgContactEmail')}</span>
								<span className="text-base-content text-end">{data.emg_contact_email}</span>
							</div>
							<div className="flex justify-between items-center py-2 border-b border-base-200">
								<span className="font-semibold text-base-content/70">{t('staff.emgContactAddress')}</span>
								<span className="text-base-content text-end">{data.emg_contact_address} {data.emg_contact_city} {data.emg_contact_country}</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			{data.notes && <div className="card bg-base-100 border border-base-200 shadow-sm">
				<div className="card-body">
					<h2 className="card-title text-lg mb-4 gap-3">
						<span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><FontAwesomeIcon icon={faIdCard} /></span>
						{t('staff.notes')}
					</h2>
					<p className="text-base-content/60 bg-base-200 rounded-lg p-3">{data.notes}</p>
				</div>
			</div>}

            {data.active_pos_registers?.length > 0 && <div className="card bg-base-100 border border-base-200 shadow-sm">
				<div className="card-body">
					<h2 className="card-title text-lg mb-4 gap-3">
						<span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><FontAwesomeIcon icon={faIdCard} /></span>
						{t('staff.posRegisters')}
					</h2>
					
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {data.active_pos_registers?.map((register: any) => (
                            <label key={register.id} className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                                <input type="checkbox" className="checkbox" checked readOnly />
                                <span className="label-text">{register.name}</span>
                            </label>
                        ))}
                    </div>
				</div>
			</div>}
		</div>
	</>
}
