"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { useAuth } from "@/hooks/auth"
import Header from "@/app/(app)/_components/header"
import BaseTable from "@/app/(app)/_components/baseTable"
import { getSales, addRefund } from "@/app/(app)/sales/_sale"
import { useConfirm } from "@/_components/useConfirm"
import { useAtom } from "jotai"
import { branch, posRegister, responseMessage, store } from "@/_state/globalStore"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus, faArrowRotateLeft } from "@fortawesome/free-solid-svg-icons"
import { useTranslation } from "next-i18next"

export default function SalesList() {
    const { t } = useTranslation('common')
	const [data, setData] = useState<any>([])
	const { user } = useAuth({ middleware: "auth" })
	const [ branchID ] = useAtom(branch)
	const [ posRegisterID ] = useAtom(posRegister)
	const { confirm, confirmModal } = useConfirm()
	const [ page, setPage ] = useState<number>(1)

	const getList = (page: number, sort: string=null, sort_direction: string='asc') => {
		setPage(page)
		getSales(page, branchID, posRegisterID, sort, sort_direction).then((returnData: any) => {
			setData(returnData.response)
		})
	}

	const refund = async (id: number) => {
		if (await confirm(t('sales.confirmRefund'))) {
			await addRefund(id, {})
			store.set(responseMessage, { type: 'success', text: t('sales.refundSuccess') })
			getList(page)
		}
	}

	const actions = {
		path: "/sales",
		view: user.permissions.includes('view sales'),
		extra: [
			{
				type: 'btn',
				icon: <FontAwesomeIcon icon={faArrowRotateLeft} />,
				classes: 'text-error',
				display: (row: any) => user.permissions.includes('create refunds') && String(row.state).toLowerCase() !== 'refunded',
				action: refund,
			},
		],
	}

    const colNames = [
		{ key: 'customer_name', label: t('sales.table.customer') },
		{ key: 'state', label: t('sales.status') },
		{ key: 'item_count', label: t('sales.table.itemCount') },
		{ key: 'total_price', label: t('sales.table.totalPrice') },
        { key: 'payment_method', label: t('sales.table.paymentMethod') },
		{ key: 'created_at', label: t('sales.table.createdAt') },
        { key: 'created_by', label: t('sales.table.createdBy') },
	]

	useEffect(() => {
		getList(1)
	}, [])

	return <>
		<Header
			title={t('sales.listTitle')}
			containerClass={"flex justify-between"}
			actions={user.permissions.includes('create sales') && <Link href="/sales/add" className="btn btn-sm btn-primary"><FontAwesomeIcon icon={faPlus} /> {t('sales.addBtn')}</Link>}
		/>
		<BaseTable data={data} actions={actions} getListFunction={getList} tableController={'sale'} colHeaderNames={colNames} cardTitleCol={"name"} />
		{confirmModal}
	</>
}
