"use client"

import { FormEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { addSubscription, getAllSystemAddons, getAllSystemPlans } from "@/app/(admin)/admin/subscriptions/_subscription"
import { getCompanies } from "@/app/(app)/branches/_branch"
import { BASE_COUNTRIES } from "@/app/(admin)/admin/systemPlans/_systemPlan"
import { useAtom } from "jotai"
import { responseMessage, store, validationErrors } from "@/_state/globalStore"
import InputError from "@/_components/inputError"
import { useTranslation } from "next-i18next"
import Header from "@/app/(app)/_components/header"
import { scrollToFirstInvalidElement, validateForm } from "@/app/_helpers/validation"

/**
 * Manual subscription creation (grandfathering). Creating one for a demo
 * company converts it into a real, billable tenant.
 */
export default function SubscriptionAdd() {
    const { t } = useTranslation('common')
	const router = useRouter()
	const [isSubmitting , setIsSubmitting] = useState(false)
	const [validErrors] = useAtom(validationErrors)
    const [companies, setCompanies] = useState<any[]>([])
    const [plans, setPlans] = useState<any[]>([])
    const [addons, setAddons] = useState<any[]>([])

    useEffect(() => {
        getCompanies().then((returnData: any) => setCompanies(returnData.response ?? []))
        getAllSystemPlans().then((returnData: any) => setPlans(returnData.response ?? []))
        getAllSystemAddons().then((returnData: any) => setAddons(returnData.response ?? []))
    }, [])

	const formSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const form = event.currentTarget
        const {errors, firstInvalidElement} = validateForm(form, t)
        if (Object.keys(errors).length > 0) {
            store.set(validationErrors, errors)
            if (firstInvalidElement) scrollToFirstInvalidElement(firstInvalidElement)
            return
        }

		const formData = new FormData(event.currentTarget)
		setIsSubmitting(true)
		await addSubscription(formData).then(() => {
			router.push(`/admin/subscriptions`)
			store.set(responseMessage, { type: 'success', text: t('subscriptions.createdMessage') });
		})
		.catch(() => setIsSubmitting(false))
	}

	return <>
		<Header
			title={t('subscriptions.addTitle')}
			subtitle={t('subscriptions.addSubtitle')}
			containerClass={"flex justify-between"}
		/>
        <form onSubmit={formSubmit}>
            <div className="mt-6 card bg-base-100 border border-base-200 shadow-sm">
                <div className="card-body">
                    <h3 className="card-title text-lg mb-4">
                        <div className="w-1 h-5 bg-primary rounded me-2"></div>
                        {t('subscriptions.details')}
                    </h3>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                            <label className="label justify-start">
                                <span className="label-text font-semibold required">{t('subscriptions.company')}</span>
                            </label>
                            <select name="company_id" data-rules="required" className="select select-sm select-bordered w-full" defaultValue={""}>
                                <option value={""} disabled>{t('chooseOption')}</option>
                                {companies.map((company: any) => (
                                    <option key={company.id} value={company.id}>{company.name}</option>
                                ))}
                            </select>
                            <InputError messages={validErrors.company_id} />
                        </div>
                        <div>
                            <label className="label justify-start">
                                <span className="label-text font-semibold required">{t('subscriptions.plan')}</span>
                            </label>
                            <select name="system_plan_id" data-rules="required" className="select select-sm select-bordered w-full" defaultValue={""}>
                                <option value={""} disabled>{t('chooseOption')}</option>
                                {plans.map((plan: any) => (
                                    <option key={plan.id} value={plan.id}>{plan.slug} ({plan.months} {t('subscriptions.months')})</option>
                                ))}
                            </select>
                            <InputError messages={validErrors.system_plan_id} />
                        </div>
                        <div>
                            <label className="label justify-start">
                                <span className="label-text font-semibold required">{t('subscriptions.status')}</span>
                            </label>
                            <select name="status" data-rules="required" className="select select-sm select-bordered w-full" defaultValue={""}>
                                <option value={""} disabled>{t('chooseOption')}</option>
                                <option value={"0"}>{t('subscriptions.statuses.trial')}</option>
                                <option value={"2"}>{t('subscriptions.statuses.active')}</option>
                            </select>
                            <InputError messages={validErrors.status} />
                        </div>
                        <div>
                            <label className="label justify-start">
                                <span className="label-text font-semibold required">{t('subscriptions.country')}</span>
                            </label>
                            <select name="country_code" data-rules="required" className="select select-sm select-bordered w-full" defaultValue={""}>
                                <option value={""} disabled>{t('chooseOption')}</option>
                                {BASE_COUNTRIES.map((country) => (
                                    <option key={country.code} value={country.code}>{t(`${country.label}`)}</option>
                                ))}
                            </select>
                            <InputError messages={validErrors.country_code} />
                        </div>
                        <div>
                            <label className="label justify-start">
                                <span className="label-text font-semibold">{t('subscriptions.trialEndsAt')}</span>
                            </label>
                            <input name="trial_ends_at" type="date" className="input input-bordered input-sm w-full" />
                            <InputError messages={validErrors.trial_ends_at} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6 card bg-base-100 border border-base-200 shadow-sm">
                <div className="card-body">
                    <h3 className="card-title text-lg mb-4">
                        <div className="w-1 h-5 bg-primary rounded me-2"></div>
                        {t('subscriptions.addons')}
                    </h3>
                    <div className="flex flex-wrap gap-4">
                        {addons.map((addon: any) => (
                            <label key={addon.id} className="label cursor-pointer justify-start gap-2 p-3 bg-base-200 rounded-lg">
                                <input type="checkbox" name="addon_ids[]" value={addon.id} className="checkbox checkbox-primary checkbox-sm" />
                                <span className="label-text font-semibold">{t(`addons.${addon.slug}.title`, { defaultValue: addon.slug })}</span>
                            </label>
                        ))}
                        {addons.length === 0 && <span className="text-base-content/60 text-sm">{t('subscriptions.noAddons')}</span>}
                    </div>
                </div>
            </div>

            <div className="card-actions justify-end mt-6">
                <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
                    {isSubmitting && <span className="loading loading-spinner"></span>}
                    {t('subscriptions.addFormBtn')}
                </button>
            </div>
        </form>
	</>
}
