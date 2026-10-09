"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { useAuth } from "@/hooks/auth"
import Header from "@/app/(app)/_components/header"
import BaseTable from "@/app/(app)/_components/baseTable"
import { getRoles, deleteRole, bulkDeleteRole } from "@/app/(app)/roles/_role"
import { useAtom } from "jotai"
import { branch } from "@/_state/globalStore"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus } from "@fortawesome/free-solid-svg-icons"
import { useTranslation } from "next-i18next"

export default function RoleList() {
    const { t } = useTranslation('common')
	const [data, setData] = useState<any>([])
	const { user } = useAuth({ middleware: "auth" })
	const actions = {
		path: "/roles",
		view: user.permissions.includes('view roles'),
		edit: user.permissions.includes('update roles'),
		delete: user.permissions.includes('delete roles')
	}
	const [ branchID ] = useAtom(branch)
	
	const getList = (page: number, sort: string=null, sort_direction: string='asc') => {
		getRoles(page, branchID, sort, sort_direction).then((returnData: any) => {
			setData(returnData.response)
		})
	}
	
	useEffect(() => {
		getList(1)
	}, [])

    const colNames = [
        { key: 'name', label: t('roles.table.name') },
        { key: 'branch_id', label: t('roles.table.branch') },
        { key: 'guard_name', label: t('roles.table.guardName') },
	]

	return <>
		<Header
			title={t('roles.listTitle')}
			containerClass={"flex justify-between"}
			actions={user.permissions.includes('create roles') && <Link href="/roles/add" className="btn btn-sm btn-primary"><FontAwesomeIcon icon={faPlus} /> {t('roles.addBtn')}</Link>}
		/>
		<BaseTable data={data} actions={actions} getListFunction={getList} deleteFunction={deleteRole} bulkDeleteFunction={bulkDeleteRole} tableController={'role'} colHeaderNames={colNames} defaultMode={"cards"} cardTitleCol={"name"} />
	</>
}