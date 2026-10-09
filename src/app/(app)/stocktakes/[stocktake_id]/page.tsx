"use client"

import { FormEvent, useEffect, useMemo, useRef, useState } from "react"
import { useBreadcrumbLabel } from "@/hooks/useBreadcrumbLabel"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faMagnifyingGlass, faXmark, faFloppyDisk, faCircleCheck, faTriangleExclamation, faCircleQuestion } from "@fortawesome/free-solid-svg-icons"

import { getStocktake, branchProductCategories, addStocktakeItem, editStocktake, finishStocktake } from "@/app/(app)/stocktakes/_stocktake"
import { Stocktake } from "@/app/(app)/stocktakes/_stocktake"
import { useAtom } from "jotai"
import { branch, posRegister, responseMessage, store, validationErrors } from "@/_state/globalStore"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/auth"
import InputError from "@/_components/inputError"
import { useTranslation } from "next-i18next"
import Header from "@/app/(app)/_components/header"
import { scrollToFirstInvalidElement, validateForm } from "@/app/_helpers/validation"
import { useConfirm } from "@/_components/useConfirm"

type StocktakeItemRecord = { product_id: number; current_quantity: number; notes?: string | null }
type FlatProduct = { id: number; name: string; categoryId: any; categoryName: string; systemQty: number }
type RowEdit = { current_quantity: string; notes: string }

export default function StocktakeItemsAdd({ params }: any) {
	const { t } = useTranslation('common')
	const { stocktake_id }: any = params
	const [data, setData] = useState<Stocktake>({} as Stocktake)
	useBreadcrumbLabel(data)
	const [categories, setCategories] = useState<any>([])
	const [ branchID ] = useAtom(branch)
	const { user } = useAuth({ middleware: "auth" })
	const router = useRouter()
	const [isUpdateSTSubmitting , setIsUpdateSTSubmitting] = useState(false)
	const [isFinishSTSubmitting , setIsFinishSTSubmitting] = useState(false)
	const [validErrors] = useAtom(validationErrors)
	const [ posRegisterID ] = useAtom(posRegister)
	const { confirm, confirmModal } = useConfirm()
	const editModalRef = useRef<HTMLInputElement>(null)
	const canEditItems = user.permissions.includes('create stocktake_items')

	// Saved stocktake items, keyed by product_id - the source of truth for coverage/status.
	const [items, setItems] = useState<Record<number, StocktakeItemRecord>>({})
	// In-progress row inputs, keyed by product_id - seeded from saved items (else system qty).
	const [rowEdits, setRowEdits] = useState<Record<number, RowEdit>>({})
	const [savingRow, setSavingRow] = useState<Record<number, boolean>>({})

	const [search, setSearch] = useState('')
	const [categoryFilter, setCategoryFilter] = useState('')
	const [uncountedOnly, setUncountedOnly] = useState(false)

	useEffect(() => {
		getStocktake(stocktake_id).then((returnData: any) => {
			if(returnData.response.status !== 0)
				router.push('/stocktakes')

			setData(returnData.response)
			const seeded: Record<number, StocktakeItemRecord> = {}
			returnData.response.stocktake_items?.forEach((item: any) => {
				seeded[item.product_id] = { product_id: item.product_id, current_quantity: item.current_quantity, notes: item.notes }
			})
			setItems(seeded)
		})

		branchProductCategories(branchID, posRegisterID).then((returnData: any) => {
			setCategories(returnData.response)
		})
	}, [])

	const products: FlatProduct[] = useMemo(() => (
		categories?.flatMap((category: any) =>
			(category.products ?? []).map((product: any) => ({
				id: product.id,
				name: product.name,
				categoryId: category.id,
				categoryName: category.name,
				systemQty: product.inventories?.reduce((total: number, inv: any) => total + Number(inv.quantity), 0) ?? 0,
			}))
		) ?? []
	), [categories])

	// Seed each row's editable inputs the first time a product/saved-item appears -
	// never overwrites an in-progress edit the user hasn't saved yet.
	useEffect(() => {
		setRowEdits((prev) => {
			let changed = false
			const next = { ...prev }
			products.forEach((product) => {
				if (next[product.id]) return
				const saved = items[product.id]
				next[product.id] = {
					current_quantity: String(saved ? saved.current_quantity : product.systemQty),
					notes: saved?.notes ?? '',
				}
				changed = true
			})
			return changed ? next : prev
		})
	}, [products, items])

	const countedCount = Object.keys(items).length

	const filteredProducts = useMemo(() => {
		const q = search.trim().toLowerCase()
		return products.filter((product) => {
			if (q && !product.name.toLowerCase().includes(q)) return false
			if (categoryFilter && String(product.categoryId) !== categoryFilter) return false
			if (uncountedOnly && items[product.id] !== undefined) return false
			return true
		})
	}, [products, search, categoryFilter, uncountedOnly, items])

	const saveRow = async (product: FlatProduct) => {
		const edit = rowEdits[product.id]
		if (!edit || edit.current_quantity === '' || isNaN(Number(edit.current_quantity))) return

		const currentQuantity = parseFloat(edit.current_quantity)
		const formData = new FormData()
		formData.append('branch_id', String(branchID))
		formData.append('stocktake_id', String(stocktake_id))
		formData.append('product_id', String(product.id))
		formData.append('original_quantity', String(product.systemQty))
		formData.append('current_quantity', String(currentQuantity))
		formData.append('notes', edit.notes ?? '')

		setSavingRow((prev) => ({ ...prev, [product.id]: true }))
		await addStocktakeItem(formData).then(() => {
			setItems((prev) => ({ ...prev, [product.id]: { product_id: product.id, current_quantity: currentQuantity, notes: edit.notes } }))
			store.set(responseMessage, { type: 'success', text: `${t('stocktakes.saved')}` })
		})
		.finally(() => setSavingRow((prev) => ({ ...prev, [product.id]: false })))
	}

	const updateStocktake = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const form = event.currentTarget
        const {errors, firstInvalidElement} = validateForm(form, t)
        if (Object.keys(errors).length > 0) {
            store.set(validationErrors, errors)
            if (firstInvalidElement) scrollToFirstInvalidElement(firstInvalidElement)
            return
        }

        const formData = new FormData(form)
		setIsUpdateSTSubmitting(true)
		await editStocktake(stocktake_id, formData).then(() => {
			setData((prev) => ({
				...prev,
				name: String(formData.get('name') ?? ''),
				stocktake_date: String(formData.get('stocktake_date') ?? ''),
				notes: String(formData.get('notes') ?? ''),
			}))
			if (editModalRef.current) editModalRef.current.checked = false
			store.set(responseMessage, { type: 'success', text: `${t('stocktakes.updatedMessage')}` });
		})
		.finally(() => setIsUpdateSTSubmitting(false))
	}

	const finishStock = async () => {
        const productsDetails = products.map((product) => ({
            product_id: product.id,
            original_quantity: product.systemQty,
        }))

        if (productsDetails.length === 0)
            return store.set(responseMessage, { type: 'alert', text: t('stocktakes.alertProduct') });

        const uncountedCount = products.filter((product) => items[product.id] === undefined).length
        if (uncountedCount > 0 && !await confirm(t('stocktakes.finishUncountedWarning', { count: uncountedCount })))
            return

        setIsFinishSTSubmitting(true)
        await finishStocktake(stocktake_id, { products: productsDetails, branch_id: branchID }).then(() => {
            router.push('/stocktakes')
            store.set(responseMessage, { type: 'success', text: `${t('stocktakes.finishedMessage')}` });
        })
        .catch(() => setIsFinishSTSubmitting(false))
	}

	return <>
		{confirmModal}

		<Header
			title={data.name}
			containerClass={"flex justify-between"}
		/>

		<div className="mt-6 card bg-base-100 border border-base-200 shadow-sm">
			<div className="card-body">
				<h2 className="card-title text-xl mb-4">
					<div className="w-1 h-6 bg-primary rounded me-2"></div>
					{t('stocktakes.details')}
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div className="flex flex-col">
						<span className="font-semibold text-base-content/70">{t('stocktakes.stocktakeDate')}</span>
						<span className="text-base-content">{data.stocktake_date}</span>
					</div>
					<div className="flex flex-col">
						<span className="font-semibold text-base-content/70">{t('stocktakes.notes')}</span>
						<span className="text-base-content">{data.notes || '-'}</span>
					</div>
                    <div className="flex items-end">
                        {user.permissions.includes('update stocktakes') && (
                        <label htmlFor="edit_modal" className="btn btn-sm btn-primary w-full">
                            {t('stocktakes.editmodalBtn')}
                        </label>
                        )}
                    </div>
				</div>
			</div>
		</div>

		<input ref={editModalRef} type="checkbox" id="edit_modal" className="modal-toggle" />
		<div className="modal" role="dialog">
			<div className="modal-box max-w-2xl">
				<div className="card bg-base-100 border border-base-200 shadow-sm">
					<div className="card-body">
						<h3 className="card-title text-xl mb-4">
							<div className="w-1 h-6 bg-primary rounded me-2"></div>
							{t('stocktakes.editTitle')}
						</h3>
						<form onSubmit={updateStocktake}>
							<input name="branch_id" type="hidden" value={branchID}/>
							<input name="stocktake_id" type="hidden" value={stocktake_id}/>

							<div className="space-y-4">
								<div>
									<label className="label justify-start">
										<span className="label-text font-semibold required">{t('stocktakes.name')}</span>
									</label>
									<input name="name" data-rules="required" type="text" className="input input-bordered input-sm w-full" defaultValue={data.name} />
									<InputError messages={validErrors.name} />
								</div>
								<div>
									<label className="label justify-start">
										<span className="label-text font-semibold required">{t('stocktakes.stocktakeDate')}</span>
									</label>
									<input name="stocktake_date" data-rules="required" type="date" className="input input-bordered input-sm w-full" defaultValue={data.stocktake_date} />
									<InputError messages={validErrors.stocktake_date} />
								</div>
								<div>
									<label className="label justify-start">
										<span className="label-text font-semibold">{t('stocktakes.notes')}</span>
									</label>
									<textarea name="notes" className="textarea textarea-bordered w-full min-h-32">
										{data.notes ?? ''}
									</textarea>
									<InputError messages={validErrors.notes} />
								</div>
							</div>

							<div className="card-actions justify-end mt-6">
                                <button className="btn btn-primary" type="submit" disabled={isUpdateSTSubmitting}>
                                    {isUpdateSTSubmitting && <span className="loading loading-spinner"></span>}
                                    {t('stocktakes.editFormBtn')}
                                </button>
							</div>
						</form>
					</div>
				</div>
			</div>
			<label className="modal-backdrop" htmlFor="edit_modal"></label>
		</div>

		<div className="mt-6 flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3">
			<div className="relative w-full sm:w-auto sm:max-w-xs">
				<FontAwesomeIcon icon={faMagnifyingGlass} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-xs opacity-50" />
				<input
					type="text"
					className="input input-sm input-bordered w-full ps-8 pe-8"
					placeholder={t('stocktakes.search')}
					aria-label={t('stocktakes.search')}
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>
				{search && (
					<button type="button" className="absolute end-2 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100" aria-label={t('baseTable.searchClear')} onClick={() => setSearch('')}>
						<FontAwesomeIcon icon={faXmark} className="text-xs" />
					</button>
				)}
			</div>
			<select
				className="select select-sm select-bordered"
				aria-label={t('stocktakes.category')}
				value={categoryFilter}
				onChange={(e) => setCategoryFilter(e.target.value)}
			>
				<option value="">{t('stocktakes.allCategories')}</option>
				{categories?.map((category: any) => (
					<option key={category.id} value={String(category.id)}>{category.name}</option>
				))}
			</select>
			<label className="label cursor-pointer gap-2 py-0">
				<input type="checkbox" className="checkbox checkbox-sm" checked={uncountedOnly} onChange={(e) => setUncountedOnly(e.target.checked)} />
				<span className="label-text">{t('stocktakes.filterUncounted')}</span>
			</label>
			<div className="badge badge-lg badge-outline sm:ms-auto">
				{t('stocktakes.coverage', { counted: countedCount, total: products.length })}
			</div>
		</div>

		<div className="mt-4 bg-base-100 rounded-lg shadow-sm border max-w-full">
			<div className="overflow-auto max-h-[70vh]">
				<table className="table table-zebra table-auto w-full">
					<thead className="bg-base-200 sticky top-0 z-10">
						<tr>
							<th>{t('stocktakes.product')}</th>
							<th>{t('stocktakes.category')}</th>
							<th>{t('stocktakes.systemQty')}</th>
							<th>{t('stocktakes.counted')}</th>
							<th>{t('stocktakes.difference')}</th>
							<th>{t('stocktakes.status')}</th>
							<th>{t('stocktakes.notes')}</th>
							{canEditItems && <th className="w-16">{t('stocktakes.save')}</th>}
						</tr>
					</thead>
					<tbody>
						{filteredProducts.map((product) => {
							const saved = items[product.id]
							const edit = rowEdits[product.id] ?? { current_quantity: String(product.systemQty), notes: '' }
							const status: 'uncounted' | 'match' | 'mismatch' = saved === undefined
								? 'uncounted'
								: (saved.current_quantity === product.systemQty ? 'match' : 'mismatch')
							const liveCounted = (edit.current_quantity === '' || isNaN(Number(edit.current_quantity)))
								? product.systemQty
								: parseInt(edit.current_quantity, 10)
							const diff = liveCounted - product.systemQty
							const diffColor = status === 'uncounted' ? 'text-base-content/50' : (diff === 0 ? 'text-success' : 'text-warning')
							const statusBadge = status === 'uncounted'
								? { icon: faCircleQuestion, classes: 'badge-ghost', label: t('stocktakes.statusUncounted') }
								: status === 'match'
									? { icon: faCircleCheck, classes: 'badge-success', label: t('stocktakes.statusMatch') }
									: { icon: faTriangleExclamation, classes: 'badge-warning', label: t('stocktakes.statusMismatch') }

							return (
								<tr key={product.id} className="hover">
									<td className="max-w-xs truncate" title={product.name}>{product.name}</td>
									<td className="max-w-xs truncate" title={product.categoryName}>{product.categoryName}</td>
									<td>{product.systemQty}</td>
									<td>
										<input
											type="number"
											inputMode="decimal"
											min="0"
											step="any"
											className="input input-bordered input-sm w-24"
											value={edit.current_quantity}
											onChange={(e) => setRowEdits((prev) => ({ ...prev, [product.id]: { ...edit, current_quantity: e.target.value } }))}
											disabled={!canEditItems}
										/>
									</td>
									<td className={`font-semibold ${diffColor}`}>{diff > 0 ? `+${diff}` : diff}</td>
									<td>
										<span className={`badge ${statusBadge.classes} gap-1`}>
											<FontAwesomeIcon icon={statusBadge.icon} className="text-xs" />
											{statusBadge.label}
										</span>
									</td>
									<td>
										<input
											type="text"
											className="input input-bordered input-sm w-full min-w-32"
											value={edit.notes}
											onChange={(e) => setRowEdits((prev) => ({ ...prev, [product.id]: { ...edit, notes: e.target.value } }))}
											disabled={!canEditItems}
										/>
									</td>
									{canEditItems && (
										<td>
											<button
												type="button"
												className="btn btn-sm btn-primary btn-square"
												onClick={() => saveRow(product)}
												disabled={savingRow[product.id]}
											>
												{savingRow[product.id]
													? <span className="loading loading-spinner loading-xs"></span>
													: <FontAwesomeIcon icon={faFloppyDisk} />}
											</button>
										</td>
									)}
								</tr>
							)
						})}
						{filteredProducts.length === 0 && (
							<tr>
								<td colSpan={8} className="text-center py-8 text-base-content/60">{t('baseTable.noData')}</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>

		<div className="card-actions justify-center mt-6">
			{user.permissions.includes('finish stocktakes') && (
				<button className="btn btn-sm btn-primary" onClick={finishStock} disabled={isFinishSTSubmitting}>
					{isFinishSTSubmitting && <span className="loading loading-spinner"></span>}
					{t('stocktakes.finishStocktakeBtn')}
				</button>
			)}
		</div>
	</>
}
