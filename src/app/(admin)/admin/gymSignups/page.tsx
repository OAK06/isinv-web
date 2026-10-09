"use client" 

import { useEffect, useState } from "react"

import { useAuth } from "@/hooks/auth"
import Header from "@/app/(app)/_components/header"
import BaseTable from "@/app/(app)/_components/baseTable"
import { getSignups } from "@/app/(admin)/admin/gymSignups/_signup"
import { useTranslation } from "next-i18next"

export default function SignupList() {
    const { t } = useTranslation('common')
	const [data, setData] = useState<any>([])
	const { user } = useAuth({ middleware: "auth" })
	const actions = {
		path: "/admin/gymSignups",
		view: user.permissions.includes('view signups'),
		edit: user.permissions.includes('update signups'),
	}
	
	const getList = (page: number, sort: string=null, sort_direction: string='asc') => {
		getSignups(page, sort, sort_direction).then((returnData: any) => {
			setData(returnData.response)
		})
	}

	useEffect(() => {
		getList(1)
	}, [])

    const colNames = [
		{ key: 'gym_name', label: t('ownerSignup.table.gymName') },
		{ key: 'gym_plan', label: t('ownerSignup.table.gymPlan') },
		{ key: 'owner_fname', label: t('ownerSignup.table.ownerFname') },
        { key: 'owner_sname', label: t('ownerSignup.table.ownerSname') },
		{ key: 'email', label: t('ownerSignup.table.email') },
        { key: 'mobile_phone', label: t('ownerSignup.table.mobilePhone') },
		{ key: 'gym_address', label: t('ownerSignup.table.gymAddress') },
		{ key: 'gym_city', label: t('ownerSignup.table.gymCity') },
        { key: 'gym_country', label: t('ownerSignup.table.gymCountry') },
		{ key: 'branch_count', label: t('ownerSignup.table.branchCount') },
        { key: 'members_estimate', label: t('ownerSignup.table.membersEstimate') },
		{ key: 'current_system', label: t('ownerSignup.table.currentSystem') },
		{ key: 'status', label: t('ownerSignup.table.status') },
		{ key: 'demo_completed', label: t('ownerSignup.table.demoCompleted') },
		{ key: 'demo_completed_at', label: t('ownerSignup.table.demoCompletedAt') },
        { key: 'notes', label: t('ownerSignup.table.notes') },
		{ key: 'created_at', label: t('ownerSignup.table.createdAt') },
	]

	return <>
		<Header
			title={t('ownerSignup.listTitle')}
			containerClass={"flex justify-between"}
		/>
		<BaseTable data={data} actions={actions} getListFunction={getList} userPermissions={user.permissions} tableController={'signup'} colHeaderNames={colNames} cardTitleCol={"gym_name"} />
	</>
}