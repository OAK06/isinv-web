"use client"

import { useEffect, useState } from "react"
import { useBreadcrumbLabel } from "@/hooks/useBreadcrumbLabel"
import { BASE_COUNTRIES, getSystemPlan } from "@/app/(admin)/admin/systemPlans/_systemPlan"
import { SystemPlan } from "@/app/(admin)/admin/systemPlans/_systemPlan"
import { useTranslation } from "next-i18next"
import Header from "@/app/(app)/_components/header"

export default function SystemPlanView({ params }: any) {
    const { t } = useTranslation('common')
	const { systemPlan_id }: any = params
	const [data, setData] = useState<SystemPlan>({} as SystemPlan)
	useBreadcrumbLabel(data)

	useEffect(() => {
		getSystemPlan(systemPlan_id).then((returnData: any) => {
			setData(returnData.response)
		})
	}, [])

	return <>
		<Header
			title={data.slug}
			containerClass={"flex justify-between"}
		/>
		<div className="mt-6 card bg-base-100 border border-base-200 shadow-sm">
			<div className="card-body">
				<h2 className="card-title text-xl mb-4">
					<div className="w-1 h-6 bg-primary rounded me-2"></div>
					{t('systemPlans.details')}
				</h2>
				<div className="space-y-4">
					<div className="flex justify-between items-center py-2 border-b border-base-200">
						<span className="font-semibold text-base-content/70">{t('systemPlans.slug')}</span>
						<span className="text-base-content text-end">{data.slug}</span>
					</div>
					<div className="flex justify-between items-center py-2 border-b border-base-200">
						<span className="font-semibold text-base-content/70">{t('systemPlans.months')}</span>
						<span className="text-base-content text-end">{data.months}</span>
					</div>
					<div className="flex justify-between items-center py-2">
						<span className="font-semibold text-base-content/70">{t('systemPlans.status')}</span>
						<span className={`badge badge-lg ${data.active ? 'badge-success' : 'badge-error'}`}>
                                {data.active ? t('active') : t('inactive')}
                        </span>
					</div>
				</div>
			</div>
		</div>

        <div className="mt-6 card bg-base-100 border border-base-200 shadow-sm">
            <div className="card-body">
                <h3 className="card-title text-lg mb-4">
                    <div className="w-1 h-5 bg-primary rounded me-2"></div>
                    {t('systemPlans.pricing')}
                </h3>
                
                <div className="space-y-4">
                    {BASE_COUNTRIES.map((country: any, i) => {
                        const countryPrice = data.prices?.find((p: any) => p.country_code === country.code)

                        return (
                        <div key={i} className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 bg-base-200 rounded-lg">
                            <div className="space-x-2">
                                <span className="font-semibold text-sm text-base-content/70">{t('systemPlans.country')}</span>
                                <span className="text-base-content">{t(`${country.label}`)}</span>
                            </div>	
                            <div className="space-x-2">
                                <span className="font-semibold text-sm text-base-content/70">{t('systemPlans.originalPrice')}</span>
                                <span className="text-base-content">{countryPrice?.original_price}</span>
                            </div>	
                            <div className="space-x-2">
                                <span className="font-semibold text-sm text-base-content/70">{t('systemPlans.currentPrice')}</span>
                                <span className="text-base-content">{countryPrice?.price}</span>
                            </div>
                        </div>
                        )
                    })}
                </div>
            </div>
        </div>
	</>
}