"use client"

import { useConfirm } from "@/_components/useConfirm";
import { branch, branch_settings, responseMessage, store, validationErrors } from "@/_state/globalStore";
import { useAuth } from "@/hooks/auth";
import { useAtom } from "jotai";
import { useTranslation } from "next-i18next";
import { bookSession } from "@/app/(app)/memberSessions/_memberSession";
import { createPublicBooking } from "@/app/(member)/member/bookings/_booking";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import PhoneInput from "@/_components/phoneInput";
import InputError from "@/_components/inputError";
import { validateForm } from "@/app/_helpers/validation";

/**
 * Session detail + book action for the member portal calendar.
 *  - Member gym (default): books via /api/me/sessions — the caller is already a member,
 *    gated by the gym's self-book opt-in + online payments (or staff permission).
 *  - `publicBooking` (a gym the caller isn't a member of): books via /api/me/public-bookings,
 *    collecting the identity the account doesn't carry (DOB + phone). Always bookable — the
 *    backend settles online/paid via Stripe, else creates it unpaid for staff.
 */
export function ViewMemberSessionModal({ data, branchID, branchCode, canBook, bookingNotice, publicBooking, onBooked }: { data: any, branchID?: number, branchCode?: string, canBook?: boolean, bookingNotice?: string, publicBooking?: boolean, onBooked?: () => void }) {
    const { t } = useTranslation('common')
	const router = useRouter()
    const { user } = useAuth()
    // Staff pages read the tenant `branch` atom; the member portal passes the
    // active-gym branchID as a prop (its /api/user is tenant-free, so no atom).
    const [branchAtom] = useAtom(branch)
    const effectiveBranch = branchID ?? branchAtom
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { confirm, confirmModal } = useConfirm()
    const [branchSettings] = useAtom(branch_settings)
    const [validErrors] = useAtom(validationErrors)
    const isPaymentSettingActive = branchSettings?.includes("online_payments")
    // DOB + phone already on the account → don't re-ask (backend fills identity from it).
    const hasIdentityOnFile = !!user?.birth_date && !!user?.mobile_phone
    // Public booking is always allowed; a member self-booking needs the gym's opt-in +
    // online payments (or the staff permission).
    const showBookAction = publicBooking ? true : (canBook ?? (user.permissions?.includes('subscribe memberSessions') && isPaymentSettingActive))
    const booked = data.extendedProps?.member_booking

    // Deferred cycle either way: the booking is created on payment success (webhook), or
    // immediately (free / no online payment). Returns a Stripe checkout URL, or nothing to pay.
    const finishBooking = (res: any) => {
        if (res?.checkout_url) { router.push(res.checkout_url); return }
        setIsSubmitting(false)
        store.set(responseMessage, { type: 'success', text: t('memberSessions.createdMessage') })
        onBooked?.()
    }

    // Existing-member self-book → /api/me/sessions.
    const handleMemberBooking = async () => {
		const confirmation = await confirm(t('memberSessions.redirectToPaymentConfirmation'))
        if (!confirmation) return
        const payload = {
            branch_id: `${effectiveBranch}`,
            session_id: data.id,
            success_url: window.location.href,
            cancel_url: window.location.href + '?payment_status=canceled',
        }
        setIsSubmitting(true)
        await bookSession(payload).then((r) => finishBooking(r.response)).catch(() => setIsSubmitting(false))
    }

    // Public booking (not a member here yet) → /api/me/public-bookings, with DOB + phone.
    const handlePublicBooking = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const form = event.currentTarget
        const { errors } = validateForm(form, t)
        if (Object.keys(errors).length > 0) { store.set(validationErrors, errors); return }
        const formData = new FormData(form)
        formData.set('branch_id', `${effectiveBranch}`)
        formData.set('session_id', String(data.id))
        // Proof of reach for an unlisted, code-joined gym (the gate 404s the booking otherwise).
        if (branchCode) formData.set('branch_code', branchCode)
        formData.set('success_url', window.location.href)
        formData.set('cancel_url', window.location.href + '?payment_status=canceled')
        setIsSubmitting(true)
        await createPublicBooking(formData).then((r) => finishBooking(r.response)).catch(() => setIsSubmitting(false))
    }

    return <div className="modal">
        <div className="modal-box">
            <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 my-3 items-center">
                {booked?.qr_code &&
                <div className="col-span-2">
                    <div className="flex items-center mb-3 min-w-max">
                        <img src={`data:image/png;base64,${data.extendedProps.qr_code}`} alt="Member Session Qr Code" className="w-32 h-32" />
                    </div>
                </div>
                }
                <div className="text-lg text-bold">{t('memberSessions.class')}</div>
                <div className="text-sm">{data.extendedProps?.class_name}</div>
                <div className="text-lg text-bold">{t('memberSessions.name')}</div>
                <div className="text-sm">{data.title}</div>
                <div className="text-lg text-bold">{t('memberSessions.sessionManager')}</div>
                <div className="text-sm">{data.extendedProps?.session_manager}</div>
                <div className="text-lg text-bold">{t('memberSessions.sessionTrainer')}</div>
                <div className="text-sm">{data.extendedProps?.session_trainer}</div>
                <div className="text-lg text-bold">{t('memberSessions.description')}</div>
                <div className="text-sm">{data.extendedProps?.description}</div>
                <div className="text-lg text-bold">{t('memberSessions.price')}</div>
                <div className="text-sm">{data.extendedProps?.price}</div>
                <div className="text-lg text-bold">{t('memberSessions.taxPercentage')}</div>
                <div className="text-sm">{data.extendedProps?.tax_percentage}</div>
                <div className="text-lg text-bold">{t('memberSessions.startDate')}</div>
                <div className="text-sm">{data.start}</div>
                <div className="text-lg text-bold">{t('memberSessions.endDate')}</div>
                <div className="text-sm">{data.end}</div>
                <div className="text-lg text-bold">{t('memberSessions.allDay')}</div>
                <div className="text-sm">{data.start == data.end ? t('true') : t('false')}</div>
                {booked && <>
                    <div className="text-lg text-bold">{t('memberSessions.attendance')}</div>
                    <div className="text-sm">{t(`${booked.attendance_status_name}`)}</div>
                </>}
            </div>

            {/* Public booking: collect the identity the account doesn't carry, then book. */}
            {!booked && showBookAction && publicBooking &&
                <form onSubmit={handlePublicBooking} className="mt-2 space-y-3">
                    {!hasIdentityOnFile && <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="label justify-start"><span className="label-text required">{t('memberPortal.join.birthDate')}</span></label>
                            <input name="birth_date" type="date" data-rules="required" className="input input-bordered input-sm w-full" />
                            <InputError messages={validErrors.birth_date} />
                        </div>
                        <div>
                            <label className="label justify-start"><span className="label-text required">{t('memberPortal.join.phone')}</span></label>
                            <PhoneInput name="mobile_phone" rules="required" size="base" />
                            <InputError messages={validErrors.mobile_phone} />
                        </div>
                    </div>}
                    <div className="modal-action justify-center">
                        <button type="submit" className="btn btn-sm btn-primary" disabled={isSubmitting}>{isSubmitting && <span className="loading loading-spinner"></span>}{t('memberSessions.bookingBtn')}</button>
                    </div>
                </form>
            }

            {/* Member self-book: single confirm-and-pay button. */}
            {!booked && showBookAction && !publicBooking &&
                <div className="modal-action justify-center">
                    <button className="btn btn-sm btn-primary" onClick={handleMemberBooking} disabled={isSubmitting}>{isSubmitting && <span className="loading loading-spinner"></span>}{t('memberSessions.bookingBtn')}</button>
                </div>
            }

            {/* Gym doesn't allow member self-booking — tell them how to book instead. */}
            {!booked && !showBookAction && bookingNotice &&
                <div className="alert alert-info mt-3 text-sm justify-center text-center">{bookingNotice}</div>
            }
        </div>
        <label className="modal-backdrop" htmlFor="view-member-session-modal" aria-label="Close"></label>
        {confirmModal}
    </div>
}
