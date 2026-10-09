"use client"

import { useRouter } from "next/navigation"
import { FormEvent, useEffect, useState } from "react"

import { addProduct, getBranchProductCategories, getCompanyBranches } from "@/app/(app)/products/_product"
import { useAtom } from "jotai"
import { branch, company, posRegister, responseMessage, store, validationErrors } from "@/_state/globalStore"
import InputError from "@/_components/inputError"
import { useTranslation } from "next-i18next"
import Header from "@/app/(app)/_components/header"
import { scrollToFirstInvalidElement, validateForm } from "@/app/_helpers/validation"
import { useAuth } from "@/hooks/auth"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons"

export default function ProductAdd() {
    const { t } = useTranslation('common')
	const [branches, setBranches] = useState([])
	const [categories, setCategories] = useState([])
	const router = useRouter()
	const [ branchID ] = useAtom(branch)
	const [ companyID ] = useAtom(company)
	const [isSubmitting , setIsSubmitting] = useState(false)
	const [validErrors] = useAtom(validationErrors)
	const [ posRegisterID ] = useAtom(posRegister)
	const [selectedBranch, setSelectedBranch] = useState<number | null>(null)
    const [isCategoriesLoading, setIsCategoriesLoading] = useState(false)
    const { user } = useAuth()
    const canAccessCompanyLevel = user.permissions.includes('create company products')

	useEffect(() => {
        if (companyID === -1) return
        getCompanyBranches(companyID).then((returnData: any) => {
            setBranches(returnData.response)
        })
    }, [companyID])

    useEffect(() => {
        if (branchID !== -1 && selectedBranch === null) {
            setSelectedBranch(branchID)
        }
    }, [branchID])

    useEffect(() => {
        if (branchID === -1) return
        const scope = selectedBranch ? 'all' : 'global'
        const branchId = selectedBranch ?? branchID 

        setIsCategoriesLoading(true)
        getBranchProductCategories(branchId, posRegisterID, scope).then((returnData: any) => {
			setCategories(returnData.response)
		})
        .catch(() => {})
        .finally(() => setIsCategoriesLoading(false))
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
		formData.set('pos_register_id', `${posRegisterID}`)
        
		setIsSubmitting(true)
		await addProduct(formData).then((response) => {
			router.push(`/products`)
			store.set(responseMessage, { type: 'success', text: `${t('products.createdMessage')}` });
		})
		.catch(() => setIsSubmitting(false))
	}

	return <>
		<Header
			title={t('products.addTitle')}
			containerClass={"flex justify-between"}
		/>
		<div className="mt-6 card bg-base-100 border border-base-200 shadow-sm">
			<div className="card-body">	
				<form onSubmit={formSubmit}>
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('products.name')}</span>
							</label>
							<input name="name" data-rules="required" type="text" className="input input-bordered input-sm w-full" />
							<InputError messages={validErrors.name} />
						</div>
                        <div>
                            <label className={`label justify-start ${canAccessCompanyLevel ? "" : "required"}`}>
                                <span className="label-text font-semibold flex items-center">
                                    {t('products.branch')}
                                    {canAccessCompanyLevel && (
                                        <div className="tooltip tooltip-top ms-2" data-tip={t('products.branchSelectNote')}>
                                            <FontAwesomeIcon icon={faInfoCircle} className="text-info" />
                                        </div>
                                    )}
                                </span>
                            </label>
                            <select name="branch_id" data-rules={canAccessCompanyLevel ? "" : "required"} className="select select-sm select-bordered w-full" value={selectedBranch ?? ""} onChange={(ev) => setSelectedBranch(ev.target.value ? Number(ev.target.value) : null)}>
                                <option value={""} disabled={canAccessCompanyLevel ? false : true}>{t('chooseOption')}</option>
                                {branches?.map((branch: any) => (
                                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                                ))}
                            </select>
                            <InputError messages={validErrors.branch_id} />
                        </div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibol required">{t('products.category')}</span>
                                {isCategoriesLoading && (
                                    <span className="loading loading-spinner loading-sm ms-3"></span>
                                )}
							</label>
							<select name="category_id" data-rules="required" className="select select-sm select-bordered w-full" disabled={isCategoriesLoading} defaultValue={""}>
								<option value={""}>{t('chooseOption')}</option>
								{categories?.map((category: any) => (
									<option key={category.id} value={category.id}>{category.name}</option>
								))}
							</select>
							<InputError messages={validErrors.category_id} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('products.photo')}</span>
							</label>
							<input name="photo_id" type="file" className="file-input file-input-bordered input-sm w-full" accept="image/*" />
							<InputError messages={validErrors.photo_id} />
						</div>
						
						<div className="lg:col-span-2 mt-4">
							<h3 className="text-lg font-semibold mb-4">{t('products.pricing')}</h3>
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('products.costPrice')}</span>
							</label>
							<input name="cost_price" type="number" defaultValue={0} className="input input-bordered input-sm w-full" />
							<InputError messages={validErrors.cost_price} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('products.costGst')}</span>
							</label>
							<input name="cost_gst" type="number" defaultValue={0} className="input input-bordered input-sm w-full" />
							<InputError messages={validErrors.cost_gst} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('products.sellPrice')}</span>
							</label>
							<input name="sell_price" type="number" defaultValue={0} className="input input-bordered input-sm w-full" />
							<InputError messages={validErrors.sell_price} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('products.sellGst')}</span>
							</label>
							<input name="sell_gst" type="number" defaultValue={0} className="input input-bordered input-sm w-full" />
							<InputError messages={validErrors.sell_gst} />
						</div>
						<div className="lg:col-span-2">
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('products.allowNegative')}</span>
							</label>
							<select name="allow_negative" className="select select-sm select-bordered w-full" defaultValue={""}>
								<option value={""}>{t('chooseOption')}</option>
								<option value={"true"}>{t('yes')}</option>
								<option value={"false"}>{t('no')}</option>
							</select>
							<InputError messages={validErrors.allow_negative} />
						</div>
						
						<div className="lg:col-span-2 mt-4">
							<h3 className="text-lg font-semibold mb-4">{t('products.variantDetails')}</h3>
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('products.thickness')}</span>
							</label>
							<input name="thickness" type="text" placeholder="6mm" className="input input-bordered input-sm w-full" />
							<InputError messages={validErrors.thickness} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('products.glassType')}</span>
							</label>
							<input name="glass_type" type="text" list="glassTypeOptions" className="input input-bordered input-sm w-full" />
							<datalist id="glassTypeOptions">
								<option value="Clear" />
								<option value="Tinted" />
								<option value="Frosted" />
								<option value="Reflective" />
								<option value="Laminated" />
								<option value="Tempered" />
							</datalist>
							<InputError messages={validErrors.glass_type} />
						</div>
						<div className="lg:col-span-2">
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('products.treatment')}</span>
							</label>
							<input name="treatment" type="text" list="treatmentOptions" className="input input-bordered input-sm w-full" />
							<datalist id="treatmentOptions">
								<option value="None" />
								<option value="Tempered" />
								<option value="Laminated" />
								<option value="Toughened" />
							</datalist>
							<InputError messages={validErrors.treatment} />
						</div>

						<div className="lg:col-span-2 mt-4">
							<h3 className="text-lg font-semibold mb-4">{t('products.stockSettings')}</h3>
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('products.lowStockNotice')}</span>
							</label>
							<input name="low_stock_notice" type="number" className="input input-bordered input-sm w-full" />
							<InputError messages={validErrors.low_stock_notice} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('products.active')}</span>
							</label>
							<select name="active" data-rules="required" className="select select-sm select-bordered w-full" defaultValue={"true"}>
								<option value={""} disabled>{t('chooseOption')}</option>
								<option value={"true"}>{t('active')}</option>
								<option value={"false"}>{t('inactive')}</option>
							</select>
							<InputError messages={validErrors.active} />
						</div>
					</div>
					
					<div className="card-actions justify-end mt-6">
						<button className="btn btn-primary" type="submit" disabled={isSubmitting}>
							{isSubmitting && <span className="loading loading-spinner"></span>}
							{t('products.addFormBtn')}
						</button>
					</div>
				</form>
			</div>
		</div>
	</>
}