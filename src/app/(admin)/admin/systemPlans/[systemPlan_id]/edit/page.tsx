"use client"

import { useRouter } from "next/navigation"
import { useBreadcrumbLabel } from "@/hooks/useBreadcrumbLabel"
import { FormEvent, useEffect, useState } from "react"
import { BASE_COUNTRIES, editSystemPlan, getSystemPlan } from "@/app/(admin)/admin/systemPlans/_systemPlan"
import { useAtom } from "jotai"
import { responseMessage, store, validationErrors } from "@/_state/globalStore"
import InputError from "@/_components/inputError"
import { useTranslation } from "next-i18next"
import Header from "@/app/(app)/_components/header"

export default function SystemPlanEdit({ params }: any) {
    const { t } = useTranslation('common')
	const router = useRouter()
	const { systemPlan_id }: any = params
	const [data, setData] = useState<any>([])
	useBreadcrumbLabel(data)
	const [isSubmitting , setIsSubmitting] = useState(false)
	const [validErrors] = useAtom(validationErrors)

	useEffect(() => {
		getSystemPlan(systemPlan_id).then((returnData: any) => {
			setData(returnData.response)
		})
	}, [])

	const formSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const formData = new FormData(event.currentTarget)
		setIsSubmitting(true)
		await editSystemPlan(systemPlan_id, formData).then(() => {
			router.push(`/admin/systemPlans/`)
			store.set(responseMessage, { type: 'success', text: t('systemPlans.updatedMessage') });
		})
		.catch(() => setIsSubmitting(false))
	}

	return <>
		<Header
			title={t('systemPlans.editTitle')}
			containerClass={"flex justify-between"}
		/>
		<form onSubmit={formSubmit}>
            <div className="mt-6 card bg-base-100 border border-base-200 shadow-sm">
                <div className="card-body">	
                    <h3 className="card-title text-lg mb-4">
                        <div className="w-1 h-5 bg-primary rounded me-2"></div>
                        {t('systemPlans.details')}
                    </h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="lg:col-span-2">
                            <label className="label justify-start">
                                <span className="label-text font-semibold required">{t('systemPlans.slug')}</span>
                            </label>
                            <input name="slug" data-rules="required" type="text" className="input input-bordered input-sm w-full" defaultValue={data.slug} />
                            <InputError messages={validErrors.slug} />
                        </div>
                        <div>
                            <label className="label justify-start">
                                <span className="label-text font-semibold required">{t('systemPlans.months')}</span>
                            </label>
                            <input name="months" data-rules="required" type="number" className="input input-bordered input-sm w-full" defaultValue={data.months} />
                            <InputError messages={validErrors.months} />
                        </div>
                        <div>
                            <label className="label justify-start">
                                <span className="label-text font-semibold required">{t('systemPlans.status')}</span>
                            </label>
                            <select name="active" data-rules="required" className="select select-sm select-bordered w-full" defaultValue={data.active}>
								<option value={""} disabled>{t('chooseOption')}</option>
								<option value={"true"} selected={data.active == true}>{t('active')}</option>
								<option value={"false"} selected={data.active == false}>{t('inactive')}</option>
							</select>
                            <InputError messages={validErrors.active} />
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
                                    <input type="hidden" name={`prices[${i}][country_code]`} value={country.code} />
                                </div>	
                                <div className="space-x-2">
                                    <span className="font-semibold text-sm text-base-content/70">{t('systemPlans.originalPrice')}</span>
                                    <input name={`prices[${i}][original_price]`} data-rules="required" type="number" className="input input-bordered input-sm w-fit" defaultValue={countryPrice?.original_price} />
                                    <InputError messages={validErrors[`prices[${i}][original_price]`]} />
                                </div>	
                                <div className="space-x-2">
                                    <span className="font-semibold text-sm text-base-content/70">{t('systemPlans.currentPrice')}</span>
                                    <input name={`prices[${i}][price]`} data-rules="required" type="number" className="input input-bordered input-sm w-fit" defaultValue={countryPrice?.price} />
                                    <InputError messages={validErrors[`prices[${i}][price]`]} />
                                </div>
                            </div>
                            )
                        })}
                    </div>
                </div>
            </div>
            
            <div className="card-actions justify-end mt-6">
                <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
                    {isSubmitting && <span className="loading loading-spinner"></span>}
                    {t('systemPlans.addFormBtn')}
                </button>
            </div>
        </form>
	</>
}