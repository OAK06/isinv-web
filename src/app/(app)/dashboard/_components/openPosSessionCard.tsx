"use client"

import { useEffect, useState } from "react"
import { useAtom } from "jotai"
import { useTranslation } from "react-i18next"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCashRegister } from "@fortawesome/free-solid-svg-icons"

import { useAuth } from "@/hooks/auth"
import { activePosSession, branch, posRegister } from "@/_state/globalStore"
import { formatCurrency } from "@/_helpers/currency"
import { getActivePosSession } from "@/app/(app)/pos-sessions/_posSession"
import EndPosSessionModal from "@/app/(app)/pos-sessions/_components/endPosSessionModal"

/**
 * Dashboard card for the register's currently-open POS session: shows the opening
 * float, sales, purchases and live expected drawer cash, with a Close button. Fetching
 * the active session also triggers the backend's lazy auto-close of a stale (previous-day)
 * session, in which case nothing renders. Renders nothing when there's no open session.
 */
export default function OpenPosSessionCard() {
	const { t } = useTranslation("common")
	const { user } = useAuth({ middleware: "auth" })
	const [branchID] = useAtom(branch)
	const [posRegisterID] = useAtom(posRegister)
	const [, setActivePosSessionID] = useAtom(activePosSession)
	const [session, setSession] = useState<any>(null)
	const [isEndOpen, setIsEndOpen] = useState(false)

	const load = () => {
		if (!branchID || branchID === -1 || !posRegisterID || posRegisterID === -1) return
		getActivePosSession(branchID, posRegisterID)
			.then((res: any) => setSession(res?.response ?? null))
			.catch(() => {})
	}

	useEffect(() => { load() }, [branchID, posRegisterID])

	if (!session) return null

	const rec = session.reconciliation ?? {}
	const canClose = user?.permissions?.includes("finish pos sessions")

	const row = (label: string, value: any) => (
		<div className="flex justify-between py-1 text-sm">
			<span className="text-base-content/60">{label}</span>
			<span className="font-semibold" dir="ltr">{value}</span>
		</div>
	)

	return (
		<div className="card bg-base-100 border border-base-200 shadow-sm h-full">
			<div className="card-body">
				<h2 className="card-title text-xl mb-1 gap-3">
					<span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><FontAwesomeIcon icon={faCashRegister} /></span>
					{t("posSessions.openSessionTitle")}
				</h2>
				<p className="text-sm text-base-content/60 mb-3">
					{session.pos_register?.name}
					{session.start && <> · {t("posSessions.openedAt")} <span dir="ltr">{new Date(session.start).toLocaleString()}</span></>}
				</p>
				<div className="divide-y divide-base-200">
					{row(t("posSessions.openingFloat"), formatCurrency(rec.open_cash ?? session.open_cash))}
					{row(t("posSessions.sales"), formatCurrency(rec.sales ?? 0))}
					{row(t("posSessions.purchases"), formatCurrency(rec.purchases ?? 0))}
				</div>
				<div className="mt-3 flex items-center justify-between rounded-lg bg-base-200 p-3">
					<span className="font-semibold">{t("posSessions.expectedCash")}</span>
					<span className="text-lg font-bold text-primary" dir="ltr">{formatCurrency(rec.expected_cash ?? 0)}</span>
				</div>
				{canClose && (
					<div className="card-actions justify-end mt-4">
						<button className="btn btn-sm btn-primary" onClick={() => setIsEndOpen(true)}>{t("posSessions.closeBtn")}</button>
					</div>
				)}
			</div>

			<EndPosSessionModal
				isOpen={isEndOpen}
				onClose={() => setIsEndOpen(false)}
				sessionID={session.id}
				reconciliation={rec}
				cancelBtn={{ display: true, label: t("cancel") }}
				onSubmitSuccess={() => {
					setIsEndOpen(false)
					setActivePosSessionID(-1)
					setSession(null)
					load()
				}}
			/>
		</div>
	)
}
