"use client"

import { useRouter } from "next/navigation"
import { useBreadcrumbLabel } from "@/hooks/useBreadcrumbLabel"
import { FormEvent, useEffect, useState } from "react"

import { getRole, editRole, getCompanies, getCompanyBranches } from "@/app/(app)/roles/_role"
import { useAtom } from "jotai"
import { responseMessage, store, validationErrors } from "@/_state/globalStore"
import InputError from "@/_components/inputError"
import { useTranslation } from "next-i18next"
import Header from "@/app/(app)/_components/header"
import { scrollToFirstInvalidElement, validateForm } from "@/app/_helpers/validation"

export default function RoleEdit({ params }: any) {
    const { t } = useTranslation('common')
	const router = useRouter()
	const { role_id }: any = params
	const [data, setData] = useState<any>([])
	useBreadcrumbLabel(data)
	const [companies, setCompanies] = useState([])
	const [branches, setBranches] = useState([])
	const [validErrors] = useAtom(validationErrors)
	const [isSubmitting , setIsSubmitting] = useState(false)

	useEffect(() => {
		getRole(role_id).then((returnData: any) => {
			setData(returnData.response)
		})

		getCompanies().then((returnData: any) => {
			setCompanies(returnData.response)
		})
	}, [])

	useEffect(() => {
		if (data.length === 0) return
		getCompanyBranches(data.company_id).then( (returnData: any) => {
			setBranches(returnData.response)
		})
	}, [data])

	const handleCompanyChange = (e: any) => {	
		getCompanyBranches(e.target.value).then( (returnData: any) => {
			setBranches(returnData.response)
		})
	}

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
		await editRole(role_id, formData).then(() => {
			router.push(`/roles/`)
			store.set(responseMessage, { type: 'success', text: t('roles.updatedMessage') });
		})
		.catch(() => setIsSubmitting(false))
	}

	return <>
		<Header
			title={t('roles.editTitle')}
			containerClass={"flex justify-between"}
		/>
		<div className="mt-6 card bg-base-100 border border-base-200 shadow-sm">
			<div className="card-body">	
				<form onSubmit={formSubmit}>
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
						<div className="lg:col-span-2">
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('roles.name')}</span>
							</label>
							<input name="name" data-rules="required" type="text" className="input input-bordered input-sm w-full" defaultValue={data.name}/>
							<InputError messages={validErrors.name} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('roles.company')}</span>
							</label>
							<select name="company_id" data-rules="required" className="select select-sm select-bordered w-full" defaultValue={data.company_id} onChange={handleCompanyChange}>
								<option value={""} disabled>{t('chooseOption')}</option>
								{companies?.map((company: any) => (
									<option key={company.id} value={company.id}>{company.name}</option>
								))}
							</select>
							<InputError messages={validErrors.company_id} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('roles.branch')}</span>
							</label>
							<select name="branch_id" data-rules="required" className="select select-sm select-bordered w-full" defaultValue={data.branch_id}>
								<option value={""} disabled>{t('chooseOption')}</option>
								{branches?.map((branch: any) => (
									<option key={branch.id} value={branch.id}>{branch.name}</option>
								))}
							</select>
							<InputError messages={validErrors.branch_id} />
						</div>
					</div>
					
					<div className="card-actions justify-end mt-6">
						<button type="button" onClick={() => router.back()} className="btn btn-ghost me-2">{t('cancel')}</button>
						<button className="btn btn-primary" type="submit" disabled={isSubmitting}>
							{isSubmitting && <span className="loading loading-spinner"></span>}
							{t('roles.editFormBtn')}
						</button>
					</div>
				</form>
			</div>
		</div>
	</>
}