"use client"

import Link from "next/link"
import PasswordInput from "@/_components/passwordInput"
import { useState } from "react"
import { useAuth } from "@/hooks/auth"

import InputError from "@/_components/inputError"
import { validateEmail, validatePassword } from "@/app/(auth)/_helpers/validation"
import { useTranslation } from "next-i18next"
import { useEmailConflictGuard } from "@/_components/useEmailConflictGuard"

export default function Register() {
    const { t } = useTranslation('common')
	const { register } = useAuth({ middleware: "guest", redirectIfAuthenticated: "/choose-branch" })
	const { guard, emailConflictModal } = useEmailConflictGuard()

	const [name, setName] = useState("")
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [passwordConfirmation, setPasswordConfirmation] = useState("")
	const [errors, setErrors] = useState<any>({})
	const [isSubmitting , setIsSubmitting] = useState(false)

	const submitForm = async event => {
		event.preventDefault()
		if (validateEmail(email))
			setErrors({ email: [t('invalidEmail')] })
		else if (validatePassword(password, passwordConfirmation))
			setErrors({ password: [t('invalidPasswordConfirmation')] })
		else {
			// Email already has an account? Offer to log in instead.
			if (!(await guard(email, 'login'))) return
			register({ name, email, password, password_confirmation: passwordConfirmation, setErrors, setIsSubmitting })
		}
	}

	return <>
		<h1 className="text-xl font-bold text-center mb-6">{t('register.title')}</h1>
		<form onSubmit={submitForm} className="space-y-4">
			<div>
				<label htmlFor="name">{t('register.name')}</label>
				<input
					id="name"
					type="text"
					value={name}
					className="mt-1 input input-bordered w-full"
					onChange={e => setName(e.target.value)}
					required
					autoFocus
					autoComplete="name"
				/>
				<InputError messages={errors.name} />
			</div>
			<div>
				<label htmlFor="email">{t('register.email')}</label>
				<input
					id="email"
					type="email"
					value={email}
					className="mt-1 input input-bordered w-full"
					onChange={e => setEmail(e.target.value)}
					required
					autoComplete="email"
				/>
				<InputError messages={errors.email} />
			</div>
			<div>
				<label htmlFor="password">{t('register.password')}</label>
				<PasswordInput
					id="password"
					
					value={password}
					className="mt-1 input input-bordered w-full"
					onChange={e => setPassword(e.target.value)}
					required
					autoComplete="new-password"
				/>
				<InputError messages={errors.password} />
			</div>
			<div>
				<label htmlFor="passwordConfirmation">{t('register.confirmPassword')}</label>
				<PasswordInput
					id="passwordConfirmation"
					
					value={passwordConfirmation}
					className="mt-1 input input-bordered w-full"
					onChange={e => setPasswordConfirmation(e.target.value)}
					required
					autoComplete="new-password"
				/>
				<InputError messages={errors.password_confirmation} />
			</div>
			<button type="submit" disabled={isSubmitting} className="btn btn-primary w-full rounded-full">{isSubmitting && <span className="loading loading-spinner loading-xs"></span>} {t('register.register')}</button>
			<div className="flex items-center justify-center">
				<Link href="/login" className="text-sm font-semibold link-primary">{t('register.alreadyRegistered')}</Link>
			</div>
		</form>
		{emailConflictModal}
	</>
}
