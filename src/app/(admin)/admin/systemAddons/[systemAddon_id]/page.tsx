"use client"

import { useEffect, useState } from "react"
import { useBreadcrumbLabel } from "@/hooks/useBreadcrumbLabel"
import { getSystemAddon } from "@/app/(admin)/admin/systemAddons/_systemAddon"
import { SystemAddon } from "@/app/(admin)/admin/systemAddons/_systemAddon"
import { BASE_COUNTRIES } from "@/app/(admin)/admin/systemPlans/_systemPlan"
import { useTranslation } from "next-i18next"
import Header from "@/app/(app)/_components/header"

export default function SystemAddonView({ params }: any) {
    const { t } = useTranslation('common')
	const { systemAddon_id }: any = params
	const [data, setData] = useState<SystemAddon>({} as SystemAddon)
	useBreadcrumbLabel(data)

	useEffect(() => {
		getSystemAddon(systemAddon_id).then((returnData: any) => {
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
					{t('systemAddons.details')}
				</h2>
				<div className="space-y-4">
					<div className="flex justify-between items-center py-2 border-b border-base-200">
						<span className="font-semibold text-base-content/70">{t('systemAddons.slug')}</span>
						<span className="text-base-content text-end">{data.slug}</span>
					</div>
					<div className="flex justify-between items-center py-2 border-b border-base-200">
						<span className="font-semibold text-base-content/70">{t('systemAddons.sort')}</span>
						<span className="text-base-content text-end">{data.sort}</span>
					</div>
					<div className="flex justify-between items-center py-2">
						<span className="font-semibold text-base-content/70">{t('systemAddons.status')}</span>
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
                    {t('systemAddons.pricing')}
                </h3>

                <div className="space-y-4">
                    {BASE_COUNTRIES.map((country: any, i) => {
                        const countryPrice = data.prices?.find((p: any) => p.country_code === country.code)

                        return (
                        <div key={i} className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 bg-base-200 rounded-lg">
                            <div className="space-x-2">
                                <span className="font-semibold text-sm text-base-content/70">{t('systemAddons.country')}</span>
                                <span className="text-base-content">{t(`${country.label}`)}</span>
                            </div>
                            <div className="space-x-2">
                                <span className="font-semibold text-sm text-base-content/70">{t('systemAddons.monthlyPrice')}</span>
                                <span className="text-base-content">{countryPrice?.price} {countryPrice?.currency}</span>
                            </div>
                        </div>
                        )
                    })}
                </div>
            </div>
        </div>
	</>
}
