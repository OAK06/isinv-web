"use client"

import Link from "next/link"
import { useTranslation } from "next-i18next"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faClock, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons"

/**
 * Slim app-wide banner driven by the platform subscription state:
 * trial countdown with a convert CTA, or a past-due payment warning.
 */
export default function SubscriptionBanner({ user }: { user: any }) {
    const { t } = useTranslation('common')
    const subscription = user?.subscription
    if (!subscription || user?.is_demo) return null

    if (subscription.status === 'trial' && subscription.trial_ends_at) {
        const daysLeft = Math.max(0, Math.ceil((new Date(subscription.trial_ends_at).getTime() - Date.now()) / 86400000))
        return (
            <div className="flex flex-wrap items-center justify-center gap-2 bg-info/15 text-base-content text-sm px-4 py-2 border-b border-info/30">
                <FontAwesomeIcon icon={faClock} className="text-info" />
                <span>{t('subscriptionBanner.trial', { days: daysLeft })}</span>
                <Link href="/billing" className="link link-primary font-semibold">{t('subscriptionBanner.trialCta')}</Link>
            </div>
        )
    }

    if (subscription.status === 'pastDue') {
        return (
            <div className="flex flex-wrap items-center justify-center gap-2 bg-warning/20 text-base-content text-sm px-4 py-2 border-b border-warning/40">
                <FontAwesomeIcon icon={faTriangleExclamation} className="text-warning" />
                <span>{t('subscriptionBanner.pastDue')}</span>
                <Link href="/billing" className="link link-primary font-semibold">{t('subscriptionBanner.pastDueCta')}</Link>
            </div>
        )
    }

    return null
}
