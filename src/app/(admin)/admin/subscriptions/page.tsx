"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { useAuth } from "@/hooks/auth"
import Header from "@/app/(app)/_components/header"
import BaseTable from "@/app/(app)/_components/baseTable"
import { getSubscriptions } from "@/app/(admin)/admin/subscriptions/_subscription"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus } from "@fortawesome/free-solid-svg-icons"
import { useTranslation } from "next-i18next"

export default function SubscriptionList() {
    const { t } = useTranslation('common')
	const [data, setData] = useState<any>([])
	const { user } = useAuth({ middleware: "auth" })
	const actions = {
		path: "/admin/subscriptions",
		view: user.permissions.includes('view subscriptions'),
		edit: false,
		delete: false
	}

	const getList = (page: number, sort: string=null, sort_direction: string='asc') => {
		getSubscriptions(page, sort, sort_direction).then((returnData: any) => {
			setData(returnData.response)
		})
	}

	useEffect(() => {
		getList(1)
	}, [])

    const colNames = [
        { key: 'company', label: t('subscriptions.table.company') },
        { key: 'plan', label: t('subscriptions.table.plan') },
        { key: 'status', label: t('subscriptions.table.status') },
        { key: 'total_price', label: t('subscriptions.table.totalPrice') },
        { key: 'currency', label: t('subscriptions.table.currency') },
        { key: 'trial_ends_at', label: t('subscriptions.table.trialEndsAt') },
        { key: 'current_period_end', label: t('subscriptions.table.periodEnd') }
	]

	return <>
		<Header
			title={t('subscriptions.listTitle')}
			subtitle={t('subscriptions.listSubtitle')}
			containerClass={"flex justify-between"}
			actions={user.permissions.includes('update subscriptions') && <Link href="/admin/subscriptions/add" className="btn btn-sm btn-primary"><FontAwesomeIcon icon={faPlus} /> {t('subscriptions.addBtn')}</Link>}
		/>
		<BaseTable data={data} actions={actions} getListFunction={getList} tableController={'company_subscription'} colHeaderNames={colNames} cardTitleCol={"company"} />
	</>
}
