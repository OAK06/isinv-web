"use client"

import { useRouter } from "next/navigation"
import { useBreadcrumbLabel } from "@/hooks/useBreadcrumbLabel"
import { FormEvent, useEffect, useState } from "react"

import InputError from "@/_components/inputError"
import { validateEmail } from "@/app/(auth)/_helpers/validation"
import { getUser, editUser, getRoles } from "@/app/(admin)/admin/users/_user"
import { useAtom } from "jotai"
import { responseMessage, store, validationErrors } from "@/_state/globalStore"
import { useTranslation } from "next-i18next"
import Header from "@/app/(app)/_components/header"
import { scrollToFirstInvalidElement, validateForm } from "@/app/_helpers/validation"

export default function UserEdit({ params }: any) {
    const { t } = useTranslation('common')
	const router = useRouter()
	const { user_id }: any = params
	const [data, setData] = useState<any>([])
	useBreadcrumbLabel(data)
	const [email, setEmail] = useState("")
	const [errors, setErrors] = useState<any>({})
	const [roles, setRoles] = useState([])
	const [userRole, setUserRole] = useState()
	const [pageRendered, setPageRendered] = useState(false)
	const [isSubmitting , setIsSubmitting] = useState(false)
	const [validErrors] = useAtom(validationErrors)

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
		await editUser(user_id, formData).then(() => {
			router.push(`/admin/users/`)
			store.set(responseMessage, { type: 'success', text: t('users.updatedMessage') });
		})
		.catch(() => setIsSubmitting(false))
	}

	useEffect(() => {
		if (!pageRendered) return
        store.set(validationErrors, { email: validateEmail(email) && [`${t('invalidEmail')}`] })
	}, [email])

	useEffect(() => {
		getUser(user_id).then((returnData: any) => {
			setPageRendered(true)
			setData(returnData.response)
			setEmail(returnData.response.email)
			const userRoles = returnData.response.roles ?? []
			if (userRoles.length) setUserRole(userRoles[0].id)
			const roleBranchId = userRoles[0]?.branch_id
			if (roleBranchId)
				getRoles(roleBranchId).then((rolesData: any) => setRoles(rolesData.response))
		})
	}, [])

	return <>
		<Header
			title={t('users.editTitle')}
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
							<input name="name" data-rules="required" type="text" className="input input-bordered input-sm w-full" defaultValue={data.name} />
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
								className={"input input-bordered input-sm w-full" + (validErrors.email ? " input-error" : "")}
								value={email}
								defaultValue={data.email}
								onChange={(e) => setEmail(e.target.value)}
							/>
							<InputError messages={validErrors.email} />
						</div>
						<div className="lg:col-span-2">
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('users.role')}</span>
							</label>
							<select name="role" data-rules="required" className="select select-sm select-bordered w-full" defaultValue={roles[0]}>
								<option value="" disabled>{t('chooseOption')}</option>
								{roles?.map((role: any) => (
									<option key={role.id} value={role.id} selected={userRole == role.id}>{role.name}</option>
								))}
							</select>
							<InputError messages={validErrors.role} />
						</div>
					</div>
					
					<div className="card-actions justify-end mt-6">
						<button className="btn btn-primary" type="submit" disabled={errors.email || isSubmitting}>
							{isSubmitting && <span className="loading loading-spinner"></span>}
							{t('users.editFormBtn')}
						</button>
					</div>
				</form>
			</div>
		</div>
	</>
}
