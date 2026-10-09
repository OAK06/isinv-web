"use client"

import { FormEvent, useEffect, useState } from "react"
import PhoneInput from "@/_components/phoneInput"
import { useRouter } from "next/navigation"

import { addBranch, getCompanies } from "@/app/(app)/branches/_branch"
import { useAtom } from "jotai"
import { branch, responseMessage, store, validationErrors } from "@/_state/globalStore"
import InputError from "@/_components/inputError"
import { useTranslation } from "next-i18next"
import Header from "@/app/(app)/_components/header"
import { scrollToFirstInvalidElement, validateForm } from "@/app/_helpers/validation"

export default function BranchAdd() {
    const { t } = useTranslation('common')
	const [ branchID ] = useAtom(branch)
	const [companies, setCompanies] = useState([])
	const [errors, setErrors] = useState(null)
	const router = useRouter()
	const [terms, setTerms] = useState('')
	const [isSubmitting , setIsSubmitting] = useState(false)
	const [validErrors] = useAtom(validationErrors)
    const timezones = Intl.supportedValuesOf('timeZone')

	const getList = () => {
		getCompanies().then((returnData: any) => {
			setCompanies(returnData.response)			
		})
	}

	useEffect(() => {
		getList()
	}, [])

	const formSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const form = event.currentTarget
        const {errors, firstInvalidElement} = validateForm(form, t, {
            terms: { value: terms, rules: ['required'] }
        })
        if (Object.keys(errors).length > 0) {
            store.set(validationErrors, errors)
            if (firstInvalidElement) scrollToFirstInvalidElement(firstInvalidElement)
            return
        }

        const formData = new FormData(form)
		formData.set('terms', terms)
		formData.set('login_branch_id', `${branchID}`)
		setIsSubmitting(true)

		await addBranch(formData).then(($response) => {			
			router.push(`/branches/`)
			store.set(responseMessage, { type: 'success', text: `${t('branches.createdMessage')}` });
		}).catch((error) => {
			setErrors(error.response.data.errors)
			setIsSubmitting(false)
		})
	}

	return <>
		<Header
			title={t('branches.addTitle')}
			containerClass={"flex justify-between"}
		/>
		<div className="mt-6 card bg-base-100 border border-base-200 shadow-sm">
			<div className="card-body">	
				<form onSubmit={formSubmit} encType="multipart/form-data">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('branches.name')}</span>
							</label>
							<input name="name" data-rules="required" type="text" className="input input-bordered input-sm w-full" />
							<InputError messages={validErrors.name} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('branches.company')}</span>
							</label>
							<select name="company_id" data-rules="required" className="select select-sm select-bordered w-full" defaultValue={""}>
								<option value={""} disabled>{t('chooseOption')}</option>
								{companies?.map((company: any) => (
									<option key={company.id} value={company.id}>{company.name}</option>
								))}
							</select>
							<InputError messages={validErrors.company_id} />
						</div>
						<div className="lg:col-span-2">
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('branches.logo')}</span>
							</label>
							<input name="logo" type="file" accept="image/*" className="file-input file-input-bordered input-sm w-full" />
							<InputError messages={validErrors.logo} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('branches.address')}</span>
							</label>
							<input name="address" data-rules="required" type="text" className="input input-bordered input-sm w-full" />
							<InputError messages={validErrors.address} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('branches.city')}</span>
							</label>
							<input name="city" data-rules="required" type="text" className="input input-bordered input-sm w-full" />
							<InputError messages={validErrors.city} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('branches.country')}</span>
							</label>
							<input name="country" data-rules="required" type="text" className="input input-bordered input-sm w-full" />
							<InputError messages={validErrors.country} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('branches.phone')}</span>
							</label>
							<PhoneInput name="phone" rules="required" size="sm" />
							<InputError messages={validErrors.phone} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('branches.email')}</span>
							</label>
							<input name="email" data-rules="required" type="text" className="input input-bordered input-sm w-full" />
							<InputError messages={validErrors.email} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('branches.contactPerson')}</span>
							</label>
							<input name="contact_person" data-rules="required" type="text" className="input input-bordered input-sm w-full" />
							<InputError messages={validErrors.contact_person} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('branches.contactPhone')}</span>
							</label>
							<PhoneInput name="contact_phone" rules="required" size="sm" />
							<InputError messages={validErrors.contact_phone} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('branches.contactEmail')}</span>
							</label>
							<input name="contact_email" data-rules="required" type="text" className="input input-bordered input-sm w-full" />
							<InputError messages={validErrors.contact_email} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('branches.timezone')}</span>
							</label>
							<select name="timezone" className="select select-sm select-bordered w-full" defaultValue={""}>
								<option value={""}>{t('chooseOption')}</option>
								{timezones.map((tz) => (
                                    <option key={tz} value={tz}>{tz}</option>
                                ))}
							</select>
							<InputError messages={validErrors.timezone} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('branches.reentry')}</span>
							</label>
							<input name="reentry" data-rules="required" type="number" className="input input-bordered input-sm w-full" />
							<InputError messages={validErrors.reentry} />
						</div>
						
						<div className="lg:col-span-2">
							<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 p-4 bg-base-200 rounded-lg">
								<label className="label justify-start cursor-pointer">
									<input name="sunday" type="checkbox" className="checkbox" />
									<span className="mx-2 label-text">{t('branches.sunday')}</span> 
								</label>
								<label className="label justify-start cursor-pointer">
									<input name="monday" type="checkbox" className="checkbox" />
									<span className="mx-2 label-text">{t('branches.monday')}</span> 
								</label>
								<label className="label justify-start cursor-pointer">
									<input name="tuesday" type="checkbox" className="checkbox" />
									<span className="mx-2 label-text">{t('branches.tuesday')}</span> 
								</label>
								<label className="label justify-start cursor-pointer">
									<input name="wednesday" type="checkbox" className="checkbox" />
									<span className="mx-2 label-text">{t('branches.wednesday')}</span> 
								</label>
								<label className="label justify-start cursor-pointer">
									<input name="thursday" type="checkbox" className="checkbox" />
									<span className="mx-2 label-text">{t('branches.thursday')}</span>  
								</label>
								<label className="label justify-start cursor-pointer">
									<input name="friday" type="checkbox" className="checkbox" />
									<span className="mx-2 label-text">{t('branches.friday')}</span> 
								</label>
								<label className="label justify-start cursor-pointer">
									<input name="saturday" type="checkbox" className="checkbox" />
									<span className="mx-2 label-text">{t('branches.saturday')}</span> 
								</label>
							</div>
						</div>

						<div data-name="terms" className="lg:col-span-2">
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('branches.terms')}</span>
							</label>
							<textarea value={terms} onChange={(ev) => setTerms(ev.target.value)} className="textarea textarea-bordered w-full min-h-48" />
							<InputError messages={validErrors.terms} />
						</div>
					</div>
					
					<div className="card-actions justify-end mt-6">
						<button className="btn btn-primary" type="submit" disabled={isSubmitting}>
							{isSubmitting && <span className="loading loading-spinner"></span>}
							{t('branches.addFormBtn')}
						</button>
					</div>
				</form>
			</div>
		</div>
	</>
}