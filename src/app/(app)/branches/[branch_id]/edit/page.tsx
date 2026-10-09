"use client"

import { useRouter } from "next/navigation"
import PhoneInput from "@/_components/phoneInput"
import { useBreadcrumbLabel } from "@/hooks/useBreadcrumbLabel"
import { fileUrl } from "@/_utils/fileUrl"
import { FormEvent, useEffect, useState } from "react"

import { getBranch, editBranch, getCompanies } from "@/app/(app)/branches/_branch"
import { useAtom } from "jotai"
import { branch, responseMessage, store, validationErrors } from "@/_state/globalStore"
import InputError from "@/_components/inputError"
import { useTranslation } from "next-i18next"
import Header from "@/app/(app)/_components/header"
import { scrollToFirstInvalidElement, validateForm } from "@/app/_helpers/validation"

export default function BranchEdit({ params }: any) {
    const { t } = useTranslation('common')
	const [ branchID ] = useAtom(branch)
	const router = useRouter()
	const { branch_id }: any = params
	const [data, setData] = useState<any>([])
	useBreadcrumbLabel(data)
	const [companies, setCompanies] = useState<any>([])
	const [terms, setTerms] = useState('')
	const [isSubmitting , setIsSubmitting] = useState(false)
	const [validErrors] = useAtom(validationErrors)
    const timezones = Intl.supportedValuesOf('timeZone')

	useEffect(() => {
		getBranch(branch_id).then((returnData: any) => {
			setData(returnData.response)
			setTerms(returnData.response.terms)
		})
		getCompanies().then((returnData: any) => {
			setCompanies(returnData.response)
		})
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

		await editBranch(branch_id, formData).then((response) => {
			router.push(`/branches/${response.response.id}`)
			store.set(responseMessage, { type: 'success', text: `${t('branches.updatedMessage')}` });
		})
		.catch(() => setIsSubmitting(false))
	}

	const previewLogo = () => {
		const fileInput: any = document.getElementById("logoInput");
		const preview = document.getElementById("logoPreview");
		if (fileInput.files && fileInput.files[0]) {
			const reader = new FileReader();
			reader.onload = function (e) {
				preview.innerHTML = `<img src="${e.target.result}" alt="Logo Preview" class="w-full h-full object-cover">`;
			};
			reader.readAsDataURL(fileInput.files[0]);
		}
	}

	return <>
		<Header
			title={t('branches.editTitle')}
			containerClass={"flex justify-between"}
		/>
		<div className="mt-6 card bg-base-100 border border-base-200 shadow-sm">
			<div className="card-body">	
				<form onSubmit={formSubmit} encType="multipart/form-data">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
						{/* Logo Upload Section */}
						<div className="lg:col-span-2 flex items-center gap-4 p-4 bg-base-200 rounded-lg">
							<div className="w-24 h-24 bg-base-200 border-2 rounded-full flex items-center justify-center overflow-hidden">
								{data.file?.url ? (
									<img src={fileUrl(data.file?.url)} alt="Branch Logo" className="w-full h-full object-cover" />
								) : (
									<span className="text-base-content/60 text-sm">{t('branches.logoPreview')}</span>
								)}
							</div>
							<div>
								<label className="cursor-pointer">
									<span className="btn btn-sm btn-outline btn-primary">
										{t('branches.uploadLogo')}
									</span>
									<input name="logo" type="file" accept="image/*" className="hidden" id="logoInput" onChange={previewLogo} />
								</label>
								<InputError messages={validErrors.logo} />
							</div>
						</div>

						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('branches.name')}</span>
							</label>
							<input name="name" data-rules="required" type="text" className="input input-bordered input-sm w-full" defaultValue={data.name} />
							<InputError messages={validErrors.name} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('branches.company')}</span>
							</label>
							<select name="company_id" data-rules="required" className="select select-sm select-bordered w-full" value={data.company_id ?? ''} onChange={(e) => setData({ ...data, company_id: e.target.value })}>
								<option value={""} disabled>{t('chooseOption')}</option>
								{companies?.map((company: any) => (
									<option key={company.id} value={company.id}>{company.name}</option>
								))}
							</select>
							<InputError messages={validErrors.company_id} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('branches.address')}</span>
							</label>
							<input name="address" data-rules="required" type="text" className="input input-bordered input-sm w-full" defaultValue={data.address} />
							<InputError messages={validErrors.address} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('branches.city')}</span>
							</label>
							<input name="city" data-rules="required" type="text" className="input input-bordered input-sm w-full" defaultValue={data.city} />
							<InputError messages={validErrors.city} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('branches.country')}</span>
							</label>
							<input name="country" data-rules="required" type="text" className="input input-bordered input-sm w-full" defaultValue={data.country} />
							<InputError messages={validErrors.country} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('branches.phone')}</span>
							</label>
							<PhoneInput name="phone" rules="required" size="sm" defaultValue={data.phone} />
							<InputError messages={validErrors.phone} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('branches.email')}</span>
							</label>
							<input name="email" data-rules="required" type="text" className="input input-bordered input-sm w-full" defaultValue={data.email} />
							<InputError messages={validErrors.email} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('branches.contactPerson')}</span>
							</label>
							<input name="contact_person" data-rules="required" type="text" className="input input-bordered input-sm w-full" defaultValue={data.contact_person} />
							<InputError messages={validErrors.contact_person} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('branches.contactPhone')}</span>
							</label>
							<PhoneInput name="contact_phone" rules="required" size="sm" defaultValue={data.contact_phone} />
							<InputError messages={validErrors.contact_phone} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('branches.contactEmail')}</span>
							</label>
							<input name="contact_email" data-rules="required" type="text" className="input input-bordered input-sm w-full" defaultValue={data.contact_email} />
							<InputError messages={validErrors.contact_email} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('branches.timezone')}</span>
							</label>
							<select name="timezone" className="select select-sm select-bordered w-full" defaultValue={data.timezone}>
								<option value={""}>{t('chooseOption')}</option>
                                {timezones.map((tz) => (
                                    <option key={tz} value={tz} selected={tz == data.timezone}>{tz}</option>
                                ))}                                
							</select>
							<InputError messages={validErrors.timezone} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('branches.reentry')}</span>
							</label>
							<input name="reentry" data-rules="required" type="number" className="input input-bordered input-sm w-full" defaultValue={data.reentry} />
							<InputError messages={validErrors.reentry} />
						</div>

						{/* Operating Days */}
						<div className="lg:col-span-2">
							<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 p-4 bg-base-200 rounded-lg">
								<label className="label justify-start cursor-pointer">
									<input name="sunday" type="checkbox" className="checkbox" checked={data.sunday} onChange={(e) => setData({ ...data, sunday: e.target.checked })} />
									<span className="mx-2 label-text">{t('branches.sunday')}</span> 
								</label>
								<label className="label justify-start cursor-pointer">
									<input name="monday" type="checkbox" className="checkbox" checked={data.monday} onChange={(e) => setData({ ...data, monday: e.target.checked })} />
									<span className="mx-2 label-text">{t('branches.monday')}</span> 
								</label>
								<label className="label justify-start cursor-pointer">
									<input name="tuesday" type="checkbox" className="checkbox" checked={data.tuesday} onChange={(e) => setData({ ...data, tuesday: e.target.checked })} />
									<span className="mx-2 label-text">{t('branches.tuesday')}</span> 
								</label>
								<label className="label justify-start cursor-pointer">
									<input name="wednesday" type="checkbox" className="checkbox" checked={data.wednesday} onChange={(e) => setData({ ...data, wednesday: e.target.checked })} />
									<span className="mx-2 label-text">{t('branches.wednesday')}</span> 
								</label>
								<label className="label justify-start cursor-pointer">
									<input name="thursday" type="checkbox" className="checkbox" checked={data.thursday} onChange={(e) => setData({ ...data, thursday: e.target.checked })} />
									<span className="mx-2 label-text">{t('branches.thursday')}</span>  
								</label>
								<label className="label justify-start cursor-pointer">
									<input name="friday" type="checkbox" className="checkbox" checked={data.friday} onChange={(e) => setData({ ...data, friday: e.target.checked })} />
									<span className="mx-2 label-text">{t('branches.friday')}</span> 
								</label>
								<label className="label justify-start cursor-pointer">
									<input name="saturday" type="checkbox" className="checkbox" checked={data.saturday} onChange={(e) => setData({ ...data, saturday: e.target.checked })} />
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
						<button type="button" onClick={() => router.back()} className="btn btn-ghost me-2">{t('cancel')}</button>
						<button className="btn btn-primary" type="submit" disabled={isSubmitting}>
							{isSubmitting && <span className="loading loading-spinner"></span>}
							{t('branches.editFormBtn')}
						</button>
					</div>
				</form>
			</div>
		</div>
	</>
}