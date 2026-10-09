"use client"

import { FormEvent, useState } from "react"
import { useTranslation } from "next-i18next"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faShieldHalved, faCircleCheck, faCopy, faDownload, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons"
import InputError from "@/_components/inputError"
import PasswordInput from "@/_components/passwordInput"
import {
	enableTwoFactor, confirmTwoFactor, disableTwoFactor, regenerateRecoveryCodes
} from "@/app/(app)/profile/_twoFactor"

/**
 * Self-contained "Two-factor authentication" security card: enable (QR + secret
 * + confirm code) -> recovery codes reveal -> steady enabled state (regenerate /
 * turn off). Reused as a full-screen forced-setup gate for Super Admins whose
 * account requires 2FA (see (admin)/layout.tsx) — that's why `mutate` is only
 * called when the user dismisses the recovery-codes box, not immediately on
 * confirm: the parent's `two_factor_required` flag flips as soon as `mutate()`
 * resolves, and dismissing it earlier would unmount this card (and the codes
 * the user hasn't saved yet) out from under them.
 */
export default function TwoFactorSection({ user, mutate }: { user: any, mutate: () => void }) {
	const { t } = useTranslation('common')
	const enabled = !!user?.two_factor_enabled

	const [isBusy, setIsBusy] = useState(false)
	const [setup, setSetup] = useState<{ secret: string, qr_svg: string } | null>(null)
	const [code, setCode] = useState("")
	const [codeError, setCodeError] = useState<string[]>([])
	const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null)

	const [showTurnOff, setShowTurnOff] = useState(false)
	const [password, setPassword] = useState("")
	const [passwordError, setPasswordError] = useState<string[]>([])

	const startEnable = () => {
		setIsBusy(true)
		enableTwoFactor()
			.then((data: any) => setSetup({ secret: data.secret, qr_svg: data.qr_svg }))
			.finally(() => setIsBusy(false))
	}

	const cancelEnable = () => {
		setSetup(null)
		setCode("")
		setCodeError([])
	}

	const runConfirm = (value: string) => {
		if (isBusy) return
		setCodeError([])
		setIsBusy(true)
		confirmTwoFactor(value)
			.then((data: any) => {
				setSetup(null)
				setCode("")
				setRecoveryCodes(data.recovery_codes)
			})
			.catch(error => {
				if (error.response?.status !== 422) throw error
				setCodeError(error.response?.data?.errors?.code ?? [t('twoFactor.profile.invalidCode')])
			})
			.finally(() => setIsBusy(false))
	}

	const submitConfirm = (event: FormEvent) => {
		event.preventDefault()
		runConfirm(code)
	}

	const doRegenerate = () => {
		setIsBusy(true)
		regenerateRecoveryCodes()
			.then((data: any) => setRecoveryCodes(data.recovery_codes))
			.finally(() => setIsBusy(false))
	}

	// Only now does the parent user get refreshed (two_factor_enabled/required) —
	// after the user has acknowledged saving the codes.
	const dismissRecoveryCodes = () => {
		setRecoveryCodes(null)
		mutate()
	}

	const submitTurnOff = (event: FormEvent) => {
		event.preventDefault()
		setPasswordError([])
		setIsBusy(true)
		disableTwoFactor(password)
			.then(() => {
				setShowTurnOff(false)
				setPassword("")
				mutate()
			})
			.catch(error => {
				if (error.response?.status !== 422) throw error
				setPasswordError(error.response?.data?.errors?.password ?? [t('twoFactor.profile.invalidPassword')])
			})
			.finally(() => setIsBusy(false))
	}

	const codesText = recoveryCodes?.join("\n") ?? ""
	const copyCodes = () => navigator.clipboard?.writeText(codesText)
	const downloadCodes = () => {
		const blob = new Blob([codesText], { type: "text/plain" })
		const url = URL.createObjectURL(blob)
		const a = document.createElement("a")
		a.href = url
		a.download = "is-inventory-recovery-codes.txt"
		a.click()
		URL.revokeObjectURL(url)
	}

	return (
		<div className="card bg-base-100 border border-base-200 shadow-sm">
			<div className="card-body">
				<div className="flex items-center justify-between flex-wrap gap-2">
					<div className="flex items-center gap-3">
						<div className="bg-base-200 p-3 rounded-full">
							<FontAwesomeIcon icon={faShieldHalved} className="w-5 h-5" />
						</div>
						<div>
							<h3 className="text-lg font-semibold">{t('twoFactor.profile.title')}</h3>
							<p className="text-sm text-base-content/60">{t('twoFactor.profile.description')}</p>
						</div>
					</div>

					{enabled && !setup && !recoveryCodes && (
						<div className="badge badge-success gap-2 py-3">
							<FontAwesomeIcon icon={faCircleCheck} /> {t('twoFactor.profile.enabledBadge')}
						</div>
					)}
				</div>

				{!enabled && !setup && !recoveryCodes && (
					<div className="mt-4">
						<button className="btn btn-primary" disabled={isBusy} onClick={startEnable}>
							{isBusy && <span className="loading loading-spinner loading-xs"></span>}
							{t('twoFactor.profile.enableBtn')}
						</button>
					</div>
				)}

				{setup && (
					<form onSubmit={submitConfirm} className="mt-4 space-y-4">
						<p className="text-sm text-base-content/70">{t('twoFactor.profile.scanHint')}</p>
						<div className="flex flex-col sm:flex-row items-start gap-6">
							<div
								className="bg-white p-3 rounded-lg border border-base-300 w-40 h-40 flex-shrink-0 flex items-center justify-center [&_svg]:w-full [&_svg]:h-full"
								dangerouslySetInnerHTML={{ __html: setup.qr_svg }}
							/>
							<div className="flex-1 space-y-3 min-w-0">
								<div>
									<label className="label justify-start">
										<span className="label-text font-semibold">{t('twoFactor.profile.secretLabel')}</span>
									</label>
									<code className="block bg-base-200 rounded-lg px-3 py-2 text-sm break-all select-all">{setup.secret}</code>
								</div>
								<div>
									<label htmlFor="two_factor_code" className="label justify-start">
										<span className="label-text font-semibold">{t('twoFactor.profile.codeLabel')}</span>
									</label>
									<input
										id="two_factor_code"
										type="text"
										inputMode="numeric"
										maxLength={6}
										value={code}
										onChange={e => {
										// Auto-validate: submit once 6 digits are entered.
										const v = e.target.value.replace(/\D/g, '').slice(0, 6)
										setCode(v)
										if (v.length === 6) runConfirm(v)
									}}
										className={"input input-bordered w-full max-w-[200px] text-center tracking-[0.5em]" + (codeError.length ? " input-error" : "")}
										autoFocus
										required
									/>
									<InputError messages={codeError} />
								</div>
							</div>
						</div>
						<div className="flex gap-2">
							<button type="submit" className="btn btn-primary" disabled={isBusy}>
								{isBusy && <span className="loading loading-spinner loading-xs"></span>}
								{t('twoFactor.profile.confirmBtn')}
							</button>
							<button type="button" className="btn btn-ghost" onClick={cancelEnable} disabled={isBusy}>
								{t('cancel')}
							</button>
						</div>
					</form>
				)}

				{recoveryCodes && (
					<div className="mt-4 space-y-3">
						<div className="alert alert-warning">
							<FontAwesomeIcon icon={faTriangleExclamation} />
							<span>{t('twoFactor.profile.recoveryWarning')}</span>
						</div>
						<div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-sm" dir="ltr">
							{recoveryCodes.map((rc) => (
								<div key={rc} className="bg-base-200 rounded-lg px-3 py-2 text-center">{rc}</div>
							))}
						</div>
						<div className="flex flex-wrap gap-2">
							<button type="button" className="btn btn-sm btn-outline" onClick={copyCodes}>
								<FontAwesomeIcon icon={faCopy} /> {t('twoFactor.profile.copyBtn')}
							</button>
							<button type="button" className="btn btn-sm btn-outline" onClick={downloadCodes}>
								<FontAwesomeIcon icon={faDownload} /> {t('twoFactor.profile.downloadBtn')}
							</button>
							<button type="button" className="btn btn-sm btn-primary ms-auto" onClick={dismissRecoveryCodes}>
								{t('twoFactor.profile.savedBtn')}
							</button>
						</div>
					</div>
				)}

				{enabled && !setup && !recoveryCodes && (
					<div className="mt-4 flex flex-wrap gap-2">
						<button className="btn btn-outline" disabled={isBusy} onClick={doRegenerate}>
							{isBusy && <span className="loading loading-spinner loading-xs"></span>}
							{t('twoFactor.profile.regenerateBtn')}
						</button>
						<button className="btn btn-error btn-outline" disabled={isBusy} onClick={() => setShowTurnOff(true)}>
							{t('twoFactor.profile.turnOffBtn')}
						</button>
					</div>
				)}
			</div>

			<div className={`modal modal-middle ${showTurnOff ? "modal-open" : ""}`}>
				<div className="modal-box max-w-[440px]">
					<h3 className="font-bold text-lg mb-2">{t('twoFactor.profile.turnOffTitle')}</h3>
					<form onSubmit={submitTurnOff} className="space-y-4">
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('twoFactor.profile.confirmPasswordLabel')}</span>
							</label>
							<PasswordInput
								value={password}
								className={"input input-bordered w-full" + (passwordError.length ? " input-error" : "")}
								onChange={(e: any) => setPassword(e.target.value)}
								autoFocus
								required
							/>
							<InputError messages={passwordError} />
						</div>
						<div className="modal-action rtl:gap-2">
							<button type="button" className="btn btn-ghost" onClick={() => { setShowTurnOff(false); setPassword(""); setPasswordError([]) }}>
								{t('cancel')}
							</button>
							<button type="submit" className="btn btn-error" disabled={isBusy}>
								{isBusy && <span className="loading loading-spinner loading-xs"></span>}
								{t('twoFactor.profile.turnOffConfirmBtn')}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	)
}
