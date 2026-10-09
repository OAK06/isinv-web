"use client"

import { useRouter } from "next/navigation"
import { useBreadcrumbLabel } from "@/hooks/useBreadcrumbLabel"
import { FormEvent, useEffect, useState } from "react"
import { getReferral, editReferral } from "@/app/(admin)/admin/referrals/_referral"
import { useAtom } from "jotai"
import { responseMessage, store, validationErrors } from "@/_state/globalStore"
import InputError from "@/_components/inputError"
import { useTranslation } from "next-i18next"
import Header from "@/app/(app)/_components/header"

export default function ReferralEdit({ params }: any) {
    const { t } = useTranslation('common')
	const router = useRouter()
	const { referral_id }: any = params
	const [data, setData] = useState<any>([])
	useBreadcrumbLabel(data)
	const [isSubmitting , setIsSubmitting] = useState(false)
	const [validErrors] = useAtom(validationErrors)

	useEffect(() => {
		getReferral(referral_id).then((returnData: any) => {
			setData(returnData.response)
		})
	}, [])

	const formSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const formData = new FormData(event.currentTarget)
		setIsSubmitting(true)
		await editReferral(referral_id, formData).then(() => {
			router.push(`/admin/referrals/`)
			store.set(responseMessage, { type: 'success', text: t('referrals.updatedMessage') });
		})
		.catch(() => setIsSubmitting(false))
	}

	return <>
		<Header
			title={t('referrals.editTitle')}
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
							<input name="source_name" type="text" className="input input-bordered input-sm w-full" defaultValue={data.source_name} />
							<InputError messages={validErrors.source_name} />
						</div>
					</div>
					
					<div className="card-actions justify-end mt-6">
						<button className="btn btn-primary" type="submit" disabled={isSubmitting}>
							{isSubmitting && <span className="loading loading-spinner"></span>}
							{t('referrals.editFormBtn')}
						</button>
					</div>
				</form>
			</div>
		</div>
	</>
}