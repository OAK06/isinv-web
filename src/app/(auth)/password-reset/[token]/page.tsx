"use client"

import { useAuth } from "@/hooks/auth"
import PasswordInput from "@/_components/passwordInput"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

import InputError from "@/_components/inputError"
import AuthSessionStatus from "@/app/(auth)/_components/authSessionStatus"
import { validateEmail, validatePassword } from "@/app/(auth)/_helpers/validation"
import { useTranslation } from "next-i18next"

export default function PasswordReset() {
    const { t } = useTranslation('common')
	const searchParams = useSearchParams()

	const { resetPassword } = useAuth({ middleware: "guest" })

	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [passwordConfirmation, setPasswordConfirmation] = useState("")
	const [errors, setErrors] = useState<any>({})
	const [status, setStatus] = useState(null)
	const [isSubmitting, setIsSubmitting] = useState(false)

	const submitForm = event => {
		event.preventDefault()
		if (validateEmail(email))
			setErrors({ email: [t('invalidEmail')] })
		else if (validatePassword(password, passwordConfirmation))
			setErrors({ password: [t('invalidPasswordConfirmation')] })
		else
			resetPassword({ email, password, password_confirmation: passwordConfirmation, setErrors, setStatus, setIsSubmitting })
	}

	useEffect(() => {
		setEmail(searchParams.get("email") ?? "")
	}, [searchParams.get("email")])

	return <>
		<AuthSessionStatus className="mb-4" status={status} />
		<form onSubmit={submitForm} className="space-y-4">
			<div>
				<label htmlFor="email">{t('resetPassword.email')}</label>
				<input
					id="email"
					autoComplete="email"
					type="email"
					value={email}
					className="mt-1 input input-bordered w-full"
					onChange={e => setEmail(e.target.value)}
					required
					autoFocus
				/>
				<InputError messages={errors.email} />
			</div>
			<div>
				<label htmlFor="password">{t('resetPassword.password')}</label>
				<PasswordInput
					id="password"
					autoComplete="new-password"
					
					value={password}
					className="mt-1 input input-bordered w-full"
					onChange={event => setPassword(event.target.value)}
					required
				/>
				<InputError messages={errors.password} />
			</div>
			<div>
				<label htmlFor="passwordConfirmation">{t('resetPassword.confirmPassword')}</label>
				<PasswordInput
					id="passwordConfirmation"
					autoComplete="new-password"
					
					value={passwordConfirmation}
					className="mt-1 input input-bordered w-full"
					onChange={e => setPasswordConfirmation(e.target.value)}
					required
				/>
				<InputError messages={errors.password_confirmation} />
			</div>
			<div className="flex items-center justify-end">
				<button type="submit" disabled={isSubmitting} className="btn btn-primary rounded-full">{isSubmitting && <span className="loading loading-spinner loading-xs"></span>} {t('resetPassword.formBtn')}</button>
			</div>
		</form>
		</>
}