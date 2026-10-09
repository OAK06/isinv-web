"use client"

import { useRouter } from "next/navigation"
import { useAtomValue, useSetAtom } from "jotai"
import { useTranslation } from "next-i18next"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowLeft, faUserShield } from "@fortawesome/free-solid-svg-icons"
import { enteredTenantName, resetAppState } from "@/_state/globalStore"

/**
 * Shown in the tenant shell while a Super Admin is "viewing" a tenant they
 * entered from /admin/tenants. Makes the impersonation-like context explicit and
 * offers a one-click exit back to the admin dashboard (clears the branch/tenant
 * context). Only rendered by the app layout when the user is a Super Admin with
 * a branch selected.
 */
export default function SuperAdminBanner() {
    const { t } = useTranslation('common')
    const router = useRouter()
    const tenantName = useAtomValue(enteredTenantName)
    const resetState = useSetAtom(resetAppState)

    const exit = () => {
        resetState()
        router.replace('/admin/dashboard')
    }

    return (
        <div className="flex flex-wrap items-center justify-center gap-2 bg-secondary text-secondary-content text-sm px-4 py-2 border-b border-white/10">
            <FontAwesomeIcon icon={faUserShield} className="text-accent" />
            <span>
                {tenantName
                    ? t('superAdminBanner.viewing', { tenant: tenantName })
                    : t('superAdminBanner.viewingGeneric')}
            </span>
            <button onClick={exit} className="btn btn-xs btn-accent gap-1">
                <FontAwesomeIcon icon={faArrowLeft} className="rtl:rotate-180" />
                {t('superAdminBanner.exit')}
            </button>
        </div>
    )
}
