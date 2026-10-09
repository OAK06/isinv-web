"use client"

import { useRouter } from "next/navigation"
import PhoneInput from "@/_components/phoneInput"
import { FormEvent, useState} from "react"

import { addMember } from "@/app/(app)/members/_member"
import InputError from "@/_components/inputError"
import { branch, responseMessage, store, validationErrors } from "@/_state/globalStore"
import { useAtom } from "jotai"
import { useTranslation } from "next-i18next"
import Header from "@/app/(app)/_components/header"
import { scrollToFirstInvalidElement, validateForm } from "@/app/_helpers/validation"
import { useEmailConflictGuard } from "@/_components/useEmailConflictGuard"

export default function MemberAdd() {
    const { t } = useTranslation('common')
	const router = useRouter()
	const [ branchID ] = useAtom(branch)
	const [isSubmitting , setIsSubmitting] = useState(false)
	const [validErrors] = useAtom(validationErrors)
	const { guard, emailConflictModal } = useEmailConflictGuard()

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
        // Email already has an account? Confirm linking the member to it.
        if (!(await guard(String(formData.get('email') ?? ''), 'link', true))) return
        setIsSubmitting(true)

        await addMember(formData).then(() => {
            router.push('/members')
            store.set(responseMessage, { type: 'success', text: t('members.createdMessage') });
        })
        .catch(() => setIsSubmitting(false))
	}

	return <>
		{emailConflictModal}
		<Header
			title={t('members.addTitleAdvanced')}
			containerClass={"flex justify-between"}
		/>
		<div className="mt-6 card bg-base-100 border border-base-200 shadow-sm">
			<div className="card-body">	
				<form onSubmit={formSubmit}>
					<input name="branch_id" type="hidden" value={branchID} />
					
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
						<div>
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
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('members.birthDate')}</span>
							</label>
							<input name="birth_date" data-rules="required" type="date" className="input input-bordered input-sm w-full" />
							<InputError messages={validErrors.birth_date} />
						</div>
						<div>
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
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('members.medications')}</span>
							</label>
							<input name="medications" type="text" className="input input-bordered input-sm w-full" />
							<InputError messages={validErrors.medications} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('members.notes')}</span>
							</label>
							<input name="notes" type="text" className="input input-bordered input-sm w-full" />
							<InputError messages={validErrors.notes} />
						</div>
						
						<div className="lg:col-span-2 mt-4">
							<h3 className="text-lg font-semibold mb-4">{t('members.emergencyContact')}</h3>
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('members.emgContactRelation')}</span>
							</label>
							<input name="emg_contact_relation" type="text" className="input input-bordered input-sm w-full" />
							<InputError messages={validErrors.emg_contact_relation} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('members.emgContactName')}</span>
							</label>
							<input name="emg_contact_name" type="text" className="input input-bordered input-sm w-full" />
							<InputError messages={validErrors.emg_contact_name} />
						</div>
						<div>
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
						<div className="lg:col-span-2">
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
						
						<div className="lg:col-span-2 mt-4">
							<h3 className="text-lg font-semibold mb-4">{t('members.additionalInfo')}</h3>
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
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('members.photo')}</span>
							</label>
							<input name="photo_id" type="file" className="file-input file-input-bordered input-sm w-full" accept="image/*" />
							<InputError messages={validErrors.photo_id} />
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
								<span className="label-text font-semibold required">{t('members.hasHealthConditions')}</span>
							</label>
							<select name="has_health_conditions" data-rules="required" className="select select-sm select-bordered w-full" defaultValue={""}>
								<option value={""}>{t('chooseOption')}</option>
								<option value={"true"}>{t('yes')}</option>
								<option value={"false"}>{t('no')}</option>
							</select>
							<InputError messages={validErrors.has_health_conditions} />
						</div>
						<div className="lg:col-span-2">
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('members.healthConditions')}</span>
							</label>
							<textarea name="health_conditions" className="textarea textarea-bordered w-full min-h-32" />
							<InputError messages={validErrors.health_conditions} />
						</div>
						{/* GDPR Art. 9 explicit-consent capture for optional health data (see privacy §3). */}
						<div className="lg:col-span-2">
							<label className="label cursor-pointer justify-start items-start gap-3">
								<input name="health_consent" value="1" type="checkbox" className="checkbox checkbox-sm checkbox-primary mt-1" />
								<span className="label-text text-base-content/70">
									<span className="font-semibold text-base-content">{t('members.healthConsentLabel')}</span>
									<br />
									{t('members.healthConsentHint')}
								</span>
							</label>
							<InputError messages={validErrors.health_consent} />
						</div>
					</div>
					
					<div className="card-actions justify-end mt-6">
						<button className="btn btn-primary" type="submit" disabled={isSubmitting}>
							{isSubmitting && <span className="loading loading-spinner"></span>}
							{t('members.addFormBtn')}
						</button>
					</div>
				</form>
			</div>
		</div>
	</>
}