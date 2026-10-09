"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { useAuth } from "@/hooks/auth"
import Header from "@/app/(app)/_components/header"
import BaseTable from "@/app/(app)/_components/baseTable"
import { getCompanies, deleteCompany, bulkDeleteCompany } from "@/app/(admin)/admin/companies/_company"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus } from "@fortawesome/free-solid-svg-icons"
import { useTranslation } from "next-i18next"

export default function CompanyList() {
    const { t } = useTranslation('common')
	const [data, setData] = useState<any>([])
	const { user } = useAuth({ middleware: "auth" })
	const actions = {
		path: "/admin/companies",
		view: user.permissions.includes('view companies'),
		edit: user.permissions.includes('update companies'),
		delete: user.permissions.includes('delete companies')
	}

	const getList = (page: number, sort: string=null, sort_direction: string='asc') => {
		getCompanies(page, sort, sort_direction).then((returnData: any) => {
			setData(returnData.response)
		})
	}

	useEffect(() => {
		getList(1)
	}, [])

    const colNames = [
		{ key: 'name', label: t('companies.table.name') },
		{ key: 'address', label: t('companies.table.address') },
        { key: 'city', label: t('companies.table.city') },
		{ key: 'country', label: t('companies.table.country') },
		{ key: 'phone', label: t('companies.table.phone') },
		{ key: 'email', label: t('companies.table.email') },
		{ key: 'archived', label: t('archived') }
	]

	return <>
		<Header
			title={t('companies.listTitle')}
			containerClass={"flex justify-between"}
			actions={user.permissions.includes('create companies') && <Link href="/admin/companies/add" className="btn btn-sm btn-primary"><FontAwesomeIcon icon={faPlus} /> {t('companies.addBtn')}</Link>}
		/>
		<BaseTable data={data} actions={actions} getListFunction={getList} deleteFunction={deleteCompany} bulkDeleteFunction={bulkDeleteCompany} archiveable={true} userPermissions={user.permissions} tableController={'company'} colHeaderNames={colNames} defaultMode={"cards"} cardTitleCol={"name"} />
	</>
}