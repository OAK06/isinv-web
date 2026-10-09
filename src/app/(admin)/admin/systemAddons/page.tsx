"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { useAuth } from "@/hooks/auth"
import Header from "@/app/(app)/_components/header"
import BaseTable from "@/app/(app)/_components/baseTable"
import { getSystemAddons, deleteSystemAddon } from "@/app/(admin)/admin/systemAddons/_systemAddon"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus } from "@fortawesome/free-solid-svg-icons"
import { useTranslation } from "next-i18next"

export default function SystemAddonList() {
    const { t } = useTranslation('common')
	const [data, setData] = useState<any>([])
	const { user } = useAuth({ middleware: "auth" })
	const actions = {
		path: "/admin/systemAddons",
		view: user.permissions.includes('view system addons'),
		edit: user.permissions.includes('update system addons'),
		delete: user.permissions.includes('delete system addons')
	}

	const getList = (page: number, sort: string=null, sort_direction: string='asc') => {
		getSystemAddons(page, sort, sort_direction).then((returnData: any) => {
			setData(returnData.response)
		})
	}

	useEffect(() => {
		getList(1)
	}, [])

    const colNames = [
        { key: 'slug', label: t('systemAddons.table.slug') },
        { key: 'sort', label: t('systemAddons.table.sort') },
		{ key: 'active', label: t('systemAddons.table.active') }
	]

	return <>
		<Header
			title={t('systemAddons.listTitle')}
			containerClass={"flex justify-between"}
			actions={user.permissions.includes('create system addons') && <Link href="/admin/systemAddons/add" className="btn btn-sm btn-primary"><FontAwesomeIcon icon={faPlus} /> {t('systemAddons.addBtn')}</Link>}
		/>
		<BaseTable data={data} actions={actions} getListFunction={getList} deleteFunction={deleteSystemAddon} archiveable={true} tableController={'system_addon'} colHeaderNames={colNames} cardTitleCol={"slug"} />
	</>
}
