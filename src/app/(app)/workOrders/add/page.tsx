"use client"

import { useRouter } from "next/navigation"
import { FormEvent, useEffect, useState } from "react"

import { addWorkOrder, getBranchStaff, WorkOrderItem } from "@/app/(app)/workOrders/_workOrder"
import { getProducts } from "@/app/(app)/sales/_sale"
import { useAtom } from "jotai"
import { branch, posRegister, responseMessage, store, validationErrors } from "@/_state/globalStore"
import InputError from "@/_components/inputError"
import { useTranslation } from "next-i18next"
import Header from "@/app/(app)/_components/header"
import { scrollToFirstInvalidElement, validateForm } from "@/app/_helpers/validation"
import { formatCurrency } from "@/_helpers/currency"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons"

let nextKey = 0
type LineItem = WorkOrderItem & { key: number }

const emptyItem = (): LineItem => ({ key: nextKey++, item_type: "product", product_id: null, name: "", quantity: 1, width: "", height: "", unit: "", unit_price: "", line_tax: "" })

// base = width*height*quantity*unit_price for glass (area-priced), quantity*unit_price otherwise.
// Mirrors WorkOrderService::lineBase on the backend so the on-screen total matches what saves.
function lineBase(item: LineItem): number {
	const quantity = Number(item.quantity) || 0
	const unitPrice = Number(item.unit_price) || 0
	if (item.item_type === "glass")
		return (Number(item.width) || 0) * (Number(item.height) || 0) * quantity * unitPrice
	return quantity * unitPrice
}

export default function WorkOrderAdd() {
    const { t } = useTranslation('common')
	const router = useRouter()
	const [ branchID ] = useAtom(branch)
	const [ posRegisterID ] = useAtom(posRegister)
	const [validErrors] = useAtom(validationErrors)
	const [isSubmitting, setIsSubmitting] = useState(false)

	const [products, setProducts] = useState<any[]>([])
	const [staff, setStaff] = useState<any[]>([])

	const [discount, setDiscount] = useState("")
	const [items, setItems] = useState<LineItem[]>([emptyItem()])

	useEffect(() => {
		getProducts(branchID, posRegisterID).then((returnData: any) => setProducts(returnData.response)).catch(() => {})
	}, [branchID, posRegisterID])

	useEffect(() => {
		getBranchStaff(branchID).then((returnData: any) => setStaff(returnData.response)).catch(() => {})
	}, [branchID])

	const updateItem = (key: number, patch: Partial<LineItem>) => {
		setItems(prev => prev.map(item => item.key === key ? { ...item, ...patch } : item))
	}

	const selectProduct = (key: number, productID: string) => {
		const product = products.find((p: any) => String(p.id) === productID)
		updateItem(key, { product_id: product ? product.id : null, name: product?.name ?? "", unit_price: product?.sell_price ?? "" })
	}

	const removeItem = (key: number) => setItems(prev => prev.length > 1 ? prev.filter(item => item.key !== key) : prev)

	const subtotal = items.reduce((sum, item) => sum + lineBase(item), 0)
	const totalTax = items.reduce((sum, item) => sum + (Number(item.line_tax) || 0), 0)
	const grandTotal = subtotal + totalTax - (Number(discount) || 0)

	const itemsAreValid = () => items.every(item => {
		if (!item.name || !(Number(item.unit_price) >= 0)) return false
		if (item.item_type === "product" && !item.product_id) return false
		if (item.item_type === "glass" && (!item.width || !item.height)) return false
		return true
	})

	const formSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const form = event.currentTarget
		const customFields = { items: { value: items.length ? "1" : "", rules: ["required"] } }
		const { errors, firstInvalidElement } = validateForm(form, t, customFields)
		if (Object.keys(errors).length > 0) {
			store.set(validationErrors, errors)
			if (firstInvalidElement) scrollToFirstInvalidElement(firstInvalidElement)
			return
		}
		if (!itemsAreValid())
			return store.set(responseMessage, { type: "alert", text: t("workOrders.itemsInvalidAlert") })

		const formData = new FormData(form)
		const data = {
			branch_id: branchID,
			customer_name: formData.get("customer_name"),
			customer_phone: formData.get("customer_phone"),
			customer_email: formData.get("customer_email"),
			assigned_to: formData.get("assigned_to") || null,
			title: formData.get("title"),
			description: formData.get("description"),
			job_type: formData.get("job_type"),
			site_address: formData.get("site_address"),
			property_type: formData.get("property_type"),
			vehicle_make: formData.get("vehicle_make"),
			vehicle_model: formData.get("vehicle_model"),
			vehicle_plate: formData.get("vehicle_plate"),
			scheduled_at: formData.get("scheduled_at") || null,
			notes: formData.get("notes"),
			discount: Number(discount) || 0,
			items: items.map(({ key, ...item }) => item),
		}

		setIsSubmitting(true)
		await addWorkOrder(data).then(() => {
			router.push(`/workOrders`)
			store.set(responseMessage, { type: "success", text: t("workOrders.createdMessage") })
		})
		.catch(() => setIsSubmitting(false))
	}

	return <>
		<Header title={t('workOrders.addTitle')} containerClass={"flex justify-between"} />
		<form onSubmit={formSubmit}>
			<div className="mt-6 card bg-base-100 border border-base-200 shadow-sm">
				<div className="card-body">
					<h2 className="card-title text-xl mb-4">
						<div className="w-1 h-6 bg-primary rounded me-2"></div>
						{t('workOrders.jobDetails')}
					</h2>
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('workOrders.customerName')}</span>
							</label>
							<input name="customer_name" data-rules="required" type="text" className="input input-bordered input-sm w-full" />
							<InputError messages={validErrors.customer_name} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('workOrders.customerPhone')}</span>
							</label>
							<input name="customer_phone" type="text" className="input input-bordered input-sm w-full" />
							<InputError messages={validErrors.customer_phone} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('workOrders.customerEmail')}</span>
							</label>
							<input name="customer_email" type="email" className="input input-bordered input-sm w-full" />
							<InputError messages={validErrors.customer_email} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('workOrders.title')}</span>
							</label>
							<input name="title" data-rules="required" type="text" className="input input-bordered input-sm w-full" />
							<InputError messages={validErrors.title} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('workOrders.jobType')}</span>
							</label>
							<input name="job_type" type="text" placeholder={t('workOrders.jobTypeHint')} className="input input-bordered input-sm w-full" />
							<InputError messages={validErrors.job_type} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('workOrders.siteAddress')}</span>
							</label>
							<input name="site_address" type="text" className="input input-bordered input-sm w-full" />
							<InputError messages={validErrors.site_address} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('workOrders.propertyType')}</span>
							</label>
							<input name="property_type" type="text" list="property_type_options" className="input input-bordered input-sm w-full" />
							<datalist id="property_type_options">
								<option value={t('workOrders.propertyTypes.residential')} />
								<option value={t('workOrders.propertyTypes.commercial')} />
								<option value={t('workOrders.propertyTypes.industrial')} />
								<option value={t('workOrders.propertyTypes.other')} />
							</datalist>
							<InputError messages={validErrors.property_type} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('workOrders.vehicleMake')}</span>
							</label>
							<input name="vehicle_make" type="text" className="input input-bordered input-sm w-full" />
							<InputError messages={validErrors.vehicle_make} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('workOrders.vehicleModel')}</span>
							</label>
							<input name="vehicle_model" type="text" className="input input-bordered input-sm w-full" />
							<InputError messages={validErrors.vehicle_model} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('workOrders.vehiclePlate')}</span>
							</label>
							<input name="vehicle_plate" type="text" className="input input-bordered input-sm w-full" />
							<InputError messages={validErrors.vehicle_plate} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('workOrders.assignedTo')}</span>
							</label>
							<select name="assigned_to" defaultValue={""} className="select select-bordered select-sm w-full">
								<option value="">{t('workOrders.unassigned')}</option>
								{staff?.map((staffMember: any) => (
									<option key={staffMember.id} value={staffMember.id}>{staffMember.fullname ?? `${staffMember.fname} ${staffMember.sname}`}</option>
								))}
							</select>
							<InputError messages={validErrors.assigned_to} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('workOrders.scheduledAt')}</span>
							</label>
							<input name="scheduled_at" type="datetime-local" className="input input-bordered input-sm w-full" />
							<InputError messages={validErrors.scheduled_at} />
						</div>
						<div className="lg:col-span-2">
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('workOrders.discount')}</span>
							</label>
							<input name="discount" type="number" step="0.01" min="0" value={discount} onChange={(ev) => setDiscount(ev.target.value)} className="input input-bordered input-sm w-full" />
							<InputError messages={validErrors.discount} />
						</div>
						<div className="lg:col-span-2">
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('workOrders.description')}</span>
							</label>
							<textarea name="description" className="textarea textarea-bordered w-full min-h-24"></textarea>
							<InputError messages={validErrors.description} />
						</div>
						<div className="lg:col-span-2">
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('workOrders.notes')}</span>
							</label>
							<textarea name="notes" className="textarea textarea-bordered w-full min-h-24"></textarea>
							<InputError messages={validErrors.notes} />
						</div>
					</div>
				</div>
			</div>

			<div className="mt-6 card bg-base-100 border border-base-200 shadow-sm" data-name="items">
				<div className="card-body">
					<div className="flex items-center justify-between mb-4">
						<h2 className="card-title text-xl">
							<div className="w-1 h-6 bg-primary rounded me-2"></div>
							{t('workOrders.lineItems')}
						</h2>
						<button type="button" className="btn btn-sm btn-primary" onClick={() => setItems(prev => [...prev, emptyItem()])}>
							<FontAwesomeIcon icon={faPlus} /> {t('workOrders.addLineBtn')}
						</button>
					</div>
					<InputError messages={validErrors.items} />

					<div className="overflow-x-auto">
						<table className="table table-sm w-full">
							<thead>
								<tr>
									<th>{t('workOrders.itemType')}</th>
									<th className="min-w-[12rem]">{t('workOrders.itemDescription')}</th>
									<th>{t('workOrders.quantity')}</th>
									<th>{t('workOrders.width')}</th>
									<th>{t('workOrders.height')}</th>
									<th>{t('workOrders.unit')}</th>
									<th>{t('workOrders.unitPrice')}</th>
									<th>{t('workOrders.lineTax')}</th>
									<th>{t('workOrders.lineTotal')}</th>
									<th></th>
								</tr>
							</thead>
							<tbody>
								{items.map((item) => {
									const isGlass = item.item_type === "glass"
									const isProduct = item.item_type === "product"
									return (
										<tr key={item.key}>
											<td>
												<select
													className="select select-bordered select-sm w-full"
													value={item.item_type}
													onChange={(ev) => updateItem(item.key, { item_type: ev.target.value as LineItem["item_type"], product_id: null, name: "" })}
												>
													<option value="product">{t('workOrders.itemTypes.product')}</option>
													<option value="service">{t('workOrders.itemTypes.service')}</option>
													<option value="glass">{t('workOrders.itemTypes.glass')}</option>
													<option value="custom">{t('workOrders.itemTypes.custom')}</option>
												</select>
											</td>
											<td>
												{isProduct ? (
													<select
														className="select select-bordered select-sm w-full"
														value={item.product_id ?? ""}
														onChange={(ev) => selectProduct(item.key, ev.target.value)}
													>
														<option value="" disabled>{t('chooseOption')}</option>
														{products?.map((product: any) => (
															<option key={product.id} value={product.id}>{product.name}</option>
														))}
													</select>
												) : (
													<input
														type="text"
														className="input input-bordered input-sm w-full"
														value={item.name}
														placeholder={t('workOrders.itemDescription')}
														onChange={(ev) => updateItem(item.key, { name: ev.target.value })}
													/>
												)}
											</td>
											<td>
												<input type="number" step="0.01" min="0" className="input input-bordered input-sm w-20" value={item.quantity} onChange={(ev) => updateItem(item.key, { quantity: ev.target.value })} />
											</td>
											<td>
												<input type="number" step="0.01" min="0" disabled={!isGlass} className="input input-bordered input-sm w-20" value={item.width ?? ""} onChange={(ev) => updateItem(item.key, { width: ev.target.value })} />
											</td>
											<td>
												<input type="number" step="0.01" min="0" disabled={!isGlass} className="input input-bordered input-sm w-20" value={item.height ?? ""} onChange={(ev) => updateItem(item.key, { height: ev.target.value })} />
											</td>
											<td>
												<input type="text" className="input input-bordered input-sm w-20" value={item.unit ?? ""} onChange={(ev) => updateItem(item.key, { unit: ev.target.value })} />
											</td>
											<td>
												<input type="number" step="0.01" min="0" className="input input-bordered input-sm w-24" value={item.unit_price} onChange={(ev) => updateItem(item.key, { unit_price: ev.target.value })} />
											</td>
											<td>
												<input type="number" step="0.01" min="0" className="input input-bordered input-sm w-24" value={item.line_tax ?? ""} onChange={(ev) => updateItem(item.key, { line_tax: ev.target.value })} />
											</td>
											<td className="font-semibold whitespace-nowrap">{formatCurrency(lineBase(item) + (Number(item.line_tax) || 0))}</td>
											<td>
												<button type="button" className="btn btn-sm btn-square btn-ghost text-error" onClick={() => removeItem(item.key)}>
													<FontAwesomeIcon icon={faTrash} />
												</button>
											</td>
										</tr>
									)
								})}
							</tbody>
						</table>
					</div>

					<div className="flex justify-end mt-4">
						<div className="w-full max-w-xs space-y-2">
							<div className="flex justify-between text-sm">
								<span className="text-base-content/70">{t('workOrders.subtotal')}</span>
								<span>{formatCurrency(subtotal)}</span>
							</div>
							<div className="flex justify-between text-sm">
								<span className="text-base-content/70">{t('workOrders.totalTax')}</span>
								<span>{formatCurrency(totalTax)}</span>
							</div>
							<div className="flex justify-between text-sm">
								<span className="text-base-content/70">{t('workOrders.discount')}</span>
								<span>-{formatCurrency(Number(discount) || 0)}</span>
							</div>
							<div className="flex justify-between font-bold text-lg border-t border-base-300 pt-2">
								<span>{t('workOrders.grandTotal')}</span>
								<span className="text-primary">{formatCurrency(grandTotal)}</span>
							</div>
						</div>
					</div>

					<div className="card-actions justify-end mt-6">
						<button className="btn btn-primary" type="submit" disabled={isSubmitting}>
							{isSubmitting && <span className="loading loading-spinner"></span>}
							{t('workOrders.addFormBtn')}
						</button>
					</div>
				</div>
			</div>
		</form>
	</>
}
