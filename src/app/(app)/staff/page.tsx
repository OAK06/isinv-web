"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { useAuth } from "@/hooks/auth"
import Header from "@/app/(app)/_components/header"
import BaseTable from "@/app/(app)/_components/baseTable"
import { getStaffs, deleteStaff, bulkDeleteStaff } from "@/app/(app)/staff/_staff"
import { useAtom } from "jotai"
import { branch } from "@/_state/globalStore"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus } from "@fortawesome/free-solid-svg-icons"
import { useTranslation } from "next-i18next"

export default function StaffList() {
    const { t } = useTranslation('common')
	const [data, setData] = useState<any>([])
	const { user } = useAuth({ middleware: "auth" })
	const actions = {
		path: "/staff",
		view: user.permissions.includes('view staff'),
		edit: user.permissions.includes('update staff'),
		delete: user.permissions.includes('delete staff')
	}
	const [ branchID ] = useAtom(branch)

	const getList = (page: number, sort: string=null, sort_direction: string='asc') => {
		getStaffs(page, branchID, sort, sort_direction).then((returnData: any) => {
			setData(returnData.response)
		})
	}

    const colNames = [
		{ key: 'name', label: t('staff.table.name') },
		{ key: 'user_id', label: t('staff.table.user') },
		{ key: 'birth_date', label: t('staff.table.birthDate') },
        { key: 'gender', label: t('staff.table.gender') },
		{ key: 'address', label: t('staff.table.address') },
        { key: 'city', label: t('staff.table.city') },
		{ key: 'country', label: t('staff.table.country') },
		{ key: 'home_phone', label: t('staff.table.homePhone') },
        { key: 'mobile_phone', label: t('staff.table.mobilePhone') },
		{ key: 'email', label: t('staff.table.email') },
        { key: 'emg_contact_name', label: t('staff.table.emgContactName') },
		{ key: 'emg_contact_relation', label: t('staff.table.emgContactRelation') },
		{ key: 'emg_contact_mobilenumber', label: t('staff.table.emgContactMobileNumber') },
        { key: 'emg_contact_email', label: t('staff.table.emgContactEmail') },
		{ key: 'emg_contact_address', label: t('staff.table.emgContactAddress') },
        { key: 'emg_contact_city', label: t('staff.table.emgContactCity') },
		{ key: 'emg_contact_country', label: t('staff.table.emgContactCountry') },
		{ key: 'blacklist', label: t('staff.table.blacklist') },
        { key: 'notes', label: t('staff.table.notes') },
		{ key: 'created_by', label: t('staff.table.createdBy') },
		{ key: 'archived', label: t('archived') }
	]

	useEffect(() => {
		getList(1)
	}, [])

	return <>
		<Header
			title={t('staff.listTitle')}
			containerClass={"flex justify-between"}
			actions={user.permissions.includes('create staff') && <Link href="/staff/add" className="btn btn-sm btn-primary"><FontAwesomeIcon icon={faPlus} /> {t('staff.addBtn')}</Link>}
		/>
		<BaseTable data={data} actions={actions} getListFunction={getList} deleteFunction={deleteStaff} bulkDeleteFunction={bulkDeleteStaff} archiveable={true} tableController={'staff'} colHeaderNames={colNames} defaultMode={"cards"} cardTitleCol={"name"} />
	</>
}