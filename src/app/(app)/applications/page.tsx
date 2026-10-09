"use client"

import { FormEvent, useEffect, useState } from "react"

import { useAuth } from "@/hooks/auth"
import Header from "@/app/(app)/_components/header"
import BaseTable from "@/app/(app)/_components/baseTable"
import { getApps, rejectApplication, archiveApplication } from "@/app/(app)/applications/_application"
import { useAtom } from "jotai"
import { branch, responseMessage, store, validationErrors } from "@/_state/globalStore"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArchive, faCheck, faXmark } from "@fortawesome/free-solid-svg-icons"
import { useRouter } from "next/navigation"
import InputError from "@/_components/inputError"
import { useTranslation } from "next-i18next"
import { useConfirm } from "@/_components/useConfirm"
import { scrollToFirstInvalidElement, validateForm } from "@/app/_helpers/validation"

export default function ApplicationList() {
    const { t } = useTranslation('common')
	const router = useRouter()
	const [data, setData] = useState<any>([])
	const { user } = useAuth({ middleware: "auth" })
	const [ branchID ] = useAtom(branch)
	const [isSubmitting , setIsSubmitting] = useState(false)
	const [isRejectAppModalOpen, setIsRejectAppModalOpen] = useState<boolean>(false)
	const [selectedAppToReject, setSelectedAppToReject] = useState<number | null>(null)
	const [validErrors] = useAtom(validationErrors)
    const { confirm, confirmModal } = useConfirm()
	const actions = {
		path: "/applications",
		view: user.permissions.includes('view applications'),
		extra: [
			user.permissions.includes('approve applications') && {
				type: 'btn',
                display: (row: any): boolean => {
                    return row.status?.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() === 'inprogress'
                },
				action: (rowId: number) => router.push(`/applications/${rowId}/edit`),
				classes: "btn-warning",
				icon: <FontAwesomeIcon icon={faCheck} />
			},
			user.permissions.includes('reject applications') && {
				type: 'btn',
                display: (row: any): boolean => {
                    return row.status?.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() === 'inprogress'
                },
				action: (rowId: number) => {
					setIsRejectAppModalOpen(true)
					setSelectedAppToReject(rowId)
				},
				classes: "btn-error",
				icon: <FontAwesomeIcon icon={faXmark} />
			},
			user.permissions.includes('archive applications') && {
				type: 'btn',
                display: (row: any): boolean => {
                    return row.status?.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() === 'inprogress'
                },
				action: (rowId: number) => archiveApp(rowId),
				classes: "btn-primary",
				icon: <FontAwesomeIcon icon={faArchive} />
			}
		]
	}

	const archiveApp = async (rowId: number) => {
		const confirmation = await confirm(t('applications.archiveConfirmation')) 
        if (confirmation) {
			await archiveApplication(rowId).then((returnData: any) => {
				// setData((prevData: any) => ({
				// 	...prevData,
				// 	data: prevData.data.filter((item: any) => item.id !== returnData.response.id)
				// }));	
                getList(1)
				store.set(responseMessage, { type: 'success', text: t('applications.archivedMessage') });
			})
        }
	}

	const rejectApp = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const form = event.currentTarget
        const {errors, firstInvalidElement} = validateForm(form, t)
        if (Object.keys(errors).length > 0) {
            store.set(validationErrors, errors)
            if (firstInvalidElement) scrollToFirstInvalidElement(firstInvalidElement)
            return
        }

        const formData = new FormData(form)
		setIsSubmitting(true)
		await rejectApplication(selectedAppToReject, formData).then((returnData: any) => {
			setIsSubmitting(false)
			setIsRejectAppModalOpen(false)

			// setData((prevData: any) => ({
			// 	...prevData,
			// 	data: prevData.data.filter((item: any) => item.id !== returnData.response.id)
			// }));
            getList(1)
			store.set(responseMessage, { type: 'success', text: t('applications.rejectedMessage') });
		})
		.catch(() => setIsSubmitting(false))
	}
	
	const getList = (page: number, sort: string=null, sort_direction: string='asc') => {
		getApps(page, branchID, sort, sort_direction).then((returnData: any) => {
			setData(returnData.response)
		})
	}

	useEffect(() => {
		getList(1)
	}, [])

    const colNames = [
        { key: 'plan_id', label: t('applications.table.plan') },
        { key: 'fname', label: t('applications.table.fname') },
        { key: 'sname', label: t('applications.table.sname') },
        { key: 'birth_date', label: t('applications.table.birthDate') },
        { key: 'gender', label: t('applications.table.gender') },
        { key: 'address', label: t('applications.table.address') },
        { key: 'city', label: t('applications.table.city') },
        { key: 'country', label: t('applications.table.country') },
        { key: 'home_phone', label: t('applications.table.homePhone') },
        { key: 'mobile_phone', label: t('applications.table.mobilePhone') },
        { key: 'email', label: t('applications.table.email') },
        { key: 'emg_contact_name', label: t('applications.table.emgContactRelation') },
        { key: 'emg_contact_relation', label: t('applications.table.emgContactName') },
        { key: 'emg_contact_mobilenumber', label: t('applications.table.emgContactMobileNumber') },
        { key: 'emg_contact_email', label: t('applications.table.emgContactEmail') },
        { key: 'emg_contact_address', label: t('applications.table.emgContactAddress') },
        { key: 'emg_contact_city', label: t('applications.table.emgContactCity') },
        { key: 'emg_contact_country', label: t('applications.table.emgContactCountry') },
        { key: 'notes', label: t('applications.table.notes') },
		{ key: 'has_health_conditions', label: t('applications.table.hasHealthConditions') },
        { key: 'health_conditions', label: t('applications.table.healthConditions') },
        { key: 'medications', label: t('applications.table.medications') },
        { key: 'access_type', label: t('applications.table.accessType') },
        { key: 'duration', label: t('applications.table.duration') },
        { key: 'type', label: t('applications.table.type') },
        { key: 'duration_count', label: t('applications.table.durationCount') },
        { key: 'startup_fee', label: t('applications.table.startupFee') },
        { key: 'price', label: t('applications.table.price') },
        { key: 'cancellation_fee', label: t('applications.table.cancellationFee') },
        { key: 'initial_pause_fee', label: t('applications.table.initialPauseFee') },
        { key: 'recurring_pause_fee', label: t('applications.table.recurringPauseFee') },
        { key: 'tax_percentage', label: t('applications.table.taxPercentage') },
        { key: 'trial', label: t('applications.table.trial') },
        { key: 'auto_renew_forever', label: t('applications.table.autoRenewForever') },
        { key: 'membership_start', label: t('applications.table.membershipStart') },
        { key: 'membership_end', label: t('applications.table.membershipEnd') },
	]
	
	return <>
		<Header
			title={t('applications.listTitle')}
			containerClass={"flex justify-between"}
		/>
		<BaseTable data={data} actions={actions} getListFunction={getList} userPermissions={user.permissions} tableController={'application'} colHeaderNames={colNames} cardTitleCol={["fname", "sname"]}  />
        <input type="checkbox" id="reject-app-modal" className="modal-toggle" checked={isRejectAppModalOpen} onChange={(e) => setIsRejectAppModalOpen(e.target.checked)}/>
		<div className="modal">
			<div className="modal-box">
				<h3 className="text-lg text-primary font-bold">{t('applications.rejectTitle')}</h3>
				<form onSubmit={rejectApp}>
					<div className="grid gap-2 grid-cols-1 sm:grid-cols-2 mb-3">
						<div className="sm:col-span-2">
							<label className="label justify-start label-text required">{t('applications.reason')}</label>
							<textarea name="reason" data-rules="required" className="textarea input-bordered w-full min-h-40" />
							<InputError messages={validErrors.reason} />
						</div>
					</div>

					<div className="grid grid-cols-1 justify-items-end mt-5">
						<button className="btn btn-sm btn-primary w-fit" type="submit" disabled={isSubmitting}>{isSubmitting && <span className="loading loading-spinner"></span>}{t('applications.rejectFormBtn')}</button>
					</div>
				</form>
			</div>
            <label className="modal-backdrop" htmlFor="reject-app-modal" aria-label="Close"></label>
		</div>
        {confirmModal}
	</>
}