"use client"

import { useRouter } from "next/navigation"
import PhoneInput from "@/_components/phoneInput"
import { FormEvent, useEffect, useRef, useState} from "react"

import { addMember, addMemberPlan, getBranchPlans } from "@/app/(app)/members/_member"
import InputError from "@/_components/inputError"
import { branch, branch_settings, branchTermsAndConditions, responseMessage, store, validationErrors } from "@/_state/globalStore"
import { useAtom } from "jotai"
import { useTranslation } from "next-i18next"
import DOMPurify from "dompurify"
import SignaturePad from "@/_components/signaturePad"
import Header from "@/app/(app)/_components/header"
import { scrollToFirstInvalidElement, validateForm } from "@/app/_helpers/validation"

export default function MemberQuickAdd() {
    const { t } = useTranslation('common')
	const router = useRouter()
	const [ branchID ] = useAtom(branch)
	const [step, setStep] = useState<number>(1)
	const [plans, setplans] = useState<any>([])
	const [planData, setPlanData] = useState<any>({})
	const stepOne = useRef(null)
	const stepTwo = useRef(null)
	const [isSubmitting , setIsSubmitting] = useState(false)
	const [validErrors] = useAtom(validationErrors)
	const [memberID, setMemberID] = useState<number | null>(null)
	const [showPaymentMethod, setShowPaymentMethod] = useState<boolean>(false)
    const [branchTerms] = useAtom(branchTermsAndConditions)
	const [signature, setSignature] = useState<File>(null)
    const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null)
    const [branchSettings] = useAtom(branch_settings)
    const shouldSign = branchSettings?.includes("quick_signup_contract_upload")
    const [acceptanceChoice, setAcceptanceChoice] = useState<'' | 'present' | 'remote'>('')
    const [termsAccepted, setTermsAccepted] = useState(false)
    const [healthConsent, setHealthConsent] = useState(false)

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

	const formSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		if (!planData.id)
            return store.set(responseMessage, { type: 'alert', text: t('planSignup.planAlertMessage') });

		const form = event.currentTarget
        const paymentMethod = form.querySelector('[name="payment_method"]:checked') as HTMLFormElement
        const {errors, firstInvalidElement} = validateForm(form, t, {
            ...(showPaymentMethod && { payment_method: { value: paymentMethod?.value || '', rules: ['required'] } }),
            ...(shouldSign && acceptanceChoice !== 'remote' && { signature: { value: signature ? 'true' : '', rules: ['required'] }}),
            ...(acceptanceChoice === 'present' && { terms_accepted: { value: termsAccepted ? 'true' : '', rules: ['required'] } })
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

        const formData = new FormData(form)
        setIsSubmitting(true);
        let currentMemberID = memberID;
        formData.set('branch_id', `${branchID}`)
        formData.set('plan_id', `${planData.id}`)
        if (acceptanceChoice === 'present') {
            signature && formData.set('signature', signature)
            formData.set('acceptance_method', 'walk_in')
            formData.set('terms_accepted', '1')
            formData.set('health_consent', healthConsent ? '1' : '0')
        } else if (acceptanceChoice === 'remote') {
            formData.set('acceptance_method', 'remote_email')
            formData.set('send_consent_request', '1')
        } else {
            signature && formData.set('signature', signature)
        }

        try {
            if (!currentMemberID) {
                const returnData = await addMember(formData);
                currentMemberID = returnData.response.id;
                setMemberID(currentMemberID);
            }

            await addMemberPlan(formData, currentMemberID);
            router.push("/members");
            store.set(responseMessage, { type: "success", text: t("members.createdMessage") });
        } catch (err) {
            setIsSubmitting(false);
            if (!currentMemberID) {
                setStep(1);
            }
        }
	}

	return <form onSubmit={formSubmit}>
		<div ref={stepOne} className={`${step === 1 ? '' : 'hidden'}`}>
			<Header
				title={t('members.memberInfoTitle')}
				containerClass={"flex justify-between"}
			/>
			
			<div className="mt-6 space-y-6">
				{/* Personal Information */}
				<div className="card bg-base-100 border border-base-200 shadow-sm">
					<div className="card-body">
						<h2 className="card-title text-xl mb-4">
							<div className="w-1 h-6 bg-primary rounded me-2"></div>
							{t('members.personalInfo')}
						</h2>
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
							<div>
								<label className="label justify-start">
									<span className="label-text font-semibold required">{t('members.fname')}</span>
								</label>
								<input name="fname" data-rules="required" type="text" className="input input-bordered input-sm w-full" />
								<InputError messages={validErrors.fname} />
							</div>
							<div>
								<label className="label justify-start">
									<span className="label-text font-semibold required">{t('members.sname')}</span>
								</label>
								<input name="sname" data-rules="required" type="text" className="input input-bordered input-sm w-full" />
								<InputError messages={validErrors.sname} />
							</div>
							<div>
								<label className="label justify-start">
									<span className="label-text font-semibold required">{t('members.gender')}</span>
								</label>
								<select name="gender" data-rules="required" className="select select-sm select-bordered w-full" defaultValue={""}>
									<option value={""} disabled>{t('chooseOption')}</option>
									<option value={"M"}>{t('male')}</option>
									<option value={"F"}>{t('female')}</option>
									<option value={"O"}>{t('other')}</option>
								</select>
								<InputError messages={validErrors.gender} />
							</div>
							<div>
								<label className="label justify-start">
									<span className="label-text font-semibold required">{t('members.birthDate')}</span>
								</label>
								<input name="birth_date" data-rules="required" type="date" className="input input-bordered input-sm w-full" />
								<InputError messages={validErrors.birth_date} />
							</div>
							<div className="lg:col-span-2">
								<label className="label justify-start">
									<span className="label-text font-semibold required">{t('members.email')}</span>
								</label>
								<input 
									name="email"
                                    data-rules="required|email" 
									type="text" 
									className="input input-bordered input-sm w-full"
								/>
								<InputError messages={validErrors.email} />
							</div>
						</div>
					</div>
				</div>

				{/* Contact Information */}
				<div className="card bg-base-100 border border-base-200 shadow-sm">
					<div className="card-body">
						<h2 className="card-title text-xl mb-4">
							<div className="w-1 h-6 bg-primary rounded me-2"></div>
							{t('members.contactInfo')}
						</h2>
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
							<div>
								<label className="label justify-start">
									<span className="label-text font-semibold required">{t('members.mobilePhone')}</span>
								</label>
								<PhoneInput name="mobile_phone" rules="required" size="sm" />
								<InputError messages={validErrors.mobile_phone} />
							</div>
							<div>
								<label className="label justify-start">
									<span className="label-text font-semibold">{t('members.homePhone')}</span>
								</label>
								<PhoneInput name="home_phone" size="sm" />
								<InputError messages={validErrors.home_phone} />
							</div>
							<div className="lg:col-span-2">
								<label className="label justify-start">
									<span className="label-text font-semibold">{t('members.address')}</span>
								</label>
								<input name="address" type="text" className="input input-bordered input-sm w-full" />
								<InputError messages={validErrors.address} />
							</div>
							<div>
								<label className="label justify-start">
									<span className="label-text font-semibold">{t('members.city')}</span>
								</label>
								<input name="city" type="text" className="input input-bordered input-sm w-full" />
								<InputError messages={validErrors.city} />
							</div>
							<div>
								<label className="label justify-start">
									<span className="label-text font-semibold">{t('members.country')}</span>
								</label>
								<input name="country" type="text" className="input input-bordered input-sm w-full" />
								<InputError messages={validErrors.country} />
							</div>
						</div>
					</div>
				</div>

				{/* Emergency Contact */}
				<div className="card bg-base-100 border border-base-200 shadow-sm">
					<div className="card-body">
						<h2 className="card-title text-xl mb-4">
							<div className="w-1 h-6 bg-primary rounded me-2"></div>
							{t('members.emergencyContact')}
						</h2>
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
							<div>
								<label className="label justify-start">
									<span className="label-text font-semibold">{t('members.emgContactName')}</span>
								</label>
								<input name="emg_contact_name" type="text" className="input input-bordered input-sm w-full" />
								<InputError messages={validErrors.emg_contact_name} />
							</div>
							<div>
								<label className="label justify-start">
									<span className="label-text font-semibold">{t('members.emgContactRelation')}</span>
								</label>
								<input name="emg_contact_relation" type="text" className="input input-bordered input-sm w-full" />
								<InputError messages={validErrors.emg_contact_relation} />
							</div>
							<div className="lg:col-span-2">
								<label className="label justify-start">
									<span className="label-text font-semibold">{t('members.emgContactMobileNumber')}</span>
								</label>
								<PhoneInput name="emg_contact_mobilenumber" size="sm" />
								<InputError messages={validErrors.emg_contact_mobilenumber} />
							</div>
							<div>
								<label className="label justify-start">
									<span className="label-text font-semibold">{t('members.emgContactEmail')}</span>
								</label>
								<input name="emg_contact_email" type="text" className="input input-bordered input-sm w-full" />
								<InputError messages={validErrors.emg_contact_email} />
							</div>
							<div>
								<label className="label justify-start">
									<span className="label-text font-semibold">{t('members.emgContactAddress')}</span>
								</label>
								<input name="emg_contact_address" type="text" className="input input-bordered input-sm w-full" />
								<InputError messages={validErrors.emg_contact_address} />
							</div>
							<div>
								<label className="label justify-start">
									<span className="label-text font-semibold">{t('members.emgContactCity')}</span>
								</label>
								<input name="emg_contact_city" type="text" className="input input-bordered input-sm w-full" />
								<InputError messages={validErrors.emg_contact_city} />
							</div>
							<div>
								<label className="label justify-start">
									<span className="label-text font-semibold">{t('members.emgContactCountry')}</span>
								</label>
								<input name="emg_contact_country" type="text" className="input input-bordered input-sm w-full" />
								<InputError messages={validErrors.emg_contact_country} />
							</div>
						</div>
					</div>
				</div>

				{/* Health & Additional Info */}
				<div className="card bg-base-100 border border-base-200 shadow-sm">
					<div className="card-body">
						<h2 className="card-title text-xl mb-4">
							<div className="w-1 h-6 bg-primary rounded me-2"></div>
							{t('members.healthInfo')}
						</h2>
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
							<div>
								<label className="label justify-start">
									<span className="label-text font-semibold required">{t('members.hasHealthConditions')}</span>
								</label>
								<select name="has_health_conditions" data-rules="required" className="select select-sm select-bordered w-full" defaultValue={""}>
									<option value={""}>{t('chooseOption')}</option>
									<option value={"true"}>{t('yes')}</option>
									<option value={"false"}>{t('no')}</option>
								</select>
								<InputError messages={validErrors.has_health_conditions} />
							</div>
							<div>
								<label className="label justify-start">
									<span className="label-text font-semibold">{t('members.medications')}</span>
								</label>
								<input name="medications" type="text" className="input input-bordered input-sm w-full" />
								<InputError messages={validErrors.medications} />
							</div>
							<div className="lg:col-span-2">
								<label className="label justify-start">
									<span className="label-text font-semibold">{t('members.healthConditions')}</span>
								</label>
								<textarea name="health_conditions" className="textarea textarea-bordered w-full min-h-32" />
								<InputError messages={validErrors.health_conditions} />
							</div>
							<div>
								<label className="label justify-start">
									<span className="label-text font-semibold required">{t('members.blockBooking')}</span>
								</label>
								<select name="block_booking" data-rules="required" className="select select-sm select-bordered w-full" defaultValue={""}>
									<option value={""}>{t('chooseOption')}</option>
									<option value={"true"}>{t('yes')}</option>
									<option value={"false"}>{t('no')}</option>
								</select>
								<InputError messages={validErrors.block_booking} />
							</div>
							<div>
								<label className="label justify-start">
									<span className="label-text font-semibold required">{t('members.status')}</span>
								</label>
								<select name="status" data-rules="required" className="select select-sm select-bordered w-full" defaultValue={""}>
									<option value={""} disabled>{t('chooseOption')}</option>
									<option value={0}>{t('members.operational')}</option>
									<option value={1}>{t('members.suspended')}</option>
									<option value={2}>{t('members.blacklist')}</option>
								</select>
								<InputError messages={validErrors.status} />
							</div>
							<div className="lg:col-span-2">
								<label className="label justify-start">
									<span className="label-text font-semibold">{t('members.notes')}</span>
								</label>
								<input name="notes" type="text" className="input input-bordered input-sm w-full" />
								<InputError messages={validErrors.notes} />
							</div>
							<div className="lg:col-span-2">
								<label className="label justify-start">
									<span className="label-text font-semibold">{t('members.photo')}</span>
								</label>
								<input name="photo_id" type="file" className="file-input file-input-bordered input-sm w-full" accept="image/*" />
								<InputError messages={validErrors.photo_id} />
							</div>
						</div>
					</div>
				</div>

				<div className="card-actions justify-end">
					<button className="btn btn-primary" type="button" onClick={() => setStep(2)}>
						{t('members.nextBtn')}
					</button>
				</div>
			</div>
		</div>

		<div ref={stepTwo} className={`${step === 2 ? '' : 'hidden'}`}>
			<Header
				title={t('members.plansInfoTitle')}
				containerClass={"flex justify-between"}
			/>

			<div className="mt-6 space-y-6">
				{/* Plan Selection */}
				<div className="card bg-base-100 border border-base-200 shadow-sm">
					<div className="card-body">
						<h2 className="card-title text-xl mb-4">
							<div className="w-1 h-6 bg-primary rounded me-2"></div>
							{t('members.selectPlan')}
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{plans?.map((plan: any, index: number) => (
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
											<p className="text-sm">{plan.entries_count} {t('members.entry')}</p>
										)}
									</div>
								</button>
							))}
						</div>
					</div>
				</div>

				{/* Plan Configuration */}
				{planData.id && (
					<div className="card bg-base-100 border border-base-200 shadow-sm">
						<div className="card-body">
							<h2 className="card-title text-xl mb-4">
								<div className="w-1 h-6 bg-primary rounded me-2"></div>
								{t('members.planConfiguration')}
							</h2>
							
							<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
								<div>
									<label className="label justify-start">
										<span className="label-text font-semibold required">{t('members.duration')}</span>
									</label>
									<select key={planData.id} name="duration" data-rules="required" className="select select-sm select-bordered w-full" defaultValue={planData.duration || ""}>
										<option value={""} disabled>{t('chooseOption')}</option>
										<option value={"days"}>{t('days')}</option>
										<option value={"weeks"}>{t('weeks')}</option>
										<option value={"months"}>{t('months')}</option>
										<option value={"years"}>{t('years')}</option>
									</select>
									<InputError messages={validErrors.duration} />
								</div>
								<div>
									<label className="label justify-start">
										<span className="label-text font-semibold required">{t('members.durationCount')}</span>
									</label>
									<input key={planData.id} name="duration_count" data-rules="required" type="number" className="input input-bordered input-sm w-full" defaultValue={planData.duration_count}/>
									<InputError messages={validErrors.duration_count} />
								</div>
								<div>
									<label className="label justify-start">
										<span className="label-text font-semibold required">{t('members.price')}</span>
									</label>
									<input key={planData.id} name="price" data-rules="required" type="number" className="input input-bordered input-sm w-full" defaultValue={planData.price}/>
									<InputError messages={validErrors.price} />
								</div>
								<div>
									<label className="label justify-start">
										<span className="label-text font-semibold required">{t('members.startupFee')}</span>
									</label>
									<input key={planData.id} name="startup_fee" data-rules="required" type="number" className="input input-bordered input-sm w-full" defaultValue={planData.startup_fee}/>
									<InputError messages={validErrors.startup_fee} />
								</div>
								<div>
									<label className="label justify-start">
										<span className="label-text font-semibold required">{t('members.taxPercentage')}</span>
									</label>
									<input key={planData.id} name="tax_percentage" data-rules="required" type="number" className="input input-bordered input-sm w-full" defaultValue={planData.tax_percentage}/>
									<InputError messages={validErrors.tax_percentage} />
								</div>
								<div>
									<label className="label justify-start">
										<span className="label-text font-semibold">{t('members.trial')}</span>
									</label>
									<select key={planData.id} name="trial" className="select select-sm select-bordered w-full" defaultValue={planData.trial?.toString() || ""}>
										<option value={""}>{t('chooseOption')}</option>
										<option value={"true"}>{t('yes')}</option>
										<option value={"false"}>{t('no')}</option>
									</select>
									<InputError messages={validErrors.trial} />
								</div>
								<div>
									<label className="label justify-start">
										<span className="label-text font-semibold required">{t('members.membershipStart')}</span>
									</label>
									<input name="start_date" data-rules="required" type="datetime-local" className="input input-bordered input-sm w-full" />
									<InputError messages={validErrors.start_date} />
								</div>
								<div>
									<label className="label justify-start">
										<span className="label-text font-semibold required">{t('members.billAt')}</span>
									</label>
									<input name="bill_at" data-rules="required" type="date" className="input input-bordered input-sm w-full" onChange={(e) => setShowPaymentMethod(e.target.value === new Date().toISOString().slice(0, 10))} />
									<InputError messages={validErrors.bill_at} />
								</div>
								{showPaymentMethod && (
									<div className="lg:col-span-2">
										<label className="label justify-start">
											<span className="label-text font-semibold required">{t('members.paymentMethod')}</span>
										</label>
										<div className="flex gap-6 p-4 bg-base-200 rounded-lg">
											<label className="label justify-start cursor-pointer">
												<input name="payment_method" type="radio" className="radio" value="cash" />
												<span className="mx-2 label-text font-semibold">{t('cash')}</span> 
											</label>
											<label className="label justify-start cursor-pointer">
												<input name="payment_method" type="radio" className="radio" value="visa" />
												<span className="mx-2 label-text font-semibold">{t('visa')}</span> 
											</label>
										</div>
										<InputError messages={validErrors.payment_method} />
									</div>
								)}
								<div className="lg:col-span-2">
									<label className="label justify-start label-text">{t('members.acceptanceMethodLabel')}</label>
									<div className="flex flex-col gap-2 p-3 bg-base-200 rounded-lg">
										<label className="label justify-start cursor-pointer gap-2">
											<input type="radio" className="radio radio-sm" checked={acceptanceChoice === 'present'} onChange={() => setAcceptanceChoice('present')} />
											<span className="label-text">{t('members.acceptancePresentOption')}</span>
										</label>
										<label className="label justify-start cursor-pointer gap-2">
											<input type="radio" className="radio radio-sm" checked={acceptanceChoice === 'remote'} onChange={() => setAcceptanceChoice('remote')} />
											<span className="label-text">{t('members.acceptanceRemoteOption')}</span>
										</label>
									</div>
								</div>

								{acceptanceChoice === 'remote' ? (
									<div className="sm:col-span-2 alert alert-info">
										<span>{t('members.acceptanceRemoteInfo')}</span>
									</div>
								) : (<>
									<div className="sm:col-span-2">
										<label className="label justify-start label-text">{t('members.contract')}</label>
										<div
											className="prose prose-sm max-w-none bg-base-200 rounded-xl p-4 h-48 overflow-y-auto"
											dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(contract) }}
										/>
									</div>
									{acceptanceChoice === 'present' && (
										<div className="sm:col-span-2">
											<label className="label justify-start cursor-pointer gap-2">
												<input type="checkbox" className="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />
												<span className="label-text required">{t('members.acceptanceTermsCheckbox')}</span>
											</label>
											<InputError messages={validErrors.terms_accepted} />
											<label className="label justify-start cursor-pointer gap-2 mt-1">
												<input type="checkbox" className="checkbox" checked={healthConsent} onChange={(e) => setHealthConsent(e.target.checked)} />
												<span className="label-text">{t('members.acceptanceHealthConsentCheckbox')}</span>
											</label>
										</div>
									)}
									<div>
										<label className={`label justify-start label-text ${shouldSign ? "required" : ""}`}>{t('members.signature')}</label>
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
								</>)}
							</div>

							{/* Fees Section */}
							<div className="divider my-6"></div>
							<h3 className="text-lg font-semibold mb-4">{t('members.fees')}</h3>
							<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
								<div>
									<label className="label justify-start">
										<span className="label-text font-semibold required">{t('members.cancellationFee')}</span>
									</label>
									<input key={planData.id} name="cancellation_fee" data-rules="required" type="number" className="input input-bordered input-sm w-full" defaultValue={planData.cancellation_fee}/>
									<InputError messages={validErrors.cancellation_fee} />
								</div>
								<div>
									<label className="label justify-start">
										<span className="label-text font-semibold required">{t('members.initialPauseFee')}</span>
									</label>
									<input key={planData.id} name="initial_pause_fee" data-rules="required" type="number" className="input input-bordered input-sm w-full" defaultValue={planData.initial_pause_fee}/>
									<InputError messages={validErrors.initial_pause_fee} />
								</div>
								<div>
									<label className="label justify-start">
										<span className="label-text font-semibold required">{t('members.recurringPauseFee')}</span>
									</label>
									<input key={planData.id} name="recurring_pause_fee" data-rules="required" type="number" className="input input-bordered input-sm w-full" defaultValue={planData.recurring_pause_fee}/>
									<InputError messages={validErrors.recurring_pause_fee} />
								</div>
							</div>
						</div>
					</div>
				)}

				<div className="card-actions justify-end gap-4">
					<button className="btn btn-sm btn-outline" type="button" disabled={memberID !== null} onClick={() => setStep(1)}>
						{t('members.prevBtn')}
					</button>
					<button className="btn btn-primary" type="submit" disabled={isSubmitting}>
						{isSubmitting && <span className="loading loading-spinner"></span>}
						{t('members.finishBtn')}
					</button>
				</div>
			</div>
		</div>
	</form>
}