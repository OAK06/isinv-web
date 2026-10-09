"use client"

import { useRouter } from "next/navigation"
import { FormEvent, useEffect, useState } from "react"

import { createPaymentSession, getBranchPlans, subscribePlan, Plan } from "@/app/(app)/memberPlans/_memberPlan"
import { useAtom } from "jotai"
import { branch, branch_settings, branchTermsAndConditions, responseMessage, store, validationErrors } from "@/_state/globalStore"
import InputError from "@/_components/inputError"
import { useTranslation } from "next-i18next"
import DOMPurify from "dompurify"
import Header from "@/app/(app)/_components/header"
import { scrollToFirstInvalidElement, validateForm } from "@/app/_helpers/validation"
import SignaturePad from "@/_components/signaturePad"
import { usePaymentReturn } from "@/hooks/usePaymentReturn"

export default function MemberPlansAdd() {	
    const { t } = useTranslation('common')
	const [ branchID ] = useAtom(branch)
	const router = useRouter()
	const [isSubmitting , setIsSubmitting] = useState(false)
	const [validErrors] = useAtom(validationErrors)
	const [plans, setplans] = useState<Plan[]>([])
	const [planData, setPlanData] = useState<any>({})
    const [branchTerms] = useAtom(branchTermsAndConditions)
	const [signature, setSignature] = useState<File>(null)
    const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null)
    const [branchSettings] = useAtom(branch_settings)
    const shouldSign = branchSettings?.includes("quick_signup_contract_upload")
    const isPaymentSettingActive = branchSettings?.includes("online_payments")
    usePaymentReturn({
        branchId: branchID,
        redirectTo: '/memberPlans',
        successMessage: t('memberPlans.createdMessage'),
        failedMessage: t('memberPlans.createdWithoutPaidMessage')
    })

    useEffect(() => {
        if (branchSettings && !isPaymentSettingActive) {
            router.replace('/dashboard')
        }
    }, [isPaymentSettingActive])

	const getList = () => {
		getBranchPlans(branchID).then((returnData: any) => {
			setplans(returnData.response)
		})
	}

	useEffect(() => {
		getList()
	}, [])

    const contract = `
        <div>${branchTerms ?? ""}</div>
        <div>${planData?.terms ?? ""}</div>
    `

    const handlePayment = async (memberPlan: any) => {
        try {
            const data = {
                branch_id: memberPlan.branch_id,
                invoice_id: memberPlan.invoice_id,
                member_id: memberPlan.member_id,
                success_url: window.location.href,
                cancel_url: window.location.href+'?payment_status=canceled'
            }
            const returnData = await createPaymentSession(data)

            router.push(returnData.response.checkout_url)
        } catch (e) {
            setIsSubmitting(false)
            router.push('/memberPlans')
            store.set(responseMessage, { type: 'alert', text: `${t('memberPlans.createdWithoutPaidMessage')}` })
        }
    }

	const formSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		if (!planData.id)
            return store.set(responseMessage, { type: 'alert', text: t('memberPlans.planAlertMessage') });
        
		const form = event.currentTarget
        const {errors, firstInvalidElement} = validateForm(form, t, {
            ...(shouldSign && { signature: { value: signature ? 'true' : '', rules: ['required'] }})
        })
        if (Object.keys(errors).length > 0) {
            store.set(validationErrors, errors)
            if (firstInvalidElement) scrollToFirstInvalidElement(firstInvalidElement)
            return
        }
        
        const formData = new FormData(form)
		formData.set('branch_id', `${branchID}`)
		formData.set('plan_id', planData.id)
        signature && formData.set('signature', signature)
		setIsSubmitting(true)
        
		await subscribePlan(formData).then((returnData) => {
            const memberPlan = returnData.response
            if (memberPlan.price == 0) {
                setIsSubmitting(false)
                router.push('/memberPlans')
                store.set(responseMessage, { type: 'success', text: `${t('memberPlans.createdMessage')}` });
                return
            }
            handlePayment(memberPlan)
		})
		.catch(() => setIsSubmitting(false))
	}

    if (!isPaymentSettingActive) return null

	return <>
		<Header
            title={t('memberPlans.addTitle')}
            containerClass={"flex justify-between"}
        />

        <form onSubmit={formSubmit}>
        <div className="mt-6 space-y-6">
            {/* Plan Selection */}
            <div className="card bg-base-100 border border-base-200 shadow-sm">
                <div className="card-body">
                    <h2 className="card-title text-xl mb-4">
                        <div className="w-1 h-6 bg-primary rounded me-2"></div>
                        {t('memberPlans.selectPlan')}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {plans?.map((plan, index: number) => (
                            <button 
                                key={index} 
                                type="button" 
                                className={`card bg-base-200 border-2 hover:border-primary transition-colors ${planData.id === plan.id ? 'border-primary' : 'border-base-300'}`}
                                onClick={() => setPlanData(plan)}
                            >
                                <div className="card-body p-4 text-center">
                                    <h3 className="card-title justify-center text-lg font-bold">{plan.name}</h3>
                                    <p className="text-sm">
                                        {plan.duration_count} {t(plan.duration)} / <span className="font-semibold">${plan.price}</span>
                                    </p>
                                    {plan.entries_count && (
                                        <p className="text-sm">{plan.entries_count} {t('memberPlans.entry')}</p>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Plan Details */}
            {planData.id && ( <>
                <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                    <div className="card bg-base-100 border border-base-200 shadow-sm">
                        <div className="card-body">
                            <h2 className="card-title text-xl mb-4">
                                <div className="w-1 h-6 bg-primary rounded me-2"></div>
                                {t('memberPlans.planDetails')}
                            </h2>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-base-200">
                                    <span className="font-semibold text-base-content/70">{t('memberPlans.duration')}</span>
                                    <span className="text-base-content">{planData.duration_count} {planData.duration}</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="font-semibold text-base-content/70">{t('memberPlans.trial')}</span>
                                    <span className="text-base-content">{planData.trial ? t('yes') : t('no')}</span>
                                </div>
                                {planData.description && <div>
                                    <span className="font-semibold text-base-content/70 block mb-2">{t('memberPlans.description')}</span>
                                    <p className="text-base-content/60 bg-base-200 rounded-lg p-3">{planData.description}</p>
                                </div>}
                            </div>
                        </div>
                    </div>

                    <div className="card bg-base-100 border border-base-200 shadow-sm">
                        <div className="card-body">
                            <h2 className="card-title text-xl mb-4">
                                <div className="w-1 h-6 bg-primary rounded me-2"></div>
                                {t('memberPlans.pricing')}
                            </h2>
                            <div className="space-y-4">
                                <div className="items-center p-4 bg-primary/5 rounded-lg">
                                    <div className="mb-2 flex justify-between">
                                        <span className="font-semibold text-lg">{t('memberPlans.price')}</span>
                                        <span className="text-2xl font-bold text-primary">${planData.price}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-base-content/70">{t('memberPlans.taxPercentage')}</span>
                                        <span className="font-semibold">{planData.tax_percentage}%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-base-content/70">{t('memberPlans.startupFee')}</span>
                                        <span className="font-semibold">${planData.startup_fee}</span>
                                    </div>
                                </div>
                                {(planData.initial_pause_fee > 0 || planData.recurring_pause_fee > 0) && <div className="items-center p-4 bg-warning/5 rounded-lg border-s-4 border-warning">
                                    <div className="flex justify-between">
                                        <span className="text-base-content/70 text-sm">{t('memberPlans.initialPauseFee')}</span>
                                        <span className="font-semibold ">${planData.initial_pause_fee}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-base-content/70 text-sm">{t('memberPlans.recurringPauseFee')}</span>
                                        <span className="font-semibold ">${planData.recurring_pause_fee}</span>
                                    </div>
                                </div>}
                                {planData.cancellation_fee > 0 && <div className="items-center p-4 bg-error/5 rounded-lg border-s-4 border-error">
                                    <div className="flex justify-between">
                                        <span className="text-base-content/70 text-sm">{t('memberPlans.cancellationFee')}</span>
                                        <span className="font-semibold ">${planData.cancellation_fee}</span>
                                    </div>
                                </div>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card bg-base-100 border border-base-200 shadow-sm">
                    <div className="card-body">
                        <h2 className="card-title text-xl mb-4">
                            <div className="w-1 h-6 bg-primary rounded me-2"></div>
                            {t('memberPlans.contract')}
                        </h2>
                        <div
                            className="prose prose-sm max-w-none bg-base-200 rounded-xl p-4 max-h-96 overflow-y-auto"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(contract) }}
                        />
                    </div>
                </div>

                <div className="card bg-base-100 border border-base-200 shadow-sm">
                    <div className="card-body">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 ">
                            <div>
                                <div>
                                    <label className="label justify-start">
                                        <span className="label-text font-semibold required">{t('memberPlans.membershipStart')}</span>
                                    </label>
                                    <input name="start_date" data-rules="required" type="datetime-local" className="input input-bordered input-sm w-full" />
                                    <InputError messages={validErrors.start_date} />
                                </div>
                                <div>
                                    <label className={`label justify-start label-text ${shouldSign ? "required" : ""}`}>{t('memberPlans.signature')}</label>
                                    <SignaturePad
                                        savedData={signatureDataUrl}
                                        onSave={(file, dataUrl) => {
                                            setSignature(file)
                                            setSignatureDataUrl(dataUrl)
                                        }}
                                        onClear={() => {
                                            setSignature(null)
                                            setSignatureDataUrl(null)
                                        }}
                                    />
                                    <InputError messages={validErrors.signature} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>)}
            
            <div className="card-actions justify-end mt-6">
                <button className="btn btn-sm btn-primary" type="submit" disabled={isSubmitting}>
                    {isSubmitting && <span className="loading loading-spinner"></span>}
                    {t('memberPlans.addFormBtn')}
                </button>
            </div>
        </div>
        </form>
	</>
}