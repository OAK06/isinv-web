"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { useAuth } from "@/hooks/auth"
import Header from "@/app/(app)/_components/header"
import BaseTable from "@/app/(app)/_components/baseTable"
import { getPlans, deletePlan, bulkDeletePlan } from "@/app/(app)/plans/_plan"
import { useAtom } from "jotai"
import { branch } from "@/_state/globalStore"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus } from "@fortawesome/free-solid-svg-icons"
import { useTranslation } from "next-i18next"

export default function PlanList() {
    const { t } = useTranslation('common')
	const [data, setData] = useState<any>([])
	const { user } = useAuth({ middleware: "auth" })
	const actions = {
		path: "/plans",
		view: user.permissions.includes('view plans'),
        edit: (row: any): boolean => {
            const global = row.branch_id?.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() === 'all'
            const permission = global ? 'update company plans' : 'update plans'
            return user.permissions.includes(permission)
        },
		delete: (row: any): boolean => {
            const global = row.branch_id?.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() === 'all'
            const permission = global ? 'delete company plans' : 'delete plans'
            return user.permissions.includes(permission)
        }
	}
	const [ branchID ] = useAtom(branch)

	const getList = (page: number, sort: string=null, sort_direction: string='asc') => {
		getPlans(page, branchID, sort, sort_direction).then((returnData: any) => {
			setData(returnData.response)
		})
	}

    const colNames = [
		{ key: 'name', label: t('plans.table.name') },
		{ key: 'company_id', label: t('plans.table.company') },
		{ key: 'branch_id', label: t('plans.table.branch') },
        { key: 'default_access_type', label: t('plans.table.defaultAccessType') },
		{ key: 'description', label: t('plans.table.description') },
        { key: 'duration', label: t('plans.table.duration') },
		{ key: 'duration_count', label: t('plans.table.durationCount') },
		{ key: 'price', label: t('plans.table.price') },
        { key: 'startup_fee', label: t('plans.table.startupFee') },
		{ key: 'initial_pause_fee', label: t('plans.table.initialPauseFee') },
        { key: 'recurring_pause_fee', label: t('plans.table.recurringPauseFee') },
		{ key: 'cancellation_fee', label: t('plans.table.cancellationFee') },
		{ key: 'tax_percentage', label: t('plans.table.taxPercentage') },
        { key: 'active', label: t('plans.table.active') },
		{ key: 'trial', label: t('plans.table.trial') },
        { key: 'terms', label: t('plans.table.terms') },
		{ key: 'archived', label: t('archived') }
	]

	useEffect(() => {
		getList(1)
	}, [])

	return <>
		<Header
			title={t('plans.listTitle')}
			containerClass={"flex justify-between"}
			actions={user.permissions.includes('create plans') && <Link href="/plans/add" className="btn btn-sm btn-primary"><FontAwesomeIcon icon={faPlus} /> {t('plans.addBtn')}</Link>}
		/>
		<BaseTable data={data} actions={actions} getListFunction={getList} deleteFunction={deletePlan} bulkDeleteFunction={bulkDeletePlan} archiveable={true} tableController={'plan'} colHeaderNames={colNames} defaultMode={"cards"} cardTitleCol={"name"} />
	</>
}