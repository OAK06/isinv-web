"use client"

import { useEffect, useState } from "react"

import Header from "@/app/(app)/_components/header"
import BaseTable from "@/app/(app)/_components/baseTable"
import { getExpiringMemberships } from "@/app/(app)/expiringMemberships/_expiringMemberships"
import { useAtom } from "jotai"
import { branch } from "@/_state/globalStore"
import { useTranslation } from "next-i18next"

export default function ExpiringMemberships() {
	const { t } = useTranslation('common')
	const [data, setData] = useState<any>([])
	const [branchID] = useAtom(branch)
	const [window, setWindow] = useState<string>('within_30')
	const actions = { path: "/expiringMemberships" }

	const getList = (page: number, sort: string = null, sort_direction: string = 'asc') => {
		getExpiringMemberships(page, branchID, window, sort, sort_direction).then((returnData: any) => {
			setData(returnData.response)
		})
	}

	useEffect(() => { getList(1) }, [window])

	const colNames = [
		{ key: 'member_name', label: t('expiringMemberships.table.memberName') },
		{ key: 'membership_plan', label: t('expiringMemberships.table.membershipPlan') },
		{ key: 'end_date', label: t('expiringMemberships.table.endDate') },
		{ key: 'days_left', label: t('expiringMemberships.table.daysLeft') },
		{ key: 'status', label: t('expiringMemberships.table.status') },
		{ key: 'email', label: t('expiringMemberships.table.email') },
		{ key: 'mobile_phone', label: t('expiringMemberships.table.mobilePhone') },
	]

	return <>
		<Header
			title={t('expiringMemberships.listTitle')}
			containerClass={"flex justify-between"}
			actions={
				<div className="flex items-center rtl:space-x-reverse space-x-2">
					<button className={`btn btn-sm ${window === 'within_7' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setWindow('within_7')}>{t('expiringMemberships.within7')}</button>
					<button className={`btn btn-sm ${window === 'within_30' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setWindow('within_30')}>{t('expiringMemberships.within30')}</button>
					<button className={`btn btn-sm ${window === 'expired' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setWindow('expired')}>{t('expiringMemberships.expired')}</button>
				</div>
			}
		/>
		<BaseTable data={data} actions={actions} getListFunction={getList} colHeaderNames={colNames} />
	</>
}
