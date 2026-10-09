"use client"

import { useEffect, useState } from "react"

import Header from "@/app/(app)/_components/header"
import BaseTable from "@/app/(app)/_components/baseTable"
import { getRefundsReport } from "@/app/(app)/refundsReport/_refundsReport"
import { useAtom } from "jotai"
import { branch } from "@/_state/globalStore"
import { useTranslation } from "next-i18next"

export default function RefundsReport() {
	const { t } = useTranslation('common')
	const [data, setData] = useState<any>([])
	const [branchID] = useAtom(branch)
	const [from, setFrom] = useState<string>('')
	const [to, setTo] = useState<string>('')
	const actions = { path: "/refundsReport" }

	const getList = (page: number, sort: string = null, sort_direction: string = 'asc') => {
		getRefundsReport(page, branchID, from, to, sort, sort_direction).then((returnData: any) => {
			setData(returnData.response)
		})
	}

	useEffect(() => { getList(1) }, [from, to])

	const colNames = [
		{ key: 'reference', label: t('refundsReport.table.reference') },
		{ key: 'member_name', label: t('refundsReport.table.memberName') },
		{ key: 'amount', label: t('refundsReport.table.amount') },
		{ key: 'date', label: t('refundsReport.table.date') },
	]

	return <>
		<Header
			title={t('refundsReport.listTitle')}
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
