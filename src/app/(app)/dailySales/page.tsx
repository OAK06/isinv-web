"use client"

import { useEffect, useState } from "react"

import Header from "@/app/(app)/_components/header"
import BaseTable from "@/app/(app)/_components/baseTable"
import { getDailySales } from "@/app/(app)/dailySales/_dailySales"
import { useAtom } from "jotai"
import { branch } from "@/_state/globalStore"
import { useTranslation } from "next-i18next"
import { useAuth } from "@/hooks/auth"

export default function DailySalesList() {
    const { t } = useTranslation('common')
	const [data, setData] = useState<any>([])
    const { user } = useAuth({ middleware: "auth" })
	const [ branchID ] = useAtom(branch)
	const actions = {
		path: "/dailySales",
	}
	const [date, setDate] = useState<any>(new Date().toISOString().split('T')[0])

	const getList = (page: number, sort: string=null, sort_direction: string='asc') => {
		getDailySales(page, branchID, date, sort, sort_direction).then((returnData: any) => {
			setData(returnData.response)
            console.log(returnData.response)
		})
	}

	useEffect(() => {
		getList(1)
	}, [date])

    const colNames = [
		{ key: 'name', label: t('dailySalesReport.table.memberName') },
		{ key: 'product_name', label: t('dailySalesReport.table.productName') },
        { key: 'price', label: t('dailySalesReport.table.price') },
        { key: 'payment_time', label: t('dailySalesReport.table.paymentTime') }
	]

	return <>
		<Header
			title={t('dailySalesReport.listTitle')}
			containerClass={"flex justify-between"}
            actions={<input type="date" className="input input-bordered input-sm" onChange={(e) => setDate(e.target.value)} value={date}/>}
		/>
		<BaseTable data={data} actions={actions} getListFunction={getList} colHeaderNames={colNames} />
	</>
}