"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { useAuth } from "@/hooks/auth"
import Header from "@/app/(app)/_components/header"
import BaseTable from "@/app/(app)/_components/baseTable"
import { getBranches, deleteBranch, bulkDeleteBranch } from "@/app/(app)/branches/_branch"
import { useAtom } from "jotai"
import { branch } from "@/_state/globalStore"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus } from "@fortawesome/free-solid-svg-icons"
import { useTranslation } from "next-i18next"

export default function BranchList() {
    const { t } = useTranslation('common')
	const [data, setData] = useState<any>([])
	const { user } = useAuth({ middleware: "auth" })
	const actions = {
		path: "/branches",
		view: user.permissions.includes('view branches'),
		edit: user.permissions.includes('update branches'),
		delete: user.permissions.includes('delete branches')
	}
	const [ branchID ] = useAtom(branch)

	const getList = (page: number, sort: string=null, sort_direction: string='asc') => {
		getBranches(page, branchID, sort, sort_direction).then((returnData: any) => {
			setData(returnData.response)
		})
	}

    const colNames = [
		{ key: 'name', label: t('branches.table.name') },
		{ key: 'address', label: t('branches.table.address') },
		{ key: 'city', label: t('branches.table.city') },
        { key: 'country', label: t('branches.table.country') },
		{ key: 'open', label: t('branches.table.open') },
		{ key: 'archived', label: t('archived') }
	]

	useEffect(() => {
		getList(1)
	}, [])

	return <>
		<Header
			title={t('branches.listTitle')}
			containerClass={"flex justify-between"}
			actions={user.permissions.includes('create branches') && <Link href="/branches/add" className="btn btn-sm btn-primary"><FontAwesomeIcon icon={faPlus} /> {t('branches.addBtn')}</Link>}
		/>
		<BaseTable data={data} actions={actions} getListFunction={getList} deleteFunction={deleteBranch} bulkDeleteFunction={bulkDeleteBranch} archiveable={true} userPermissions={user.permissions} tableController={'branch'} colHeaderNames={colNames} defaultMode={"cards"} cardTitleCol={"name"} />
	</>
}