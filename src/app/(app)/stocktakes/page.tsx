"use client"

import { FormEvent, useEffect, useState } from "react"

import { useAuth } from "@/hooks/auth"
import Header from "@/app/(app)/_components/header"
import BaseTable from "@/app/(app)/_components/baseTable"
import { getStocktakes, addStocktake, getActiveStocktake } from "@/app/(app)/stocktakes/_stocktake"
import { useAtom } from "jotai"
import { activePosSession, branch, posRegister, loading, responseMessage, store, validationErrors } from "@/_state/globalStore"
import { useRouter } from "next/navigation"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus } from "@fortawesome/free-solid-svg-icons"
import InputError from "@/_components/inputError"
import { useTranslation } from "next-i18next"
import { scrollToFirstInvalidElement, validateForm } from "@/app/_helpers/validation"
import StartPosSessionModal from "@/app/(app)/pos-sessions/_components/startPosSessionModal"

export default function StocktakeList() {
    const { t } = useTranslation('common')
	
	const router = useRouter()
	const { user } = useAuth({ middleware: "auth" })
	
	const [ branchID ] = useAtom(branch)
	const [isLoading] = useAtom(loading)
	const [validErrors] = useAtom(validationErrors)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
	const [ posRegisterID ] = useAtom(posRegister)
    const [isStartPosSessionModalOpen, setIsStartPosSessionModalOpen] = useState(false)
	const [ activePosSessionID ] = useAtom(activePosSession)
	const [data, setData] = useState<any>([])
	const [isSubmitting , setIsSubmitting] = useState(false)
	const [isPending, setIsPending] = useState<boolean>(true)
	const actions = {
		path: "/stocktakes",
		view: (row: any): boolean => !row.result
	}

	const getList = (page: number, sort: string=null, sort_direction: string='asc') => {
		getStocktakes(page, branchID, posRegisterID, sort, sort_direction).then((returnData: any) => {
			setData(returnData.response)
		})
	}

    const colNames = [
		{ key: 'name', label: t('stocktakes.table.name') },
		{ key: 'stocktake_date', label: t('stocktakes.table.stocktakeDate') },
		{ key: 'status', label: t('stocktakes.table.status') },
        { key: 'result', label: t('stocktakes.table.result') },
		{ key: 'approved_by', label: t('stocktakes.table.approvedBy') },
        { key: 'created_by', label: t('stocktakes.table.createdBy') },
		{ key: 'updated_by', label: t('stocktakes.table.updatedBy') },
    ]

	useEffect(() => {
		getList(1)
	}, [])

    useEffect(() => {
        if (!branchID || !posRegisterID) return

        getActiveStocktake(branchID, posRegisterID).then((returnData: any) => {
            setIsPending(returnData.response?.id ? true : false)
        })
        .catch(() => setIsPending(false))
	}, [branchID, posRegisterID])

    useEffect(() => {
        if (activePosSessionID !== -1)
            setIsStartPosSessionModalOpen(false)
    }, [activePosSessionID])

    const handleCreateStocktakeBtn = () => {
        if (activePosSessionID === -1)
            setIsStartPosSessionModalOpen(true)

        setIsCreateModalOpen(true)
    }

	const formSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const form = event.currentTarget
        const {errors, firstInvalidElement} = validateForm(form, t)
        if (Object.keys(errors).length > 0) {
            store.set(validationErrors, errors)
            if (firstInvalidElement) scrollToFirstInvalidElement(firstInvalidElement)
            return
        }

        const formData = new FormData(form)
        formData.set('pos_register_id', `${posRegisterID}`)
        formData.set('pos_register_session_id', `${activePosSessionID}`)
		setIsSubmitting(true)
		await addStocktake(formData).then((returnData) => {
			router.push(`/stocktakes/${returnData.response.id}`)
			store.set(responseMessage, { type: 'success', text: `${t('stocktakes.createdMessage')}` });
		})
		.catch(() => setIsSubmitting(false))
	}

	return <>
        <StartPosSessionModal 
            isOpen={isStartPosSessionModalOpen} 
            onClose={() => {
                setIsStartPosSessionModalOpen(false) 
                setIsCreateModalOpen(false)}
            }
            cancelBtn={{ display: true, label: t('back') }}
        />

		<Header
			title={t('stocktakes.listTitle')}
			containerClass={"flex justify-between"}
            actions={(user.permissions.includes('create stocktakes')) && 
                <span className={isPending ? 'tooltip tooltip-left rtl:tooltip-right' : ''} data-tip={t('stocktakes.disabledAddMessage')}> 
                    <button 
                        onClick={() => handleCreateStocktakeBtn()} 
                        disabled={isPending} 
                        className={`btn btn-sm btn-primary`}
                    >
                        <FontAwesomeIcon icon={faPlus} /> {t('stocktakes.addBtn')}
                    </button>
                </span>
            }
		/>
		<BaseTable data={data} actions={actions} getListFunction={getList} tableController={'stocktake'} colHeaderNames={colNames} cardTitleCol={"name"} />
        
		<input type="checkbox" id="stocktake_modal" className="modal-toggle" checked={isCreateModalOpen} onChange={(e) => setIsCreateModalOpen(e.target.checked)}/>
		<div className="modal" role="dialog">
			<div className="modal-box">
				<form onSubmit={formSubmit}>
					<div className="text-xl text-primary text-bold mb-4">{t('stocktakes.addTitle')}</div>
					<div className="grid gap-2 grid-cols-1 sm:grid-cols-2 mb-3">
						<input name="branch_id" type="hidden" value={branchID}/>
						<div className="">
							<label className="label justify-start label-text required">{t('stocktakes.name')}</label>
							<input name="name" data-rules="required" type="text" className="input input-bordered input-sm w-full" />
							<InputError messages={validErrors.name} />
						</div>
						<div className="">
							<label className="label justify-start label-text required">{t('stocktakes.stocktakeDate')}</label>
							<input name="stocktake_date" data-rules="required" type="date" className="input input-bordered input-sm w-full" />
							<InputError messages={validErrors.stocktake_date} />
						</div>
						<div className="sm:col-span-2">
							<label className="label justify-start label-text">{t('stocktakes.notes')}</label>
							<textarea name="notes" className="textarea input-bordered w-full min-h-40" />
							<InputError messages={validErrors.notes} />
						</div>
					</div>
					<div className="grid grid-cols-1 justify-items-end mt-5">
						<button className="btn btn-sm btn-primary w-fit" type="submit" disabled={isSubmitting}>{isSubmitting && <span className="loading loading-spinner"></span>}{t('stocktakes.addFormBtn')}</button>
					</div>
				</form>
			</div>
			<label className="modal-backdrop" htmlFor="stocktake_modal"></label>
		</div>
	</>
}