"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { useAuth } from "@/hooks/auth"
import Header from "@/app/(app)/_components/header"
import BaseTable from "@/app/(app)/_components/baseTable"
import { getUsers, deleteUser, bulkDeleteUser } from "@/app/(admin)/admin/users/_user"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus } from "@fortawesome/free-solid-svg-icons"
import { useTranslation } from "next-i18next"

export default function UserList() {
    const { t } = useTranslation('common')
	const [data, setData] = useState<any>([])
	const { user } = useAuth({ middleware: "auth" })
	const actions = {
		path: "/admin/users",
		view: user.permissions.includes('view users'),
		edit: user.permissions.includes('update users'),
		delete: user.permissions.includes('delete users')
	}

	const getList = (page: number, sort: string=null, sort_direction: string='asc') => {
		getUsers(page, sort, sort_direction).then((returnData: any) => {
			setData(returnData.response)
		})
	}

	useEffect(() => {
		getList(1)
	}, [])

    const colNames = [
        { key: 'name', label: t('users.table.name') },
        { key: 'email', label: t('users.table.email') },
        { key: 'phone', label: t('users.table.mobilePhone') },
        { key: 'age', label: t('users.table.age') },
        { key: 'company', label: t('users.table.company') },
        { key: 'branch', label: t('users.table.branch') },
        { key: 'role', label: t('users.table.role') },
	]

	return <>
		<Header
			title={t('users.listTitle')}
			containerClass={"flex justify-between"}
			actions={user.permissions.includes('create users') && <Link href="/admin/users/add" className="btn btn-sm btn-primary"><FontAwesomeIcon icon={faPlus} /> {t('users.addBtn')}</Link>}
		/>
		<BaseTable data={data} actions={actions} getListFunction={getList} deleteFunction={deleteUser} bulkDeleteFunction={bulkDeleteUser} tableController={'user'} colHeaderNames={colNames} cardTitleCol={"name"} />
	</>
}