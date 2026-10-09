"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/auth"
import { useTranslation } from "next-i18next"

export default function VerifyEmail() {
    const { t } = useTranslation('common')
	const { logout, resendEmailVerification } = useAuth({ middleware: "auth", redirectIfAuthenticated: "/dashboard" })

	const [status, setStatus] = useState(null)
	const [isSubmitting, setIsSubmitting] = useState(false)

	return <>
		<div className="mb-4 text-sm">{t('verifyEmail.thanksMessage')}</div>
		{status === "verification-link-sent" && <div className="mb-4 font-medium text-sm text-success">{t('verifyEmail.resendMessage')}</div>}
		<div className="mt-4 flex items-center justify-between">
			<button onClick={() => resendEmailVerification({ setStatus, setIsSubmitting })} className="btn btn-primary rounded-full">{isSubmitting && <span className="loading loading-spinner loading-xs"></span>} {t('verifyEmail.resendBtn')}</button>
			<button onClick={logout} className="link-primary">{t('verifyEmail.logoutBtn')}</button>
		</div>
	</>
}