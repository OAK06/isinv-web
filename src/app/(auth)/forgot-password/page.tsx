"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/auth"

import InputError from "@/_components/inputError"
import { validateEmail } from "@/app/(auth)/_helpers/validation"
import AuthSessionStatus from "@/app/(auth)/_components/authSessionStatus"
import { useTranslation } from "next-i18next"

export default function ForgotPassword() {
    const { t } = useTranslation('common')
	const { forgotPassword } = useAuth({ middleware: "guest", redirectIfAuthenticated: "/dashboard" })

	const [email, setEmail] = useState("")
	const [status, setStatus] = useState(null)
	const [errors, setErrors] = useState<any>({})
	const [isSubmitting, setIsSubmitting] = useState(false)

	const submitForm = event => {
		event.preventDefault()
		if (validateEmail(email))
			setErrors({ email: [t('invalidEmail')] })
		else
			forgotPassword({ email, setErrors, setStatus, setIsSubmitting })
	}

	return <>
		<AuthSessionStatus className="mb-4" status={status} />
		<form onSubmit={submitForm} className="space-y-4">
			<div className="text-sm">
                {t('forgotPassword.title')}
			</div>
			<div>
				<label htmlFor="email">{t('forgotPassword.email')}</label>
				<input
					id="email"
					autoComplete="email"
					type="email"
					name="email"
					value={email}
					className="mt-1 input input-bordered w-full"
					onChange={e => setEmail(e.target.value)}
					required
					autoFocus
				/>
				<InputError messages={errors.email} />
			</div>
			<div className="flex items-center justify-end">
				<button type="submit" disabled={isSubmitting} className="btn btn-primary rounded-full">{isSubmitting && <span className="loading loading-spinner loading-xs"></span>} {t('forgotPassword.resetLinkBtn')}</button>
			</div>
		</form>
		</>
}