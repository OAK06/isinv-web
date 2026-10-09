"use client"

import { usePathname } from "next/navigation"
import { useBreadcrumbLabel } from "@/hooks/useBreadcrumbLabel"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBox } from "@fortawesome/free-solid-svg-icons"
import { useEffect, useState } from "react"

import { getProduct } from "@/app/(app)/products/_product"
import { Product } from "@/app/(app)/products/_product"
import { useTranslation } from "next-i18next"
import Header from "@/app/(app)/_components/header"
import { formatCurrency } from "@/_helpers/currency"

export default function ProductView({ params }: any) {
    const { t } = useTranslation('common')
    const pathname = usePathname()
	const { product_id }: any = params
	const [data, setData] = useState<Product>({} as Product)
	useBreadcrumbLabel(data)

	useEffect(() => {
		getProduct(product_id).then((returnData: any) => {
			setData(returnData.response)
		})
	}, [])

	return <>
		<Header editHref={`${pathname}/edit`} editLabel={t('edit')}
			title={<div className="flex items-center gap-4"><div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"><FontAwesomeIcon icon={faBox} className="text-2xl" /></div><div className="min-w-0"><h1 className="text-2xl font-bold leading-tight truncate">{data.name}</h1><div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-base-content/60"><div className={`badge badge-sm ${data.active ? 'badge-success' : 'badge-error'}`}>{data.active ? t('active') : t('inactive')}</div><div className={`badge badge-sm ${data.allow_negative ? 'badge-warning' : 'badge-info'}`}>{data.allow_negative ? t('products.allowNegative') : t('products.allowPositiveOnly')}</div></div></div></div>}
			containerClass="flex flex-wrap items-center justify-between gap-4"
		/>
		<div className="mt-6 space-y-6">
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
				<div className="card bg-base-100 border border-base-200 shadow-sm">
					<div className="card-body">
						<h2 className="card-title text-lg mb-4 gap-3">
							<span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><FontAwesomeIcon icon={faBox} /></span>
							{t('products.basicInfo')}
						</h2>
						<div className="space-y-4">
							<div className="flex justify-between items-center py-2 border-b border-base-200">
								<span className="font-semibold text-base-content/70">{t('products.categoryName')}</span>
								<span className="text-base-content text-end">{data.category?.name}</span>
							</div>
							<div className="flex justify-between items-center py-2 border-b border-base-200">
								<span className="font-semibold text-base-content/70">{t('products.type')}</span>
								<span className="text-base-content text-end">{data.type}</span>
							</div>
							<div className="flex justify-between items-center py-2 border-b border-base-200">
								<span className="font-semibold text-base-content/70">{t('products.companyName')}</span>
								<span className="text-base-content text-end">{data.company?.name}</span>
							</div>
							<div className="flex justify-between items-center py-2">
								<span className="font-semibold text-base-content/70">{t('products.branchName')}</span>
								<span className="text-base-content text-end">{data.branch?.name}</span>
							</div>
						</div>
					</div>
				</div>

				<div className="card bg-base-100 border border-base-200 shadow-sm">
					<div className="card-body">
						<h2 className="card-title text-lg mb-4 gap-3">
							<span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><FontAwesomeIcon icon={faBox} /></span>
							{t('products.pricing')}
						</h2>
						<div className="space-y-4">
							<div className="flex justify-between items-center p-4 bg-primary/5 rounded-lg">
								<span className="font-semibold text-lg">{t('products.sellPrice')}</span>
								<span className="text-2xl font-bold text-primary">{formatCurrency(data.sell_price)}</span>
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div className="flex justify-between items-center p-3 bg-base-200 rounded-lg">
									<span className="text-base-content/70">{t('products.costPrice')}</span>
									<span className="font-semibold">{formatCurrency(data.cost_price)}</span>
								</div>
								<div className="flex justify-between items-center p-3 bg-base-200 rounded-lg">
									<span className="text-base-content/70">{t('products.fixedPrice')}</span>
									<span className="font-semibold">{formatCurrency(data.fixed_price)}</span>
								</div>
								<div className="flex justify-between items-center p-3 bg-base-200 rounded-lg">
									<span className="text-base-content/70">{t('products.costGst')}</span>
									<span className="font-semibold">{formatCurrency(data.cost_gst)}</span>
								</div>
								<div className="flex justify-between items-center p-3 bg-base-200 rounded-lg">
									<span className="text-base-content/70">{t('products.sellGst')}</span>
									<span className="font-semibold">{formatCurrency(data.sell_gst)}</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="card bg-base-100 border border-base-200 shadow-sm">
				<div className="card-body">
					<h2 className="card-title text-lg mb-4 gap-3">
						<span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><FontAwesomeIcon icon={faBox} /></span>
						{t('products.stockSettings')}
					</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
						<div className="flex justify-between items-center p-4 bg-warning/5 rounded-lg border-s-4 border-warning">
							<span className="font-semibold text-base-content/70">{t('products.lowStockNotice')}</span>
							<span className="text-xl font-bold text-warning">{data.low_stock_notice}</span>
						</div>
						<div className="flex justify-between items-center p-4 bg-error/5 rounded-lg border-s-4 border-error">
							<span className="font-semibold text-base-content/70">{t('products.lowStockReOrder')}</span>
							<span className="text-xl font-bold text-error">{data.low_stock_re_order}</span>
						</div>
					</div>
				</div>
			</div>

			<div className="card bg-base-100 border border-base-200 shadow-sm">
				<div className="card-body">
					<h2 className="card-title text-lg mb-4 gap-3">
						<span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><FontAwesomeIcon icon={faBox} /></span>
						{t('products.auditInfo')}
					</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div className="flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('products.createdBy')}</span>
							<span className="text-base-content text-end">{data.created_by?.name}</span>
						</div>
						<div className="flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('products.updatedBy')}</span>
							<span className="text-base-content text-end">{data.updated_by?.name}</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</>
}