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

export default function InActiveClassList() {
    const { t } = useTranslation('common')
	const [data, setData] = useState<any>([])
	const { user } = useAuth({ middleware: "auth" })
	const actions = {
		path: "/classes",
		view: user.permissions.includes('view classes'),
		edit: user.permissions.includes('update classes'),
		delete: user.permissions.includes('delete classes')
	}
	const [ branchID ] = useAtom(branch)

	const getList = (page: number, sort: string=null, sort_direction: string='asc', active: boolean=false) => {
		getClasses(page, branchID, sort, sort_direction, active).then((returnData: any) => {
			setData(returnData.response)
		})
	}

	const colNames = [
		{ key: 'name', label: t('classes.table.name') },
		{ key: 'class_manager', label: t('classes.table.manager') },
		{ key: 'class_trainer', label: t('classes.table.trainer') },
		{ key: 'archived', label: t('archived') }
	]

	useEffect(() => {
		getList(1)
	}, [])

	return <>
		<Header
			title={t('classes.inactiveListTitle')}
			containerClass={"flex justify-between"}
			actions={
                <div className="flex items-center rtl:space-x-reverse space-x-2">
					{user.permissions.includes('view classes') && <Link href="/classes" className="btn btn-sm btn-primary">{t('classes.activeClassesBtn')}</Link>}
					{user.permissions.includes('create classes') && <Link href="/classes/add" className="btn btn-sm btn-primary"><FontAwesomeIcon icon={faPlus} /> {t('classes.addBtn')}</Link>}
				</div>
            }
		/>
		<BaseTable data={data} actions={actions} getListFunction={getList} active={false} deleteFunction={deleteClass} bulkDeleteFunction={bulkDeleteClass} archiveable={true} tableController={'class_inactive'} colHeaderNames={colNames} defaultMode={"cards"} cardTitleCol={"name"} />
	</>
}