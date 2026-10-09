"use client"

import { useEffect, useState } from "react"
import { useAtom, useSetAtom } from "jotai"
import { useTranslation } from "next-i18next"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faStore, faChevronDown, faCheck } from "@fortawesome/free-solid-svg-icons"
import axios from "@/lib/axios"
import { activePosSession, branch, branch_settings, branchHashedId, branchTermsAndConditions, company, posRegister } from "@/_state/globalStore"

/**
 * Inline navbar branch switcher for staff whose roles span more than one
 * location. Selecting a branch swaps exactly the atoms choose-branch sets and
 * clears the POS-register selection; the app layout then re-resolves the
 * register for the new branch (auto-picks one, prompts on two or more). useAuth
 * is keyed on the branch atom, so permissions/modules refetch automatically.
 * Super Admins are excluded - they use the dedicated tenant switcher.
 */
export default function BranchSwitcher({ user }: { user: any }) {
    const { t, i18n } = useTranslation("common")
    const isRtl = i18n.dir() === "rtl"

    const [branchID, setBranchID] = useAtom(branch)
    const setCompanyID = useSetAtom(company)
    const setBranchSettings = useSetAtom(branch_settings)
    const setBranchHashedID = useSetAtom(branchHashedId)
    const setBranchTerms = useSetAtom(branchTermsAndConditions)
    const setPosRegisterID = useSetAtom(posRegister)
    const setActivePosSessionID = useSetAtom(activePosSession)

    const [branches, setBranches] = useState<any[]>([])

    const enabled = (user?.branches_count ?? 0) > 1 && !user?.roles?.includes("Super Admin")

    useEffect(() => {
        if (!enabled) return
        axios.get("/user-branches", { headers: { "X-SWR-Request": true } })
            .then(res => setBranches(res.data.response ?? []))
            .catch(() => setBranches([]))
    }, [enabled])

    if (!enabled || branches.length < 2) return null

    const current = branches.find(b => b.id === branchID)

    const switchTo = (b: any) => {
        (document.activeElement as HTMLElement)?.blur()
        if (b.id === branchID) return
        // Clear POS selection first so the layout re-resolves it for the new branch.
        setPosRegisterID(-1)
        setActivePosSessionID(-1)
        setBranchSettings(b.settings.map((s: any) => s.feature_name))
        setBranchHashedID(b.hashed_id)
        setBranchTerms(b.terms)
        setCompanyID(b.company_id)
        setBranchID(b.id) // last: re-keys useAuth -> refetch under the new branch
    }

    return (
        <div className={`dropdown ${isRtl ? "dropdown-start" : "dropdown-end"}`}>
            <label tabIndex={0} className="btn btn-sm btn-ghost gap-2 normal-case max-w-[11rem]">
                <FontAwesomeIcon icon={faStore} />
                <span className="hidden sm:inline truncate">{current?.name ?? t("navbar.switchBranch")}</span>
                <FontAwesomeIcon icon={faChevronDown} className="text-xs opacity-60" />
            </label>
            <ul tabIndex={0} className="menu dropdown-content absolute end-0 z-[1] p-2 shadow bg-base-100 rounded-box w-56 mt-1 border border-base-200 max-h-80 overflow-y-auto">
                <li className="menu-title px-4 pt-1">{t("navbar.switchBranch")}</li>
                {branches.map(b => (
                    <li key={b.id}>
                        <button onClick={() => switchTo(b)} className={b.id === branchID ? "active" : ""}>
                            <span className="truncate">{b.name}</span>
                            {b.id === branchID && <FontAwesomeIcon icon={faCheck} className="ms-auto" />}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    )
}
