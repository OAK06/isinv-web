"use client"

import { useEffect, useState } from "react"
import { useBreadcrumbLabel } from "@/hooks/useBreadcrumbLabel"
import { getReferral } from "@/app/(admin)/admin/referrals/_referral"
import { Referral } from "@/app/(admin)/admin/referrals/_referral"
import { useTranslation } from "next-i18next"
import Header from "@/app/(app)/_components/header"

export default function ReferralView({ params }: any) {
    const { t } = useTranslation('common')
	const { referral_id }: any = params
	const [data, setData] = useState<Referral>({} as Referral)
	useBreadcrumbLabel(data)

	useEffect(() => {
		getReferral(referral_id).then((returnData: any) => {
			setData(returnData.response)
		})
	}, [])

	return <>
		<Header
			title={data.source_name}
			containerClass={"flex justify-between"}
		/>
		<div className="mt-6 card bg-base-100 border border-base-200 shadow-sm">
			<div className="card-body">
				<h2 className="card-title text-xl mb-4">
					<div className="w-1 h-6 bg-primary rounded me-2"></div>
					{t('referrals.details')}
				</h2>
				<div className="space-y-4">
					<div className="flex justify-between items-center py-2 border-b border-base-200">
						<span className="font-semibold text-base-content/70">{t('referrals.sourceName')}</span>
						<span className="text-base-content text-end">{data.source_name}</span>
					</div>
					<div className="flex justify-between items-center py-2">
						<span className="font-semibold text-base-content/70">{t('referrals.referralCount')}</span>
						<span className="text-base-content text-end">{data.referral_count}</span>
					</div>
				</div>
			</div>
		</div>
	</>
}