"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { useAuth } from "@/hooks/auth"
import Header from "@/app/(app)/_components/header"
import BaseTable from "@/app/(app)/_components/baseTable"
import { getWorkOrders, deleteWorkOrder, bulkDeleteWorkOrder } from "@/app/(app)/workOrders/_workOrder"
import { useAtom } from "jotai"
import { branch } from "@/_state/globalStore"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus } from "@fortawesome/free-solid-svg-icons"
import { useTranslation } from "next-i18next"

export default function WorkOrderList() {
    const { t } = useTranslation('common')
	const [data, setData] = useState<any>([])
	const { user } = useAuth({ middleware: "auth" })
	const [ branchID ] = useAtom(branch)
	const actions = {
		path: "/workOrders",
		view: user.permissions.includes('view work orders'),
		edit: false,
		delete: user.permissions.includes('delete work orders')
	}

	const getList = (page: number, sort: string=null, sort_direction: string='asc') => {
		getWorkOrders(page, branchID, sort, sort_direction).then((returnData: any) => {
			setData(returnData.response)
		})
	}

    const colNames = [
		{ key: 'reference', label: t('workOrders.table.reference') },
		{ key: 'customer_name', label: t('workOrders.table.customerName') },
		{ key: 'title', label: t('workOrders.table.title') },
		{ key: 'status', label: t('workOrders.table.status') },
		{ key: 'total_price', label: t('workOrders.table.totalPrice') },
		{ key: 'created_at', label: t('workOrders.table.createdAt') },
	]

	useEffect(() => {
		getList(1)
	}, [])

	return <>
		<Header
			title={t('workOrders.listTitle')}
			subtitle={t('workOrders.listSubtitle')}
			containerClass={"flex justify-between"}
			actions={user.permissions.includes('create work orders') && <Link href="/workOrders/add" className="btn btn-sm btn-primary"><FontAwesomeIcon icon={faPlus} /> {t('workOrders.addBtn')}</Link>}
		/>
		<BaseTable data={data} actions={actions} getListFunction={getList} deleteFunction={deleteWorkOrder} bulkDeleteFunction={bulkDeleteWorkOrder} archiveable={true} tableController={'work_order'} colHeaderNames={colNames} cardTitleCol={"title"} />
	</>
}
