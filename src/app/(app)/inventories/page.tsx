"use client"

import { useEffect, useState } from "react"

import { useAuth } from "@/hooks/auth"
import Header from "@/app/(app)/_components/header"
import BaseTable from "@/app/(app)/_components/baseTable"
import { getInventories } from "@/app/(app)/inventories/_inventory"
import { useAtom } from "jotai"
import { branch } from "@/_state/globalStore"
import { useTranslation } from "next-i18next"

export default function InventoryList() {
    const { t } = useTranslation('common')
	const [data, setData] = useState<any>([])
	const { user } = useAuth({ middleware: "auth" })
	const actions = {
		path: "/inventories",
		view: false,
		edit: false,
		delete: false
	}
	const [ branchID ] = useAtom(branch)

	const getList = (page: number, sort: string=null, sort_direction: string='asc') => {
		getInventories(page, branchID, sort, sort_direction).then((returnData: any) => {
			setData(returnData.response)
		})
	}

    const colNames = [
		{ key: 'branch_id', label: t('inventories.table.branch') },
		{ key: 'product_id', label: t('inventories.table.product') },
        { key: 'product_category_id', label: t('inventories.table.productCategory') },
		{ key: 'quantity', label: t('inventories.table.quantity') },
        { key: 'expiry_date', label: t('inventories.table.expiryDate') },
		{ key: 'purchase_order_id', label: t('inventories.table.purchaseOrder') },
		{ key: 'source', label: t('inventories.table.source') },
        { key: 'operation_type', label: t('inventories.table.operationType') },
		{ key: 'created_by', label: t('inventories.table.createdBy') },
	]

	useEffect(() => {
		getList(1)
	}, [])

	return <>
		<Header
			title={t('inventories.listTitle')}
			containerClass={"flex justify-between"}
		/>
		<BaseTable data={data} actions={actions} getListFunction={getList} tableController={'inventory'} colHeaderNames={colNames} />
	</>
}