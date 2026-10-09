"use client"

import { useRouter } from "next/navigation"
import { FormEvent, useEffect, useState } from "react"

import { addPurchase, getCompanyBranches, getSuppliers, getProducts } from "@/app/(app)/purchaseOrders/_purchaseOrder"
import { useAtom } from "jotai"
import { branch, company, posRegister, responseMessage, store, validationErrors } from "@/_state/globalStore"
import InputError from "@/_components/inputError"
import { useTranslation } from "next-i18next"
import Header from "@/app/(app)/_components/header"
import { scrollToFirstInvalidElement, validateForm } from "@/app/_helpers/validation"

export default function PurchaseOrderAdd() {
    const { t } = useTranslation('common')
	const [branches, setBranches] = useState([])
	const [suppliers, setSuppliers] = useState([])
	const [products, setProducts] = useState([])
	const router = useRouter()
	const [ branchID ] = useAtom(branch)
	const [ companyID ] = useAtom(company)
	const [isSubmitting , setIsSubmitting] = useState(false)
	const [validErrors] = useAtom(validationErrors)
	const [ posRegisterID ] = useAtom(posRegister)
	const [selectedBranch, setSelectedBranch] = useState<number | null>(null)
	// Supplier is a type-or-pick combobox: a typed name that matches a known
	// supplier sends supplier_id; an unknown name is saved as free-text supplier_name.
	const [supplierInput, setSupplierInput] = useState("")
    const [isProductsLoading, setIsProductsLoading] = useState(false)
    const [isSuppliersLoading, setIsSuppliersLoading] = useState(false)

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
        if (!selectedBranch) {
            setProducts([])
            setSuppliers([])
            return
        }

        setIsProductsLoading(true)
        getProducts(selectedBranch, posRegisterID).then((returnData: any) => {
            setProducts(returnData.response)
        })
        .catch(() => {})
        .finally(() => setIsProductsLoading(false))

        setIsSuppliersLoading(true)
        getSuppliers(selectedBranch, posRegisterID).then((returnData: any) => {
            setSuppliers(returnData.response)
        })
        .catch(() => {})
        .finally(() => setIsSuppliersLoading(false))
    }, [selectedBranch])

	const formSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		event.preventDefault()
        const form = event.currentTarget
        const {errors, firstInvalidElement} = validateForm(form, t)
        if (Object.keys(errors).length > 0) {
            store.set(validationErrors, errors)
            if (firstInvalidElement) scrollToFirstInvalidElement(firstInvalidElement)
            return
        }

        const formData = new FormData(form)
		// Resolve the supplier combobox: known name -> supplier_id, new name -> free-text supplier_name.
		formData.delete('supplier_display')
		const typedSupplier = supplierInput.trim()
		if (typedSupplier) {
			const match = suppliers.find((s: any) => s.name?.trim().toLowerCase() === typedSupplier.toLowerCase())
			if (match) formData.append('supplier_id', String((match as any).id))
			else formData.append('supplier_name', typedSupplier)
		}
		setIsSubmitting(true)
		await addPurchase(formData).then(() => {
			router.push(`/purchaseOrders`)
			store.set(responseMessage, { type: 'success', text: `${t('purchases.createdMessage')}` });
		})
		.catch(() => setIsSubmitting(false))
	}

	return <>
		<Header
			title={t('purchases.addTitle')}
			containerClass={"flex justify-between"}
		/>
		<div className="mt-6 card bg-base-100 border border-base-200 shadow-sm">
			<div className="card-body">	
				<form onSubmit={formSubmit}>
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('purchases.branch')}</span>
							</label>
							<select name="branch_id" data-rules="required" className="select select-sm select-bordered w-full" value={selectedBranch ?? ""} onChange={(ev) => setSelectedBranch(ev.target.value ? Number(ev.target.value) : null)}>
								<option value={""} disabled>{t('chooseOption')}</option>
								{branches?.map((branch: any) => (
									<option key={branch.id} value={branch.id}>{branch.name}</option>
								))}
							</select>
							<InputError messages={validErrors.branch_id} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('purchases.supplier')}</span>
                                {isSuppliersLoading && (
                                    <span className="loading loading-spinner loading-sm ms-3"></span>
                                )}
							</label>
							<input
								name="supplier_display"
								list="suppliers-list"
								className="input input-bordered input-sm w-full"
								disabled={isSuppliersLoading}
								placeholder={t('purchases.supplierHint')}
								value={supplierInput}
								onChange={(ev) => setSupplierInput(ev.target.value)}
								autoComplete="off"
							/>
							<datalist id="suppliers-list">
								{suppliers?.map((supplier: any) => (
									<option key={supplier.id} value={supplier.name} />
								))}
							</datalist>
							<InputError messages={validErrors.supplier_id} />
							<InputError messages={validErrors.supplier_name} />
						</div>
						<div className="lg:col-span-2">
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('purchases.product')}</span>
                                {isProductsLoading && (
                                    <span className="loading loading-spinner loading-sm ms-3"></span>
                                )}
							</label>
							<select name="product_id" data-rules="required" className="select select-sm select-bordered w-full" disabled={isProductsLoading} defaultValue={""}>
								<option value={""} disabled>{t('chooseOption')}</option>
								{products?.map((product: any) => (
									<option key={product.id} value={product.id}>{product.name}</option>
								))}
							</select>
							<InputError messages={validErrors.product_id} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('purchases.quantity')}</span>
							</label>
							<input name="quantity" data-rules="required" type="number" step="any" min="0" className="input input-bordered input-sm w-full" />
							<InputError messages={validErrors.quantity} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('purchases.expiryDate')}</span>
							</label>
							<input name="expiry_date" type="date" className="input input-bordered input-sm w-full" />
							<InputError messages={validErrors.expiry_date} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('purchases.costPrice')}</span>
							</label>
							<input name="cost_price" type="number" step="0.01" min="0" placeholder={t('purchases.costPriceHint')} className="input input-bordered input-sm w-full" />
							<InputError messages={validErrors.cost_price} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('purchases.costGst')}</span>
							</label>
							<input name="cost_gst" type="number" step="0.01" min="0" className="input input-bordered input-sm w-full" />
							<InputError messages={validErrors.cost_gst} />
						</div>
						<div className="lg:col-span-2">
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('purchases.receiptPhoto')}</span>
							</label>
							<input name="receipt_photo" data-rules="required" type="file" accept="image/*" className="file-input file-input-bordered input-sm w-full" />
							<InputError messages={validErrors.receipt_photo} />
						</div>
						<div className="lg:col-span-2">
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('purchases.notes')}</span>
							</label>
							<textarea name="notes" className="textarea textarea-bordered w-full min-h-32"></textarea>
							<InputError messages={validErrors.notes} />
						</div>
					</div>
					
					<div className="card-actions justify-end mt-6">
						<button className="btn btn-primary" type="submit" disabled={isSubmitting}>
							{isSubmitting && <span className="loading loading-spinner"></span>}
							{t('purchases.addFormBtn')}
						</button>
					</div>
				</form>
			</div>
		</div>
	</>
}