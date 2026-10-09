"use client"

import { useRouter } from "next/navigation"
import PhoneInput from "@/_components/phoneInput"
import { useBreadcrumbLabel } from "@/hooks/useBreadcrumbLabel"
import { FormEvent, useEffect, useState } from "react"

import { approveApplication, getApplication } from "@/app/(app)/applications/_application"
import { useAtom } from "jotai"
import { branch, branch_settings, loading, responseMessage, store, validationErrors } from "@/_state/globalStore"
import InputError from "@/_components/inputError"
import { useTranslation } from "next-i18next"
import Header from "@/app/(app)/_components/header"
import { scrollToFirstInvalidElement, validateForm } from "@/app/_helpers/validation"

export default function ApplicationEdit({ params }: any) {
    const { t } = useTranslation('common')
	const router = useRouter()
	const { application_id }: any = params
	const [data, setData] = useState<any>([])
	useBreadcrumbLabel(data)
	const [email, setEmail] = useState("")
	const [isSubmitting , setIsSubmitting] = useState(false)
	const [validErrors] = useAtom(validationErrors)
	const [ branchID ] = useAtom(branch)
	const [showPaymentMethod, setShowPaymentMethod] = useState<boolean>(false)
    const [branchSettings] = useAtom(branch_settings)

	useEffect(() => {
		getApplication(application_id).then((returnData: any) => {
			setData(returnData.response)
			setEmail(returnData.response.email)
		})
	}, [])

	const formSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const form = event.currentTarget
        const paymentMethod = form.querySelector('[name="payment_method"]:checked') as HTMLFormElement
        const {errors, firstInvalidElement} = validateForm(form, t, {
            ...(showPaymentMethod && { payment_method: { value: paymentMethod?.value || '', rules: ['required'] } })
        })
        if (Object.keys(errors).length > 0) {
            store.set(validationErrors, errors)
            if (firstInvalidElement) scrollToFirstInvalidElement(firstInvalidElement)
            return
        }

        const formData = new FormData(form)
        formData.set('branch_id', `${branchID}`)
        setIsSubmitting(true)
        await approveApplication(application_id, formData).then((returnData) => {
            router.push('/applications')
            store.set(responseMessage, { type: 'success', text: t('applications.approvedMessage') });
        })
        .catch(() => setIsSubmitting(false))
	}

	return <form onSubmit={formSubmit}>
		<Header
			title={t('applications.editTitle')}
			containerClass={"flex justify-between"}
		/>
		<div className="mt-6 space-y-6">
			{/* Member Information Section */}
			<div className="card bg-base-100 border border-base-200 shadow-sm">
				<div className="card-body">
					<h2 className="card-title text-xl mb-4">
						<div className="w-1 h-6 bg-primary rounded me-2"></div>
						{t('applications.memberInfo')}
					</h2>
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('applications.fname')}</span>
							</label>
							<input name="fname" data-rules="required" type="text" className="input input-bordered input-sm w-full" defaultValue={data.fname}/>
							<InputError messages={validErrors.fname} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('applications.sname')}</span>
							</label>
							<input name="sname" data-rules="required" type="text" className="input input-bordered input-sm w-full" defaultValue={data.sname}/>
							<InputError messages={validErrors.sname} />
						</div>
						<div className="lg:col-span-2">
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('applications.gender')}</span>
							</label>
							<select name="gender" data-rules="required" className="select select-sm select-bordered w-full" defaultValue={data.gender}>
								<option value={""} disabled>{t('chooseOption')}</option>
								<option value={"M"} selected={data.gender === "M"}>{t('male')}</option>
								<option value={"F"} selected={data.gender === "F"}>{t('female')}</option>
								<option value={"O"} selected={data.gender === "O"}>{t('other')}</option>
							</select>
							<InputError messages={validErrors.gender} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('applications.mobilePhone')}</span>
							</label>
							<PhoneInput name="mobile_phone" rules="required" size="sm" defaultValue={data.mobile_phone} />
							<InputError messages={validErrors.mobile_phone} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('applications.homePhone')}</span>
							</label>
							<PhoneInput name="home_phone" size="sm" defaultValue={data.home_phone} />
							<InputError messages={validErrors.home_phone} />
						</div>
						<div className="lg:col-span-2">
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('applications.address')}</span>
							</label>
							<input name="address" type="text" className="input input-bordered input-sm w-full" defaultValue={data.address}/>
							<InputError messages={validErrors.address} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('applications.city')}</span>
							</label>
							<input name="city" type="text" className="input input-bordered input-sm w-full" defaultValue={data.city}/>
							<InputError messages={validErrors.city} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('applications.country')}</span>
							</label>
							<input name="country" type="text" className="input input-bordered input-sm w-full" defaultValue={data.country}/>
							<InputError messages={validErrors.country} />
						</div>
						<div className="lg:col-span-2">
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('applications.email')}</span>
							</label>
							<input
								name="email" 
                                data-rules="required|email"
								type="text"
								className={"input input-bordered input-sm w-full" + (validErrors.email ? " input-error" : "")}
								value={email}
								defaultValue={data.email}
								onChange={(e) => setEmail(e.target.value)}
							/>
							<InputError messages={validErrors.email} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('applications.birthDate')}</span>
							</label>
							<input name="birth_date" data-rules="required" type="date" className="input input-bordered input-sm w-full" defaultValue={data.birth_date}/>
							<InputError messages={validErrors.birth_date} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('applications.medications')}</span>
							</label>
							<input name="medications" type="text" className="input input-bordered input-sm w-full" defaultValue={data.medications}/>
							<InputError messages={validErrors.medications} />
						</div>
						<div className="lg:col-span-2">
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('applications.notes')}</span>
							</label>
							<input name="notes" type="text" className="input input-bordered input-sm w-full" defaultValue={data.notes}/>
							<InputError messages={validErrors.notes} />
						</div>
						
						{/* Emergency Contact Section */}
						<div className="lg:col-span-2 border-t pt-4 mt-4">
							<h3 className="text-lg font-semibold text-base-content/70 mb-4">{t('applications.emergencyContact')}</h3>
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('applications.emgContactRelation')}</span>
							</label>
							<input name="emg_contact_relation" type="text" className="input input-bordered input-sm w-full" defaultValue={data.emg_contact_relation}/>
							<InputError messages={validErrors.emg_contact_relation} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('applications.emgContactName')}</span>
							</label>
							<input name="emg_contact_name" type="text" className="input input-bordered input-sm w-full" defaultValue={data.emg_contact_name}/>
							<InputError messages={validErrors.emg_contact_name} />
						</div>
						<div className="lg:col-span-2">
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('applications.emgContactMobileNumber')}</span>
							</label>
							<PhoneInput name="emg_contact_mobilenumber" size="sm" defaultValue={data.emg_contact_mobilenumber} />
							<InputError messages={validErrors.emg_contact_mobilenumber} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('applications.emgContactEmail')}</span>
							</label>
							<input name="emg_contact_email" type="text" className="input input-bordered input-sm w-full" defaultValue={data.emg_contact_email}/>
							<InputError messages={validErrors.emg_contact_email} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('applications.emgContactAddress')}</span>
							</label>
							<input name="emg_contact_address" type="text" className="input input-bordered input-sm w-full" defaultValue={data.emg_contact_address}/>
							<InputError messages={validErrors.emg_contact_address} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('applications.emgContactCity')}</span>
							</label>
							<input name="emg_contact_city" type="text" className="input input-bordered input-sm w-full" defaultValue={data.emg_contact_city}/>
							<InputError messages={validErrors.emg_contact_city} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('applications.emgContactCountry')}</span>
							</label>
							<input name="emg_contact_country" type="text" className="input input-bordered input-sm w-full" defaultValue={data.emg_contact_country}/>
							<InputError messages={validErrors.emg_contact_country} />
						</div>
						
						{/* Health Information */}
						<div className="lg:col-span-2 border-t pt-4 mt-4">
							<h3 className="text-lg font-semibold text-base-content/70 mb-4">{t('applications.healthInfo')}</h3>
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('applications.hasHealthConditions')}</span>
							</label>
							<select name="has_health_conditions" data-rules="required" className="select select-sm select-bordered w-full" defaultValue={data.has_health_conditions}>
								<option value={""}>{t('chooseOption')}</option>
								<option value={"true"} selected={data.has_health_conditions == true}>{t('yes')}</option>
								<option value={"false"} selected={data.has_health_conditions == false}>{t('no')}</option>
							</select>
							<InputError messages={validErrors.has_health_conditions} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('applications.photo')}</span>
							</label>
							<input name="photo_id" type="file" className="file-input file-input-bordered input-sm w-full" accept="image/*" />
							<InputError messages={validErrors.photo_id} />
						</div>
						<div className="lg:col-span-2">
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('applications.healthConditions')}</span>
							</label>
							<textarea name="health_conditions" className="textarea textarea-bordered w-full min-h-32" defaultValue={data.health_conditions}/>
							<InputError messages={validErrors.health_conditions} />
						</div>
					</div>
				</div>
			</div>

			{/* Plan Information Section */}
			<div className="card bg-base-100 border border-base-200 shadow-sm">
				<div className="card-body">
					<h2 className="card-title text-xl mb-4">
						<div className="w-1 h-6 bg-primary rounded me-2"></div>
						{t('applications.planInfo')}
					</h2>
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('applications.duration')}</span>
							</label>
							<select name="duration" data-rules="required" className="select select-sm select-bordered w-full" defaultValue={data.duration}>
								<option value={""} disabled>{t('chooseOption')}</option>
								<option value={"days"} selected={data.duration === "days"}>{t('days')}</option>
								<option value={"weeks"} selected={data.duration === "weeks"}>{t('weeks')}</option>
								<option value={"months"} selected={data.duration === "months"}>{t('months')}</option>
								<option value={"years"} selected={data.duration === "years"}>{t('years')}</option>
							</select>
							<InputError messages={validErrors.duration} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('applications.durationCount')}</span>
							</label>
							<input name="duration_count" data-rules="required" type="number" className="input input-bordered input-sm w-full" defaultValue={data.duration_count} />
							<InputError messages={validErrors.duration_count} />
						</div>
						<div className="lg:col-span-2">
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('applications.startupFee')}</span>
							</label>
							<input name="startup_fee" data-rules="required" type="number" className="input input-bordered input-sm w-full" defaultValue={data.startup_fee} />
							<InputError messages={validErrors.startup_fee} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('applications.price')}</span>
							</label>
							<input name="price" data-rules="required" type="number" className="input input-bordered input-sm w-full" defaultValue={data.price} />
							<InputError messages={validErrors.price} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('applications.cancellationFee')}</span>
							</label>
							<input name="cancellation_fee" data-rules="required" type="number" className="input input-bordered input-sm w-full" defaultValue={data.cancellation_fee} />
							<InputError messages={validErrors.cancellation_fee} />
						</div>
						<div className="lg:col-span-2">
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('applications.initialPauseFee')}</span>
							</label>
							<input name="initial_pause_fee" data-rules="required" type="number" className="input input-bordered input-sm w-full" defaultValue={data.initial_pause_fee} />
							<InputError messages={validErrors.initial_pause_fee} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('applications.recurringPauseFee')}</span>
							</label>
							<input name="recurring_pause_fee" data-rules="required" type="number" className="input input-bordered input-sm w-full" defaultValue={data.recurring_pause_fee} />
							<InputError messages={validErrors.recurring_pause_fee} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('applications.taxPercentage')}</span>
							</label>
							<input name="tax_percentage" data-rules="required" type="number" className="input input-bordered input-sm w-full" defaultValue={data.tax_percentage} />
							<InputError messages={validErrors.tax_percentage} />
						</div>
						<div className="lg:col-span-2">
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('applications.trial')}</span>
							</label>
							<select name="trial" data-rules="required" className="select select-sm select-bordered w-full" defaultValue={data.trial}>
								<option value={""} disabled>{t('chooseOption')}</option>
								<option value={"true"} selected={data.trial == true}>{t('yes')}</option>
								<option value={"false"} selected={data.trial == false}>{t('no')}</option>
							</select>
							<InputError messages={validErrors.trial} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('applications.membershipStart')}</span>
							</label>
							<input name="start_date" data-rules="required" type="datetime-local" className="input input-bordered input-sm w-full" defaultValue={data.membership_start?.replace(' ', 'T').slice(0, 16)} />
							<InputError messages={validErrors.start_date} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('applications.billAt')}</span>
							</label>
							<input name="bill_at" data-rules="required" type="date" className="input input-bordered input-sm w-full" defaultValue={""} onChange={(e) => setShowPaymentMethod(e.target.value === new Date().toISOString().slice(0, 10))} />
							<InputError messages={validErrors.bill_at} />
						</div>
						{showPaymentMethod && (
							<div className="lg:col-span-2">
								<div className="flex gap-6 p-4 bg-base-200 rounded-lg">
									<label className="label justify-start cursor-pointer">
										<input name="payment_method" type="radio" className="radio" value="cash" />
										<span className="mx-2 label-text font-semibold">{t('cash')}</span> 
									</label>
									<label className="label justify-start cursor-pointer">
										<input name="payment_method" type="radio" className="radio" value="visa" />
										<span className="mx-2 label-text font-semibold">{t('visa')}</span>
									</label>

                                    {/* Member pays online themselves — membership stays pending until paid. */}
                                    {branchSettings?.includes("online_payments") &&
                                    <label className="label justify-start cursor-pointer">
										<input name="payment_method" type="radio" className="radio" value="pay-online" />
										<span className="mx-2 label-text font-semibold">{t('applications.payOnline')}</span>
									</label>
                                    }

                                    {data.default_payment_method && branchSettings?.includes("online_payments") &&
                                    <label className="label justify-start cursor-pointer">
										<input name="payment_method" type="radio" className="radio" value="default_card" />
										<span className="mx-2 label-text font-semibold">default card</span> 
									</label>
                                    }
								</div>
								<InputError messages={validErrors.payment_method} />
							</div>
						)}
					</div>
				</div>
			</div>

			<div className="card-actions justify-end">
				<button type="button" onClick={() => router.back()} className="btn btn-ghost me-2">{t('cancel')}</button>
						<button className="btn btn-primary" type="submit" disabled={isSubmitting}>
					{isSubmitting && <span className="loading loading-spinner"></span>}
					{t('applications.editFormBtn')}
				</button>
			</div>
		</div>
	</form>
}