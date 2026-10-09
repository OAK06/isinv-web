"use client"

import { useEffect, useRef, useState } from "react"

import { useAtom } from "jotai"
import { branch, responseMessage, store, validationErrors } from "@/_state/globalStore"
import InputError from "@/_components/inputError"
import { batchStatus, downloadTemplate, getFileHeadings,} from "@/app/(app)/import/_import"
import { checkMemberFile, getImportMembers, importMembers} from "@/app/(app)/import/members/_importMember"
import HintCard from "@/app/(app)/import/_components/hintCard"
import ImportTable from "@/app/(app)/import/_components/importTable"
import { useRouter } from "next/navigation"
import { useTranslation } from "next-i18next"
import { useConfirm } from "@/_components/useConfirm"
import Header from "@/app/(app)/_components/header"
import { scrollToFirstInvalidElement, validateForm } from "@/app/_helpers/validation"

export default function ImportMembers() {
    const { t } = useTranslation('common')
	const router = useRouter()
	const [data, setData] = useState<any>([])
	const [ branchID ] = useAtom(branch)
	const [validErrors] = useAtom(validationErrors)
	const [startSpinner, setStartSpinner] = useState(false)
    const [columns, setColumns] = useState<any>({})
    const [mapping, setMapping] = useState<any>({})
    const [file, setFile] = useState<File | null>(null)
    const [checkBatchID, setCheckBatchID] = useState<string | null>(null)
    const [importBatchID, setImportBatchID] = useState<string | null>(null)
    const [handleDuplicates, setHandleDuplicates] = useState<string>("");
	const [withPlans, setWithPlans] = useState<boolean>(false)
	const [membersAlreadyExist, setMembersAlreadyExist] = useState<boolean | null>(null)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [fileHasErrors, setFileHasErrors] = useState(false)
	const [confirmChange, setConfirmChange] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null);
    const memberHeadings = {'fname': true, 'sname': true, 'birth_date': true, 'gender': true, 'address': false, 'city': false, 'country': false, 'home_phone': false, 'mobile_phone': true, 'email': true, 'emg_contact_name': false, 'emg_contact_relation': false, 'emg_contact_mobilenumber': false, 'emg_contact_email': false, 'emg_contact_address': false, 'emg_contact_city': false, 'emg_contact_country': false, 'notes': false, 'medications': false}
    const planHeadings = {'plan_name': true, 'duration': true, 'type': true, 'duration_count': true, 'startup_fee': true, 'price': true, 'cancellation_fee': true, 'initial_pause_fee': true, 'recurring_pause_fee': true, 'tax_percentage': true, 'trial': true, 'membership_start': true, 'membership_end': true, 'start_date': true, 'end_date': true, 'bill_at': true}
    const [sysHeadings, setSysHeadings] = useState<any>(memberHeadings)
    const { confirm, confirmModal } = useConfirm()
    
    useEffect(() => {
        if (withPlans) {
            setSysHeadings({ ...memberHeadings, ...planHeadings })
        } else {
            setSysHeadings(memberHeadings)
        }
    }, [withPlans])

	const fileUploaded = async () => {
        setMapping({})
        setColumns({})
        setData([])
        setHandleDuplicates("")
        setConfirmChange(false)
        if (!file) return

		const formData = new FormData()
        formData.append('file', file)
		await getFileHeadings(formData).then((returnData) => {
            setColumns(returnData.response)
		})
	}

    useEffect(() => {
		fileUploaded()
	}, [file])

    const handleCheckFile = async () => {
        const form = document.createElement("form")
        const customFields: Record<string, any> = {}
        Object.entries(sysHeadings).forEach(([field, isRequired]) => {
            customFields[`mapping.${field}`] = { value: mapping[field] ?? "", rules: isRequired ? ["required"] : [] }
        })
        const {errors, firstInvalidElement} = validateForm(form, t, customFields)
        if (Object.keys(errors).length > 0) {
            store.set(validationErrors, errors)
            if (firstInvalidElement) scrollToFirstInvalidElement(firstInvalidElement)
            return
        }

        const formData = new FormData()
        setConfirmChange(true)
        setCheckBatchID(null)
        setIsSubmitting(true)
        const updatedMapping = Object.fromEntries(
            Object.keys(sysHeadings).map(key => [key, mapping[key] ?? ''])
        )

        formData.append("branch_id", `${branchID}`)
        formData.append("mapping", JSON.stringify(updatedMapping))
        file && formData.append("file", file)
        withPlans && formData.append('with_plans', `${withPlans}`)

        await checkMemberFile(formData).then((returnData) => {
            setCheckBatchID(returnData.response)
            setIsSubmitting(false)
        })
        .catch(() => setIsSubmitting(false))
    }

    const getList = async (page: number, branch: number) => {
        const res = await getImportMembers(page, checkBatchID, branch)

        if (res.status === 'success') {
            setData(res.response.data)
            setFileHasErrors(res.response.data.data.some((item: any) => item.errors && item.errors.length > 0))
            setMembersAlreadyExist(res.response.hasMatchingMembers)
        } else if (res.status === 'in-progress') {
            return false
        }
        
        return true // stop interval
    }

    useEffect(() => {
        if (!checkBatchID || branchID === -1) return
        
        setStartSpinner(true)
        let running = false

		const interval = setInterval(() => {
            if (running) return
            running = true
            getList(1, branchID)
                .then((done) => {
                    if (done) {
                        clearInterval(interval)
                        setStartSpinner(false)
                    }
                })
                .catch((error) => {
                    clearInterval(interval)
                    setStartSpinner(false)
                })
                .finally(() => {
                    running = false
                })
        }, 3000)

        return () => clearInterval(interval)
	}, [checkBatchID])

    const handleWithPlansChange = async () => {
        if (confirmChange) {
            const confirmation = await confirm(t('importMembers.calncelConfirmation'))
            if (!confirmation) return
            setFile(null)
            setWithPlans(prev => !prev)
            if (fileInputRef.current)
                fileInputRef.current.value = ''
        }
        else {
            setWithPlans(prev => !prev)
        }
    }

    const handleImport = async () => {
        if (!checkBatchID) return 
        const form = document.createElement("form")
        const {errors, firstInvalidElement} = validateForm(form, t, {
            ...(membersAlreadyExist && {handle_duplicates: { value: handleDuplicates, rules: ['required'] }})
        })
        if (Object.keys(errors).length > 0) {
            store.set(validationErrors, errors)
            if (firstInvalidElement) scrollToFirstInvalidElement(firstInvalidElement)
            return
        }

        const params = new URLSearchParams({ batch_id: checkBatchID })
        membersAlreadyExist && params.append("handle_duplicates", handleDuplicates)
        withPlans && params.append("with_plans", `${withPlans}`)
        params.append("branch_id", `${branchID}`)

        setIsSubmitting(true)
        await importMembers(params).then((returnData) => {
            setImportBatchID(returnData.response) 
            store.set(responseMessage, { type: 'success', text: t('importMembers.createdMessage') })
            router.push('/dashboard')
        })
        .catch(() => setIsSubmitting(false))
    }   

    useEffect(() => {
        if (!importBatchID) return
        let running = false

		const interval = setInterval(() => {
            if (running) return

            running = true
            batchStatus(importBatchID)
                .then((returnData) => {
                    if (returnData.status !== 'in-progress') {
                        clearInterval(interval)
                        if (fileInputRef.current)
                            fileInputRef.current.value = ''
                        setFile(null)
                        setIsSubmitting(false)
                    }
                })
                .catch((error) => {
                    clearInterval(interval)
                    setIsSubmitting(false)
                })
                .finally(() => {
                    running = false
                })
        }, 3000)

        return () => clearInterval(interval)
	}, [importBatchID])
    
    const handleDownloadTemplate = () => {
        const headings = Object.keys(sysHeadings).map((haeding) =>
            colNames.find((col: any) => col.key === haeding)?.label || haeding
        )
        downloadTemplate(headings, 'members-import-template') 
    }
    
    const PlanTips = t('importMembers.planTips', { returnObjects: true }) as string[]
    const MemberTips = t('importMembers.memberTips', { returnObjects: true }) as string[]

    const importTips = {
        title: t('importMembers.tipsTitle'),
        tips: [
            ...MemberTips,
            ...(withPlans ? PlanTips : [])
        ],
        templateBtnAction: handleDownloadTemplate
    }

    const colNames = [
		{ key: 'row_number', label: t('importMembers.table.rowNumber') },
		{ key: 'member', label: t('importMembers.table.member') },
		{ key: 'plan', label: t('importMembers.table.plan') },
		{ key: 'is_success', label: t('importMembers.table.success') },
        { key: 'errors', label: t('importMembers.table.errors') },
        { key: 'fname', label: t('importMembers.table.fname') },
        { key: 'sname', label: t('importMembers.table.sname') },
        { key: 'birth_date', label: t('importMembers.table.birthDate') },
        { key: 'gender', label: t('importMembers.table.gender') },
        { key: 'address', label: t('importMembers.table.address') },
        { key: 'city', label: t('importMembers.table.city') },
        { key: 'country', label: t('importMembers.table.country') },
        { key: 'home_phone', label: t('importMembers.table.homePhone') },
        { key: 'mobile_phone', label: t('importMembers.table.mobilePhone') },
        { key: 'email', label: t('importMembers.table.email') },
        { key: 'emg_contact_name', label: t('importMembers.table.emgContactRelation') },
        { key: 'emg_contact_relation', label: t('importMembers.table.emgContactName') },
        { key: 'emg_contact_mobilenumber', label: t('importMembers.table.emgContactMobileNumber') },
        { key: 'emg_contact_email', label: t('importMembers.table.emgContactEmail') },
        { key: 'emg_contact_address', label: t('importMembers.table.emgContactAddress') },
        { key: 'emg_contact_city', label: t('importMembers.table.emgContactCity') },
        { key: 'emg_contact_country', label: t('importMembers.table.emgContactCountry') },
        { key: 'notes', label: t('importMembers.table.notes') },
        { key: 'medications', label: t('importMembers.table.medications') },
        { key: 'plan_name', label: t('importMembers.table.planName') },
        { key: 'duration', label: t('importMembers.table.duration') },
        { key: 'type', label: t('importMembers.table.type') },
        { key: 'duration_count', label: t('importMembers.table.durationCount') },
        { key: 'startup_fee', label: t('importMembers.table.startupFee') },
        { key: 'price', label: t('importMembers.table.price') },
        { key: 'cancellation_fee', label: t('importMembers.table.cancellationFee') },
        { key: 'initial_pause_fee', label: t('importMembers.table.initialPauseFee') },
        { key: 'recurring_pause_fee', label: t('importMembers.table.recurringPauseFee') },
        { key: 'tax_percentage', label: t('importMembers.table.taxPercentage') },
        { key: 'trial', label: t('importMembers.table.trial') },
        { key: 'membership_start', label: t('importMembers.table.membershipStart') },
        { key: 'membership_end', label: t('importMembers.table.membershipEnd') },
        { key: 'start_date', label: t('importMembers.table.startDate') },
        { key: 'end_date', label: t('importMembers.table.endDate') },
        { key: 'bill_at', label: t('importMembers.table.billAt') },
	]

	return <>
        <Header
            title={t('importMembers.listTitle')}
            containerClass={"flex justify-between"}
        />
        
        <div className="mt-6 space-y-6">
            <HintCard tips={importTips}/>

            <div className="card bg-base-100 border border-base-200 shadow-sm">
                <div className="card-body">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="flex items-center p-3 bg-base-200 rounded-lg">
                            <label className="label justify-start cursor-pointer w-full">
                                <input name="with_plans" type="checkbox" className="checkbox checkbox-primary" 
                                    checked={withPlans} 
                                    onChange={handleWithPlansChange}
                                />
                                <span className="mx-2 label-text font-semibold">{t('importMembers.withPlans')}</span> 
                            </label>
                        </div>
                        <div className="lg:col-span-2">
                            <label className="label justify-start">
                                <span className="label-text font-semibold required">{t('importMembers.uploadFile')}</span>
                            </label>
                            <input ref={fileInputRef} name="file" type="file" accept=".xlsx, .xls, .csv" className="file-input file-input-bordered input-sm w-full" 
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                            />
                            <InputError messages={validErrors.file} />
                        </div>				
                    </div>
                </div>
            </div>

            {columns && columns.length > 0 && (
                <div className="card bg-base-100 border border-base-200 shadow-sm">
                    <div className="card-body">
                        <h2 className="card-title text-xl mb-4">
                            <div className="w-1 h-6 bg-primary rounded me-2"></div>
                            {t('importMembers.mappingTitle')}
                        </h2>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {Object.entries(sysHeadings).map(([systemField, isRequired]: [string, boolean], i: number) => (
                                <div key={i}>
                                    <label className={`label justify-start ${isRequired ? 'required' : ''}`}>
                                        <span className="label-text font-semibold">{colNames.find((col: any) => col.key === systemField)?.label || systemField}</span>
                                    </label>
                                    <select
                                        className="select select-sm select-bordered w-full"
                                        value={mapping[systemField]}
                                        defaultValue={""}
                                        onChange={(e) => setMapping({ ...mapping, [systemField]: e.target.value })}
                                    >
                                        <option value={""} disabled={isRequired}>{t('chooseOption')}</option>
                                        {columns?.map((col: string) => (
                                            <option key={col} value={col}>{col}</option>
                                        ))}
                                    </select>
                                    <InputError messages={validErrors[`mapping.${systemField}`]} />
                                </div>
                            ))}
                        </div>
                        
                        <div className="card-actions justify-end mt-6">
                            <button onClick={handleCheckFile} className="btn btn-sm btn-primary" disabled={isSubmitting}>
                                {isSubmitting && <span className="loading loading-spinner"></span>}
                                {t('importMembers.mappingBtn')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {startSpinner && (
                <div className="card bg-base-100 border border-base-200 shadow-sm">
                    <div className="card-body text-center">
                        <span className="loading loading-spinner loading-lg"></span>
                        <p className="mt-4 text-lg">{t('loading')}</p>
                    </div>
                </div>
            )}

            {(data.data?.length > 0 && !startSpinner) && (
                <div className="card bg-base-100 border border-base-200 shadow-sm">
                    <div className="card-body">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center mb-6">
                            {membersAlreadyExist && (
                                <div>
                                    <label className="label justify-start">
                                        <span className="label-text font-semibold required">{t('importMembers.existingMembers')}</span>
                                    </label>
                                    <select name="handle_duplicates" 
                                        className="select select-sm select-bordered w-full" 
                                        value={handleDuplicates}
                                        onChange={(e) => setHandleDuplicates(e.target.value)}
                                    >
                                        <option value={""} disabled>{t('chooseOption')}</option>
                                        <option value={"false"}>{t('importMembers.ignore')}</option>
                                        <option value={"true"}>{t('importMembers.update')}</option>
                                    </select>
                                    <InputError messages={validErrors.handle_duplicates} />
                                </div>
                            )}
                            <div className="flex justify-end">
                                <button onClick={handleImport} className="btn btn-sm btn-primary" disabled={isSubmitting || fileHasErrors}>
                                    {isSubmitting && <span className="loading loading-spinner"></span>}
                                    {t('importMembers.importBtn')}
                                </button>
                            </div>
                        </div>
                        
                        <ImportTable data={data} getListFunction={getList} colHeaderNames={colNames} />
                    </div>
                </div>
            )}
        </div>
        
        {confirmModal}
    </>
}