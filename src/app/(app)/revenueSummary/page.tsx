"use client"

import { useEffect, useState } from "react"

import Header from "@/app/(app)/_components/header"
import BaseTable from "@/app/(app)/_components/baseTable"
import { getRevenueSummary } from "@/app/(app)/revenueSummary/_revenueSummary"
import { useAtom } from "jotai"
import { branch } from "@/_state/globalStore"
import { useTranslation } from "next-i18next"

export default function RevenueSummary() {
	const { t } = useTranslation('common')
	const [data, setData] = useState<any>([])
	const [branchID] = useAtom(branch)
	const [from, setFrom] = useState<string>('')
	const [to, setTo] = useState<string>('')
	const actions = { path: "/revenueSummary" }

	const getList = (page: number, sort: string = null, sort_direction: string = 'asc') => {
		getRevenueSummary(page, branchID, from, to, sort, sort_direction).then((returnData: any) => {
			setData(returnData.response)
		})
	}

	useEffect(() => { getList(1) }, [from, to])

	const colNames = [
		{ key: 'date', label: t('revenueSummary.table.date') },
		{ key: 'transactions', label: t('revenueSummary.table.transactions') },
		{ key: 'memberships_revenue', label: t('revenueSummary.table.membershipsRevenue') },
		{ key: 'products_revenue', label: t('revenueSummary.table.productsRevenue') },
		{ key: 'total_revenue', label: t('revenueSummary.table.totalRevenue') },
	]

	return <>
		<Header
			title={t('revenueSummary.listTitle')}
			containerClass={"flex justify-between"}
			actions={
				<div className="flex items-center rtl:space-x-reverse space-x-2">
					<input type="date" className="input input-bordered input-sm" value={from} onChange={e => setFrom(e.target.value)} />
					<input type="date" className="input input-bordered input-sm" value={to} onChange={e => setTo(e.target.value)} />
				</div>
			}
		/>
		<BaseTable data={data} actions={actions} getListFunction={getList} colHeaderNames={colNames} />
	</>
}
