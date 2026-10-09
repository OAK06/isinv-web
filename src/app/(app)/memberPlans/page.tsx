"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { useAuth } from "@/hooks/auth"
import Header from "@/app/(app)/_components/header"
import BaseTable from "@/app/(app)/_components/baseTable"
import { getMemberPlans } from "@/app/(app)/memberPlans/_memberPlan"
import { useAtom } from "jotai"
import { branch, branch_settings } from "@/_state/globalStore"
import { useTranslation } from "next-i18next"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus } from "@fortawesome/free-solid-svg-icons"

export default function MemberPlansList() {
    const { t } = useTranslation('common')
	const [data, setData] = useState<any>([])
	const { user } = useAuth({ middleware: "auth" })
	const [ branchID ] = useAtom(branch)
    const [branchSettings] = useAtom(branch_settings)
    const isPaymentSettingActive = branchSettings?.includes("online_payments")
    const canSubscribePlans = user.permissions.includes('subscribe memberPlans')
	const actions = {
		path: "/memberPlans",
		view: user.permissions.includes('view memberPlans')
	}

	const getList = (page: number, sort: string=null, sort_direction: string='asc') => {
		getMemberPlans(page, branchID, sort, sort_direction).then((returnData: any) => {
			setData(returnData.response)
		})
	}

    const colNames = [
		{ key: 'plan_id', label: t('memberPlans.table.plan') },
		{ key: 'duration', label: t('memberPlans.table.duration') },
		{ key: 'duration_count', label: t('memberPlans.table.durationCount') },
		{ key: 'membership_start', label: t('memberPlans.table.membershipStart') },
		{ key: 'membership_end', label: t('memberPlans.table.membershipEnd') },
		{ key: 'startup_fee', label: t('memberPlans.table.startupFee') },
		{ key: 'price', label: t('memberPlans.table.price') },
		{ key: 'cancellation_fee', label: t('memberPlans.table.cancellationFee') },
		{ key: 'initial_pause_fee', label: t('memberPlans.table.initialPauseFee') },
		{ key: 'recurring_pause_fee', label: t('memberPlans.table.recurringPauseFee') },
		{ key: 'tax_percentage', label: t('memberPlans.table.taxPercentage') },
		{ key: 'trial', label: t('memberPlans.table.trial') },
		{ key: 'status', label: t('memberPlans.table.status') },
		{ key: 'auto_renew_forever', label: t('memberPlans.table.autoRenewForever') },
		{ key: 'renewal_count', label: t('memberPlans.table.renewalCount') },
		{ key: 'pause_start', label: t('memberPlans.table.pauseStart') },
		{ key: 'pause_end', label: t('memberPlans.table.pauseEnd') },
		{ key: 'cancel_at', label: t('memberPlans.table.cancelAt') },
    ]

	useEffect(() => {
		getList(1)
	}, [])

	return <>
		<Header
			title={t('memberPlans.listTitle')}
			containerClass={"flex justify-between"}
            actions={(canSubscribePlans && isPaymentSettingActive) && <Link href="/memberPlans/add" className="btn btn-sm btn-primary"><FontAwesomeIcon icon={faPlus} /> {t('memberPlans.addBtn')}</Link>}
		/>
		<BaseTable data={data} actions={actions} getListFunction={getList} tableController={'member_plan'} colHeaderNames={colNames} />
	</>
}