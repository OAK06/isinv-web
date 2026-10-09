"use client"

import axios from "@/lib/axios"
import { useSetAtom } from "jotai"
import { useAuth } from "@/hooks/auth"
import { useRouter } from "next/navigation"
import { FormEvent, useEffect, useState } from "react"
import { activePosSession, branch, branch_settings, branchHashedId, branchTermsAndConditions, company, posRegister, resetAppState, responseMessage, store } from "@/_state/globalStore"

import Loading from "@/app/(app)/_components/loading"
import { useTranslation } from "next-i18next"
import MessageModal from "@/_components/messageModal"

export default function ChooseBranch() {
    const { t } = useTranslation('common')
	const router = useRouter()
    const setBranchID = useSetAtom(branch)
    const setCompanyID = useSetAtom(company)
    const setBranchSettings = useSetAtom(branch_settings)
    const setBranchHasedID = useSetAtom(branchHashedId)
    const setBranchTerms = useSetAtom(branchTermsAndConditions)
    const setPosRegisterID = useSetAtom(posRegister)
    const setActivePosSessionID = useSetAtom(activePosSession)
	const { user } = useAuth({ middleware: "auth" })	
	const [userBranches, setUserBranches] = useState<any>([])
	const [isSubmitting , setIsSubmitting] = useState(false)
    const resetState = useSetAtom(resetAppState)
	

	useEffect(() => {
        resetState()

		axios.get(`/user-branches`)
			.then((res) => {
				setUserBranches(res.data.response)
			})
			.catch(error => { throw error })
	}, [])

    // Skip the manual picker when there's only one branch to choose from
    // (always true right after self-onboarding) — auto-select it exactly like
    // submitting the form would.
    useEffect(() => {
        if (userBranches.length === 1) setAtoms(userBranches[0])
    }, [userBranches])

    // Resolve the POS register here too when there's nothing to actually
    // choose (0 or 1 register) — avoids bouncing through a whole separate
    // page just to auto-pick the only option. Only a genuine choice (2+)
    // detours through /choose-pos-register. router.replace throughout this
    // auto-redirect chain so the back button doesn't land on an intermediate
    // resolver page that just bounces forward again.
    useEffect(() => {
        if (!user) return
        // Non-staff users (customers/members) go to the member portal — even with zero
        // memberships (they get a join-a-gym empty state). Dual-role users (staff who
        // also hold a membership) have staff access, so they default to the business
        // area here and switch to the portal from the menu. Tenant-free signals, so this
        // fires with no branch selected.
        if (!user.has_staff_access) { router.replace('/member'); return }
        if (!user?.roles?.length) return
        // Super Admins have no tenant branches — they land in the dedicated admin
        // dashboard, not a tenant. (Login routes here for everyone; this is the
        // fork for the global Super Admin role.)
        if (user.roles.includes('Super Admin')) { router.replace('/admin/dashboard'); return }
        const registers = user.pos_registers ?? []
        if (registers.length === 1) {
            setPosRegisterID(registers[0].id)
            setActivePosSessionID(registers[0].active_session?.id)
            router.replace('/dashboard')
        } else if (registers.length > 1) {
            router.replace('/choose-pos-register')
        } else {
            router.replace('/dashboard')
        }
	}, [user])

	const setAtoms = async (selectedBranch: any) => {
		setBranchID(selectedBranch.id)
		setCompanyID(selectedBranch.company_id)
		setBranchSettings(selectedBranch.settings.map((item : any) => item.feature_name))
        setBranchHasedID(selectedBranch.hashed_id)
        setBranchTerms(selectedBranch.terms)
	}	

	const submitForm = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const selectedBranch = userBranches.find((branch: any) => branch.id == event.currentTarget.branch_id.value)
		if (!selectedBranch)
            return store.set(responseMessage, { type: 'alert', text: t('chooseBranch.selectBranchAlert') });
        
        setIsSubmitting(true)
        await setAtoms(selectedBranch)
            .catch(() => setIsSubmitting(false))
	}

    // Keep the spinner up through the whole auto-select + redirect window —
    // only a genuine choice (2+ branches) is worth ever showing the form for.
    // (0 branches is an unreachable-in-practice edge case; it also just spins
    // rather than showing a dead-end empty picker, which isn't a regression.)
    if (!user || userBranches.length <= 1) return <Loading />

	return <>
        <MessageModal />
		<form onSubmit={submitForm} className="space-y-4">
			<h1 className="text-lg font-bold text-center">
				{t('chooseBranch.title')}
			</h1>
			<div>
				<select name="branch_id" className="select select-bordered w-full" defaultValue={userBranches[0]?.id}>
					{userBranches?.map((branch: any) => {
						return <option key={branch.id} value={branch.id}>{branch.name} ({branch.company.name})</option>
					})}
				</select>
			</div>
			<div className="grid grid-cols-1 justify-items-center">
				<button type="submit" className="btn btn-primary rounded-full w-fit" disabled={!userBranches.length || isSubmitting}>
					{isSubmitting && <span className="loading loading-spinner"></span>}
					{t('chooseBranch.formBtn')}
				</button>
			</div>
		</form>
	</>
}