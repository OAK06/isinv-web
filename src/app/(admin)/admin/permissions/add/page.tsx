"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { addPermission } from "@/app/(admin)/admin/permissions/_permission"
import { useAtom } from "jotai"
import { responseMessage, store, validationErrors } from "@/_state/globalStore"
import InputError from "@/_components/inputError"
import { useTranslation } from "next-i18next"
import Header from "@/app/(app)/_components/header"
import { scrollToFirstInvalidElement, validateForm } from "@/app/_helpers/validation"

export default function PermissionAdd() {
    const { t } = useTranslation('common')
	const router = useRouter()
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
		await addPermission(formData).then(() => {
			router.push(`/admin/permissions/`)
			store.set(responseMessage, { type: 'success', text: t('permissions.createdMessage') });
		})
		.catch(() => setIsSubmitting(false))
	}

	return <>
		<Header
			title={t('permissions.addTitle')}
			containerClass={"flex justify-between"}
		/>
		<div className="mt-6 card bg-base-100 border border-base-200 shadow-sm">
			<div className="card-body">	
				<form onSubmit={formSubmit}>
					<div className="space-y-4">
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('permissions.name')}</span>
							</label>
							<input name="name" data-rules="required" type="text" className="input input-bordered input-sm w-full" />
							<InputError messages={validErrors.name} />
						</div>
					</div>
					
					<div className="card-actions justify-end mt-6">
						<button className="btn btn-primary" type="submit" disabled={isSubmitting}>
							{isSubmitting && <span className="loading loading-spinner"></span>}
							{t('permissions.addFormBtn')}
						</button>
					</div>
				</form>
			</div>
		</div>
	</>
}