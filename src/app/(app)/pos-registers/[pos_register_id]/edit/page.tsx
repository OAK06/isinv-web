"use client"

import { useRouter } from "next/navigation"
import { useBreadcrumbLabel } from "@/hooks/useBreadcrumbLabel"
import { FormEvent, useEffect, useState } from "react"

import { getPosRegister, editPosRegister, getCompanyBranches } from "@/app/(app)/pos-registers/_posRegister"
import { useAtom } from "jotai"
import { branch, company, responseMessage, store, validationErrors } from "@/_state/globalStore"
import { loading } from "@/_state/globalStore"
import Loading from "@/app/(app)/_components/loading"
import InputError from "@/_components/inputError"
import { useTranslation } from "next-i18next"
import { useAuth } from "@/hooks/auth"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons"
import Header from "@/app/(app)/_components/header"
import { scrollToFirstInvalidElement, validateForm } from "@/app/_helpers/validation"

export default function PosRegisterEdit({ params }: any) {
    const { t } = useTranslation('common')
	const router = useRouter()
	const { pos_register_id }: any = params
	const [data, setData] = useState<any>([])
	useBreadcrumbLabel(data)
	const [branches, setBranches] = useState([])
	const [ branchID ] = useAtom(branch)
	const [ companyID ] = useAtom(company)
	const [isLoading] = useAtom(loading)
	const [isSubmitting , setIsSubmitting] = useState(false)
	const [validErrors] = useAtom(validationErrors)
    const { user } = useAuth()
    const canAccessCompanyLevel = user.permissions.includes('update company pos registers')

	useEffect(() => {
        if (companyID === -1) return
		getPosRegister(pos_register_id).then((returnData: any) => {
			setData(returnData.response)
		})

		getCompanyBranches(companyID).then((returnData: any) => {
			setBranches(returnData.response)
		})
	}, [companyID])

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
		formData.set('login_branch_id', `${branchID}`)
		setIsSubmitting(true)

		await editPosRegister(pos_register_id, formData).then((response) => {
			router.push(`/pos-registers/${response.response.id}`)
			store.set(responseMessage, { type: 'success', text: `${t('posRegisters.updatedMessage')}` });
		})
		.catch(() => setIsSubmitting(false))
	}

	if (isLoading) return <Loading />
	return <>
		<Header
			title={t('posRegisters.editTitle')}
			containerClass={"flex justify-between"}
		/>
		<div className="mt-6 card bg-base-100 border border-base-200 shadow-sm">
			<div className="card-body">	
				<form onSubmit={formSubmit}>
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
						<div className="lg:col-span-2">
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('posRegisters.name')}</span>
							</label>
							<input name="name" data-rules="required" type="text" className="input input-bordered input-sm w-full" defaultValue={data.name} />
							<InputError messages={validErrors.name} />
						</div>
						<div>
							<label className={`label justify-start ${canAccessCompanyLevel ? "" : "required"}`}>
								<span className="label-text font-semibold flex items-center">
									{t('posRegisters.branch')}
									{canAccessCompanyLevel && (
										<div className="tooltip tooltip-top ms-2" data-tip={t('posRegisters.branchSelectNote')}>
											<FontAwesomeIcon icon={faInfoCircle} className="text-info" />
										</div>
									)}
								</span>
							</label>
							<select name="branch_id" data-rules={canAccessCompanyLevel ? "" : "required"} className="select select-sm select-bordered w-full" defaultValue={data.branch_id ?? ""}>
								<option value={""} disabled={canAccessCompanyLevel ? false : true}>{t('chooseOption')}</option>
								{branches?.map((branch: any) => (
									<option key={branch.id} value={branch.id} selected={branch.id == data.branch_id}>{branch.name}</option>
								))}
							</select>
							<InputError messages={validErrors.branch_id} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('posRegisters.active')}</span>
							</label>
							<select name="active" data-rules="required" className="select select-sm select-bordered w-full" defaultValue={data.active}>
								<option value={""} disabled>{t('chooseOption')}</option>
								<option value={"true"} selected={data.active == true}>{t('active')}</option>
								<option value={"false"} selected={data.active == false}>{t('inactive')}</option>
							</select>
							<InputError messages={validErrors.active} />
						</div>
						<div className="lg:col-span-2">
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('posRegisters.description')}</span>
							</label>
							<textarea name="description" className="textarea textarea-bordered w-full min-h-32" defaultValue={data.description}></textarea>
							<InputError messages={validErrors.description} />
						</div>
					</div>
					
					<div className="card-actions justify-end mt-6">
						<button type="button" onClick={() => router.back()} className="btn btn-ghost me-2">{t('cancel')}</button>
						<button className="btn btn-primary" type="submit" disabled={isSubmitting}>
							{isSubmitting && <span className="loading loading-spinner"></span>}
							{t('posRegisters.editFormBtn')}
						</button>
					</div>
				</form>
			</div>
		</div>
	</>
}