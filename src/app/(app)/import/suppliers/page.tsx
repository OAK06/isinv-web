"use client"

import { useEffect, useRef, useState } from "react"

import { useAtom } from "jotai"
import { branch, responseMessage, store, validationErrors } from "@/_state/globalStore"
import InputError from "@/_components/inputError"
import { batchStatus, downloadTemplate, getFileHeadings,} from "@/app/(app)/import/_import"
import { checkSupplierFile, getImportSuppliers, importSuppliers} from "@/app/(app)/import/suppliers/_importSupplier"
import HintCard from "@/app/(app)/import/_components/hintCard"
import Header from "@/app/(app)/_components/header"
import ImportTable from "@/app/(app)/import/_components/importTable"
import { useRouter } from "next/navigation"
import { useTranslation } from "next-i18next"
import { scrollToFirstInvalidElement, validateForm } from "@/app/_helpers/validation"

export default function ImportSuppliers() {
    const { t } = useTranslation('common')
	const router = useRouter()
	const [data, setData] = useState<any>([])
	const [ branchID ] = useAtom(branch)
	const [validErrors] = useAtom(validationErrors)
	const [startSpinner , setStartSpinner] = useState(false)
    const [columns, setColumns] = useState<any>({})
    const [mapping, setMapping] = useState<any>({})
    const [file, setFile] = useState<File | null>(null)
    const [checkBatchID, setCheckBatchID] = useState<string | null>(null)
    const [importBatchID, setImportBatchID] = useState<string | null>(null)
	const [isSubmitting , setIsSubmitting] = useState(false)
	const [fileHasErrors , setFileHasErrors] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null);
    const sysHeadings = {'name': true, 'email': true, 'phone': false, 'address': false}

	const fileUploaded = async () => {
        setMapping({})
        setColumns({})
        setData([])
        if (!file) return

		const formData = new FormData()
        formData.append('file', file)
		await getFileHeadings(formData).then((returnData) => {
            setColumns(returnData.response)
		})
        .catch(() => setIsSubmitting(false))
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
        setCheckBatchID(null)
        setIsSubmitting(true)
        const updatedMapping = Object.fromEntries(
            Object.keys(sysHeadings).map(key => [key, mapping[key] ?? ''])
        )

        formData.append("login_branch_id", `${branchID}`)
        formData.append("mapping", JSON.stringify(updatedMapping))
        if (file)
            formData.append("file", file)

        await checkSupplierFile(formData).then((returnData) => {
            setCheckBatchID(returnData.response)
            setIsSubmitting(false)
        })
        .catch(() => setIsSubmitting(false))
    }

    const getList = async (page: number, branch: number) => {
        const res = await getImportSuppliers(page, checkBatchID, branch)

        if (res.status === 'success') {
            setData(res.response)
            setFileHasErrors(res.response.data.some((item: any) => item.errors && item.errors.length > 0))
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
	}, [checkBatchID, branchID])

    const handleImport = async () => {
        if (!checkBatchID || branchID === -1) return
        setIsSubmitting(true)

        await importSuppliers(checkBatchID, branchID).then((returnData) => {
            setImportBatchID(returnData.response)
            store.set(responseMessage, { type: 'success', text: t('importSuppliers.createdMessage') })
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
        downloadTemplate(headings, 'suppliers-import-template')
    }

    const importTips = {
        title: t('importSuppliers.tipsTitle'),
        tips: t('importSuppliers.tips', { returnObjects: true }),
        templateBtnAction: handleDownloadTemplate
    }

    const colNames = [
		{ key: 'row_number', label: t('importSuppliers.table.rowNumber') },
		{ key: 'supplier', label: t('importSuppliers.table.supplier') },
		{ key: 'is_success', label: t('importSuppliers.table.success') },
        { key: 'errors', label: t('importSuppliers.table.errors') },
        { key: 'name', label: t('importSuppliers.table.name') },
        { key: 'email', label: t('importSuppliers.table.email') },
        { key: 'phone', label: t('importSuppliers.table.phone') },
        { key: 'address', label: t('importSuppliers.table.address') },
	]

    return <>
        <Header
            title={t('importSuppliers.listTitle')}
            containerClass={"flex justify-between"}
        />

        <div className="mt-6 space-y-6">
            <HintCard tips={importTips}/>

            <div className="card bg-base-100 border border-base-200 shadow-sm">
                <div className="card-body">
                    <div className="space-y-4">
                        <div>
                            <label className="label justify-start">
                                <span className="label-text font-semibold required">{t('importSuppliers.uploadFile')}</span>
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
                            {t('importSuppliers.mappingTitle')}
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
                                {t('importSuppliers.mappingBtn')}
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
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="card-title text-xl">
                                <div className="w-1 h-6 bg-primary rounded me-2"></div>
                                {t('importSuppliers.previewTitle')}
                            </h2>
                            <button onClick={handleImport} className="btn btn-sm btn-primary" disabled={isSubmitting || fileHasErrors}>
                                {isSubmitting && <span className="loading loading-spinner"></span>}
                                {t('importSuppliers.importBtn')}
                            </button>
                        </div>

                        <ImportTable data={data} getListFunction={getList} colHeaderNames={colNames} />
                    </div>
                </div>
            )}
        </div>
    </>
}
