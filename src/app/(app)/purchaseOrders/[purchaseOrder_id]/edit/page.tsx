"use client"

import { useRouter } from "next/navigation"
import { FormEvent, useEffect, useRef, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faXmark } from "@fortawesome/free-solid-svg-icons"

import { getPurchase, editPurchase, getSuppliers, PurchaseOrder } from "@/app/(app)/purchaseOrders/_purchaseOrder"
import { useAtom } from "jotai"
import { posRegister, responseMessage, store, validationErrors } from "@/_state/globalStore"
import InputError from "@/_components/inputError"
import { useTranslation } from "next-i18next"
import Header from "@/app/(app)/_components/header"
import { fileUrl } from "@/_utils/fileUrl"
import { formatNumber, formatCurrency } from "@/_helpers/currency"
import { useBreadcrumbLabel } from "@/hooks/useBreadcrumbLabel"

export default function PurchaseOrderEdit({ params }: any) {
    const { t } = useTranslation('common')
	const { purchaseOrder_id }: any = params
	const router = useRouter()
	const [data, setData] = useState<PurchaseOrder>({} as PurchaseOrder)
	const [suppliers, setSuppliers] = useState([])
	const [supplierInput, setSupplierInput] = useState("")
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [validErrors] = useAtom(validationErrors)
	const [ posRegisterID ] = useAtom(posRegister)
	const receiptPhotoRef = useRef<HTMLInputElement>(null)
	useBreadcrumbLabel(data)

	useEffect(() => {
		getPurchase(purchaseOrder_id).then((returnData: any) => {
			const po = returnData.response
			setData(po)
			setSupplierInput(po.supplier?.name ?? po.supplier_name ?? "")
		})
	}, [])

	useEffect(() => {
		if (!data.branch_id) return
		getSuppliers(data.branch_id, posRegisterID).then((returnData: any) => {
			setSuppliers(returnData.response)
		}).catch(() => {})
	}, [data.branch_id])

	const formSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const form = event.currentTarget
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
		await editPurchase(purchaseOrder_id, formData).then(() => {
			router.push(`/purchaseOrders`)
			store.set(responseMessage, { type: 'success', text: `${t('purchases.updatedMessage')}` })
		})
		.catch(() => setIsSubmitting(false))
	}

	return <>
		<Header
			title={t('purchases.editTitle')}
			containerClass={"flex justify-between"}
		/>
		{data.id && (
			<div className="mt-6 card bg-base-100 border border-base-200 shadow-sm">
				<div className="card-body">
					<form onSubmit={formSubmit}>
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
							{/* Locked inventory fields — set at creation, already posted to stock */}
							<div>
								<label className="label justify-start">
									<span className="label-text font-semibold">{t('purchases.branch')}</span>
								</label>
								<input type="text" disabled value={data.branch?.name ?? ""} className="input input-bordered input-sm w-full" />
							</div>
							<div>
								<label className="label justify-start">
									<span className="label-text font-semibold">{t('purchases.product')}</span>
								</label>
								<input type="text" disabled value={data.inventory?.product?.name ?? ""} className="input input-bordered input-sm w-full" />
							</div>
							<div>
								<label className="label justify-start">
									<span className="label-text font-semibold">{t('purchases.quantity')}</span>
								</label>
								<input type="text" disabled value={formatNumber(data.inventory?.quantity)} className="input input-bordered input-sm w-full" />
							</div>
							<div>
								<label className="label justify-start">
									<span className="label-text font-semibold">{t('purchases.unitCost')}</span>
								</label>
								<input type="text" disabled value={formatCurrency(data.inventory?.cost_price)} className="input input-bordered input-sm w-full" />
							</div>
							{/* Editable fields */}
							<div>
								<label className="label justify-start">
									<span className="label-text font-semibold">{t('purchases.purchaseDate')}</span>
								</label>
								<input name="purchase_date" type="date" defaultValue={data.purchase_date ?? ''} className="input input-bordered input-sm w-full" />
								<InputError messages={validErrors.purchase_date} />
							</div>
							<div>
								<label className="label justify-start">
									<span className="label-text font-semibold">{t('purchases.supplier')}</span>
								</label>
								<input
									name="supplier_display"
									list="suppliers-list"
									className="input input-bordered input-sm w-full"
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
									<span className="label-text font-semibold">{t('purchases.receiptPhoto')}</span>
								</label>
								<div className="flex items-center gap-2">
									<input ref={receiptPhotoRef} name="receipt_photo" type="file" accept="image/*" className="file-input file-input-bordered input-sm w-full" />
									<button type="button" aria-label={t('close')} onClick={() => { if (receiptPhotoRef.current) receiptPhotoRef.current.value = '' }} className="btn btn-ghost btn-sm btn-square">
										<FontAwesomeIcon icon={faXmark} />
									</button>
								</div>
								<InputError messages={validErrors.receipt_photo} />
								{data.receipt_photo?.url && (
									<a href={fileUrl(data.receipt_photo.url)} target="_blank" rel="noopener" className="mt-2 block max-w-[12rem]">
										<img src={fileUrl(data.receipt_photo.url)} alt={t('purchases.receiptPhoto')} className="w-full rounded-lg border border-base-200 object-contain" />
									</a>
								)}
							</div>
							<div className="lg:col-span-2">
								<label className="label justify-start">
									<span className="label-text font-semibold">{t('purchases.notes')}</span>
								</label>
								<textarea name="notes" defaultValue={data.notes ?? ""} className="textarea textarea-bordered w-full min-h-32"></textarea>
								<InputError messages={validErrors.notes} />
							</div>
						</div>

						<div className="card-actions justify-end mt-6">
							<button className="btn btn-primary" type="submit" disabled={isSubmitting}>
								{isSubmitting && <span className="loading loading-spinner"></span>}
								{t('purchases.editFormBtn')}
							</button>
						</div>
					</form>
				</div>
			</div>
		)}
	</>
}
