"use client"

import { useEffect, useState } from "react"

import Header from "@/app/(app)/_components/header"
import BaseTable from "@/app/(app)/_components/baseTable"
import { getDuePayments } from "@/app/(app)/duePaymentsReport/_duePayment"
import { useAtom } from "jotai"
import { branch } from "@/_state/globalStore"
import { useTranslation } from "next-i18next"
import { useAuth } from "@/hooks/auth"

export default function DuePaymentsReport() {
    const { t } = useTranslation('common')
	const [data, setData] = useState<any>([])
    const { user } = useAuth({ middleware: "auth" })
	const [ branchID ] = useAtom(branch)
	const actions = {
		path: "/duePaymentsReport",
	}
	const [date, setDate] = useState<string>('current_month')

	const getList = (page: number, sort: string=null, sort_direction: string='asc') => {
		getDuePayments(page, branchID, date, sort, sort_direction).then((returnData: any) => {
			setData(returnData.response)
		})
	}

	useEffect(() => {
		getList(1)
	}, [date])

    const colNames = [
		{ key: 'member_name', label: t('duePaymentsReport.table.memberName') },
		{ key: 'membership_plan', label: t('duePaymentsReport.table.membershipPlan') },
		{ key: 'bill_number', label: t('duePaymentsReport.table.billNumber') },
        { key: 'bill_date', label: t('duePaymentsReport.table.billDate') },
        { key: 'due_date', label: t('duePaymentsReport.table.dueDate') },
        { key: 'amount_due', label: t('duePaymentsReport.table.amountDue') },
        { key: 'payment_status', label: t('duePaymentsReport.table.paymentStatus') },
        { key: 'email', label: t('duePaymentsReport.table.email') },
        { key: 'mobile_phone', label: t('duePaymentsReport.table.mobilePhone') },
	]

	return <>
		<Header
			title={t('duePaymentsReport.listTitle')}
			containerClass={"flex justify-between"}
            actions={
                <div className="flex items-center rtl:space-x-reverse space-x-2">
                    <button className="btn btn-primary btn-sm" onClick={() => setDate('current_month')}>{t('duePaymentsReport.currentMonth')}</button>
                    <button className="btn btn-primary btn-sm" onClick={() => setDate('next_month')}>{t('duePaymentsReport.nextMonth')}</button>
                </div>
            }
		/>
		<BaseTable data={data} actions={actions} getListFunction={getList} colHeaderNames={colNames} />
	</>
}