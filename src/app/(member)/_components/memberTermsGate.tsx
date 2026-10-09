"use client"

import { useState } from "react"
import { useTranslation } from "next-i18next"
import { acceptMemberTerms } from "@/app/(member)/member/memberships/_plan"
import Logo from "@/_components/logo"

/**
 * One-time gate shown on first portal access until the member accepts the member
 * Terms of Service. Recorded server-side; reload re-fetches /api/user which then
 * reports member_terms_accepted = true.
 * NOTE: the public /member-terms page was removed (legal pages to be rebuilt
 * later), so the terms are shown as plain text here — restore the link when the
 * legal page returns.
 */
export default function MemberTermsGate() {
	const { t } = useTranslation('common')
	const [accepted, setAccepted] = useState(false)
	const [busy, setBusy] = useState(false)

	const submit = async () => {
		setBusy(true)
		await acceptMemberTerms().then(() => window.location.reload()).catch(() => setBusy(false))
	}

	return <div className="min-h-screen flex items-center justify-center p-4 bg-base-200">
		<div className="card bg-base-100 border border-base-200 shadow-lg w-full max-w-lg">
			<div className="card-body">
				<Logo className="w-32 mb-2" />
				<h1 className="text-xl font-bold">{t('memberTerms.gateTitle')}</h1>
				<p className="text-base-content/70">{t('memberTerms.gateBody')}</p>
				<label className="flex items-start gap-3 mt-3 cursor-pointer">
					<input type="checkbox" className="checkbox checkbox-primary mt-1" checked={accepted} onChange={e => setAccepted(e.target.checked)} />
					<span className="text-sm mt-1.5">
						{t('memberTerms.accept')}{' '}
						<span className="font-medium">{t('memberTerms.linkText')}</span>
					</span>
				</label>
				<div className="card-actions justify-end mt-4">
					<button className="btn btn-primary rounded-full" disabled={!accepted || busy} onClick={submit}>
						{busy && <span className="loading loading-spinner"></span>}
						{t('memberTerms.continue')}
					</button>
				</div>
			</div>
		</div>
	</div>
}
