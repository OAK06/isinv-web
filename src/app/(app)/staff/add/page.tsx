"use client"

import { FormEvent, useEffect, useState } from "react"
import PhoneInput from "@/_components/phoneInput"
import { useRouter } from "next/navigation"

import { addStaff, getBranchPosRegisters, getBranchRoles } from "@/app/(app)/staff/_staff"
import { validateEmail } from "@/app/(auth)/_helpers/validation"
import { useAtom } from "jotai"
import { branch, responseMessage, store, validationErrors } from "@/_state/globalStore"
import InputError from "@/_components/inputError"
import { useTranslation } from "next-i18next"
import Header from "@/app/(app)/_components/header"
import { scrollToFirstInvalidElement, validateForm } from "@/app/_helpers/validation"
import { useEmailConflictGuard } from "@/_components/useEmailConflictGuard"

export default function StaffAdd() {
    const { t } = useTranslation('common')
	const router = useRouter()
	const [roles, setRoles] = useState([])
	const [email, setEmail] = useState("")
	const [emailError, setEmailError] = useState(false)
	const [pageRendered, setPageRendered] = useState(false)
	const [ branchID ] = useAtom(branch)
	const [isSubmitting , setIsSubmitting] = useState(false)
	const [validErrors] = useAtom(validationErrors)
	const [selectedRoles, setSelectedRoles] = useState<string[]>([])
	const [registers, setRegisters] = useState([])
	const [selectedRegisters, setSelectedRegisters] = useState<string[]>([])
	const { guard, emailConflictModal } = useEmailConflictGuard()

	const formSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const form = event.currentTarget
        const {errors, firstInvalidElement} = validateForm(form, t, {
            roles: { value: selectedRoles.join(','), rules: ['required'] }
        })
        if (Object.keys(errors).length > 0) {
            store.set(validationErrors, errors)
            if (firstInvalidElement) scrollToFirstInvalidElement(firstInvalidElement)
            return
        }

        const formData = new FormData(form)
        formData.set('branch_id', `${branchID}`)
        // Email already has an account? Confirm linking the staff to it.
        if (!(await guard(email, 'link', true))) return
		setIsSubmitting(true)
		await addStaff(formData).then(() => {
			router.push(`/staff/`)
			store.set(responseMessage, { type: 'success', text: `${t('staff.createdMessage')}` });
		})
		.catch(() => setIsSubmitting(false))
	}

	useEffect(() => {
		if (!pageRendered) return
		setEmailError(validateEmail(email))
	}, [email])

	useEffect(() => {
		getBranchRoles(branchID).then((returnDate) => {
			setRoles(returnDate.response)
			setPageRendered(true)
		})

        getBranchPosRegisters(branchID, true).then((returnDate) => {
			setRegisters(returnDate.response)
		})
	}, [])

	return <>
		{emailConflictModal}
		<Header
			title={t('staff.addTitle')}
			containerClass={"flex justify-between"}
		/>
		<div className="mt-6 card bg-base-100 border border-base-200 shadow-sm">
			<div className="card-body">	
				<form onSubmit={formSubmit}>
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('staff.fname')}</span>
							</label>
							<input name="fname" data-rules="required" type="text" className="input input-bordered input-sm w-full" />
							<InputError messages={validErrors.fname} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('staff.sname')}</span>
							</label>
							<input name="sname" data-rules="required" type="text" className="input input-bordered input-sm w-full" />
							<InputError messages={validErrors.sname} />
						</div>
						<div className="lg:col-span-2">
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('staff.email')}</span>
							</label>
							<input
								name="email" 
                                data-rules="required"
								type="text"
								className={"input input-bordered input-sm w-full" + (emailError ? " input-error" : "")}
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
							<InputError messages={[emailError, validErrors.email]} />
						</div>
						<div className="lg:col-span-2">
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('staff.address')}</span>
							</label>
							<input name="address" type="text" className="input input-bordered input-sm w-full" />
							<InputError messages={validErrors.address} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('staff.city')}</span>
							</label>
							<input name="city" type="text" className="input input-bordered input-sm w-full" />
							<InputError messages={validErrors.city} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('staff.country')}</span>
							</label>
							<input name="country" type="text" className="input input-bordered input-sm w-full" />
							<InputError messages={validErrors.country} />
						</div>
						<div className="lg:col-span-2">
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('staff.mobilePhone')}</span>
							</label>
							<PhoneInput name="mobile_phone" rules="required" size="sm" />
							<InputError messages={validErrors.mobile_phone} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('staff.homePhone')}</span>
							</label>
							<PhoneInput name="home_phone" size="sm" />
							<InputError messages={validErrors.home_phone} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('staff.birthDate')}</span>
							</label>
							<input name="birth_date" data-rules="required" type="date" className="input input-bordered input-sm w-full" />
							<InputError messages={validErrors.birth_date} />
						</div>
						<div className="lg:col-span-2">
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('staff.gender')}</span>
							</label>
							<select name="gender" data-rules="required" className="select select-sm select-bordered w-full" defaultValue={""}>
								<option value={""} disabled>{t('chooseOption')}</option>
								<option value={"M"}>{t('male')}</option>
								<option value={"F"}>{t('female')}</option>
								<option value={"O"}>{t('other')}</option>
							</select>
							<InputError messages={validErrors.gender} />
						</div>
						
						<div className="lg:col-span-2 mt-4">
							<h3 className="text-lg font-semibold mb-4">{t('staff.emergencyContact')}</h3>
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('staff.emgContactRelation')}</span>
							</label>
							<input name="emg_contact_relation" type="text" className="input input-bordered input-sm w-full" />
							<InputError messages={validErrors.emg_contact_relation} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('staff.emgContactName')}</span>
							</label>
							<input name="emg_contact_name" type="text" className="input input-bordered input-sm w-full" />
							<InputError messages={validErrors.emg_contact_name} />
						</div>
						<div className="lg:col-span-2">
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('staff.emgContactMobileNumber')}</span>
							</label>
							<PhoneInput name="emg_contact_mobilenumber" size="sm" />
							<InputError messages={validErrors.emg_contact_mobilenumber} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('staff.emgContactEmail')}</span>
							</label>
							<input name="emg_contact_email" type="text" className="input input-bordered input-sm w-full" />
							<InputError messages={validErrors.emg_contact_email} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('staff.emgContactAddress')}</span>
							</label>
							<input name="emg_contact_address" type="text" className="input input-bordered input-sm w-full" />
							<InputError messages={validErrors.emg_contact_address} />
						</div>
						<div className="lg:col-span-2">
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('staff.emgContactCity')}</span>
							</label>
							<input name="emg_contact_city" type="text" className="input input-bordered input-sm w-full" />
							<InputError messages={validErrors.emg_contact_city} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('staff.emgContactCountry')}</span>
							</label>
							<input name="emg_contact_country" type="text" className="input input-bordered input-sm w-full" />
							<InputError messages={validErrors.emg_contact_country} />
						</div>
						
						<div className="lg:col-span-2 mt-4">
							<h3 className="text-lg font-semibold mb-4">{t('staff.additionalInfo')}</h3>
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('staff.notes')}</span>
							</label>
							<input name="notes" type="text" className="input input-bordered input-sm w-full" />
							<InputError messages={validErrors.notes} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('staff.photo')}</span>
							</label>
							<input name="photo_id" type="file" className="file-input file-input-bordered input-sm w-full" accept="image/*" />
							<InputError messages={validErrors.photo_id} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('staff.blacklist')}</span>
							</label>
							<select name="blacklist" data-rules="required" className="select select-sm select-bordered w-full" defaultValue={""}>
								<option value={""}>{t('chooseOption')}</option>
								<option value={"true"}>{t('yes')}</option>
								<option value={"false"}>{t('no')}</option>
							</select>
							<InputError messages={validErrors.blacklist} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('staff.roles')}</span>
							</label>
							<select 
                                name="roles[]" 
                                data-name="roles" 
                                className="select select-sm select-bordered w-full" 
                                multiple
                                onChange={(e) => setSelectedRoles(Array.from(e.target.selectedOptions, (option) => option.value))}
                                value={selectedRoles}
                            >
								<option value="" disabled>{t('chooseOption')}</option>
								{roles?.map((role: any) => (
									<option key={role.id} value={role.id}>{role.name}</option>
								))}
							</select>
							<InputError messages={validErrors.roles} />
						</div>
					</div>
                    
                    {registers.length > 0 && (
                    <>
                        <div className="space-y-4">
                            <div className="lg:col-span-2 mt-4">
                                <h3 className="text-lg font-semibold mb-4">{t('staff.posRegisters')}</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {registers?.map((register: any) => (
                                    <label key={register.id} className="flex items-center gap-3 p-3 bg-base-200 rounded-lg cursor-pointer hover:bg-base-300 transition-colors">
                                        <input 
                                            name="pos_register_ids[]"
                                            type="checkbox"
                                            className="checkbox"
                                            checked={selectedRegisters.includes(register.id)}
                                            onChange={() => setSelectedRegisters((prev) => 
                                                prev.includes(register.id)
                                                ? prev.filter((id) => id !== register.id)
                                                : [...prev, register.id]
                                            )}
                                            value={register.id} 
                                        />
                                        <span className="label-text">{register.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </>
                    )}
					
					<div className="card-actions justify-end mt-6">
						<button className="btn btn-primary" type="submit" disabled={emailError || isSubmitting}>
							{isSubmitting && <span className="loading loading-spinner"></span>}
							{t('staff.addFormBtn')}
						</button>
					</div>
				</form>
			</div>
		</div>
	</>
}
