"use client"

import { useRouter } from "next/navigation"
import { fileUrl } from "@/_utils/fileUrl"
import { ChangeEvent, useEffect, useState } from "react"

import { getProducts, getSale, editSale } from "@/app/(app)/sales/_sale"
import { useAtom } from "jotai"
import { branch, posRegister, responseMessage, store, validationErrors } from "@/_state/globalStore"
import { useTranslation } from "next-i18next"
import Header from "@/app/(app)/_components/header"
import InputError from "@/_components/inputError"
import { useBreadcrumbLabel } from "@/hooks/useBreadcrumbLabel"
import { formatCurrency } from "@/_helpers/currency"

/**
 * Owner correction: edit an existing sale. Same cart UI as the POS, pre-loaded
 * with the sale's lines. Submitting reverses the original stock and re-applies
 * the new cart server-side (editSale), so inventory + COGS stay correct.
 */
export default function SaleEdit({ params }: any) {
	const { t } = useTranslation('common')
	const { sale_id }: any = params
	const router = useRouter()
	const [products, setProducts] = useState([])
	const [searchProductResults, setSearchProductResults] = useState([])
	const [cart, setCart] = useState<any[]>([])
	const [productInput, setProductInput] = useState('')
	const [total, setTotal] = useState(0)
	const [branchID] = useAtom(branch)
	const [posRegisterID] = useAtom(posRegister)
	const [customerName, setCustomerName] = useState("")
	const [customerPhone, setCustomerPhone] = useState("")
	const [paymentMethod, setPaymentMethod] = useState("")
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [validErrors] = useAtom(validationErrors)
	const [sale, setSale] = useState<any>({})
	useBreadcrumbLabel(sale)

	useEffect(() => {
		getProducts(branchID, posRegisterID).then((returnData: any) => {
			setProducts(returnData.response.map((product: any) => ({
				...product,
				quantity: product.inventories?.reduce((t: number, inv: any) => t + Number(inv.quantity), 0),
			})))
		})
	}, [])

	useEffect(() => {
		getSale(Number(sale_id)).then((returnData: any) => {
			const inv: any = returnData.response
			setSale(inv)
			setCustomerName(inv.customer_name ?? "")
			setCustomerPhone(inv.customer_phone ?? "")
			setPaymentMethod(inv.payment_method ?? "")
			// Rebuild the cart from the sale's lines, keeping the actual sold unit price.
			setCart((inv.invoice_items ?? []).map((it: any) => {
				const sellGst = Number(it.item?.sell_gst ?? 0)
				return {
					...(it.item ?? {}),
					id: it.item_id,
					name: it.item?.name,
					sell_gst: sellGst,
					sell_price: Number(it.price) - sellGst,
					cost_price: Number(it.cost_price ?? it.item?.cost_price ?? 0),
					cost_gst: Number(it.cost_gst ?? it.item?.cost_gst ?? 0),
					fixed_price: it.item?.fixed_price ?? 1,
					quantity: Number(it.quantity),
				}
			}))
		})
	}, [sale_id])

	useEffect(() => {
		let sum = 0
		cart?.forEach((item: any) => { sum += (Number(item.sell_price) + Number(item.sell_gst)) * item.quantity })
		setTotal(sum)
	}, [cart])

	const handleProductSearch = (ev: ChangeEvent<HTMLInputElement>) => {
		const value = ev.target.value
		setProductInput(value)
		if (value.length >= 1 && value[0] != ' ')
			setSearchProductResults(products?.filter((p: any) => p.name.toLowerCase().includes(value.toLowerCase())))
		else if (value.length === 0)
			setSearchProductResults([])
	}

	const handleCountInputChange = (ev: ChangeEvent<HTMLInputElement>, product: any) => {
		const newQuantity = ev.target.value
		if (Number(newQuantity) === 0)
			setCart(prev => prev.filter((item) => item.id !== product.id))
		setCart(prev => prev.map(item => item.id === product.id ? { ...item, quantity: Number(newQuantity) } : item))
	}

	const handlePriceInputChange = (ev: ChangeEvent<HTMLInputElement>, product: any) => {
		const newPrice = ev.target.value
		setCart(prev => prev.map(item => item.id === product.id ? { ...item, sell_price: newPrice === '' ? '' : Number(newPrice) } : item))
	}

	const handleAddClick = (product: any) => {
		let found = false
		setCart(prev => {
			const updated = prev.map((item) => {
				if (item.id === product.id) {
					found = true
					if (item.quantity === product.quantity) return item
					return { ...item, quantity: item.quantity + 1 }
				}
				return item
			})
			if (!found) return [...updated, { ...product, quantity: 1 }]
			return updated
		})
	}

	const handleSubClick = (product: any) => {
		if (product.quantity > 1)
			return setCart(prev => prev.map((item) => item.id === product.id ? { ...item, quantity: item.quantity - 1 } : item))
		setCart(prev => prev.filter((item) => item.id !== product.id))
	}

	const submit = async () => {
		if (!cart.length)
			return store.set(responseMessage, { type: 'alert', text: t('sales.alertProduct') })
		const data = {
			items: cart.map((item: any) => ({ ...item, sell_price: Number(item.sell_price) || 0 })),
			total_price: total,
			customer_name: customerName,
			customer_phone: customerPhone,
			payment_method: paymentMethod,
		}
		setIsSubmitting(true)
		await editSale(Number(sale_id), data).then(() => {
			router.push('/sales')
			store.set(responseMessage, { type: 'success', text: t('sales.editSuccess') })
		}).catch(() => setIsSubmitting(false))
	}

	return <>
		<Header title={t('sales.editTitle')} containerClass={"flex justify-between"} />
		<div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
			<div className="lg:col-span-3">
				<div className="card bg-base-100 border border-base-200 shadow-sm">
					<div className="card-body">
						<h2 className="card-title text-xl mb-4"><div className="w-1 h-6 bg-primary rounded me-2"></div>{t('sales.customer')}</h2>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
							<label className="form-control w-full">
								<div className="label"><span className="label-text font-semibold">{t('sales.customerName')}</span></div>
								<input type="text" value={customerName} onChange={(ev) => setCustomerName(ev.target.value)} className="input input-bordered input-sm w-full" />
							</label>
							<label className="form-control w-full">
								<div className="label"><span className="label-text font-semibold">{t('sales.customerPhone')}</span></div>
								<input type="text" value={customerPhone} onChange={(ev) => setCustomerPhone(ev.target.value)} className="input input-bordered input-sm w-full" />
							</label>
						</div>
					</div>
				</div>
			</div>

			<div className="lg:col-span-2">
				<div className="card bg-base-100 border border-base-200 shadow-sm">
					<div className="card-body">
						<h2 className="card-title text-xl mb-4"><div className="w-1 h-6 bg-primary rounded me-2"></div>{t('sales.products')}</h2>
						<div className="mb-6">
							<input type="text" onChange={handleProductSearch} value={productInput} placeholder={t('sales.productSearch')} className="input input-bordered input-sm w-full" />
						</div>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							{(searchProductResults.length >= 1 ? searchProductResults : products)?.map((product: any) => {
								const outOfStock = product.quantity < 1
								const totalPrice = Number(product.sell_price) + Number(product.sell_gst)
								return (
									<div key={product.id} className="card bg-base-200 border border-base-300">
										<div className="card-body p-4">
											<div className="flex items-center gap-4">
												{product.file?.url && (
													<div className="flex-shrink-0"><img src={fileUrl(product.file?.url)} alt="product-image" className="w-16 h-16 rounded-lg object-cover" /></div>
												)}
												<div className="flex-1">
													<h3 className="font-bold text-lg">{product.name}</h3>
													<div className="flex justify-between items-center mt-2">
														<span className="font-bold text-primary">{formatCurrency(totalPrice)}</span>
														{outOfStock && <span className="badge badge-error badge-sm">{t('sales.outOfStock')}</span>}
													</div>
												</div>
											</div>
											<div className="card-actions justify-end mt-3">
												<button className="btn btn-sm btn-primary" type="button" disabled={outOfStock} onClick={() => handleAddClick(product)}>
													{outOfStock ? t('sales.outOfStock') : t('sales.addProductBtn')}
												</button>
											</div>
										</div>
									</div>
								)
							})}
						</div>
					</div>
				</div>
			</div>

			<div className="lg:col-span-1">
				<div className="card bg-base-100 border border-base-200 shadow-sm sticky top-6">
					<div className="card-body">
						<h2 className="card-title text-xl mb-4"><div className="w-1 h-6 bg-primary rounded me-2"></div>{t('sales.cart')}</h2>
						<div className="space-y-4 max-h-96 overflow-y-auto">
							{cart?.length > 0 ? cart.map((cartItem: any) => {
								const itemTotal = (Number(cartItem.sell_price) + Number(cartItem.sell_gst)) * cartItem.quantity
								const product = products.find((p: any) => p.id === cartItem.id)
								return (
									<div key={cartItem.id} className="border-b border-base-300 pb-4 last:border-b-0">
										<div className="flex justify-between items-start mb-2">
											<div>
												<h4 className="font-semibold">{cartItem.name}</h4>
												<div className="flex items-center gap-2 mt-1">
													<span className="text-sm text-base-content/60">{t('sales.unitPrice')}</span>
													<input type="number" step="any" min="0" className="input input-bordered input-sm input-xs w-24 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={cartItem.sell_price} onChange={(ev) => handlePriceInputChange(ev, cartItem)} />
												</div>
											</div>
											<button className="btn btn-xs btn-error btn-outline" onClick={() => setCart(prev => prev.filter((item) => item.id !== cartItem.id))}>×</button>
										</div>
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-2">
												<button className="btn btn-xs btn-primary" onClick={() => handleSubClick(cartItem)}>-</button>
												<input type="number" step="any" min="0" className="input input-bordered input-sm input-xs w-12 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={cartItem.quantity} onChange={(ev) => handleCountInputChange(ev, cartItem)} />
												<button className="btn btn-xs btn-primary" onClick={() => handleAddClick(product)}>+</button>
											</div>
											<span className="font-bold">{formatCurrency(itemTotal)}</span>
										</div>
									</div>
								)
							}) : <div className="text-center text-base-content/60 py-8">{t('sales.emptyCart')}</div>}
						</div>
						{cart?.length > 0 && (
							<div className="border-t border-base-300 pt-4 mt-4">
								<div className="flex justify-between items-center text-lg font-bold mb-4"><span>{t('sales.total')}</span><span className="text-primary">{formatCurrency(total)}</span></div>
								<div className="space-y-3 mb-4">
									<label className="flex items-center gap-3 cursor-pointer">
										<input name="payment_method" type="radio" className="radio radio-primary" value="cash" checked={paymentMethod === "cash"} onChange={(e) => setPaymentMethod(e.target.value)} />
										<span className="label-text">{t('sales.cash')}</span>
									</label>
									<label className="flex items-center gap-3 cursor-pointer">
										<input name="payment_method" type="radio" className="radio radio-primary" value="visa" checked={paymentMethod === "visa"} onChange={(e) => setPaymentMethod(e.target.value)} />
										<span className="label-text">{t('sales.visa')}</span>
									</label>
									<InputError messages={validErrors.payment_method} />
								</div>
								<button className="btn btn-sm btn-primary w-full" type="button" onClick={submit} disabled={isSubmitting}>
									{isSubmitting && <span className="loading loading-spinner"></span>}
									{t('sales.editFormBtn')} {formatCurrency(total)}
								</button>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	</>
}
