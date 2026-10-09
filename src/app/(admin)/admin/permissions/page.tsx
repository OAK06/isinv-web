"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { useAuth } from "@/hooks/auth"
import Header from "@/app/(app)/_components/header"
import BaseTable from "@/app/(app)/_components/baseTable"
import { getPermissions, deletePermission, bulkDeletePermission } from "@/app/(admin)/admin/permissions/_permission"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus } from "@fortawesome/free-solid-svg-icons"
import { useTranslation } from "next-i18next"

export default function PermissionList() {
    const { t } = useTranslation('common')
	const [data, setData] = useState<any>([])
	const { user } = useAuth({ middleware: "auth" })
	const actions = {
		path: "/admin/permissions",
		view: user.permissions.includes('view permissions'),
		edit: user.permissions.includes('update permissions'),
		delete: user.permissions.includes('delete permissions')
	}

	const getList = (page: number, sort: string=null, sort_direction: string='asc') => {
		getPermissions(page, sort, sort_direction).then((returnData: any) => {
			setData(returnData.response)
		})
	}

	useEffect(() => {
		getList(1)
	}, [])

    const colNames = [
        { key: 'name', label: t('permissions.table.name') },
        { key: 'guard_name', label: t('permissions.table.guardName') },
	]

	return <>
		<Header
			title={t('permissions.listTitle')}
			containerClass={"flex justify-between"}
			actions={user.permissions.includes('create permissions') && <Link href="/admin/permissions/add" className="btn btn-sm btn-primary"><FontAwesomeIcon icon={faPlus} /> {t('permissions.addBtn')}</Link>}
		/>
		<BaseTable data={data} actions={actions} getListFunction={getList} deleteFunction={deletePermission} bulkDeleteFunction={bulkDeletePermission} tableController={'permission'} colHeaderNames={colNames} cardTitleCol={"name"} />
	</>
}