"use client"

import { useRouter } from "next/navigation"
import PhoneInput from "@/_components/phoneInput"
import { useBreadcrumbLabel } from "@/hooks/useBreadcrumbLabel"
import { FormEvent, useEffect, useState } from "react"

import { getSupplier, editSupplier, getCompanyBranches, getBranchPosRegisters } from "@/app/(app)/suppliers/_supplier"
import { useAtom } from "jotai"
import { branch, company, loading, responseMessage, store, validationErrors } from "@/_state/globalStore"
import InputError from "@/_components/inputError"
import { useTranslation } from "next-i18next"
import Header from "@/app/(app)/_components/header"
import { scrollToFirstInvalidElement, validateForm } from "@/app/_helpers/validation"
import { useAuth } from "@/hooks/auth"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons"

export default function SupplierEdit({ params }: any) {
    const { t } = useTranslation('common')
	const router = useRouter()
	const { supplier_id }: any = params
	const [data, setData] = useState<any>([])
	useBreadcrumbLabel(data)
	const [ branchID ] = useAtom(branch)
	const [ companyID ] = useAtom(company)
	const [isLoading] = useAtom(loading)
	const [isSubmitting , setIsSubmitting] = useState(false)
	const [validErrors] = useAtom(validationErrors)
    const [branches, setBranches] = useState([])
    const [registers, setRegisters] = useState([])
	const [selectedBranch, setSelectedBranch] = useState<number | null | undefined>(undefined)
    const [isRegistersLoading, setIsRegistersLoading] = useState(false)
    const { user } = useAuth()
    const canAccessCompanyLevel = user.permissions.includes('update company suppliers')

    useEffect(() => {
        if (companyID === -1) return
        getSupplier(supplier_id).then((returnData: any) => {
            setData(returnData.response)
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
        getBranchPosRegisters(branchId, true, scope).then((returnData: any) => {
            setRegisters(returnData.response)
        })
        .catch(() => {})
        .finally(() => setIsRegistersLoading(false))
    }, [selectedBranch, branchID])
	
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
		await editSupplier(supplier_id, formData).then((response) => {
			router.push(`/suppliers/${response.response.id}`)
			store.set(responseMessage, { type: 'success', text: `${t('suppliers.updatedMessage')}` });
		})
		.catch(() => setIsSubmitting(false))
	}

	return <>
		<Header
			title={t('suppliers.editTitle')}
			containerClass={"flex justify-between"}
		/>
		<div className="mt-6 card bg-base-100 border border-base-200 shadow-sm">
			<div className="card-body">	
				<form onSubmit={formSubmit}>
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
						<div className="lg:col-span-2">
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('suppliers.name')}</span>
							</label>
							<input name="name" data-rules="required" type="text" className="input input-bordered input-sm w-full" defaultValue={data.name}/>	
							<InputError messages={validErrors.name} />	
						</div>
                        <div>
                            <label className={`label justify-start ${canAccessCompanyLevel ? "" : "required"}`}>
                                <span className="label-text font-semibold flex items-center">
                                    {t('suppliers.branch')}
                                    {canAccessCompanyLevel && (
                                        <div className="tooltip tooltip-top ms-2" data-tip={t('suppliers.branchSelectNote')}>
                                            <FontAwesomeIcon icon={faInfoCircle} className="text-info" />
                                        </div>
                                    )}
                                </span>
                            </label>
                            <select name="branch_id" data-rules={canAccessCompanyLevel ? "" : "required"} className="select select-sm select-bordered w-full"  value={selectedBranch ?? ""} onChange={(ev) => setSelectedBranch(ev.target.value ? Number(ev.target.value) : null)}>
                                <option value={""} disabled={canAccessCompanyLevel ? false : true}>{t('chooseOption')}</option>
                                {branches?.map((branch: any) => (
                                    <option key={branch.id} value={branch.id} selected={branch.id == data.branch_id}>{branch.name}</option>
                                ))}
                            </select>
                            <InputError messages={validErrors.branch_id} />
                        </div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('suppliers.email')}</span>
							</label>
							<input name="email" data-rules="required|email" type="email" className="input input-bordered input-sm w-full" defaultValue={data.email}/>	
							<InputError messages={validErrors.email} />	
						</div>
						<div className="lg:col-span-2">
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('suppliers.address')}</span>
							</label>
							<input name="address" type="text" className="input input-bordered input-sm w-full" defaultValue={data.address}/>	
							<InputError messages={validErrors.address} />	
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('suppliers.phone')}</span>
							</label>
							<PhoneInput name="phone" size="sm" defaultValue={data.phone} />	
							<InputError messages={validErrors.phone} />	
						</div>
                        <div>
                            <label className="label justify-start">
                                <span className="label-text font-semibold">{t('suppliers.posRegister')}</span>
                                {isRegistersLoading && (
                                    <span className="loading loading-spinner loading-sm ms-3"></span>
                                )}
                            </label>
                            <select name="pos_register_id" className="select select-sm select-bordered w-full" disabled={isRegistersLoading} defaultValue={data.pos_register_id ?? ""}>
                                <option value={""} disabled>{t('chooseOption')}</option>
                                {registers?.map((register: any) => (
                                    <option key={register.id} value={register.id} selected={register.id == data.pos_register_id}>{register.name}</option>
                                ))}
                            </select>
                            <InputError messages={validErrors.pos_register_id} />
                        </div>
					</div>
					
					<div className="card-actions justify-end mt-6">
						<button type="button" onClick={() => router.back()} className="btn btn-ghost me-2">{t('cancel')}</button>
						<button className="btn btn-primary" type="submit" disabled={isSubmitting}>
							{isSubmitting && <span className="loading loading-spinner"></span>}
							{t('suppliers.editFormBtn')}
						</button>
					</div>
				</form>
			</div>
		</div>
	</>
}