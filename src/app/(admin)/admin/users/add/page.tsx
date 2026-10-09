"use client"

import { FormEvent, useEffect, useState } from "react"
import PasswordInput from "@/_components/passwordInput"
import { useRouter } from "next/navigation"

import { addUser, getRoles } from "@/app/(admin)/admin/users/_user"
import { validateEmail, validatePassword } from "@/app/(auth)/_helpers/validation"
import { useAtom } from "jotai"
import { branch, responseMessage, store, validationErrors } from "@/_state/globalStore"
import InputError from "@/_components/inputError"
import { useTranslation } from "next-i18next"
import Header from "@/app/(app)/_components/header"
import { scrollToFirstInvalidElement, validateForm } from "@/app/_helpers/validation"
import { useEmailConflictGuard } from "@/_components/useEmailConflictGuard"

export default function UserAdd() {
    const { t } = useTranslation('common')
	const router = useRouter()
	const [email, setEmail] = useState("")
	const [emailError, setEmailError] = useState(true)
	const [password, setPassword] = useState("")
	const [confirmPassword, setConfirmPassword] = useState("")
	const [passwordError, setPasswordError] = useState(false)
	const [roles, setRoles] = useState([])
	const [pageRendered, setPageRendered] = useState(false)
	const [ branchID ] = useAtom(branch)
	const [isSubmitting , setIsSubmitting] = useState(false)
	const [validErrors] = useAtom(validationErrors)
	const { guard, emailConflictModal } = useEmailConflictGuard()

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
        // Email already has an account? Confirm linking the new role to it.
        if (!(await guard(email, 'link', true))) return
		setIsSubmitting(true)
		await addUser(formData).then(() => {
			router.push(`/admin/users/`)
			store.set(responseMessage, { type: 'success', text: t('users.createdMessage') });
		})
		.catch(() => setIsSubmitting(false))
	}

	useEffect(() => {
		if (!pageRendered) return
		setEmailError(validateEmail(email))
	}, [email])

	useEffect(() => {
		if (!pageRendered) return
		setPasswordError(validatePassword(password, confirmPassword))
	}, [password, confirmPassword])

	useEffect(() => {
		getRoles(branchID).then((returnData: any) => {
			setRoles(returnData.response)
		})
		setPageRendered(true)
	}, [])

	return <>
		{emailConflictModal}
		<Header
			title={t('users.addTitle')}
			containerClass={"flex justify-between"}
		/>
		<div className="mt-6 card bg-base-100 border border-base-200 shadow-sm">
			<div className="card-body">	
				<form onSubmit={formSubmit}>
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('users.name')}</span>
							</label>
							<input name="name" data-rules="required" type="text" className="input input-bordered input-sm w-full" />
							<InputError messages={validErrors.name} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('users.email')}</span>
							</label>
							<input
								name="email"
                                data-rules="required|email"
								type="text"
								className={"input input-bordered input-sm w-full" + (emailError ? " input-error" : "")}
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
							<InputError messages={[emailError, validErrors.email]} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('users.password')}</span>
							</label>
							<PasswordInput
								name="password"
 data-rules="required"
								
								className="input input-bordered input-sm w-full"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>
							<InputError messages={validErrors.password} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('users.confirmPassword')}</span>
							</label>
							<PasswordInput
								name="confirm-password"
								
								className={"input input-bordered input-sm w-full" + (passwordError ? " input-error" : "")}
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
							/>
							{passwordError && <span className="text-xs text-error">{t('invalidPasswordConfirmation')}</span>}
						</div>
						<div className="lg:col-span-2">
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('users.role')}</span>
							</label>
							<select name="role" data-rules="required" className="select select-sm select-bordered w-full" defaultValue={""}>
								<option value="" disabled>{t('chooseOption')}</option>
								{roles?.map((role: any) => (
									<option key={role.id} value={role.id}>{role.name}</option>
								))}
							</select>
							<InputError messages={validErrors.role} />
						</div>
					</div>
					
					<div className="card-actions justify-end mt-6">
						<button className="btn btn-primary" type="submit" disabled={emailError || passwordError || isSubmitting}>
							{isSubmitting && <span className="loading loading-spinner"></span>}
							{t('users.addFormBtn')}
						</button>
					</div>
				</form>
			</div>
		</div>
	</>
}
