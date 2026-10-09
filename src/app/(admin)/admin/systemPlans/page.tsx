"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { useAuth } from "@/hooks/auth"
import Header from "@/app/(app)/_components/header"
import BaseTable from "@/app/(app)/_components/baseTable"
import { getSystemPlans, deleteSystemPlan } from "@/app/(admin)/admin/systemPlans/_systemPlan"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus } from "@fortawesome/free-solid-svg-icons"
import { useTranslation } from "next-i18next"

export default function SystemPlanList() {
    const { t } = useTranslation('common')
	const [data, setData] = useState<any>([])
	const { user } = useAuth({ middleware: "auth" })
	const actions = {
		path: "/admin/systemPlans",
		view: user.permissions.includes('view system plans'),
		edit: user.permissions.includes('update system plans'),
		delete: user.permissions.includes('delete system plans')
	}

	const getList = (page: number, sort: string=null, sort_direction: string='asc') => {
		getSystemPlans(page, sort, sort_direction).then((returnData: any) => {
			setData(returnData.response)
		})
	}

	useEffect(() => {
		getList(1)
	}, [])

    const colNames = [
        { key: 'slug', label: t('systemPlans.table.slug') },
        { key: 'months', label: t('systemPlans.table.months') },
		{ key: 'active', label: t('systemPlans.table.active') }
	]

	return <>
		<Header
			title={t('systemPlans.listTitle')}
			containerClass={"flex justify-between"}
			actions={user.permissions.includes('create system plans') && <Link href="/admin/systemPlans/add" className="btn btn-sm btn-primary"><FontAwesomeIcon icon={faPlus} /> {t('systemPlans.addBtn')}</Link>}
		/>
		<BaseTable data={data} actions={actions} getListFunction={getList} deleteFunction={deleteSystemPlan} archiveable={true} tableController={'system_plan'} colHeaderNames={colNames} cardTitleCol={"slug"} />
	</>
}