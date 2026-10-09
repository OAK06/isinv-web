"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { useAuth } from "@/hooks/auth"
import Header from "@/app/(app)/_components/header"
import BaseTable from "@/app/(app)/_components/baseTable"
import { getMembers } from "@/app/(app)/members/_member"
import { useAtom } from "jotai"
import { branch } from "@/_state/globalStore"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus } from "@fortawesome/free-solid-svg-icons"
import { useTranslation } from 'react-i18next';

export default function MembersList() {
    const { t } = useTranslation('common')
	const [data, setData] = useState<any>([])
	const { user } = useAuth({ middleware: "auth" })
	const [ branchID ] = useAtom(branch)
	const actions = {
		path: "/members",
		view: user.permissions.includes('view members')
	}

	const getList = (page: number, sort: string=null, sort_direction: string='asc') => {
		getMembers(page, branchID, sort, sort_direction).then((returnData: any) => {
			setData(returnData.response)
		})
	}

	useEffect(() => {
		getList(1)
	}, [])

    const colNames = [
        { key: 'fname', label: t('members.table.fname') },
        { key: 'sname', label: t('members.table.sname') },
        { key: 'birth_date', label: t('members.table.birthDate') },
        { key: 'age', label: t('members.table.age') },
        { key: 'gender', label: t('members.table.gender') },
        { key: 'address', label: t('members.table.address') },
        { key: 'city', label: t('members.table.city') },
        { key: 'country', label: t('members.table.country') },
        { key: 'home_phone', label: t('members.table.homePhone') },
        { key: 'mobile_phone', label: t('members.table.mobilePhone') },
        { key: 'email', label: t('members.table.email') },
        { key: 'emg_contact_name', label: t('members.table.emgContactRelation') },
        { key: 'emg_contact_relation', label: t('members.table.emgContactName') },
        { key: 'emg_contact_mobilenumber', label: t('members.table.emgContactMobileNumber') },
        { key: 'emg_contact_email', label: t('members.table.emgContactEmail') },
        { key: 'emg_contact_address', label: t('members.table.emgContactAddress') },
        { key: 'emg_contact_city', label: t('members.table.emgContactCity') },
        { key: 'emg_contact_country', label: t('members.table.emgContactCountry') },
		{ key: 'has_health_conditions', label: t('members.table.hasHealthConditions') },
        { key: 'health_conditions', label: t('members.table.healthConditions') },
        { key: 'medications', label: t('members.table.medications') },
        { key: 'block_booking', label: t('members.table.blockBooking') }, 
        { key: 'notes', label: t('members.table.notes') }, 
	]

	return <>
		<Header
			title={t('members.listTitle')}
			containerClass={"flex justify-between"}
			actions={
				<div className="rtl:space-x-reverse space-x-2">
					{['create members', 'create memberPlans'].every((p) => user.permissions.includes(p)) && <Link href="/members/add/quick" className="btn btn-sm btn-primary"><FontAwesomeIcon icon={faPlus} /> {t('members.quickBtn')}</Link>}
					{user.permissions.includes('create members') && <Link href="/members/add" className="btn btn-sm btn-primary"><FontAwesomeIcon icon={faPlus} /> {t('members.advancedBtn')}</Link>}
				</div>
			}
		/>
		<BaseTable data={data} actions={actions} getListFunction={getList} tableController={'member'} colHeaderNames={colNames} defaultMode={"cards"} cardTitleCol={["fname", "sname"]} />
	</>
}