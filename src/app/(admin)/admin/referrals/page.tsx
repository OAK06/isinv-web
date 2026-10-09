"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { useAuth } from "@/hooks/auth"
import Header from "@/app/(app)/_components/header"
import BaseTable from "@/app/(app)/_components/baseTable"
import { getReferrals, deleteReferral, bulkDeleteReferral } from "@/app/(admin)/admin/referrals/_referral"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus } from "@fortawesome/free-solid-svg-icons"
import { useTranslation } from "next-i18next"

export default function ReferralList() {
    const { t } = useTranslation('common')
	const [data, setData] = useState<any>([])
	const { user } = useAuth({ middleware: "auth" })
	const actions = {
		path: "/admin/referrals",
		view: user.permissions.includes('view referrals'),
		edit: user.permissions.includes('update referrals'),
		delete: user.permissions.includes('delete referrals')
	}

	const getList = (page: number, sort: string=null, sort_direction: string='asc') => {
		getReferrals(page, sort, sort_direction).then((returnData: any) => {
			setData(returnData.response)
		})
	}

	useEffect(() => {
		getList(1)
	}, [])

    const colNames = [
        { key: 'source_name', label: t('referrals.table.sourceName') },
        { key: 'referral_count', label: t('referrals.table.referralCount') },
		{ key: 'archived', label: t('archived') }
	]

	return <>
		<Header
			title={t('referrals.listTitle')}
			containerClass={"flex justify-between"}
			actions={user.permissions.includes('create referrals') && <Link href="/admin/referrals/add" className="btn btn-sm btn-primary"><FontAwesomeIcon icon={faPlus} /> {t('referrals.addBtn')}</Link>}
		/>
		<BaseTable data={data} actions={actions} getListFunction={getList} deleteFunction={deleteReferral} bulkDeleteFunction={bulkDeleteReferral} archiveable={true} tableController={'referral'} colHeaderNames={colNames} defaultMode={"cards"} cardTitleCol={"source_name"} />
	</>
}