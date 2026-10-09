"use client"

import { useRouter } from "next/navigation"
import { useBreadcrumbLabel } from "@/hooks/useBreadcrumbLabel"
import { FormEvent, useEffect, useState } from "react"

import { useAtom } from "jotai"
import { responseMessage, store, validationErrors } from "@/_state/globalStore"
import InputError from "@/_components/inputError"
import { useTranslation } from "next-i18next"
import Header from "@/app/(app)/_components/header"
import { editSignup, getSignup } from "@/app/(admin)/admin/gymSignups/_signup"
import { scrollToFirstInvalidElement, validateForm } from "@/app/_helpers/validation"

export default function SignupEdit({ params }: any) {
    const { t } = useTranslation('common')
	const router = useRouter()
	const { signup_id }: any = params
	const [data, setData] = useState<any>([])
	useBreadcrumbLabel(data)
	const [isSubmitting , setIsSubmitting] = useState(false)
	const [validErrors] = useAtom(validationErrors)

	useEffect(() => {
		getSignup(signup_id).then((returnData: any) => {
			setData(returnData.response)
		})
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

        const formData = new FormData(form)
        setIsSubmitting(true)
        await editSignup(signup_id, formData).then((returnData) => {
            router.push('/admin/gymSignups')
            store.set(responseMessage, { type: 'success', text: t('ownerSignup.updatedMessage') });
        })
        .catch(() => setIsSubmitting(false))
	}

    return <>
        <Header
            title={t('ownerSignup.editTitle')}
            containerClass={"flex justify-between"}
        />
        <div className="mt-6 card bg-base-100 border border-base-200 shadow-sm">
            <div className="card-body">	
                <form onSubmit={formSubmit} encType="multipart/form-data">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Read-only Section */}
                        <div className="lg:col-span-2">
                            <h3 className="text-lg font-semibold text-base-content/70 mb-4">{t('ownerSignup.basicInfo')}</h3>
                        </div>
                        <div>
                            <label className="label justify-start">
                                <span className="label-text font-semibold">{t('ownerSignup.gymName')}</span>
                            </label>
                            <input type="text" className="input input-bordered input-sm w-full bg-base-200" defaultValue={data.gym_name} readOnly />
                            <InputError messages={validErrors.gym_name} />
                        </div>
                        <div>
                            <label className="label justify-start">
                                <span className="label-text font-semibold">{t('ownerSignup.gymPlan')}</span>
                            </label>
                            <input type="text" className="input input-bordered input-sm w-full bg-base-200" defaultValue={data.gym_plan ?? "---"} readOnly />
                        </div>
                        <div>
                            <label className="label justify-start">
                                <span className="label-text font-semibold">{t('ownerSignup.ownerFname')}</span>
                            </label>
                            <input type="text" className="input input-bordered input-sm w-full bg-base-200" defaultValue={data.owner_fname} readOnly />
                            <InputError messages={validErrors.owner_fname} />
                        </div>
                        <div>
                            <label className="label justify-start">
                                <span className="label-text font-semibold">{t('ownerSignup.ownerSname')}</span>
                            </label>
                            <input type="text" className="input input-bordered input-sm w-full bg-base-200" defaultValue={data.owner_sname} readOnly />
                            <InputError messages={validErrors.owner_sname} />
                        </div>
                        <div>
                            <label className="label justify-start">
                                <span className="label-text font-semibold">{t('ownerSignup.email')}</span>
                            </label>
                            <input 
                                defaultValue={data.email}
                                type="email" 
                                className="input input-bordered input-sm w-full bg-base-200" 
                                readOnly
                            />
                            <InputError messages={validErrors.email} />
                        </div>
                        <div>
                            <label className="label justify-start">
                                <span className="label-text font-semibold">{t('ownerSignup.mobilePhone')}</span>
                            </label>
                            <input type="text" className="input input-bordered input-sm w-full bg-base-200" defaultValue={data.mobile_phone} readOnly />
                            <InputError messages={validErrors.mobile_phone} />
                        </div>

                        {/* Editable Section */}
                        <div className="lg:col-span-2 border-t pt-6 mt-4">
                            <h3 className="text-lg font-semibold text-base-content/70 mb-4">{t('ownerSignup.editableInfo')}</h3>
                        </div>
                        <div className="lg:col-span-2">
                            <label className="label justify-start">
                                <span className="label-text font-semibold">{t('ownerSignup.gymAddress')}</span>
                            </label>
                            <input name="gym_address" type="text" className="input input-bordered input-sm w-full" defaultValue={data.gym_address} />
                            <InputError messages={validErrors.gym_address} />
                        </div>
                        <div>
                            <label className="label justify-start">
                                <span className="label-text font-semibold required">{t('ownerSignup.gymCity')}</span>
                            </label>
                            <input name="gym_city" data-rules="required" type="text" className="input input-bordered input-sm w-full" defaultValue={data.gym_city} />
                            <InputError messages={validErrors.gym_city} />
                        </div>
                        <div>
                            <label className="label justify-start">
                                <span className="label-text font-semibold required">{t('ownerSignup.gymCountry')}</span>
                            </label>
                            <input name="gym_country" data-rules="required" type="text" className="input input-bordered input-sm w-full" defaultValue={data.gym_country} />
                            <InputError messages={validErrors.gym_country} />
                        </div>
                        <div>
                            <label className="label justify-start">
                                <span className="label-text font-semibold">{t('ownerSignup.currentSystemInput')}</span>
                            </label>
                            <select name="current_system" className="select select-sm select-bordered w-full" defaultValue={data.current_system}>
                                <option value={""} disabled>{t('chooseOption')}</option>
                                <option value={"true"}>{t('yes')}</option>
                                <option value={"false"}>{t('no')}</option>
                            </select>
                            <InputError messages={validErrors.current_system} />
                        </div>
                        <div>
                            <label className="label justify-start">
                                <span className="label-text font-semibold">{t('ownerSignup.membersEstimate')}</span>
                            </label>
                            <input name="members_estimate" type="number" className="input input-bordered input-sm w-full" defaultValue={data.members_estimate} />
                            <InputError messages={validErrors.members_estimate} />
                        </div>
                        <div>
                            <label className="label justify-start">
                                <span className="label-text font-semibold">{t('ownerSignup.branchCount')}</span>
                            </label>
                            <input name="branch_count" type="number" className="input input-bordered input-sm w-full" defaultValue={data.branch_count} />
                            <InputError messages={validErrors.branch_count} />
                        </div>
                        <div>
                            <label className="label justify-start">
                                <span className="label-text font-semibold required">{t('ownerSignup.status')}</span>
                            </label>
                            <select name="status" data-rules="required" className="select select-sm select-bordered w-full" defaultValue={data.status}>
                                <option value={""} disabled>{t('chooseOption')}</option>
                                <option value={0}>{t('ownerSignup.new')}</option>
                                <option value={1}>{t('ownerSignup.customer')}</option>
                                <option value={2}>{t('ownerSignup.contacted')}</option>
                                <option value={3}>{t('ownerSignup.inProgress')}</option>
                                <option value={4}>{t('ownerSignup.demoScheduled')}</option>
                                <option value={5}>{t('ownerSignup.notInterested')}</option>
                            </select>
                            <InputError messages={validErrors.status} />
                        </div>
                        <div>
                            <label className="label justify-start">
                                <span className="label-text font-semibold">{t('ownerSignup.demoCompleted')}</span>
                            </label>
                            <select name="demo_completed" className="select select-sm select-bordered w-full" defaultValue={data.demo_completed ? 1 : 0}>
                                <option value={1}>{t('yes')}</option>
                                <option value={0}>{t('no')}</option>
                            </select>
                        </div>
                        
                        <div className="lg:col-span-2">
                            <label className="label justify-start">
                                <span className="label-text font-semibold">{t('ownerSignup.notes')}</span>
                            </label>
                            <textarea name="notes" className="textarea textarea-bordered w-full min-h-32" defaultValue={data.notes}></textarea>
                            <InputError messages={validErrors.notes} />
                        </div>
                        <div className="lg:col-span-2">
                            <label className="label justify-start">
                                <span className="label-text font-semibold">{t('ownerSignup.adminNotes')}</span>
                            </label>
                            <textarea name="admin_notes" className="textarea textarea-bordered w-full min-h-32" defaultValue={data.admin_notes ?? ''}></textarea>
                            <InputError messages={validErrors.admin_notes} />
                        </div>
                    </div>
                    
                    <div className="card-actions justify-end mt-6">
                        <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
                            {isSubmitting && <span className="loading loading-spinner"></span>}
                            {t('ownerSignup.editFormBtn')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </>
}