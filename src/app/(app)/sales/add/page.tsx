"use client"

import { useRouter } from "next/navigation"
import { fileUrl } from "@/_utils/fileUrl"
import { ChangeEvent, useEffect, useState } from "react"

import { addSales, getProducts } from "@/app/(app)/sales/_sale"
import { useAtom } from "jotai"
import { activePosSession, branch, posRegister, responseMessage, store, validationErrors } from "@/_state/globalStore"
import { useTranslation } from "next-i18next"
import InputError from "@/_components/inputError"
import Header from "@/app/(app)/_components/header"
import StartPosSessionModal from "@/app/(app)/pos-sessions/_components/startPosSessionModal"
import { useAuth } from "@/hooks/auth"
import { formatCurrency } from "@/_helpers/currency"

export default function SalesAdd() {
    const { t } = useTranslation('common')
	const [products, setProducts] = useState([])
	const [searchProductResults, setSearchProductResults] = useState([])
	const [cart, setCart] = useState([])
	const [productInput, setProductInput] = useState('')
	const [total, setTotal] = useState(0)
	const [ branchID ] = useAtom(branch)
	const router = useRouter()
	const [customerName, setCustomerName] = useState("")
	const [customerPhone, setCustomerPhone] = useState("")
	const [isSubmitting , setIsSubmitting] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState("")
	const [validErrors] = useAtom(validationErrors)
    const [isStartPosSessionModalOpen, setIsStartPosSessionModalOpen] = useState(false)
	const { user } = useAuth({ middleware: "auth" })
	const [ posRegisterID ] = useAtom(posRegister)
	const [ activePosSessionID ] = useAtom(activePosSession)

    useEffect(() => {
        if (activePosSessionID !== -1)
            return setIsStartPosSessionModalOpen(false)
            
        setIsStartPosSessionModalOpen(true)
    }, [activePosSessionID])
    
	const getList = () => {
		getProducts(branchID, posRegisterID).then((returnData: any) => {
			setProducts(
                returnData.response.map((product: any) => ({
                    ...product,
                    quantity: product.inventories?.reduce((total: number, inv: any) => total + Number(inv.quantity), 0)
                }))
            )
		})	
	}
    
	useEffect(() => {
		getList()
	}, [])

	useEffect(() => {
		setTotal(0)
		cart?.map((item: any) => {
			setTotal(prev => prev + (Number(item.sell_price) + Number(item.sell_gst)) * item.quantity)
		})
	}, [cart])

	const handleProductSearch = (ev: ChangeEvent<HTMLInputElement>) => {
		const value = ev.target.value
		setProductInput(value)
		if (value.length >= 1 && value[0] != ' ')
			setSearchProductResults(products?.filter((product: any) => product.name.toLowerCase().includes(value.toLowerCase())))
		else if (value.length === 0)
			setSearchProductResults([])
	}

	const handleCountInputChange = (ev: ChangeEvent<HTMLInputElement>, product: any) => {
		const newQuantity = ev.target.value
		if(Number(newQuantity) === 0)
			setCart(prev => prev.filter((item) => item.id !== product.id))

		setCart(prev =>
			prev.map(item =>
				item.id === product.id ? { ...item, quantity: Number(newQuantity) } : item
			)
		)
	}

	const handleAddClick = (product :any) => {
		let found = false
		setCart(prev => {
            const updatedCart = prev.map((item) => {
                if (item.id === product.id) {
                    found = true
                    if (item.quantity === product.quantity) return item
					return {...item, quantity: item.quantity + 1}
				}
				return item
			})

			if (!found) {
				return [...updatedCart, {...product, quantity: 1}]
			}
			return updatedCart
		})
	}					

	const handleSubClick = (product: any) => {
		if (product.quantity > 1)
			return setCart(prev => prev.map((item) => {
				if(item.id === product.id)
					return {...item, quantity: item.quantity -1}
				return item
			}))
					
		setCart(prev => prev.filter((item) => item.id !== product.id))
	}

	const submitButton = async () => {
		if (!cart.length)
            return store.set(responseMessage, { type: 'alert', text: t('sales.alertProduct') })

        const data = {
            items: cart,
            branch_id: branchID,
            total_price: total,
            customer_name: customerName,
            customer_phone: customerPhone,
            payment_method: paymentMethod,
            pos_register_id: posRegisterID,
            pos_register_session_id: activePosSessionID
        }
        setIsSubmitting(true)
        await addSales(data).then(() => {
            router.push('/sales')
        })
        .catch(() => setIsSubmitting(false))
	}

	return <>
        <StartPosSessionModal 
            isOpen={isStartPosSessionModalOpen} 
            onClose={() => window.history.back()}
            cancelBtn={{ display: true, label: t('back') }}
        />

		<Header
			title={t('sales.addTitle')}
			containerClass={"flex justify-between"}
		/>
		<div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
			{/* Customer Contact Section — optional guest contact, no Member account */}
			<div className="lg:col-span-3">
				<div className="card bg-base-100 border border-base-200 shadow-sm">
					<div className="card-body">
						<h2 className="card-title text-xl mb-4">
							<div className="w-1 h-6 bg-primary rounded me-2"></div>
							{t('sales.customer')}
						</h2>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
							<label className="form-control w-full">
								<div className="label">
									<span className="label-text font-semibold">{t('sales.customerName')}</span>
								</div>
								<input
									type="text"
									value={customerName}
									onChange={(ev) => setCustomerName(ev.target.value)}
									className="input input-bordered input-sm w-full"
								/>
								<InputError messages={validErrors.customer_name} />
							</label>
							<label className="form-control w-full">
								<div className="label">
									<span className="label-text font-semibold">{t('sales.customerPhone')}</span>
								</div>
								<input
									type="text"
									value={customerPhone}
									onChange={(ev) => setCustomerPhone(ev.target.value)}
									className="input input-bordered input-sm w-full"
								/>
								<InputError messages={validErrors.customer_phone} />
							</label>
						</div>
					</div>
				</div>
			</div>

			{/* Products Section */}
			<div className="lg:col-span-2">
				<div className="card bg-base-100 border border-base-200 shadow-sm">
					<div className="card-body">
						<h2 className="card-title text-xl mb-4">
							<div className="w-1 h-6 bg-primary rounded me-2"></div>
							{t('sales.products')}
						</h2>
						
						<div className="mb-6">
							<input 
								type="text" 
								onChange={handleProductSearch} 
								value={productInput} 
								placeholder={t('sales.productSearch')} 
								className="input input-bordered input-sm w-full" 
							/>
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
													<div className="flex-shrink-0">
														<img 
															src={fileUrl(product.file?.url)} 
															alt="product-image" 
															className="w-16 h-16 rounded-lg object-cover"
														/>
													</div>
												)}
												
												<div className="flex-1">
													<h3 className="font-bold text-lg">{product.name}</h3>
													<div className="flex justify-between items-center mt-2">
														<span className="font-bold text-primary">{formatCurrency(totalPrice)}</span>
														{outOfStock && (
															<span className="badge badge-error badge-sm">{t('sales.outOfStock')}</span>
														)}
													</div>
												</div>
											</div>
											
											<div className="card-actions justify-end mt-3">
												<button 
													className="btn btn-sm btn-primary" 
													type="button" 
													disabled={outOfStock} 
													onClick={() => handleAddClick(product)}
												>
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

			{/* Cart Section */}
			<div className="lg:col-span-1">
				<div className="card bg-base-100 border border-base-200 shadow-sm sticky top-6">
					<div className="card-body">
						<h2 className="card-title text-xl mb-4">
							<div className="w-1 h-6 bg-primary rounded me-2"></div>
							{t('sales.cart')}
						</h2>

						<div className="space-y-4 max-h-96 overflow-y-auto">
							{cart?.length > 0 ? 
								cart.map((cartItem: any) => {
									const itemTotal = (Number(cartItem.sell_price) + Number(cartItem.sell_gst)) * cartItem.quantity
                                    const product = products.find((product) => product.id === cartItem.id)
									
									return (
										<div key={cartItem.id} className="border-b border-base-300 pb-4 last:border-b-0">
											<div className="flex justify-between items-start mb-2">
												<div>
													<h4 className="font-semibold">{cartItem.name}</h4>
													<p className="text-sm text-base-content/60">{formatCurrency(Number(cartItem.sell_price) + Number(cartItem.sell_gst))} {t('sales.each')}</p>
												</div>
												<button 
													className="btn btn-xs btn-error btn-outline" 
													onClick={() => setCart(prev => prev.filter((item) => item.id !== cartItem.id))}
												>
													×
												</button>
											</div>
											
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-2">
													<button 
														className="btn btn-xs btn-primary" 
														onClick={() => handleSubClick(cartItem)}
													>
														-
													</button>
													<input
														type="number"
														step="any"
														min="0"
														className="input input-bordered input-sm input-xs w-12 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
														value={cartItem.quantity}
														onChange={(ev) => handleCountInputChange(ev, cartItem)}
													/>
													<button 
														className="btn btn-xs btn-primary" 
														onClick={() => handleAddClick(product)}
													>
														+
													</button>
												</div>
												<span className="font-bold">{formatCurrency(itemTotal)}</span>
											</div>
										</div>
									)
								}) : (
								<div className="text-center text-base-content/60 py-8">
									{t('sales.emptyCart')}
								</div>
							)}
						</div>

						{cart?.length > 0 && (
							<>
								<div className="border-t border-base-300 pt-4 mt-4">
									<div className="flex justify-between items-center text-lg font-bold mb-4">
										<span>{t('sales.total')}</span>
										<span className="text-primary">{formatCurrency(total)}</span>
									</div>

									<div className="space-y-3 mb-4">
										<label className="flex items-center gap-3 cursor-pointer">
											<input 
												name="payment_method" 
												type="radio" 
												className="radio radio-primary"
												value="cash" 
												checked={paymentMethod === "cash"}
												onChange={(e) => setPaymentMethod(e.target.value)}
											/>
											<span className="label-text">{t('sales.cash')}</span> 
										</label>
										<label className="flex items-center gap-3 cursor-pointer">
											<input 
												name="payment_method" 
												type="radio" 
												className="radio radio-primary"
												value="visa"
												checked={paymentMethod === "visa"}
												onChange={(e) => setPaymentMethod(e.target.value)}
											/>
											<span className="label-text">{t('sales.visa')}</span> 
										</label>
										<InputError messages={validErrors.payment_method} />
									</div>

									<button 
										className="btn btn-sm btn-primary w-full" 
										type="submit" 
										onClick={submitButton} 
										disabled={isSubmitting}
									>
										{isSubmitting && <span className="loading loading-spinner"></span>}
										{t('sales.payBtn')} {formatCurrency(total)}
									</button>
								</div>
							</>
						)}
					</div>
				</div>
			</div>
		</div>
	</>
}