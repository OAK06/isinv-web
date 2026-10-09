"use client"

import { useEffect, useState } from "react"
import { useBreadcrumbLabel } from "@/hooks/useBreadcrumbLabel"

import { getPurchase } from "@/app/(app)/purchaseOrders/_purchaseOrder"
import { PurchaseOrder } from "@/app/(app)/purchaseOrders/_purchaseOrder"
import { useTranslation } from "next-i18next"
import Header from "@/app/(app)/_components/header"
import { fileUrl } from "@/_utils/fileUrl"

export default function PurchaseView({ params }: any) {
    const { t } = useTranslation('common')
	const { purchaseOrder_id }: any = params
	const [data, setData] = useState<PurchaseOrder>({} as PurchaseOrder)
	useBreadcrumbLabel(data)

	useEffect(() => {
		getPurchase(purchaseOrder_id).then((returnData: any) => {
			setData(returnData.response)
		})
	}, [])

	return <>
		<Header
			title={t('purchases.purchaseDetails')}
			containerClass={"flex justify-between"}
		/>
		<div className="mt-6 card bg-base-100 border border-base-200 shadow-sm">
			<div className="card-body">
				<h2 className="card-title text-xl mb-4">
					<div className="w-1 h-6 bg-primary rounded me-2"></div>
					{t('purchases.basicInfo')}
				</h2>
				<div className="space-y-4">
					<div className="flex justify-between items-center py-2 border-b border-base-200">
						<span className="font-semibold text-base-content/70">{t('purchases.branchName')}</span>
						<span className="text-base-content">{data.branch?.name}</span>
					</div>
					<div className="flex justify-between items-center py-2 border-b border-base-200">
						<span className="font-semibold text-base-content/70">{t('purchases.supplierName')}</span>
						<span className="text-base-content">{data.supplier?.name ?? data.supplier_name}</span>
					</div>
					<div className="flex justify-between items-center py-2 border-b border-base-200">
						<span className="font-semibold text-base-content/70">{t('purchases.product')}</span>
						<span className="text-base-content">{data.inventory?.product?.name}</span>
					</div>
					<div className="flex justify-between items-center py-2 border-b border-base-200">
						<span className="font-semibold text-base-content/70">{t('purchases.quantity')}</span>
						<span className="text-base-content">{data.inventory?.quantity}</span>
					</div>
					<div className="flex justify-between items-center py-2 border-b border-base-200">
						<span className="font-semibold text-base-content/70">{t('purchases.createdBy')}</span>
						<span className="text-base-content">{data.created_by?.name}</span>
					</div>
					{data.notes && (
						<div className="flex justify-between items-start py-2">
							<span className="font-semibold text-base-content/70">{t('purchases.notes')}</span>
							<span className="text-base-content text-end">{data.notes}</span>
						</div>
					)}
				</div>
			</div>
		</div>
			{data.receipt_photo?.url && (
				<div className="mt-6 card bg-base-100 border border-base-200 shadow-sm">
					<div className="card-body">
						<h2 className="card-title text-xl mb-4">
							<div className="w-1 h-6 bg-primary rounded me-2"></div>
							{t('purchases.receiptPhoto')}
						</h2>
						<a href={fileUrl(data.receipt_photo.url)} target="_blank" rel="noopener" className="block max-w-md">
							<img src={fileUrl(data.receipt_photo.url)} alt={t('purchases.receiptPhoto')} className="w-full rounded-lg border border-base-200 object-contain" />
						</a>
					</div>
				</div>
			)}
	</>
}