"use client"

import { useEffect, useState } from "react"

import Header from "@/app/(app)/_components/header"
import BaseTable from "@/app/(app)/_components/baseTable"
import { getAttendance } from "@/app/(app)/attendanceReport/_attendance"
import { useAtom } from "jotai"
import { branch } from "@/_state/globalStore"
import { useTranslation } from "next-i18next"

export default function AttendanceReport() {
	const { t } = useTranslation('common')
	const [data, setData] = useState<any>([])
	const [branchID] = useAtom(branch)
	const [from, setFrom] = useState<string>('')
	const [to, setTo] = useState<string>('')
	const actions = { path: "/attendanceReport" }

	const getList = (page: number, sort: string = null, sort_direction: string = 'asc') => {
		getAttendance(page, branchID, from, to, sort, sort_direction).then((returnData: any) => {
			setData(returnData.response)
		})
	}

	useEffect(() => { getList(1) }, [from, to])

	const colNames = [
		{ key: 'member_name', label: t('attendanceReport.table.memberName') },
		{ key: 'class_name', label: t('attendanceReport.table.className') },
		{ key: 'date', label: t('attendanceReport.table.date') },
		{ key: 'check_in_time', label: t('attendanceReport.table.checkInTime') },
	]

	return <>
		<Header
			title={t('attendanceReport.listTitle')}
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
