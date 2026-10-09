"use client"

import { FormEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { addRole, getCompanyBranches, getCompanies } from "@/app/(app)/roles/_role"
import { useAtom } from "jotai"
import { branch, company, responseMessage, store, validationErrors } from "@/_state/globalStore"
import InputError from "@/_components/inputError"
import { useTranslation } from "next-i18next"
import Header from "@/app/(app)/_components/header"
import { scrollToFirstInvalidElement, validateForm } from "@/app/_helpers/validation"

export default function RoleAdd() {
    const { t } = useTranslation('common')
	const router = useRouter()
	const [ branchID ] = useAtom(branch)
	const [ companyID ] = useAtom(company)
	const [companies, setCompanies] = useState([])
	const [branches, setBranches] = useState([])
	const [selectedCompany, setSelectedCompany] = useState<number | "">("")
	const [selectedBranch, setSelectedBranch] = useState<number | "">("")
	const [validErrors] = useAtom(validationErrors)
	const [isSubmitting , setIsSubmitting] = useState(false)

	const getList = () => {
		getCompanies().then((returnData: any) => {
			setCompanies(returnData.response)
		})
	}

	useEffect(() => {
		getList()
	}, [])

	// Default the company/branch pickers to the current branch the user is working in.
	useEffect(() => {
		if (companyID === -1 || selectedCompany !== "") return
		setSelectedCompany(companyID)

		getCompanyBranches(companyID).then((returnData: any) => {
			setBranches(returnData.response)
			if (branchID !== -1) setSelectedBranch(branchID)
		})
	}, [companyID])

	const handleCompanyChange = (e: any) => {
		setSelectedCompany(e.target.value ? Number(e.target.value) : "")
		setSelectedBranch("")
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
		await addRole(formData).then(() => {
			router.push(`/roles/`)
			store.set(responseMessage, { type: 'success', text: t('roles.createdMessage') });
		})
		.catch(() => setIsSubmitting(false))
	}

	return <>
		<Header
			title={t('roles.addTitle')}
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
							<input name="name" data-rules="required" type="text" className="input input-bordered input-sm w-full" />
							<InputError messages={validErrors.name} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('roles.company')}</span>
							</label>
							<select name="company_id" data-rules="required" className="select select-sm select-bordered w-full" value={selectedCompany} onChange={handleCompanyChange}>
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
							<select name="branch_id" data-rules="required" className="select select-sm select-bordered w-full" value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value ? Number(e.target.value) : "")}>
								<option value={""} disabled>{t('chooseOption')}</option>
								{branches?.map((branch: any) => (
									<option key={branch.id} value={branch.id}>{branch.name}</option>
								))}
							</select>
							<InputError messages={validErrors.branch_id} />
						</div>
					</div>
					
					<div className="card-actions justify-end mt-6">
						<button className="btn btn-primary" type="submit" disabled={isSubmitting}>
							{isSubmitting && <span className="loading loading-spinner"></span>}
							{t('roles.addFormBtn')}
						</button>
					</div>
				</form>
			</div>
		</div>
	</>
}