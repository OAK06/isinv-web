"use client"

import { useEffect, useState } from "react"

import Header from "@/app/(app)/_components/header"
import BaseTable from "@/app/(app)/_components/baseTable"
import { getSubscriptionTransactions } from "@/app/(app)/subscriptionTransactions/_subscriptionTransactions"
import { useAtom } from "jotai"
import { branch } from "@/_state/globalStore"
import { useTranslation } from "next-i18next"
import { useAuth } from "@/hooks/auth"

export default function SubscriptionTransactionsList() {
    const { t } = useTranslation('common')
	const [data, setData] = useState<any>([])
    const { user } = useAuth({ middleware: "auth" })
	const [ branchID ] = useAtom(branch)
	const actions = {
		path: "/subscriptionTransactions",
	}
	const [fromDate, setFromDate] = useState<any>(new Date().toISOString().split('T')[0])
	const [toDate, setToDate] = useState<any>(new Date().toISOString().split('T')[0])

	const getList = (page: number, sort: string=null, sort_direction: string='asc') => {
		getSubscriptionTransactions(page, branchID, fromDate, toDate, sort, sort_direction).then((returnData: any) => {
			setData(returnData.response)
		})
	}

	useEffect(() => {
		getList(1)
	}, [fromDate, toDate])

    const colNames = [
		{ key: 'member_fname', label: t('subscriptionTransactionsReport.table.memberFname') },
		{ key: 'member_sname', label: t('subscriptionTransactionsReport.table.memberSname') },
		{ key: 'item_type', label: t('subscriptionTransactionsReport.table.itemType') },
		{ key: 'item_name', label: t('subscriptionTransactionsReport.table.itemName') },
        { key: 'payment_amount', label: t('subscriptionTransactionsReport.table.amountPaid') },
        { key: 'payment_created_at', label: t('subscriptionTransactionsReport.table.transactionDate') },
        { key: 'reference', label: t('subscriptionTransactionsReport.table.reference') }
	]

	return <>
		<Header
			title={t('subscriptionTransactionsReport.listTitle')}
			containerClass={"flex justify-between items-end"}
            actions={
                <div className="flex items-center gap-2">
                    <div>
                        <label className="label justify-start">
                            <span className="label-text">{t('from')}</span>
                        </label>
                        <input type="date" className="input input-bordered input-sm" onChange={(e) => setFromDate(e.target.value)} value={fromDate}/>
                    </div>
                    <div>
                        <label className="label justify-start">
                            <span className="label-text">{t('to')}</span>
                        </label>
                        <input type="date" className="input input-bordered input-sm" onChange={(e) => setToDate(e.target.value)} value={toDate}/>
                    </div>
                </div>
            }
		/>
		<BaseTable data={data} actions={actions} getListFunction={getList} tableController={'subscription_transactions'} colHeaderNames={colNames} />
	</>
}