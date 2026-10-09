"use client"

import { useEffect, useState } from "react"

import { useAuth } from "@/hooks/auth"
import Header from "@/app/(app)/_components/header"
import BaseTable from "@/app/(app)/_components/baseTable"
import { getActivities } from "@/app/(admin)/admin/activityLogs/_activityLog"
import { useTranslation } from "next-i18next"

export default function ActivityLogList() {
    const { t } = useTranslation('common')
	const [data, setData] = useState<any>([])
	const { user } = useAuth({ middleware: "auth" })
	const actions = {
		path: "/admin/activityLogs",
		view: user.permissions.includes('view logs'),
	}

	const getList = (page: number) => {
		getActivities(page).then((returnData: any) => {
			setData(returnData.response)
		})
	}

	useEffect(() => {
		getList(1)
	}, [])

    const colNames = [
		{ key: 'company', label: t('logs.table.company') },
		{ key: 'branch', label: t('logs.table.branch') },
        { key: 'operation_type', label: t('logs.table.operationType') },
        { key: 'object_type', label: t('logs.table.objectType') },
		{ key: 'created_by', label: t('logs.table.createdBy') },
		{ key: 'created_at', label: t('logs.table.createdAt') },
	]

	return <>
		<Header
			title={t('logs.listTitle')}
			containerClass={"flex justify-between"}
		/>
		<BaseTable data={data} actions={actions} getListFunction={getList} colHeaderNames={colNames} />
	</>
}