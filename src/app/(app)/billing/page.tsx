"use client"

import { useEffect, useRef, useState } from "react"
import { useAtom } from "jotai"
import { branch, responseMessage, store } from "@/_state/globalStore"
import { billingCheckout, getBilling, updateBillingAddons, cancelSubscription, reactivateSubscription } from "@/app/(app)/billing/_billing"
import BranchAddonsSection from "@/app/(app)/billing/_components/branchAddonsSection"
import CloseAccountSection from "@/app/(app)/billing/_components/closeAccountSection"
import { useConfirm } from "@/_components/useConfirm"
import { useAuth } from "@/hooks/auth"
import { useTranslation } from "next-i18next"
import Header from "@/app/(app)/_components/header"
import Loading from "@/app/(app)/_components/loading"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCreditCard } from "@fortawesome/free-solid-svg-icons"

const STATUS_BADGES: Record<string, string> = {
    0: 'badge-info', 1: 'badge-warning', 2: 'badge-success', 3: 'badge-warning', 4: 'badge-error', 5: 'badge-ghost',
}
const STATUS_KEYS: Record<number, string> = {
    0: 'trial', 1: 'pendingPayment', 2: 'active', 3: 'pastDue', 4: 'suspended', 5: 'canceled'
}
const PAYMENT_STATE_KEYS: Record<number, string> = {
    1: 'pending', 4: 'succeeded', 7: 'error'
}

export default function Billing() {
    const { t } = useTranslation('common')
    const { user } = useAuth()
    const [branchID] = useAtom(branch)
    const [data, setData] = useState<any>(null)
    const [busy, setBusy] = useState(false)
    const [confirmingPayment, setConfirmingPayment] = useState(false)
    const { confirm, confirmModal } = useConfirm()

    const load = () => {
        return getBilling(branchID).then((returnData: any) => {
            setData(returnData.response)
            return returnData.response
        }).catch(() => null)
    }

    useEffect(() => {
        if (branchID !== -1) load()
    }, [branchID])

    // Returning from Stripe Checkout (?platform_payment=success|canceled).
    // Checkout completing does NOT mean the subscription is active yet — that
    // only happens once the platform webhook (payment_intent.succeeded) has
    // been processed, which can lag a moment behind the redirect (or, in
    // local dev, never arrive at all if `stripe listen` isn't forwarding to
    // this server). So we poll actual billing state instead of trusting the
    // URL param, and say so honestly if it doesn't confirm in time.
    //
    // handledReturn is a ref (not state) specifically so this survives React
    // Strict Mode's dev double-invoke of effects: consuming the URL param via
    // replaceState is a one-way side effect invisible to a second run, so a
    // state-only guard could start `confirmingPayment` on the first pass and
    // never get a chance to resolve it if the second pass finds nothing left
    // to trigger a poll from.
    const handledReturn = useRef(false)
    useEffect(() => {
        if (branchID === -1 || handledReturn.current) return
        const params = new URLSearchParams(window.location.search)
        const result = params.get('platform_payment')
        if (!result) return
        handledReturn.current = true
        window.history.replaceState(null, '', '/billing')

        if (result === 'canceled') {
            store.set(responseMessage, { type: 'error', text: t('billing.paymentCanceled') })
        } else if (result === 'success') {
            setConfirmingPayment(true)
        }
    }, [branchID])

    const subscription = data?.subscription
    const subscriptionSettled = !!subscription && [2, 3].includes(subscription.status) // Active | PastDue

    // Self-rescheduling poll (not a bare interval) so it re-evaluates against
    // the LATEST fetched data on every tick, and resolves the instant that
    // data says settled — from this poll or any other refresh of `data`.
    const confirmAttempts = useRef(0)
    useEffect(() => {
        if (!confirmingPayment) return

        if (subscriptionSettled) {
            setConfirmingPayment(false)
            confirmAttempts.current = 0
            store.set(responseMessage, {
                type: subscription.status === 2 ? 'success' : 'error',
                text: subscription.status === 2 ? t('billing.paymentSuccess') : t('billing.paymentDelayed')
            })
            return
        }

        if (confirmAttempts.current >= 8) {
            setConfirmingPayment(false)
            confirmAttempts.current = 0
            store.set(responseMessage, { type: 'error', text: t('billing.paymentDelayed') })
            return
        }

        const timeout = setTimeout(() => {
            confirmAttempts.current += 1
            load()
        }, 2000)
        return () => clearTimeout(timeout)
    }, [confirmingPayment, subscriptionSettled, data])

    if (!data) return <Loading />

    const statusName = subscription ? (STATUS_KEYS[subscription.status] ?? String(subscription.status)) : null
    const activeAddonSlugs: string[] = subscription?.addons?.map((addon: any) => addon.slug) ?? []

    const checkout = async () => {
        setBusy(true)
        try {
            const returnData = await billingCheckout(branchID)
            window.location.href = returnData.response.checkout_url
        } catch {
            setBusy(false)
        }
    }

    // Demo accounts get a fully-populated but READ-ONLY billing page (a live
    // preview for prospects); every mutating control is disabled.
    const readOnly = !!data.is_demo

    const cancel = async () => {
        if (readOnly) return
        const msg = statusName === 'active' ? t('billing.cancelConfirmActive') : t('billing.cancelConfirm')
        if (!(await confirm(msg))) return
        setBusy(true)
        try {
            await cancelSubscription(branchID)
            store.set(responseMessage, { type: 'success', text: t('billing.cancelDone') })
            await load()
        } finally { setBusy(false) }
    }

    const reactivate = async () => {
        if (readOnly) return
        setBusy(true)
        try {
            await reactivateSubscription(branchID)
            store.set(responseMessage, { type: 'success', text: t('billing.resumeDone') })
            await load()
        } finally { setBusy(false) }
    }

    const toggleAddon = async (slug: string) => {
        if (readOnly) return
        const next = activeAddonSlugs.includes(slug)
            ? activeAddonSlugs.filter((s) => s !== slug)
            : [...activeAddonSlugs, slug]
        setBusy(true)
        try {
            await updateBillingAddons(branchID, next)
            store.set(responseMessage, { type: 'success', text: t('billing.addonsUpdated') })
            load()
        } finally {
            setBusy(false)
        }
    }

    return <>
        <Header
            title={t('billing.title')}
            subtitle={t('billing.subtitle')}
            containerClass={"flex justify-between"}
        />

        {confirmingPayment && !subscriptionSettled && (
            <div className="alert alert-info mt-6">
                <span className="loading loading-spinner loading-sm"></span>
                {t('billing.paymentProcessing')}
            </div>
        )}

        {data.is_demo && (
            <div className="alert mt-6">{t('billing.demoNotice')}</div>
        )}

        {!subscription && !data.is_demo && (
            <div className="alert mt-6">{t('billing.noSubscription')}</div>
        )}

        {subscription && <>
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 card bg-base-100 border border-base-200 shadow-sm">
                <div className="card-body">
                    <h3 className="card-title text-lg mb-4">
                        <div className="w-1 h-5 bg-primary rounded me-2"></div>
                        {t('billing.planTitle')}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10">
                        <div className="flex justify-between items-center py-2 border-b border-base-200">
                            <span className="font-semibold text-base-content/70">{t('billing.plan')}</span>
                            <span>{t(`pricing.${subscription.system_plan?.slug}.title`)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-base-200">
                            <span className="font-semibold text-base-content/70">{t('billing.status')}</span>
                            <span className={`badge ${STATUS_BADGES[subscription.status] ?? 'badge-ghost'}`}>{t(`subscriptions.statuses.${statusName}`)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-base-200 sm:col-span-2">
                            <span className="font-semibold text-base-content/70">{statusName === 'trial' ? t('billing.trialEnds') : t('billing.renewsAt')}</span>
                            <span>{(statusName === 'trial' ? subscription.trial_ends_at : subscription.current_period_end)?.substring(0, 10) ?? '—'}</span>
                        </div>
                    </div>

                    <div className="mt-4 rounded-xl bg-base-200/60 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-base-content/50 mb-2">{t('billing.breakdownTitle')}</p>
                        <div className="flex justify-between items-center py-1.5 text-sm">
                            <span className="text-base-content/70">{t('billing.basePlan')}</span>
                            <span dir="ltr">{subscription.base_price} {subscription.currency}</span>
                        </div>
                        {Number(subscription.addons_price) > 0 && (
                            <div className="flex justify-between items-center py-1.5 text-sm">
                                <span className="text-base-content/70">{t('billing.addonsTitle')}</span>
                                <span dir="ltr">{subscription.addons_price} {subscription.currency}</span>
                            </div>
                        )}
                        {Number(subscription.branch_surcharge) > 0 && (
                            <div className="flex justify-between items-center py-1.5 text-sm">
                                <span className="text-base-content/70">{t('billing.branchSurcharge')}</span>
                                <span dir="ltr">{subscription.branch_surcharge} {subscription.currency}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center pt-3 mt-2 border-t border-base-300">
                            <span className="font-bold">{t('billing.total')}</span>
                            <span className="font-bold text-lg" dir="ltr">{subscription.total_price} {subscription.currency}</span>
                        </div>
                        {statusName === 'trial' && (
                            <p className="text-xs text-base-content/50 mt-2">{t('billing.breakdownTrialNote')}</p>
                        )}
                    </div>

                    {(statusName === 'trial' || statusName === 'pastDue' || statusName === 'pendingPayment') && (
                        <div className="mt-4 flex flex-wrap items-center gap-3 bg-base-200 rounded-xl p-4">
                            <span className="flex-1 text-sm">{statusName === 'trial' ? t('billing.convertHint') : t('billing.payNowHint')}</span>
                            <button className="btn btn-primary rounded-full font-bold" onClick={checkout} disabled={busy}>
                                {busy && <span className="loading loading-spinner"></span>}
                                {statusName === 'trial' ? t('billing.convertBtn') : t('billing.payNowBtn')}
                            </button>
                        </div>
                    )}

                    {/* Cancellation: active → cancel-at-period-end (with resume), canceled → resubscribe. */}
                    {!readOnly && statusName === 'active' && subscription.canceled_at && (
                        <div className="mt-4 flex flex-wrap items-center gap-3 bg-warning/10 border border-warning/30 rounded-xl p-4">
                            <span className="flex-1 text-sm">{t('billing.cancelPending', { date: subscription.current_period_end?.substring(0, 10) ?? '' })}</span>
                            <button className="btn btn-primary btn-sm rounded-full" onClick={reactivate} disabled={busy}>
                                {busy && <span className="loading loading-spinner"></span>}{t('billing.resumeBtn')}
                            </button>
                        </div>
                    )}
                    {!readOnly && statusName === 'canceled' && (
                        <div className="mt-4 flex flex-wrap items-center gap-3 bg-base-200 rounded-xl p-4">
                            <span className="flex-1 text-sm">{t('billing.canceledNotice')}</span>
                            <button className="btn btn-primary btn-sm rounded-full font-bold" onClick={checkout} disabled={busy}>
                                {busy && <span className="loading loading-spinner"></span>}{t('billing.resubscribeBtn')}
                            </button>
                        </div>
                    )}
                    {!readOnly && (statusName === 'active' && !subscription.canceled_at || statusName === 'trial') && (
                        <div className="mt-4 flex justify-end">
                            <button className="btn btn-ghost btn-sm text-error" onClick={cancel} disabled={busy}>{t('billing.cancelBtn')}</button>
                        </div>
                    )}
                </div>
            </div>

            <div className="card bg-base-100 border border-base-200 shadow-sm">
                <div className="card-body">
                    <h3 className="card-title text-lg mb-4">
                        <div className="w-1 h-5 bg-primary rounded me-2"></div>
                        {t('billing.paymentMethodTitle')}
                    </h3>
                    {data.payment_method
                        ? <div className="flex items-center gap-3">
                            <FontAwesomeIcon icon={faCreditCard} className="text-primary text-xl" />
                            <div dir="ltr">
                                <span className="font-semibold capitalize">{data.payment_method.card_brand}</span> •••• {data.payment_method.last_four}
                                <div className="text-xs text-base-content/60">{data.payment_method.exp_month}/{data.payment_method.exp_year}</div>
                            </div>
                        </div>
                        : <p className="text-sm text-base-content/60">{t('billing.noCard')}</p>}
                    <p className="text-xs text-base-content/50 mt-2">{t('billing.cardHint')}</p>
                </div>
            </div>
        </div>

        <div className="mt-6 card bg-base-100 border border-base-200 shadow-sm">
            <div className="card-body">
                <h3 className="card-title text-lg mb-1">
                    <div className="w-1 h-5 bg-primary rounded me-2"></div>
                    {t('billing.addonsTitle')}
                </h3>
                <p className="text-sm text-base-content/60 mb-4">{t('billing.addonsHint')}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {data.available_addons?.map((addon: any) => (
                        <label key={addon.slug} className={`rounded-2xl border p-4 cursor-pointer transition-all flex items-start gap-3 ${activeAddonSlugs.includes(addon.slug) ? 'border-primary ring-1 ring-primary bg-primary/5' : 'border-base-300'}`}>
                            <input
                                type="checkbox"
                                className="checkbox checkbox-primary checkbox-sm mt-1"
                                checked={activeAddonSlugs.includes(addon.slug)}
                                disabled={busy || readOnly}
                                onChange={() => toggleAddon(addon.slug)}
                            />
                            <span>
                                <span className="font-bold block">{t(`addons.${addon.slug}.title`)}</span>
                                <span className="text-sm text-base-content/60 block">{t(`addons.${addon.slug}.description`)}</span>
                                {addon.monthly_price != null && (
                                    <span className="text-sm font-semibold block mt-1">{addon.monthly_price} {addon.currency} {t('pricing.perMonth')}</span>
                                )}
                            </span>
                        </label>
                    ))}
                </div>
            </div>
        </div>

        {data.branches?.length > 1 && (
            <div className="mt-6">
                <BranchAddonsSection
                    branchID={branchID}
                    branches={data.branches}
                    availableAddons={data.available_addons}
                    subscriptionAddons={subscription.addons ?? []}
                    onSaved={load}
                    readOnly={readOnly}
                />
            </div>
        )}

        {data.trial_usage && (
        <div className="mt-6 card bg-base-100 border border-base-200 shadow-sm">
            <div className="card-body">
                <h3 className="card-title text-lg mb-1">
                    <div className="w-1 h-5 bg-primary rounded me-2"></div>
                    {t('billing.trialLimitsTitle')}
                </h3>
                <p className="text-sm text-base-content/60 mb-4">{t('billing.trialLimitsHint')}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {Object.entries(data.trial_usage).map(([resource, usage]: any) => (
                        <div key={resource} className="bg-base-200 rounded-xl p-3 text-center">
                            <div className="text-xs text-base-content/60 mb-1">{t(`billing.resources.${resource}`)}</div>
                            <div className={`font-bold ${usage.used >= usage.limit ? 'text-error' : ''}`}>{usage.used} / {usage.limit}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
        )}

        <div className="mt-6 card bg-base-100 border border-base-200 shadow-sm">
            <div className="card-body">
                <h3 className="card-title text-lg mb-4">
                    <div className="w-1 h-5 bg-primary rounded me-2"></div>
                    {t('billing.historyTitle')}
                </h3>
                {subscription.payments?.length > 0
                    ? <div className="overflow-x-auto">
                        <table className="table table-sm">
                            <thead>
                                <tr>
                                    <th>{t('subscriptions.paymentAmount')}</th>
                                    <th>{t('subscriptions.paymentState')}</th>
                                    <th>{t('subscriptions.paymentPeriod')}</th>
                                    <th>{t('subscriptions.paymentDate')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subscription.payments.map((payment: any) => (
                                    <tr key={payment.id}>
                                        <td>{payment.amount} {payment.currency}</td>
                                        <td>{t(`subscriptions.paymentStates.${PAYMENT_STATE_KEYS[payment.state] ?? 'pending'}`)}</td>
                                        <td dir="ltr">{payment.period_start?.substring(0, 10)} → {payment.period_end?.substring(0, 10)}</td>
                                        <td>{payment.created_at?.substring(0, 10)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    : <span className="text-base-content/60">{t('subscriptions.noPayments')}</span>}
            </div>
        </div>
        </>}

        {!readOnly && <CloseAccountSection user={user} />}

        {confirmModal}
    </>
}
