"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAtom } from "jotai"
import { useTranslation } from "next-i18next"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCreditCard, faPlus, faStar, faTrash } from "@fortawesome/free-solid-svg-icons"
import { activeMembership, responseMessage, store } from "@/_state/globalStore"
import { addMyPaymentMethod, getMyPaymentMethods, deleteMyPaymentMethod, setDefaultCard, PaymentMethod } from "@/app/(member)/member/payment-methods/_paymentMethod"
import { useConfirm } from "@/_components/useConfirm"
import Header from "@/app/(app)/_components/header"
import Loading from "@/app/(app)/_components/loading"

/**
 * Member saved cards for the active gym. Adding a card redirects to the gym's
 * Stripe Billing Portal (the app has no inline card form); Stripe webhooks sync
 * the list back. Delete/set-default hit the gym's Stripe via /api/me/*.
 */
export default function MemberPaymentMethods() {
	const { t } = useTranslation('common')
	const router = useRouter()
	const [branchID] = useAtom(activeMembership)
	const [cards, setCards] = useState<PaymentMethod[] | null>(null)
	const [paymentsEnabled, setPaymentsEnabled] = useState(true)
	const [busy, setBusy] = useState(false)
	const { confirm, confirmModal } = useConfirm()

	const load = () => {
		if (branchID === -1) return
		getMyPaymentMethods(branchID)
			.then(({ cards, paymentsEnabled }) => { setCards(cards); setPaymentsEnabled(paymentsEnabled) })
			.catch(() => setCards([]))
	}

	useEffect(load, [branchID])

	const addCard = async () => {
		setBusy(true)
		try {
			const res = await addMyPaymentMethod(branchID, window.location.href)
			router.push(res.response.url)
		} catch (e) {
			setBusy(false)
		}
	}

	const remove = async (id: number) => {
		if (!(await confirm(t('memberPortal.paymentMethods.deleteConfirm')))) return
		setBusy(true)
		await deleteMyPaymentMethod(id).then(() => {
			store.set(responseMessage, { type: 'success', text: t('memberPortal.paymentMethods.deleted') })
			load()
		}).finally(() => setBusy(false))
	}

	const makeDefault = async (id: number) => {
		setBusy(true)
		await setDefaultCard(id).then(() => load()).finally(() => setBusy(false))
	}

	if (branchID === -1) return <div className="text-center py-16 text-base-content/60">
		{t('memberPortal.selectGymFirst')} <Link href="/member" className="link link-primary">{t('memberPortal.nav.overview')}</Link>
	</div>

	return <>
		<Header
			title={t('memberPortal.nav.paymentMethods')}
			containerClass={"flex justify-between"}
			actions={paymentsEnabled ? <button className="btn btn-sm btn-primary" onClick={addCard} disabled={busy}>
				<FontAwesomeIcon icon={faPlus} /> {t('memberPortal.paymentMethods.add')}
			</button> : undefined}
		/>

		{cards === null
			? <Loading />
			: !paymentsEnabled && cards.length === 0
				? <div className="text-center py-12 text-base-content/60">{t('memberPortal.paymentMethods.unavailable')}</div>
				: cards.length === 0
				? <div className="text-center py-12 text-base-content/60">{t('memberPortal.paymentMethods.noCards')}</div>
				: <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{cards.map((c) => {
						const isDefault = c.is_default === 'true'
						return <div key={c.id} className={`card bg-base-100 border shadow-sm ${isDefault ? 'border-primary ring-1 ring-primary' : 'border-base-200'}`}>
							<div className="card-body gap-3">
								<div className="flex items-center justify-between">
									<span className="flex items-center gap-2 font-semibold">
										<FontAwesomeIcon icon={faCreditCard} className="text-base-content/60" />
										{c.card_brand} •••• {c.last_four}
									</span>
									{isDefault && <span className="badge badge-primary badge-sm">{t('memberPortal.paymentMethods.default')}</span>}
								</div>
								<p className="text-sm text-base-content/60">{t('memberPortal.paymentMethods.expires')} {c.exp_month}/{c.exp_year}</p>
								<div className="card-actions justify-end">
									{!isDefault && <button className="btn btn-xs btn-ghost" onClick={() => makeDefault(c.id)} disabled={busy}>
										<FontAwesomeIcon icon={faStar} /> {t('memberPortal.paymentMethods.setDefault')}
									</button>}
									<button className="btn btn-xs btn-error btn-outline" onClick={() => remove(c.id)} disabled={busy}>
										<FontAwesomeIcon icon={faTrash} /> {t('memberPortal.paymentMethods.delete')}
									</button>
								</div>
							</div>
						</div>
					})}
				</div>
		}
		{confirmModal}
	</>
}
