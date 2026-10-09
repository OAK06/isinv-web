"use client"

import { useEffect, useState } from "react"
import { useBreadcrumbLabel } from "@/hooks/useBreadcrumbLabel"

import { getSignup } from "@/app/(admin)/admin/gymSignups/_signup"
import { GymSignup } from "@/app/(admin)/admin/gymSignups/_signup"
import { useTranslation } from "next-i18next"
import Header from "@/app/(app)/_components/header"

export default function SignupView({ params }: any) {
    const { t } = useTranslation('common')
	const { signup_id }: any = params
	const [data, setData] = useState<GymSignup>({} as GymSignup)
	useBreadcrumbLabel(data)

	useEffect(() => {
		getSignup(signup_id).then((returnData: any) => {
			setData(returnData.response)
		})
	}, [])

    return <>
        <Header
			title={<div className="flex items-start gap-2">
                <h1 className="text-2xl font-bold">{data.gym_name}</h1>
                <div className="flex gap-2 pt-2">
                    <div className="badge badge-lg badge-info">
                        {t(`ownerSignup.${data.status_name}`)}
                    </div>
                </div>
            </div>}
			containerClass={"flex justify-between"}
		/>
        <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                <div className="card bg-base-100 border border-base-200 shadow-sm">
                    <div className="card-body">
                        <h2 className="card-title text-xl mb-4">
                            <div className="w-1 h-6 bg-primary rounded me-2"></div>
                            {t('ownerSignup.gymInfo')}
                        </h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-base-200">
                                <span className="font-semibold text-base-content/70">{t('ownerSignup.gymAddress')}</span>
                                <span className="text-base-content">{data.gym_address}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-base-200">
                                <span className="font-semibold text-base-content/70">{t('ownerSignup.gymCity')}</span>
                                <span className="text-base-content">{data.gym_city}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-base-200">
                                <span className="font-semibold text-base-content/70">{t('ownerSignup.gymCountry')}</span>
                                <span className="text-base-content">{data.gym_country}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-base-200">
                                <span className="font-semibold text-base-content/70">{t('ownerSignup.gymPlan')}</span>
                                <span className="text-base-content">{data.gym_plan}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-base-200">
                                <span className="font-semibold text-base-content/70">{t('ownerSignup.currentSystem')}</span>
                                <span className="text-base-content">{data.current_system ? t('yes') : t('no')}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-base-200">
                                <span className="font-semibold text-base-content/70">{t('ownerSignup.membersEstimate')}</span>
                                <span className="text-base-content">{data.members_estimate}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="font-semibold text-base-content/70">{t('ownerSignup.branchCount')}</span>
                                <span className="text-base-content">{data.branch_count}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card bg-base-100 border border-base-200 shadow-sm">
                    <div className="card-body">
                        <h2 className="card-title text-xl mb-4">
                            <div className="w-1 h-6 bg-primary rounded me-2"></div>
                            {t('ownerSignup.ownerInfo')}
                        </h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-base-200">
                                <span className="font-semibold text-base-content/70">{t('ownerSignup.ownerFname')}</span>
                                <span className="text-base-content">{data.owner_fname}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-base-200">
                                <span className="font-semibold text-base-content/70">{t('ownerSignup.ownerSname')}</span>
                                <span className="text-base-content">{data.owner_sname}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-base-200">
                                <span className="font-semibold text-base-content/70">{t('ownerSignup.email')}</span>
                                <span className="text-base-content">{data.email}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-base-200">
                                <span className="font-semibold text-base-content/70">{t('ownerSignup.mobilePhone')}</span>
                                <span className="text-base-content">{data.mobile_phone}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="font-semibold text-base-content/70">{t('ownerSignup.referral')}</span>
                                <span className="text-base-content">{data.referral?.source_name}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {(data.notes || data.admin_notes) && (
                <div className="card bg-base-100 border border-base-200 shadow-sm">
                    <div className="card-body">
                        <h2 className="card-title text-xl mb-4">
                            <div className="w-1 h-6 bg-primary rounded me-2"></div>
                            {t('ownerSignup.notesSection')}
                        </h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {data.notes && (
                                <div>
                                    <h3 className="font-semibold text-base-content/70 mb-2">{t('ownerSignup.notes')}</h3>
                                    <p className="text-base-content bg-base-200 rounded-lg p-3">{data.notes}</p>
                                </div>
                            )}
                            {data.admin_notes && (
                                <div>
                                    <h3 className="font-semibold text-base-content/70 mb-2">{t('ownerSignup.adminNotes')}</h3>
                                    <p className="text-base-content bg-base-200 rounded-lg p-3">{data.admin_notes}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    </>
}