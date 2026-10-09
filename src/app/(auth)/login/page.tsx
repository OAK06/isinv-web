"use client"

import Link from "next/link"
import PasswordInput from "@/_components/passwordInput"
import { useAuth } from "@/hooks/auth"
import { FormEvent, useState } from "react"
import { useSearchParams } from "next/navigation"

import InputError from "@/_components/inputError"
import { validateEmail } from "@/app/(auth)/_helpers/validation"
import AuthSessionStatus from "@/app/(auth)/_components/authSessionStatus"
import { useTranslation } from "next-i18next"

export default function Login() {
    const { t } = useTranslation('common')

	// Support a ?redirect= return-to (e.g. from the approval email pay link). Only
	// allow internal paths to avoid open-redirects; default to the normal chooser.
	const searchParams = useSearchParams()
	const redirectParam = searchParams.get('redirect')
	const safeRedirect = redirectParam && redirectParam.startsWith('/') && !redirectParam.startsWith('//') ? redirectParam : '/choose-branch'

	const { login, twoFactorChallenge } = useAuth({ middleware: "guest", redirectIfAuthenticated: safeRedirect })

	const [email, setEmail] = useState(searchParams.get('email') ?? "")
	const [password, setPassword] = useState("")
	const [shouldRemember, setShouldRemember] = useState(false)
	const [errors, setErrors] = useState<any>({})
	const [status, setStatus] = useState(null)
	const [isSubmitting, setIsSubmitting] = useState(false)

	// Two-factor challenge step: entered when /login responds 200 { two_factor: true }
	// instead of establishing a session outright.
	const [needsTwoFactor, setNeedsTwoFactor] = useState(false)
	const [useRecoveryCode, setUseRecoveryCode] = useState(false)
	const [code, setCode] = useState("")
	const [recoveryCode, setRecoveryCode] = useState("")

	const submitForm = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		if (validateEmail(email))
			setErrors({ email: [t('invalidEmail')] })
		else
			login({
				email, password, remember: shouldRemember, setErrors, setStatus, setIsSubmitting,
				onTwoFactor: () => setNeedsTwoFactor(true)
			})
	}

	const runChallenge = (payload: { code?: string; recovery_code?: string }) => {
		if (isSubmitting) return
		twoFactorChallenge({ ...payload, setErrors, setIsSubmitting })
	}

	const submitTwoFactor = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		runChallenge(useRecoveryCode ? { recovery_code: recoveryCode } : { code })
	}

	const toggleRecoveryMode = () => {
		setUseRecoveryCode(v => !v)
		setErrors({})
		setCode("")
		setRecoveryCode("")
	}

	if (needsTwoFactor) return <>
		<h1 className="text-xl font-bold text-center mb-2">{t('twoFactor.challenge.title')}</h1>
		<p className="text-sm text-base-content/70 text-center mb-6">
			{useRecoveryCode ? t('twoFactor.challenge.recoveryHint') : t('twoFactor.challenge.codeHint')}
		</p>
		<form onSubmit={submitTwoFactor} className="space-y-4">
			{useRecoveryCode ? (
				<div>
					<label htmlFor="recovery_code">{t('twoFactor.challenge.recoveryCode')}</label>
					<input
						id="recovery_code"
						name="recovery_code"
						type="text"
						value={recoveryCode}
						onChange={e => setRecoveryCode(e.target.value)}
						className={"mt-1 input input-bordered w-full" + (errors.recovery_code ? " input-error" : "")}
						required
						autoFocus
						autoComplete="one-time-code"
					/>
					<InputError messages={errors.recovery_code} />
				</div>
			) : (
				<div>
					<label htmlFor="code">{t('twoFactor.challenge.code')}</label>
					<input
						id="code"
						name="code"
						type="text"
						inputMode="numeric"
						maxLength={6}
						value={code}
						onChange={e => {
							// Auto-validate: submit once 6 digits are entered.
							const v = e.target.value.replace(/\D/g, '').slice(0, 6)
							setCode(v)
							if (v.length === 6) runChallenge({ code: v })
						}}
						className={"mt-1 input input-bordered w-full text-center tracking-[0.5em]" + (errors.code ? " input-error" : "")}
						required
						autoFocus
						autoComplete="one-time-code"
					/>
					<InputError messages={errors.code} />
				</div>
			)}
			<button type="submit" disabled={isSubmitting} className="btn btn-primary w-full rounded-full">
				{isSubmitting && <span className="loading loading-spinner loading-xs"></span>} {t('twoFactor.challenge.verifyBtn')}
			</button>
			<div className="flex items-center justify-center">
				<button type="button" onClick={toggleRecoveryMode} className="text-sm font-semibold link-primary">
					{useRecoveryCode ? t('twoFactor.challenge.useCodeInstead') : t('twoFactor.challenge.useRecoveryInstead')}
				</button>
			</div>
		</form>
	</>

		return <>
			<h1 className="text-xl font-bold text-center mb-6">{t('login.title')}</h1>
			<AuthSessionStatus className="mb-4" status={status} />
			<form onSubmit={submitForm} className="space-y-4">
				<div>
					<label htmlFor="email">{t('login.email')}</label>
					<input
						id="email"
						name="email"
						type="email"
						value={email}
						onChange={e => setEmail(e.target.value)}
						className={"mt-1 input input-bordered w-full" + (errors.email ? " input-error" : "")}
						required
						autoFocus
						autoComplete="email"
					/>
					<InputError messages={errors.email} />
				</div>
				<div>
					<label htmlFor="password">{t('login.password')}</label>
					<PasswordInput
						id="password"
						name="password"
						
						value={password}
						className={"mt-1 input input-bordered w-full" + (errors.password ? " input-error" : "")}
						onChange={e => setPassword(e.target.value)}
						required
						autoComplete="current-password"
					/>
					<InputError messages={errors.password} />
				</div>
				<div>
					<label className="inline-flex cursor-pointer items-center rtl:space-x-reverse space-x-2">
						<input type="checkbox" name="remember" className="checkbox checkbox-sm" onChange={e => setShouldRemember(e.target.checked)} />
						<span className="text-sm">{t('login.remember')}</span>
					</label>
				</div>
				<button type="submit" disabled={isSubmitting} className="btn btn-primary w-full rounded-full">{isSubmitting && <span className="loading loading-spinner loading-xs"></span>} {t('login.loginBtn')}</button>
				<div className="flex items-center justify-center">
					<Link href="/forgot-password" className="text-sm font-semibold link-primary">{t('login.forgotPass')}</Link>
				</div>
				<div className="flex items-center justify-center">
					<div className="flex text-sm rtl:space-x-reverse space-x-1">
						<span>{t('login.notMember')}</span>
						<span><Link href="/register" className="font-semibold link-primary">{t('login.createAccount')}</Link></span>
					</div>
				</div>
			</form>
		</>
}
