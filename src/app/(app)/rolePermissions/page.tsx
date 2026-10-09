"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { useAuth } from "@/hooks/auth"
import Header from "@/app/(app)/_components/header"
import BaseTable from "@/app/(app)/_components/baseTable"
import { getRoles } from "@/app/(app)/rolePermissions/_rolePermissions"
import { useAtom } from "jotai"
import { branch } from "@/_state/globalStore"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus } from "@fortawesome/free-solid-svg-icons"
import { useTranslation } from "next-i18next"

export default function RolePermissionList() {
    const { t } = useTranslation('common')
	const [data, setData] = useState<any>([])
	const { user } = useAuth({ middleware: "auth" })
	const actions = {
		path: "/rolePermissions",
		view: user.permissions.includes('view rolePermissions')
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
        { key: 'name', label: t('rolePermission.table.name') },
        { key: 'company_id', label: t('rolePermission.table.company') },
        { key: 'branch_id', label: t('rolePermission.table.branch') },
        { key: 'guard_name', label: t('rolePermission.table.guardName') },
	]

	return <>
		<Header
			title={t('rolePermission.listTitle')}
			containerClass={"flex justify-between"}
			actions={user.permissions.includes('create rolePermissions') && <Link href="/rolePermissions/add" className="btn btn-sm btn-primary"><FontAwesomeIcon icon={faPlus} /> {t('rolePermission.addBtn')}</Link>}
		/>
		<BaseTable data={data} actions={actions} getListFunction={getList} tableController={'role_permission'} colHeaderNames={colNames} cardTitleCol={"name"} />
	</>
}