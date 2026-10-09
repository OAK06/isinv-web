"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { useAuth } from "@/hooks/auth"
import Header from "@/app/(app)/_components/header"
import BaseTable from "@/app/(app)/_components/baseTable"
import { getPosRegisters, deletePosRegister, bulkDeleteRegister } from "@/app/(app)/pos-registers/_posRegister"
import { useAtom } from "jotai"
import { branch, loading } from "@/_state/globalStore"
import Loading from "@/app/(app)/_components/loading"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus } from "@fortawesome/free-solid-svg-icons"
import { useTranslation } from "next-i18next"

export default function PosRegisterList() {
    const { t } = useTranslation('common')
	const [data, setData] = useState<any>([])
	const { user } = useAuth({ middleware: "auth" })
	const actions = {
		path: "/pos-registers",
		view: user.permissions.includes('view pos registers'),
		edit: (row: any): boolean => {
            const global = row.branch_id?.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() === 'all'
            const permission = global ? 'update company registers' : 'update registers'
            return user.permissions.includes(permission)
        },
		delete: (row: any): boolean => {
            const global = row.branch_id?.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() === 'all'
            const permission = global ? 'delete company registers' : 'delete registers'
            return user.permissions.includes(permission)
        }
	}
	const [isLoading] = useAtom(loading)
	const [ branchID ] = useAtom(branch)
	
	const getList = (page: number, sort: string=null, sort_direction: string='asc') => {
		getPosRegisters(page, branchID, sort, sort_direction).then((returnData: any) => {
			setData(returnData.response)
		})
	}
	
	useEffect(() => {
		getList(1)
	}, [])

    const colNames = [
        { key: 'name', label: t('posRegisters.table.name') },
        { key: 'branch_id', label: t('posRegisters.table.branch') },
        { key: 'description', label: t('posRegisters.table.description') },
        { key: 'active', label: t('posRegisters.table.active') },
	]
	
	if (isLoading) return <Loading />
	return <>
		<Header
			title={t('posRegisters.listTitle')}
			containerClass={"flex justify-between"}
			actions={user.permissions.includes('create pos registers') && <Link href="/pos-registers/add" className="btn btn-sm btn-primary"><FontAwesomeIcon icon={faPlus} /> {t('posRegisters.addBtn')}</Link>}
		/>
		<BaseTable data={data} actions={actions} getListFunction={getList} deleteFunction={deletePosRegister} bulkDeleteFunction={bulkDeleteRegister} tableController={'pos_register'} colHeaderNames={colNames} />
	</>
}