"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { useAuth } from "@/hooks/auth"
import Header from "@/app/(app)/_components/header"
import BaseTable from "@/app/(app)/_components/baseTable"
import { getCategories, deleteCategory, bulkDeleteCategory } from "@/app/(app)/productCategories/_productCategory"
import { useAtom } from "jotai"
import { branch, posRegister } from "@/_state/globalStore"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus } from "@fortawesome/free-solid-svg-icons"
import { useTranslation } from "next-i18next"

export default function CategoryList() {
    const { t } = useTranslation('common')
	const [data, setData] = useState<any>([])
	const { user } = useAuth({ middleware: "auth" })
	const actions = {
		path: "/productCategories",
		view: user.permissions.includes('view categories'), 
		edit: (row: any): boolean => {
            const global = row.branch_id?.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() === 'all'
            const permission = global ? 'update company categories' : 'update categories'
            return user.permissions.includes(permission)
        },
		delete: (row: any): boolean => {
            const global = row.branch_id?.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() === 'all'
            const permission = global ? 'delete company categories' : 'delete categories'
            return user.permissions.includes(permission)
        }
	}
	const [ branchID ] = useAtom(branch)
	const [ posRegisterID ] = useAtom(posRegister)

	const getList = (page: number, sort: string=null, sort_direction: string='asc') => {
		getCategories(page, branchID, posRegisterID, sort, sort_direction).then((returnData: any) => {
			setData(returnData.response)
		})
	}

    const colNames = [
		{ key: 'name', label: t('categories.table.name') },
		{ key: 'company_id', label: t('categories.table.company') },
		{ key: 'branch_id', label: t('categories.table.branch') },
        { key: 'description', label: t('categories.table.description') },
		{ key: 'active', label: t('categories.table.active') },
        { key: 'created_by', label: t('categories.table.createdBy') },
		{ key: 'updated_by', label: t('categories.table.updatedBy') },
		{ key: 'archived', label: t('archived') }
	]

	useEffect(() => {
		getList(1)
	}, [])

	return <> 
		<Header
			title={t('categories.listTitle')}
			containerClass={"flex justify-between"}
			actions={user.permissions.includes('create categories') && <Link href="/productCategories/add" className="btn btn-sm btn-primary"><FontAwesomeIcon icon={faPlus} /> {t('categories.addBtn')}</Link>}
		/>
		<BaseTable data={data} actions={actions} getListFunction={getList} deleteFunction={deleteCategory} bulkDeleteFunction={bulkDeleteCategory} archiveable={true} userPermissions={user.permissions} tableController={'product_category'} colHeaderNames={colNames} defaultMode={"cards"} cardTitleCol={"name"} />
	</>
}