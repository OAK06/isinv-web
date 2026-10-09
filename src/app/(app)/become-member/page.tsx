"use client"

import { FormEvent, useState } from "react"
import PhoneInput from "@/_components/phoneInput"
import { useRouter } from "next/navigation"
import { useAtom } from "jotai"
import { useTranslation } from "next-i18next"
import { useAuth } from "@/hooks/auth"
import { branch, responseMessage, store } from "@/_state/globalStore"
import { joinGym } from "@/app/(member)/member/join/_gym"
import Header from "@/app/(app)/_components/header"

/**
 * Operational-side action for a company owner/staff to create their OWN member
 * profile at their current gym, so they can use GymFlyte as a member too (dual-role).
 * Existing staff accounts otherwise have no member profile and are locked to staff.
 */
export default function BecomeMember() {
	const { t } = useTranslation('common')
	const router = useRouter()
	const { user } = useAuth({ middleware: "auth" })
	const [branchID] = useAtom(branch)
	const [busy, setBusy] = useState(false)

	const profile = user?.staff_profile
	const nameParts = (user?.name ?? '').trim().split(' ')

	const submit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const form = event.currentTarget
		setBusy(true)
		try {
			await joinGym({
				branch_id: branchID,
				fname: form.fname.value,
				sname: form.sname.value,
				birth_date: form.birth_date.value,
				mobile_phone: form.mobile_phone.value,
			})
			store.set(responseMessage, { type: 'success', text: t('becomeMember.done') })
			router.push('/member')
		} catch (e) {
			setBusy(false)
		}
	}

	return <>
		<Header title={t('becomeMember.title')} subtitle={t('becomeMember.subtitle')} />
		<form onSubmit={submit} className="mt-6 card bg-base-100 border border-base-200 shadow-sm">
			<div className="card-body grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div>
					<label className="label justify-start"><span className="label-text">{t('becomeMember.firstName')}</span></label>
					<input name="fname" defaultValue={profile?.fname ?? nameParts[0] ?? ''} required className="input input-bordered w-full" />
				</div>
				<div>
					<label className="label justify-start"><span className="label-text">{t('becomeMember.lastName')}</span></label>
					<input name="sname" defaultValue={profile?.sname ?? nameParts.slice(1).join(' ')} required className="input input-bordered w-full" />
				</div>
				<div>
					<label className="label justify-start"><span className="label-text">{t('becomeMember.birthDate')}</span></label>
					<input name="birth_date" type="date" defaultValue={profile?.birth_date ?? ''} required className="input input-bordered w-full" />
				</div>
				<div>
					<label className="label justify-start"><span className="label-text">{t('becomeMember.phone')}</span></label>
					<PhoneInput name="mobile_phone" rules="required" size="base" defaultValue={profile?.mobile_phone ?? ''} />
				</div>
				<div className="sm:col-span-2 flex justify-end">
					<button type="submit" className="btn btn-primary rounded-full" disabled={busy || branchID === -1}>
						{busy && <span className="loading loading-spinner loading-xs"></span>}
						{t('becomeMember.createBtn')}
					</button>
				</div>
			</div>
		</form>
	</>
}
