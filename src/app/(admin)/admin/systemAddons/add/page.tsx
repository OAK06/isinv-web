"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { addSystemAddon } from "@/app/(admin)/admin/systemAddons/_systemAddon"
import { BASE_COUNTRIES } from "@/app/(admin)/admin/systemPlans/_systemPlan"
import { useAtom } from "jotai"
import { responseMessage, store, validationErrors } from "@/_state/globalStore"
import InputError from "@/_components/inputError"
import { useTranslation } from "next-i18next"
import Header from "@/app/(app)/_components/header"
import { scrollToFirstInvalidElement, validateForm } from "@/app/_helpers/validation"

export default function SystemAddonAdd() {
    const { t } = useTranslation('common')
	const router = useRouter()
	const [isSubmitting , setIsSubmitting] = useState(false)
	const [validErrors] = useAtom(validationErrors)

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
		await addSystemAddon(formData).then(() => {
			router.push(`/admin/systemAddons`)
			store.set(responseMessage, { type: 'success', text: t('systemAddons.createdMessage') });
		})
		.catch(() => setIsSubmitting(false))
	}

	return <>
		<Header
			title={t('systemAddons.addTitle')}
			containerClass={"flex justify-between"}
		/>
        <form onSubmit={formSubmit}>
            <div className="mt-6 card bg-base-100 border border-base-200 shadow-sm">
                <div className="card-body">
                    <h3 className="card-title text-lg mb-4">
                        <div className="w-1 h-5 bg-primary rounded me-2"></div>
                        {t('systemAddons.details')}
                    </h3>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="lg:col-span-2">
                            <label className="label justify-start">
                                <span className="label-text font-semibold required">{t('systemAddons.slug')}</span>
                            </label>
                            <input name="slug" data-rules="required" type="text" className="input input-bordered input-sm w-full" placeholder="pos" />
                            <InputError messages={validErrors.slug} />
                        </div>
                        <div>
                            <label className="label justify-start">
                                <span className="label-text font-semibold">{t('systemAddons.sort')}</span>
                            </label>
                            <input name="sort" type="number" className="input input-bordered input-sm w-full" defaultValue={0} />
                            <InputError messages={validErrors.sort} />
                        </div>
                        <div>
                            <label className="label justify-start">
                                <span className="label-text font-semibold required">{t('systemAddons.status')}</span>
                            </label>
                            <select name="active" data-rules="required" className="select select-sm select-bordered w-full" defaultValue={""}>
                                <option value={""} disabled>{t('chooseOption')}</option>
                                <option value={"true"}>{t('active')}</option>
                                <option value={"false"}>{t('inactive')}</option>
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
                        {t('systemAddons.pricing')}
                    </h3>
                    <p className="text-sm text-base-content/60 mb-2">{t('systemAddons.pricingHint')}</p>

                    <div className="space-y-4">
                        {BASE_COUNTRIES.map((country: any, i) => (
                            <div key={i} className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 bg-base-200 rounded-lg">
                                <div className="space-x-2">
                                    <span className="font-semibold text-sm text-base-content/70">{t('systemAddons.country')}</span>
                                    <span className="text-base-content">{t(`${country.label}`)}</span>
                                    <input type="hidden" name={`prices[${i}][country_code]`} value={country.code} />
                                </div>
                                <div className="space-x-2">
                                    <span className="font-semibold text-sm text-base-content/70">{t('systemAddons.monthlyPrice')}</span>
                                    <input name={`prices[${i}][price]`} data-rules="required" type="number" step="any" className="input input-bordered input-sm w-fit" />
                                    <InputError messages={validErrors[`prices[${i}][price]`]} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="card-actions justify-end mt-6">
                <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
                    {isSubmitting && <span className="loading loading-spinner"></span>}
                    {t('systemAddons.addFormBtn')}
                </button>
            </div>
        </form>
	</>
}
