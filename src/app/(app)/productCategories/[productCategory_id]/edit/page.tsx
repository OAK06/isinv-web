"use client"

import { useRouter } from "next/navigation"
import { useBreadcrumbLabel } from "@/hooks/useBreadcrumbLabel"
import { FormEvent, useEffect, useState } from "react"

import { getCategory, editCategory, getCompanyBranches, getBranchPosRegisters } from "@/app/(app)/productCategories/_productCategory"
import { useAtom } from "jotai"
import { branch, company, responseMessage, store, validationErrors } from "@/_state/globalStore"
import InputError from "@/_components/inputError"
import { useTranslation } from "next-i18next"
import Header from "@/app/(app)/_components/header"
import { scrollToFirstInvalidElement, validateForm } from "@/app/_helpers/validation"
import { useAuth } from "@/hooks/auth"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons"

export default function CategoryEdit({ params }: any) {
    const { t } = useTranslation('common')
	const router = useRouter()
	const { productCategory_id }: any = params
	const [data, setData] = useState<any>([])
	useBreadcrumbLabel(data)
	const [branches, setBranches] = useState([])
	const [ branchID ] = useAtom(branch)
	const [ companyID ] = useAtom(company)
	const [isSubmitting , setIsSubmitting] = useState(false)
	const [validErrors] = useAtom(validationErrors)
    const { user } = useAuth()
    const canAccessCompanyLevel = user.permissions.includes('update company categories')
	const [registers, setRegisters] = useState([])
	const [selectedRegisters, setSelectedRegisters] = useState<string[]>([])
	const [selectedBranch, setSelectedBranch] = useState<number | null | undefined>(undefined)
    const [isRegistersLoading, setIsRegistersLoading] = useState(false)
    
    useEffect(() => {
        if (companyID === -1) return
        getCategory(productCategory_id).then((returnData: any) => {
            setData(returnData.response)
            setSelectedRegisters(returnData.response.pos_registers?.map((register: any) => register.pivot?.pos_register_id))
            setSelectedBranch(returnData.response.branch_id)
        })
        
        getCompanyBranches(companyID).then((returnData: any) => {
            setBranches(returnData.response)
        })
    }, [companyID])

    useEffect(() => {
        if (selectedBranch === undefined || branchID === -1) return
        const scope = selectedBranch ? 'all' : 'global'
        const branchId = selectedBranch ?? branchID 

        setIsRegistersLoading(true)
        setRegisters([])
        getBranchPosRegisters(branchId, true, scope).then((returnData: any) => {
            setRegisters(returnData.response)
        })
        .catch(() => setRegisters([]))
        .finally(() => setIsRegistersLoading(false))
    }, [selectedBranch, branchID])
	
	const formSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const form = event.currentTarget
        const {errors, firstInvalidElement} = validateForm(form, t, {
            pos_register_ids: { value: selectedRegisters.join(','), rules: ['required'] }
        })
        if (Object.keys(errors).length > 0) {
            store.set(validationErrors, errors)
            if (firstInvalidElement) scrollToFirstInvalidElement(firstInvalidElement)
            return
        }

        const formData = new FormData(form)
        formData.append('login_branch_id', `${branchID}`)   
        
		setIsSubmitting(true)
		await editCategory(productCategory_id, formData).then((response) => {
			router.push(`/productCategories`)
			store.set(responseMessage, { type: 'success', text: `${t('categories.updatedMessage')}` });
		})
		.catch(() => setIsSubmitting(false))
	}

	return <>
		<Header
			title={t('categories.editTitle')}
			containerClass={"flex justify-between"}
		/>
		<div className="mt-6 card bg-base-100 border border-base-200 shadow-sm">
			<div className="card-body">	
				<form onSubmit={formSubmit}>
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('categories.name')}</span>
							</label>
							<input name="name" data-rules="required" type="text" className="input input-bordered input-sm w-full" defaultValue={data.name} />
							<InputError messages={validErrors.name} />
						</div>
                        <div>
                            <label className={`label justify-start ${canAccessCompanyLevel ? "" : "required"}`}>
                                <span className="label-text font-semibold flex items-center">
                                    {t('categories.branch')}
                                    {canAccessCompanyLevel && (
                                        <div className="tooltip tooltip-top ms-2" data-tip={t('categories.branchSelectNote')}>
                                            <FontAwesomeIcon icon={faInfoCircle} className="text-info" />
                                        </div>
                                    )}
                                </span>
                            </label>
                            <select name="branch_id" data-rules={canAccessCompanyLevel ? "" : "required"} className="select select-sm select-bordered w-full" value={selectedBranch ?? ""} onChange={(ev) => setSelectedBranch(ev.target.value ? Number(ev.target.value) : null)}>
                                <option value={""} disabled={canAccessCompanyLevel ? false : true}>{t('chooseOption')}</option>
                                {branches?.map((branch: any) => (
                                    <option key={branch.id} value={branch.id} selected={branch.id == data.branch_id}>{branch.name}</option>
                                ))}
                            </select>
                            <InputError messages={validErrors.branch_id} />
                        </div>

						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('categories.photo')}</span>
							</label>
							<input name="photo_id" type="file" className="file-input file-input-bordered input-sm w-full" accept="image/*" />
							<InputError messages={validErrors.photo_id} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('categories.active')}</span>
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
								<span className="label-text font-semibold">{t('categories.description')}</span>
							</label>
							<textarea name="description" className="textarea textarea-bordered w-full min-h-32" defaultValue={data.description}></textarea>
							<InputError messages={validErrors.description} />
						</div>
					</div>
					
                    <div className="space-y-4">
                        <div className="lg:col-span-2 my-4 flex">
                            <h3 data-name="pos_register_ids" className="text-lg font-semibold required">{t('categories.posRegisters')}</h3>
                            {isRegistersLoading && (
                                <span className="loading loading-spinner loading-sm ms-3"></span>
                            )}
                            <InputError messages={validErrors.pos_register_ids} />
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
                                        disabled={isRegistersLoading}
                                    />
                                    <span className="label-text">{register.name}</span>
                                </label>
                            ))}
                        </div>                        
                    </div>
					
					<div className="card-actions justify-end mt-6">
						<button type="button" onClick={() => router.back()} className="btn btn-ghost me-2">{t('cancel')}</button>
						<button className="btn btn-primary" type="submit" disabled={isSubmitting}>
							{isSubmitting && <span className="loading loading-spinner"></span>}
							{t('categories.editFormBtn')}
						</button>
					</div>
				</form>
			</div>
		</div>
	</>
}