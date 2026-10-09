"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { addReferral } from "@/app/(admin)/admin/referrals/_referral"
import { useAtom } from "jotai"
import { responseMessage, store, validationErrors } from "@/_state/globalStore"
import InputError from "@/_components/inputError"
import { useTranslation } from "next-i18next"
import Header from "@/app/(app)/_components/header"

export default function ReferralAdd() {
    const { t } = useTranslation('common')
	const router = useRouter()
	const [isSubmitting , setIsSubmitting] = useState(false)
	const [validErrors] = useAtom(validationErrors)

	const formSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const formData = new FormData(event.currentTarget)
		setIsSubmitting(true)
		await addReferral(formData).then(() => {
			router.push(`/admin/referrals/`)
			store.set(responseMessage, { type: 'success', text: t('referrals.createdMessage') });
		})
		.catch(() => setIsSubmitting(false))
	}

	return <>
		<Header
			title={t('referrals.addTitle')}
			containerClass={"flex justify-between"}
		/>
		<div className="mt-6 card bg-base-100 border border-base-200 shadow-sm">
			<div className="card-body">	
				<form onSubmit={formSubmit}>
					<div className="space-y-4">
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('referrals.sourceName')}</span>
							</label>
							<input name="source_name" type="text" className="input input-bordered input-sm w-full" />
							<InputError messages={validErrors.source_name} />
						</div>
					</div>
					
					<div className="card-actions justify-end mt-6">
						<button className="btn btn-primary" type="submit" disabled={isSubmitting}>
							{isSubmitting && <span className="loading loading-spinner"></span>}
							{t('referrals.addFormBtn')}
						</button>
					</div>
				</form>
			</div>
		</div>
	</>
}