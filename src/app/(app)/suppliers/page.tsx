"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { useAuth } from "@/hooks/auth"
import Header from "@/app/(app)/_components/header"
import BaseTable from "@/app/(app)/_components/baseTable"
import { getSuppliers, deleteSupplier, bulkDeleteSupplier } from "@/app/(app)/suppliers/_supplier"
import { useAtom } from "jotai"
import { branch, posRegister } from "@/_state/globalStore"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus } from "@fortawesome/free-solid-svg-icons"
import { useTranslation } from "next-i18next"

export default function SupplierList() {
    const { t } = useTranslation('common')
	const [data, setData] = useState<any>([])
	const { user } = useAuth({ middleware: "auth" })
	const [ branchID ] = useAtom(branch)
	const [ posRegisterID ] = useAtom(posRegister)
	const actions = {
		path: "/suppliers",
		view: user.permissions.includes('view suppliers'), 
		edit: (row: any): boolean => {
            const global = row.branch_id?.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() === 'all'
            const permission = global ? 'update company suppliers' : 'update suppliers'
            return user.permissions.includes(permission)
        },
		delete: (row: any): boolean => {
            const global = row.branch_id?.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() === 'all'
            const permission = global ? 'delete company suppliers' : 'delete suppliers'
            return user.permissions.includes(permission)
        }
	}

	const getList = (page: number, sort: string=null, sort_direction: string='asc') => {
		getSuppliers(page, branchID, posRegisterID, sort, sort_direction).then((returnData: any) => {
			setData(returnData.response)
		})
	}

    const colNames = [
		{ key: 'name', label: t('suppliers.table.name') },
		{ key: 'branch_id', label: t('suppliers.table.branch') },
		{ key: 'email', label: t('suppliers.table.email') },
		{ key: 'phone', label: t('suppliers.table.phone') },
        { key: 'address', label: t('suppliers.table.address') },
		{ key: 'created_by', label: t('suppliers.table.createdBy') },
        { key: 'updated_by', label: t('suppliers.table.updatedBy') },
		{ key: 'archived', label: t('archived') }
	]

	useEffect(() => {
		getList(1)
	}, [])

	return <>
		<Header
			title={t('suppliers.listTitle')}
			containerClass={"flex justify-between"}
			actions={user.permissions.includes('create suppliers') && <Link href="/suppliers/add" className="btn btn-sm btn-primary"><FontAwesomeIcon icon={faPlus} /> {t('suppliers.addBtn')}</Link>}
		/>
		<BaseTable data={data} actions={actions} getListFunction={getList} deleteFunction={deleteSupplier} bulkDeleteFunction={bulkDeleteSupplier} archiveable={true} userPermissions={user.permissions} tableController={'supplier'} colHeaderNames={colNames} cardTitleCol={"name"} />
	</>
}