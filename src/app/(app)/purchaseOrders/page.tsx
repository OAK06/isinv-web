"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { useAuth } from "@/hooks/auth"
import Header from "@/app/(app)/_components/header"
import BaseTable from "@/app/(app)/_components/baseTable"
import { getPurchases, deletePurchase, bulkDeletePurchase } from "@/app/(app)/purchaseOrders/_purchaseOrder"
import { useAtom } from "jotai"
import { branch } from "@/_state/globalStore"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus } from "@fortawesome/free-solid-svg-icons"
import { useTranslation } from "next-i18next"

export default function PurchaseOrderList() {
    const { t } = useTranslation('common')
	const [data, setData] = useState<any>([])
	const { user } = useAuth({ middleware: "auth" })
	const actions = {
		path: "/purchaseOrders",
		view: user.permissions.includes('view purchases'), 
		edit: false,
		delete: user.permissions.includes('delete purchases')
	}
	const [ branchID ] = useAtom(branch)

	const getList = (page: number, sort: string=null, sort_direction: string='asc') => {
		getPurchases(page, branchID, sort, sort_direction).then((returnData: any) => {
			setData(returnData.response)
		})
	}

    const colNames = [
		{ key: 'branch_id', label: t('purchases.table.branch') },
		{ key: 'supplier_id', label: t('purchases.table.supplier') },
		{ key: 'product', label: t('purchases.product') },
		{ key: 'quantity', label: t('purchases.quantity') },
        { key: 'created_by', label: t('purchases.table.createdBy') },
		{ key: 'archived', label: t('archived') }
	]

	useEffect(() => {
		getList(1)
	}, [])

	return <>
		<Header
			title={t('purchases.listTitle')}
			containerClass={"flex justify-between"}
			actions={user.permissions.includes('create purchases') && <Link href="/purchaseOrders/add" className="btn btn-sm btn-primary"><FontAwesomeIcon icon={faPlus} /> {t('purchases.addBtn')}</Link>}
		/>
		<BaseTable data={data} actions={actions} getListFunction={getList} deleteFunction={deletePurchase} bulkDeleteFunction={bulkDeletePurchase} archiveable={true} tableController={'purchase_order'} colHeaderNames={colNames} />
	</>
}