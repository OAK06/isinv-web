"use client"

import { useRouter } from "next/navigation"
import PhoneInput from "@/_components/phoneInput"
import { FormEvent, useEffect, useRef, useState} from "react"

import InputError from "@/_components/inputError"
import { useAtom } from "jotai"
import { responseMessage, store, validationErrors } from "@/_state/globalStore"
import { addApplication, getOnlineBranchPlans, getHashedBranch, managePaymentMethods } from "@/app/(auth)/signup/_signup"
import { useAuth } from "@/hooks/auth"
import { useTranslation } from "next-i18next"
import MessageModal from "@/_components/messageModal"
import DOMPurify from "dompurify"
import SignaturePad from "@/_components/signaturePad"
import { scrollToFirstInvalidElement, validateForm } from "@/app/_helpers/validation"
import { useConfirm } from "@/_components/useConfirm"
import { useEmailConflictGuard } from "@/_components/useEmailConflictGuard"

export default function SignupPlan({ params }: any) {
    const { t } = useTranslation('common')
	const router = useRouter()
	const { branch_id }: any = params
	const [step, setStep] = useState<number>(1)
	const [plans, setPlans] = useState<any>([])
	const [planData, setPlanData] = useState<any>({})
	const [isSubmitting , setIsSubmitting] = useState(false)
	const [branchData, setBranchData] = useState<any>({})
	const { user } = useAuth({ middleware: "guest", redirectIfAuthenticated: "/dashboard" })
	const [validErrors] = useAtom(validationErrors)
	const [contract, setContract] = useState("")
	const [signature, setSignature] = useState<File>(null)
    const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null)
    const [termsAccepted, setTermsAccepted] = useState(false)
    const [healthConsent, setHealthConsent] = useState(false)
    const stepOne = useRef(null)
    const stepTwo = useRef(null)
    const { confirm, confirmModal } = useConfirm()
    const { guard, emailConflictModal } = useEmailConflictGuard()

	const getList = () => {
        getHashedBranch(branch_id).then((returnData: any) => {
            setBranchData(returnData.response)

            getOnlineBranchPlans(returnData.response.id).then((returnData: any) => {
                setPlans(returnData.response)
            })
        })
	}

	useEffect(() => {
		getList()
	}, [])

    useEffect(() => {
		if (!planData?.terms || !branchData?.terms) return
        
        setContract(`
            <div>${branchData.terms}</div>
            <div>${planData.terms}</div>
        `)
	}, [planData])

    const branchHasFeature = (settingName: string) => 
        branchData?.active_settings?.some((s: any) => s.feature_name === settingName)

    const handlePaymentMethods = async (data: any) => {
        await managePaymentMethods(data).then((returnData) => {
            router.push(returnData.response.url)
        })
        .catch(() => setIsSubmitting(false))
    }

	const formSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		if (!planData.id)
            return store.set(responseMessage, { type: 'alert', text: t('planSignup.planAlertMessage') });
        
        const form = event.currentTarget
        const formData = new FormData(form)
        const {errors, firstInvalidElement} = validateForm(form, t, {
            ...(branchHasFeature('quick_signup_contract_upload') && { signature: { value: signature ? 'true' : '', rules: ['required'] }}),
            terms_accepted: { value: termsAccepted ? 'true' : '', rules: ['required'] }
        })
        if (Object.keys(errors).length > 0) {
            store.set(validationErrors, errors)
            if (firstInvalidElement) {
                if (stepOne.current?.contains(firstInvalidElement)) 
                    setStep(1)
                if (stepTwo.current?.contains(firstInvalidElement)) 
                    setStep(2)
                setTimeout(() => scrollToFirstInvalidElement(firstInvalidElement), 200)
            }
            return
        }

        // Email already has an account? Confirm linking the application to it.
        if (!(await guard(String(formData.get('email') ?? ''), 'link', false))) return

        const confirmation = branchHasFeature('online_payments') ? await confirm(t('planSignup.redirectToAddPaymentMethod')) : true
        if (confirmation) {
            formData.set('branch_id', branchData?.id)
            formData.set('plan_id', planData.id)
            signature && formData.set('signature', signature)
            formData.set('acceptance_method', 'online_self')
            formData.set('terms_accepted', '1')
            formData.set('health_consent', healthConsent ? '1' : '0')
            setIsSubmitting(true)
            await addApplication(formData).then((returnData) => {
                const res = returnData.response
                if (branchHasFeature('online_payments')) {
                    handlePaymentMethods({
                        branch_id: res.branch_id,
                        application_id: res.id,
                        name: res.fullname,
                        email: res.email,
                        return_url: window.location.href + `/${res.hashed_id}`
                    })
                } else {
                    router.push(`/signup/${branch_id}/plans/${res.hashed_id}`)
                }
            })
            .catch(() => setIsSubmitting(false))
        }
	}

	return <>
		{emailConflictModal}
        <form onSubmit={formSubmit}>
            <MessageModal /> 

			<div ref={stepOne} className={step === 1 ? "" : "hidden"}>
				<div className="text-xl text-primary text-bold mb-4">{t('planSignup.memberInfoTitle')} {branchData?.name}</div>
				<div className="grid gap-2 grid-cols-1 sm:grid-cols-2 mb-3">
					<div className="">
						<label className="label justify-start label-text required">{t('planSignup.fname')}</label>
						<input name="fname" data-rules="required" type="text" className="input input-bordered w-full" />
						<InputError messages={validErrors.fname} />
					</div>
					<div className="">
						<label className="label justify-start label-text required">{t('planSignup.sname')}</label>
						<input name="sname" data-rules="required" type="text" className="input input-bordered w-full" />
						<InputError messages={validErrors.sname} />
					</div>
					<div className="sm:col-span-2">
						<label className="label justify-start label-text required">{t('planSignup.email')}</label>
						<div className="w-full">
							<input 
								name="email" 
                                data-rules="required|email"
								type="text" 
								className="input input-sm input-bordered w-full"
							/>
                            <InputError messages={validErrors.email} />
						</div>
					</div>
					<div className="">
						<label className="label justify-start label-text required">{t('planSignup.mobilePhone')}</label>
						<PhoneInput name="mobile_phone" rules="required" size="base" />
						<InputError messages={validErrors.mobile_phone} />
					</div>
					<div className="">
						<label className="label justify-start label-text">{t('planSignup.homePhone')}</label>
						<PhoneInput name="home_phone" size="base" />
						<InputError messages={validErrors.home_phone} />
					</div>
					<div className="sm:col-span-2">
						<label className="label justify-start label-text required">{t('planSignup.gender')}</label>
						<select name="gender" data-rules="required" className="select select-sm select-bordered w-full" defaultValue={""} >
							<option value={""} disabled>{t('chooseOption')}</option>
							<option value={"M"}>{t('male')}</option>
							<option value={"F"}>{t('female')}</option>
							<option value={"O"}>{t('other')}</option>
						</select>
						<InputError messages={validErrors.gender} />
					</div>
					<div className="">
						<label className="label justify-start label-text">{t('planSignup.city')}</label>
						<input name="city" type="text" className="input input-bordered w-full" />
						<InputError messages={validErrors.city} />
					</div>
					<div className="">
						<label className="label justify-start label-text">{t('planSignup.country')}</label>
						<input name="country" type="text" className="input input-bordered w-full" />
						<InputError messages={validErrors.country} />
					</div>
					<div className="sm:col-span-2">
						<label className="label justify-start label-text">{t('planSignup.address')}</label>
						<input name="address" type="text" className="input input-bordered w-full" />
						<InputError messages={validErrors.address} />
					</div>
					<div className="">
						<label className="label justify-start label-text required">{t('planSignup.birthDate')}</label>
						<input name="birth_date" data-rules="required" type="date" className="input input-bordered w-full" />
						<InputError messages={validErrors.birth_date} />
					</div>
					<div className="">
						<label className="label justify-start label-text">{t('planSignup.medications')}</label>
						<input name="medications" type="text" className="input input-sm input-bordered w-full" />
						<InputError messages={validErrors.medications} />
					</div>
					<div className="sm:col-span-2">
						<label className="label justify-start label-text">{t('planSignup.notes')}</label>
						<input name="notes" type="text" className="input input-sm input-bordered w-full" />
						<InputError messages={validErrors.notes} />
					</div>
					<div className="">
						<label className="label justify-start label-text">{t('planSignup.emgContactRelation')}</label>
						<input name="emg_contact_relation" type="text" className="input input-bordered w-full" />
						<InputError messages={validErrors.emg_contact_relation} />
					</div>
					<div className="">
						<label className="label justify-start label-text">{t('planSignup.emgContactName')}</label>
						<input name="emg_contact_name" type="text" className="input input-bordered w-full" />
						<InputError messages={validErrors.emg_contact_name} />
					</div>
					<div className="sm:col-span-2">
						<label className="label justify-start label-text">{t('planSignup.emgContactMobileNumber')}</label>
						<PhoneInput name="emg_contact_mobilenumber" size="base" />
						<InputError messages={validErrors.emg_contact_mobilenumber} />
					</div>
					<div className="">
						<label className="label justify-start label-text">{t('planSignup.emgContactEmail')}</label>
						<input name="emg_contact_email" type="text" className="input input-bordered w-full" />
						<InputError messages={validErrors.emg_contact_email} />
					</div>
					<div className="">
						<label className="label justify-start label-text">{t('planSignup.emgContactAddress')}</label>
						<input name="emg_contact_address" type="text" className="input input-bordered w-full" />
						<InputError messages={validErrors.emg_contact_address} />
					</div>
					<div className="sm:col-span-2">
						<label className="label justify-start label-text">{t('planSignup.emgContactCity')}</label>
						<input name="emg_contact_city" type="text" className="input input-bordered w-full" />
						<InputError messages={validErrors.emg_contact_city} />
					</div>
					<div className="">
						<label className="label justify-start label-text">{t('planSignup.emgContactCountry')}</label>
						<input name="emg_contact_country" type="text" className="input input-bordered w-full" />
						<InputError messages={validErrors.emg_contact_country} />
					</div>
					<div className="">
						<label className="label justify-start label-text required">{t('planSignup.hasHealthConditions')}</label>
						<select name="has_health_conditions" data-rules="required" className="select select-sm select-bordered w-full" defaultValue={""} >
							<option value={""}>{t('chooseOption')}</option>
							<option value={"true"}>{t('yes')}</option>
							<option value={"false"}>{t('no')}</option>
						</select>
						<InputError messages={validErrors.has_health_conditions} />
					</div>
					<div className="sm:col-span-2">
						<label className="label justify-start label-text">{t('planSignup.healthConditions')}</label>
						<textarea name="health_conditions" className="textarea input-bordered w-full min-h-40" />
						<InputError messages={validErrors.health_conditions} />
					</div>
					<div className="sm:col-span-2">
						<label className="label justify-start cursor-pointer gap-2">
							<input type="checkbox" className="checkbox" checked={healthConsent} onChange={(e) => setHealthConsent(e.target.checked)} />
							<span className="label-text">{t('planSignup.healthConsentCheckbox')}</span>
						</label>
					</div>
					<div className="sm:col-span-2">
						<label className="label justify-start label-text">{t('planSignup.photo')}</label>
						<input name="photo_id" type="file" className="input input-bordered w-full" accept="image/*" />
						<InputError messages={validErrors.photo_id} />
					</div>
				</div>
			</div>

			<div ref={stepTwo} className={step === 2 ? "" : "hidden"}>
				<div className="text-xl text-primary text-bold mb-4 required">{t('planSignup.plansInfoTitle')}</div>
				<div className="grid grid-cols-4 gap-3">
					{plans?.map((plan: any, index: number) => {
					return <button key={index} type="button" className="border border-base-300 rounded-md shadow-sm p-2 hover:border-primary transition-colors" onClick={() => setPlanData(plan)}>
							<div className="w-full">
								<span className="font-bold">{plan.name}</span>								
								<div><span>{plan.duration_count} {t(plan.duration)}</span> / <span>{`$${plan.price}`}</span></div>
								{plan.entries_count &&
                                    <div>{plan.entries_count} {t('members.entry')}</div>
                                }
							</div>
						</button>
					})}
				</div>
				
				<hr className="mt-5"/>
				
				<div className="grid gap-2 grid-cols-1 sm:grid-cols-2 my-5">
					<div className="text-md font-bold">{t('planSignup.duration')}:</div>
					<div className="text-md">{planData.duration}</div>
					<div className="text-md font-bold">{t('planSignup.durationCount')}:</div>
					<div className="text-md">{planData.duration_count}</div>
					<div className="text-md font-bold">{t('planSignup.startupFee')}:</div>
					<div className="text-md">{planData.startup_fee}</div>
					<div className="text-md font-bold">{t('planSignup.price')}:</div>
					<div className="text-md">{planData.price}</div>
					<div className="text-md font-bold">{t('planSignup.cancellationFee')}:</div>
					<div className="text-md">{planData.cancellation_fee}</div>	
					<div className="sm:col-span-2">
						<label className="label justify-start label-text required">{t('planSignup.membershipStart')}</label>
						<input name="membership_start" data-rules="required" type="datetime-local" className="input input-bordered w-full" />
						<InputError messages={validErrors.membership_start} />
					</div>
                    <div className="sm:col-span-2">
                        <label className="label justify-start label-text">{t('members.contract')}</label>
                        <div
                            className="prose prose-sm max-w-none bg-base-200 rounded-xl p-4 h-48 overflow-y-auto"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(contract ?? '') }}
                        />
                    </div>
                    <div className="sm:col-span-2">
                        <label className="label justify-start cursor-pointer gap-2">
                            <input type="checkbox" className="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />
                            <span className="label-text required">{t('planSignup.acceptTermsCheckbox')}</span>
                        </label>
                        <InputError messages={validErrors.terms_accepted} />
                    </div>
                    <div className="sm:col-span-2">
                        <label className={`label justify-start label-text ${branchHasFeature('quick_signup_contract_upload') ? "required" : ""}`}>{t('members.signature')}</label>
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

			{step === 1 ?
				<div className="grid grid-cols-1 justify-items-end mt-5">
					<button className="btn btn-primary rounded-full w-fit" type="button" onClick={() => setStep(2)}>{t('planSignup.nextBtn')}</button>
				</div>
				: 
				<div className="flex justify-end mt-5 rtl:space-x-reverse space-x-3">
					<button className="btn btn-primary rounded-full w-fit" type="button" onClick={() => setStep(1)}>{t('planSignup.prevBtn')}</button>
					<button className="btn btn-primary rounded-full w-fit" type="submit" disabled={isSubmitting}>{isSubmitting && <span className="loading loading-spinner"></span>}{t('planSignup.finishBtn')}</button>
				</div>
			}
            
		</form>

        {confirmModal}
    </>
}