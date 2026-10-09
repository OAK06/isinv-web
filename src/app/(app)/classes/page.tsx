"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { useAuth } from "@/hooks/auth"
import Header from "@/app/(app)/_components/header"
import BaseTable from "@/app/(app)/_components/baseTable"
import { getClasses, deleteClass, bulkDeleteClass } from "@/app/(app)/classes/_class"
import { useAtom } from "jotai"
import { branch } from "@/_state/globalStore"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus } from "@fortawesome/free-solid-svg-icons"
import { useTranslation } from "next-i18next"

export default function ActiveClassList() {
    const { t } = useTranslation('common')
	const [data, setData] = useState<any>([])
	const { user } = useAuth({ middleware: "auth" })
	const [ branchID ] = useAtom(branch)
	const actions = {
		path: "/classes",
		view: user.permissions.includes('view classes'),  
        edit: (row: any): boolean => {
            const global = row.branch_id?.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() === 'all'
            const permission = global ? 'update company classes' : 'update classes'
            return user.permissions.includes(permission)
        },
		delete: (row: any): boolean => {
            const global = row.branch_id?.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() === 'all'
            const permission = global ? 'delete company classes' : 'delete classes'
            return user.permissions.includes(permission)
        }
	}

	const getList = (page: number, sort: string=null, sort_direction: string='asc', active: boolean=true) => {
		getClasses(page, branchID, sort, sort_direction, active).then((returnData: any) => {
			setData(returnData.response)
		})
	}

	const colNames = [
		{ key: 'name', label: t('classes.table.name') },
		{ key: 'branch_id', label: t('classes.table.branch') },
		{ key: 'plan_id', label: t('classes.table.plan') },
		{ key: 'price', label: t('classes.table.price') },
		{ key: 'class_manager', label: t('classes.table.manager') },
		{ key: 'class_trainer', label: t('classes.table.trainer') },
		{ key: 'archived', label: t('archived') }
	]

	useEffect(() => {
		getList(1)
	}, [])

	return <>
		<Header
			title={t('classes.activeListTitle')}
			containerClass={"flex justify-between"}
			actions={
				<div className="flex items-center rtl:space-x-reverse space-x-2">
					{user.permissions.includes('view classes') && <Link href="/classes/inactive" className="btn btn-sm btn-primary">{t('classes.inactiveClassesBtn')}</Link>}
					{user.permissions.includes('create classes') && <Link href="/classes/add" className="btn btn-sm btn-primary"><FontAwesomeIcon icon={faPlus} /> {t('classes.addBtn')}</Link>}
				</div>
			}
		/>
		<BaseTable data={data} actions={actions} getListFunction={getList} active={true} deleteFunction={deleteClass} bulkDeleteFunction={bulkDeleteClass} archiveable={true} tableController={'class'} colHeaderNames={colNames} defaultMode={"cards"} cardTitleCol={"name"} />
	</>
}