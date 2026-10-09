"use client"

import { FormEvent, useState } from "react"
import PhoneInput from "@/_components/phoneInput"
import { useRouter } from "next/navigation"

import { addCompany } from "@/app/(admin)/admin/companies/_company"
import { useAtom } from "jotai"
import { responseMessage, store, validationErrors } from "@/_state/globalStore"
import InputError from "@/_components/inputError"
import { useTranslation } from "next-i18next"
import Header from "@/app/(app)/_components/header"
import { scrollToFirstInvalidElement, validateForm } from "@/app/_helpers/validation"

export default function CompanyAdd() {
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

		const formData = new FormData(form)
		setIsSubmitting(true)
		await addCompany(formData).then((response) => {
			router.push(`/admin/companies/${response.response.id}`)
			store.set(responseMessage, { type: 'success', text: t('companies.createdMessage') });
		})
		.catch(() => setIsSubmitting(false))
	}

	return <>
		<Header
			title={t('companies.addTitle')}
			containerClass={"flex justify-between"}
		/>
		<div className="mt-6 card bg-base-100 border border-base-200 shadow-sm">
			<div className="card-body">	
				<form onSubmit={formSubmit} encType="multipart/form-data">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
						<div className="lg:col-span-2">
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('companies.name')}</span>
							</label>
							<input name="name" data-rules="required" type="text" className="input input-bordered input-sm w-full" />
							<InputError messages={validErrors.name} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('companies.phone')}</span>
							</label>
							<PhoneInput name="phone" rules="required" size="sm" />
							<InputError messages={validErrors.phone} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('companies.email')}</span>
							</label>
							<input name="email" data-rules="required|email" type="text" className="input input-bordered input-sm w-full" />
							<InputError messages={validErrors.email} />
						</div>
						<div className="lg:col-span-2">
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('companies.address')}</span>
							</label>
							<input name="address" type="text" className="input input-bordered input-sm w-full" />
							<InputError messages={validErrors.address} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('companies.city')}</span>
							</label>
							<input name="city" type="text" className="input input-bordered input-sm w-full" />
							<InputError messages={validErrors.city} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('companies.country')}</span>
							</label>
							<input name="country" type="text" className="input input-bordered input-sm w-full" />
							<InputError messages={validErrors.country} />
						</div>
						<div className="lg:col-span-2">
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('companies.contactPerson')}</span>
							</label>
							<input name="contact_person" data-rules="required" type="text" className="input input-bordered input-sm w-full" />
							<InputError messages={validErrors.contact_person} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('companies.contactPhone')}</span>
							</label>
							<PhoneInput name="contact_phone" rules="required" size="sm" />
							<InputError messages={validErrors.contact_phone} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('companies.contactEmail')}</span>
							</label>
							<input name="contact_email" data-rules="required|email" type="text" className="input input-bordered input-sm w-full" />
							<InputError messages={validErrors.contact_email} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('companies.logo')}</span>
							</label>
							<input name="logo" type="file" className="file-input file-input-bordered input-sm w-full" />
							<InputError messages={validErrors.logo} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('companies.status')}</span>
							</label>
							<select name="status" data-rules="required" className="select select-sm select-bordered w-full" defaultValue={""}>
								<option value={""} disabled>{t('chooseOption')}</option>
								<option value={0}>{t('companies.active')}</option>
								<option value={1}>{t('companies.inactive')}</option>
								<option value={2}>{t('companies.suspended')}</option>
							</select>
							<InputError messages={validErrors.status} />
						</div>
						<div className="lg:col-span-2">
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-base-200 rounded-lg">
								<label className="label justify-start cursor-pointer">
									<input name="suspend_owner" type="checkbox" className="checkbox" />
									<span className="mx-2 label-text">{t('companies.suspendOwner')}</span> 
								</label>
								<label className="label justify-start cursor-pointer">
									<input name="suspend_staff" type="checkbox" className="checkbox" />
									<span className="mx-2 label-text">{t('companies.suspendStaff')}</span> 
								</label>
								<label className="label justify-start cursor-pointer">
									<input name="suspend_member" type="checkbox" className="checkbox" />
									<span className="mx-2 label-text">{t('companies.suspendMember')}</span> 
								</label>
								<label className="label justify-start cursor-pointer">
									<input name="suspend_entry" type="checkbox" className="checkbox" />
									<span className="mx-2 label-text">{t('companies.suspendEntry')}</span> 
								</label>
							</div>
						</div>
					</div>
					
					<div className="card-actions justify-end mt-6">
						<button className="btn btn-primary" type="submit" disabled={isSubmitting}>
							{isSubmitting && <span className="loading loading-spinner"></span>}
							{t('companies.addFormBtn')}
						</button>
					</div>
				</form>
			</div>
		</div>
	</>
}