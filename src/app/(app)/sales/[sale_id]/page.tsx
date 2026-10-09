"use client"

import { useEffect, useState } from "react"
import { useBreadcrumbLabel } from "@/hooks/useBreadcrumbLabel"

import { getSale } from "@/app/(app)/sales/_sale"
import { Sale } from "@/app/(app)/sales/_sale"
import { useTranslation } from "next-i18next"
import Header from "@/app/(app)/_components/header"
import { formatCurrency } from "@/_helpers/currency"

export default function SaleView({ params }: any) {
    const { t } = useTranslation('common')
	const { sale_id }: any = params
	const [data, setData] = useState<Sale>({} as Sale)
	useBreadcrumbLabel(data)

	useEffect(() => {
		getSale(sale_id).then((returnData: any) => {
			setData(returnData.response)
		})
	}, [])

	return <>
		<Header
			title={t('sales.saleDetails')}
			containerClass={"flex justify-between"}
		/>
		<div className="mt-6 card bg-base-100 border border-base-200 shadow-sm">
			<div className="card-body">
				<h2 className="card-title text-xl mb-4">
					<div className="w-1 h-6 bg-primary rounded me-2"></div>
					{t('sales.saleInfo')}
				</h2>
				<div className="space-y-4">
					<div className="flex justify-between items-center py-2 border-b border-base-200">
						<span className="font-semibold text-base-content/70">{t('sales.customerName')}</span>
						<span className="text-base-content">{data.customer_name || '-'}</span>
					</div>
					<div className="flex justify-between items-center py-2 border-b border-base-200">
						<span className="font-semibold text-base-content/70">{t('sales.customerPhone')}</span>
						<span className="text-base-content">{data.customer_phone || '-'}</span>
					</div>
					<div className="flex justify-between items-start py-2 border-b border-base-200">
						<span className="font-semibold text-base-content/70">{t('sales.items')}</span>
						<div className="text-base-content text-end">
							{data.invoice_items?.map((invItem: any, i: number) => (
								<span key={i} className="block">
									{invItem.item?.name} <span className="text-sm text-base-content/60">x{invItem.quantity}</span>
								</span>
							))}
						</div>
					</div>
					<div className="flex justify-between items-center py-2 border-b border-base-200">
						<span className="font-semibold text-base-content/70">{t('sales.totalItems')}</span>
						<span className="text-base-content">{data.item_count}</span>
					</div>
					<div className="flex justify-between items-center py-2 border-b border-base-200">
						<span className="font-semibold text-base-content/70">{t('sales.totalPrice')}</span>
						<span className="text-base-content font-bold">{formatCurrency(data.total_price)}</span>
					</div>
					<div className="flex justify-between items-center py-2 border-b border-base-200">
						<span className="font-semibold text-base-content/70">{t('sales.totalTax')}</span>
						<span className="text-base-content">{formatCurrency(data.total_tax)}</span>
					</div>
					<div className="flex justify-between items-center py-2">
						<span className="font-semibold text-base-content/70">{t('sales.date')}</span>
						<span className="text-base-content">
							{new Date(data.created_at).toLocaleDateString()} at {new Date(data.created_at).toLocaleTimeString()}
						</span>
					</div>
				</div>
			</div>
		</div>
	</>
}