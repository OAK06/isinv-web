"use client"

import { useTranslation } from "next-i18next"
import { useCallback, useRef, useState } from "react"

export function useConfirm() {
    const { t } = useTranslation('common')
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [message, setMessage] = useState<string>("")
    const resolveRef = useRef<((value: boolean) => void) | null>(null)

    const confirm = useCallback((msg: string) => {
        setMessage(msg)
        setIsOpen(true)

        return new Promise<boolean>((resolve) => {
            resolveRef.current = resolve
        })
    }, [])

    const handleClose = (value: boolean) => {
        resolveRef.current?.(value)
        setIsOpen(false)
    }

    const confirmModal = (
        <div className={`modal modal-middle z-[9999] ${isOpen ? "modal-open" : ""}`}>
            <div className="modal-box max-w-[440px]">
                <p>{message}</p>
                <div className="modal-action rtl:gap-2">
                    <button onClick={() => handleClose(false)} className="btn btn-sm btn-ghost">{t('cancel')}</button>
                    <button onClick={() => handleClose(true)} className="btn btn-sm btn-primary">{t('confirm')}</button>
                </div>
            </div>
        </div>
    )

    return { confirm, confirmModal }
}
