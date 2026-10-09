'use client';

import { FormEvent, useState } from "react"
import { useAuth } from "@/hooks/auth"
import { useAtom } from "jotai"
import { activePosSession, branch, posRegister, responseMessage, store, validationErrors } from "@/_state/globalStore"
import { loading } from "@/_state/globalStore"
import Loading from "@/app/(app)/_components/loading"
import InputError from "@/_components/inputError"
import { useTranslation } from "next-i18next"
import { scrollToFirstInvalidElement, validateForm } from "@/app/_helpers/validation"
import ModalPortal from "@/app/(app)/_components/modalPortal"
import { endPosSession } from "@/app/(app)/pos-sessions/_posSession"

type Props = {
    isOpen: boolean
    onClose: () => void
    sessionID: number
    onSubmitSuccess?: () => void
    cancelBtn: { display: boolean, label?: string }
}

export default function EndPosSessionModal({isOpen, onClose, sessionID, onSubmitSuccess, cancelBtn}: Props) {
    const { t } = useTranslation('common')
	const { user } = useAuth({ middleware: "auth" })
	const [ branchID ] = useAtom(branch)
	const [isLoading] = useAtom(loading)
	const [isSubmitting , setIsSubmitting] = useState(false)
	const [validErrors] = useAtom(validationErrors)
	const [activePosSessionID, setActivePosSessionID] = useAtom(activePosSession)
	const [ posRegisterID ] = useAtom(posRegister)

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
		setIsSubmitting(true)
		await endPosSession(sessionID, formData).then((returnData) => {
            setActivePosSessionID(-1)
            onSubmitSuccess()
			store.set(responseMessage, { type: 'success', text: `${t('posSessions.finishedMessage')}` });
		})
		.catch(() => setIsSubmitting(false))
	}

    return <ModalPortal>
        <input type="checkbox" id="end_pos_session_modal" className="modal-toggle" checked={isOpen} onChange={(e) => { if (!e.target.checked) onClose() }}/>
        <div className="modal" role="dialog">
            <div className="modal-box">
                <form onSubmit={formSubmit}> {isLoading && <Loading />}
                    <div className="text-xl text-primary text-bold mb-4">{t('posSessions.endTitle')}</div>
                    <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 mb-3">
                        <div className="sm:col-span-2">
                            <label className="label justify-start label-text required">{t('posSessions.closeCash')}</label>
                            <input name="close_cash" data-rules="required" type="number" className="input input-bordered input-sm w-full" />
                            <InputError messages={validErrors.close_cash} />
                        </div>
                    </div>
                    <div className="modal-action rtl:gap-2">
                        {cancelBtn.display && 
                            <label className="btn btn-sm btn-error w-fit" htmlFor="end_pos_session_modal">{cancelBtn.label}</label>
                        }
                        <button className="btn btn-sm btn-primary w-fit" type="submit" disabled={isSubmitting}>{isSubmitting && <span className="loading loading-spinner"></span>}{t('posSessions.endFormBtn')}</button>
                    </div>
                </form>
            </div>
            {!cancelBtn.display && <label className="modal-backdrop" htmlFor="end_pos_session_modal"></label>}
        </div>
    </ModalPortal>
}
