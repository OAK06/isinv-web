"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSetAtom } from "jotai"
import { useTranslation } from "next-i18next"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons"
import { resetAppState, responseMessage, store } from "@/_state/globalStore"
import { closeAccount } from "@/app/(app)/billing/_billing"
import PasswordInput from "@/_components/passwordInput"

/**
 * Owner-only "danger zone": irreversibly closes the account (deletes all
 * gym/member/staff data + files; billing-ledger rows are kept server-side
 * for legal/tax reasons). Rendered ONLY for a Company Owner — never for
 * staff/demo — the backend re-checks the role + password regardless.
 */
export default function CloseAccountSection({ user }: { user: any }) {
    const { t } = useTranslation('common')
    const router = useRouter()
    const resetState = useSetAtom(resetAppState)

    const [open, setOpen] = useState(false)
    const [password, setPassword] = useState("")
    const [confirmText, setConfirmText] = useState("")
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState("")

    if (!user?.roles?.includes('Company Owner')) return null

    const closeModal = () => {
        if (busy) return
        setOpen(false)
        setPassword("")
        setConfirmText("")
        setError("")
    }

    const canConfirm = password.length > 0 && confirmText === 'DELETE'

    const submit = async () => {
        if (!canConfirm) return
        setBusy(true)
        setError("")
        try {
            await closeAccount(password, confirmText)
            resetState()
            store.set(responseMessage, { type: 'success', text: t('billing.closeAccount.success') })
            router.replace('/login')
        } catch (e: any) {
            const code = e?.response?.data?.code
            setError(code ? t(`apiErrors.${code}`, { defaultValue: t('billing.closeAccount.genericError') }) : t('billing.closeAccount.genericError'))
            setBusy(false)
        }
    }

    return <>
        <div className="mt-6 card bg-base-100 border border-error/30 shadow-sm">
            <div className="card-body">
                <h3 className="card-title text-lg mb-1 text-error">
                    <FontAwesomeIcon icon={faTriangleExclamation} />
                    {t('billing.closeAccount.title')}
                </h3>
                <p className="text-sm text-base-content/60 mb-4">{t('billing.closeAccount.warning')}</p>
                <div>
                    <button className="btn btn-error" onClick={() => setOpen(true)}>
                        {t('billing.closeAccount.button')}
                    </button>
                </div>
            </div>
        </div>

        <div className={`modal modal-middle ${open ? "modal-open" : ""}`}>
            <div className="modal-box max-w-[520px]">
                <h3 className="font-bold text-lg mb-2 text-error">{t('billing.closeAccount.title')}</h3>

                <div className="alert alert-warning mb-4">
                    <FontAwesomeIcon icon={faTriangleExclamation} />
                    <span>{t('billing.closeAccount.warning')}</span>
                </div>

                <p className="text-sm text-base-content/70 mb-4">
                    {t('billing.closeAccount.exportFirst')}{' '}
                    <Link href="/finance" className="link link-primary">{t('billing.closeAccount.exportFinanceLink')}</Link>
                    {' · '}
                    <Link href="/members" className="link link-primary">{t('billing.closeAccount.exportMembersLink')}</Link>
                </p>

                <div className="space-y-4">
                    <div>
                        <label className="label justify-start">
                            <span className="label-text font-semibold">{t('billing.closeAccount.passwordLabel')}</span>
                        </label>
                        <PasswordInput
                            value={password}
                            className="input input-bordered w-full"
                            onChange={(e: any) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            disabled={busy}
                        />
                    </div>
                    <div>
                        <label className="label justify-start">
                            <span className="label-text font-semibold">{t('billing.closeAccount.confirmLabel')}</span>
                        </label>
                        <input
                            type="text"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            placeholder={t('billing.closeAccount.confirmPlaceholder')}
                            className="input input-bordered w-full"
                            disabled={busy}
                        />
                    </div>
                    {error && <p className="text-sm text-error">{error}</p>}
                </div>

                <div className="modal-action rtl:gap-2">
                    <button type="button" className="btn btn-ghost" onClick={closeModal} disabled={busy}>
                        {t('cancel')}
                    </button>
                    <button type="button" className="btn btn-error" onClick={submit} disabled={busy || !canConfirm}>
                        {busy && <span className="loading loading-spinner loading-xs"></span>}
                        {t('billing.closeAccount.confirmButton')}
                    </button>
                </div>
            </div>
        </div>
    </>
}
