"use client"

import { useEffect, useState } from "react"

import Header from "@/app/(app)/_components/header"
import BaseTable from "@/app/(app)/_components/baseTable"
import { getLowStock } from "@/app/(app)/lowStock/_lowStock"
import { useAtom } from "jotai"
import { branch } from "@/_state/globalStore"
import { useTranslation } from "next-i18next"

export default function LowStock() {
	const { t } = useTranslation('common')
	const [data, setData] = useState<any>([])
	const [branchID] = useAtom(branch)
	const actions = { path: "/lowStock" }

	const getList = (page: number, sort: string = null, sort_direction: string = 'asc') => {
		getLowStock(page, branchID, sort, sort_direction).then((returnData: any) => {
			setData(returnData.response)
		})
	}

	useEffect(() => { getList(1) }, [])

	const colNames = [
		{ key: 'product_name', label: t('lowStock.table.productName') },
		{ key: 'stock_level', label: t('lowStock.table.stockLevel') },
		{ key: 'threshold', label: t('lowStock.table.threshold') },
	]

	return <>
		<Header title={t('lowStock.listTitle')} containerClass={"flex justify-between"} />
		<BaseTable data={data} actions={actions} getListFunction={getList} colHeaderNames={colNames} />
	</>
}
