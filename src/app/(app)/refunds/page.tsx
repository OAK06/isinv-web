"use client"

import { useEffect, useState } from "react"

import Header from "@/app/(app)/_components/header"
import BaseTable from "@/app/(app)/_components/baseTable"
import { getRefunds } from "@/app/(app)/refunds/_refund"
import { useAtom } from "jotai"
import { branch, posRegister } from "@/_state/globalStore"
import { useTranslation } from "next-i18next"

export default function RefundsList() {
    const { t } = useTranslation('common')
	const [data, setData] = useState<any>([])
	const [ branchID ] = useAtom(branch)
	const [ posRegisterID ] = useAtom(posRegister)
	const actions = {
		path: "/refunds",
	}

	const getList = (page: number, sort: string=null, sort_direction: string='asc') => {
		getRefunds(page, branchID, posRegisterID, sort, sort_direction).then((returnData: any) => {
			setData(returnData.response)
		})
	}

    const colNames = [
		{ key: 'member_id', label: t('refunds.table.member') },
		{ key: 'item_count', label: t('refunds.table.itemCount') },
		{ key: 'total_price', label: t('refunds.table.totalPrice') },
        { key: 'payment_method', label: t('refunds.table.paymentMethod') },
        { key: 'invoiceItems', label: t('refunds.table.invoiceItems') },
		{ key: 'created_at', label: t('refunds.table.createdAt') },
        { key: 'created_by', label: t('refunds.table.createdBy') }
	]

	useEffect(() => {
		getList(1)
	}, [])

	return <>
		<Header
			title={t('refunds.listTitle')}
			containerClass={"flex justify-between"}
		/>
		<BaseTable data={data} actions={actions} getListFunction={getList} tableController={'refund'} colHeaderNames={colNames} />
	</>
}