"use client"

import { useRouter } from "next/navigation"
import { FormEvent, useEffect, useRef, useState } from "react"
import { useAtom } from "jotai"
import { useTranslation } from "next-i18next"
import DOMPurify from "dompurify"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faLocationDot, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons"
import { useAuth } from "@/hooks/auth"
import { activeBranchCode, activeMembership, responseMessage, store, validationErrors } from "@/_state/globalStore"
import { subscribePlan } from "@/app/(app)/memberPlans/_memberPlan"
import { getMemberPlans } from "@/app/(app)/memberPlans/_memberPlan"
import { createMemberApplication, getGymPolicy, getPendingApplications, PendingApplication } from "@/app/(member)/member/memberships/_plan"
import { getMemberships } from "@/app/(member)/member/_membership"
import { getGyms, getHashedBranch, DirectoryGym } from "@/app/(member)/member/join/_gym"
import InputError from "@/_components/inputError"
import PhoneInput from "@/_components/phoneInput"
import Header from "@/app/(app)/_components/header"
import BaseTable from "@/app/(app)/_components/baseTable"
import SignaturePad from "@/_components/signaturePad"
import { scrollToFirstInvalidElement, validateForm } from "@/app/_helpers/validation"
import { usePaymentReturn } from "@/hooks/usePaymentReturn"

/**
 * Memberships tab — the subscribe flow lives HERE, at the tab itself (no hidden `/add`
 * route). The active gym comes from the global navbar switcher (`activeMembership`);
 * the tab shows that gym's current plans plus the pick-plan → sign → pay flow, and a
 * "find a gym" panel to join a new one. NO member record is created until the commit
 * point — the backend creates it only when the member pays (self-subscribe gyms) or
 * staff approve the application. Two gym-policy paths, on `self_subscribe`:
 *  - ON  → member picks a plan, signs, and pays online now (POST /api/me/plans → Stripe).
 *  - OFF → member submits an application (POST /api/me/applications) for staff to approve.
 */
export default function MemberMemberships() {
	const { t } = useTranslation('common')
	const router = useRouter()
	const { user } = useAuth()
	// The active gym (global navbar switcher) — persisted so it survives the Stripe redirect back.
	const [branchID, setBranchID] = useAtom(activeMembership)
	// Share code when this gym was reached by code (unlisted, not-yet-member). "" otherwise.
	const [branchCode, setBranchCode] = useAtom(activeBranchCode)
	const [memberships, setMemberships] = useState<any[]>([])
	const [validErrors] = useAtom(validationErrors)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [policy, setPolicy] = useState<any>({ plans: [] })
	const [planData, setPlanData] = useState<any>({})
	const [signature, setSignature] = useState<File>(null)
	const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null)
	const [acceptBranch, setAcceptBranch] = useState(false)
	const [acceptPlan, setAcceptPlan] = useState(false)

	// Current plans (active gym) + cross-gym pending applications.
	const [planList, setPlanList] = useState<any>([])
	const [pending, setPending] = useState<PendingApplication[]>([])

	// "Add a plan" flow: off by default (the tab just lists current plans + pending),
	// entered via "Join another gym", exited via Cancel back to the listing.
	const [adding, setAdding] = useState(false)
	const prevBranchRef = useRef(branchID)
	// "Find a gym" panel (directory search + share code).
	const [joining, setJoining] = useState(false)
	const [gymSearch, setGymSearch] = useState('')
	const [gyms, setGyms] = useState<DirectoryGym[]>([])
	const [code, setCode] = useState('')
	// Label of a gym picked from the directory (not in `memberships`, so the navbar switcher
	// can't name it) — shown by the subscribe flow so you know which gym you're joining.
	const [pickedGymName, setPickedGymName] = useState('')

	const selfSubscribe = !!policy.self_subscribe
	const shouldSign = !!policy.sign_required
	const termsOk = (!policy.terms || acceptBranch) && (!planData.terms || acceptPlan)
	// Already a member here? Then DOB/phone are on file — don't re-ask; and show their plans.
	const activeMembershipRow = memberships.find((m: any) => m.branch_id === branchID)
	const isExistingMember = !!activeMembershipRow
	// DOB + phone already on the account → don't re-ask (backend fills identity from it).
	const hasIdentityOnFile = !!user?.birth_date && !!user?.mobile_phone
	const activeGymName = activeMembershipRow
		? `${activeMembershipRow.company_name}${activeMembershipRow.branch_name ? ` — ${activeMembershipRow.branch_name}` : ''}`
		: pickedGymName

	usePaymentReturn({
		branchId: branchID,
		redirectTo: '/member/memberships',
		successMessage: t('memberPlans.createdMessage'),
		failedMessage: t('memberPlans.createdWithoutPaidMessage'),
	})

	// The member's gyms; default the active gym if none chosen. Open the find-a-gym panel
	// straight away when they belong to no gym yet, or when arriving via "Join another gym".
	useEffect(() => {
		getMemberships().then((all: any[]) => {
			setMemberships(all)
			if (branchID === -1 && all.length) { setBranchID(all[0].branch_id); setBranchCode('') }
			const wantsJoin = new URLSearchParams(window.location.search).get('join') === '1'
			// No gyms yet, or arriving via "Join another gym" → straight into the add flow.
			if (!all.length || wantsJoin) { setAdding(true); setJoining(true) }
		}).catch(() => {})
		getPendingApplications().then(setPending).catch(() => {})
	}, [])

	// Directory search (debounced) while the find-a-gym panel is open.
	useEffect(() => {
		if (!joining) return
		const timer = setTimeout(() => getGyms(gymSearch).then(setGyms), 250)
		return () => clearTimeout(timer)
	}, [gymSearch, joining])

	// Load the gym's policy + online plans whenever the target gym changes.
	useEffect(() => {
		if (branchID === -1) return
		setPlanData({}); setAcceptBranch(false); setAcceptPlan(false)
		getGymPolicy(branchID, branchCode).then(setPolicy).catch(() => {})
	}, [branchID, branchCode])

	// The current-plans table for the active gym (only meaningful where they're a member).
	const getList = (page: number, sort: string = null, sort_direction: string = 'asc') => {
		if (branchID === -1 || !isExistingMember) return
		getMemberPlans(page, branchID, sort, sort_direction).then((r: any) => setPlanList(r.response))
	}
	useEffect(() => { getList(1) }, [branchID, memberships])

	// Enter the add-a-plan flow (find a gym → pick → subscribe); remember where to return to.
	const startAdding = () => { prevBranchRef.current = branchID; setAdding(true); setJoining(true) }
	// Leave it and restore the previous listing.
	const cancelAdding = () => {
		setAdding(false); setJoining(false); setPlanData({}); setPickedGymName(''); setBranchCode('')
		if (prevBranchRef.current !== branchID) setBranchID(prevBranchRef.current)
	}

	// Target a gym picked from the directory / a share code (no member record created).
	const pickGym = (gym: any, code = '') => {
		setBranchID(gym.branch_id)
		setBranchCode(code)
		setPickedGymName(`${gym.company_name ?? ''}${gym.name ? ` — ${gym.name}` : ''}`.trim())
		setJoining(false); setGymSearch(''); setCode('')
	}

	// Resolve a gym by its share code, then target it.
	const resolveCode = async () => {
		if (!code.trim()) return
		try {
			const trimmed = code.trim()
			const res = await getHashedBranch(trimmed)
			const branch = res.response ?? res
			if (branch?.id) pickGym({ branch_id: branch.id, name: branch.name, company_name: branch.company?.name }, trimmed)
			else store.set(responseMessage, { type: 'alert', text: t('memberPortal.join.codeNotFound') })
		} catch (e) {
			store.set(responseMessage, { type: 'alert', text: t('memberPortal.join.codeNotFound') })
		}
	}

	const formSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		if (!planData.id) return store.set(responseMessage, { type: 'alert', text: t('memberPlans.planAlertMessage') })
		if (!termsOk) return store.set(responseMessage, { type: 'alert', text: t('memberPortal.memberships.termsRequired') })

		const form = event.currentTarget
		const { errors, firstInvalidElement } = validateForm(form, t, {
			...(shouldSign && { signature: { value: signature ? 'true' : '', rules: ['required'] } }),
		})
		if (Object.keys(errors).length > 0) {
			store.set(validationErrors, errors)
			if (firstInvalidElement) scrollToFirstInvalidElement(firstInvalidElement)
			return
		}

		const formData = new FormData(form)
		formData.set('branch_id', `${branchID}`)
		formData.set('plan_id', planData.id)
		formData.set('terms_accepted', '1')
		if (branchCode) formData.set('branch_code', branchCode)
		signature && formData.set('signature', signature)
		setIsSubmitting(true)

		if (selfSubscribe) {
			// Pay online now. The member record is created by the payment-success webhook.
			formData.set('success_url', window.location.href)
			formData.set('cancel_url', window.location.href + '?payment_status=canceled')
			await subscribePlan(formData).then((r) => {
				if (r.response?.checkout_url) return router.push(r.response.checkout_url)
				setIsSubmitting(false)
				setAdding(false); setPlanData({})
				store.set(responseMessage, { type: 'success', text: t('memberPlans.createdMessage') })
				getMemberships().then(setMemberships).catch(() => {})
				getList(1)
			}).catch(() => setIsSubmitting(false))
		} else {
			// Application path expects `membership_start`; the form field is `start_date`.
			formData.set('membership_start', String(formData.get('start_date') ?? ''))
			await createMemberApplication(formData).then(() => {
				setIsSubmitting(false)
				setAdding(false); setPlanData({})
				store.set(responseMessage, { type: 'success', text: t('memberPortal.memberships.applicationSubmitted') })
				getPendingApplications().then(setPending).catch(() => {})
			}).catch(() => setIsSubmitting(false))
		}
	}

	const colNames = [
		{ key: 'plan_id', label: t('memberPlans.table.plan') },
		{ key: 'duration', label: t('memberPlans.table.duration') },
		{ key: 'duration_count', label: t('memberPlans.table.durationCount') },
		{ key: 'membership_start', label: t('memberPlans.table.membershipStart') },
		{ key: 'membership_end', label: t('memberPlans.table.membershipEnd') },
		{ key: 'price', label: t('memberPlans.table.price') },
		{ key: 'status', label: t('memberPlans.table.status') },
		{ key: 'auto_renew_forever', label: t('memberPlans.table.autoRenewForever') },
	]

	const pendingSection = pending.length > 0 && <div className="my-4">
		<h2 className="text-xl font-bold mb-3">{t('memberPortal.memberships.pendingTitle')}</h2>
		<div className="overflow-x-auto">
			<table className="table">
				<thead>
					<tr>
						<th>{t('memberPortal.memberships.pendingGym')}</th>
						<th>{t('memberPlans.table.plan')}</th>
						<th>{t('memberPlans.membershipStart')}</th>
						<th>{t('memberPlans.price')}</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{pending.map((a) => <tr key={a.id}>
						<td>{a.company_name}{a.branch_name ? ` — ${a.branch_name}` : ''}</td>
						<td>{a.plan_name}</td>
						<td className="text-sm">{a.membership_start ? new Date(a.membership_start).toLocaleDateString() : '-'}</td>
						<td>${a.price}</td>
						<td className="text-end"><span className="badge badge-warning badge-sm">{t('memberPortal.memberships.pendingApproval')}</span></td>
					</tr>)}
				</tbody>
			</table>
		</div>
	</div>

	return <>
		<Header title={t('memberPortal.memberships.addTitle')} actions={
			!adding && <button type="button" className="btn btn-sm btn-ghost gap-2" onClick={startAdding}>
				<FontAwesomeIcon icon={faMagnifyingGlass} className="w-3 h-3" /> {t('memberPortal.memberships.joinAnother')}
			</button>
		} />

		{!adding && pendingSection}

		{/* Find-a-gym: directory search + share code. Targets a gym without creating anything. */}
		{adding && joining && <div className="card bg-base-100 border border-base-200 shadow-sm mt-4"><div className="card-body">
			<div className="flex items-center justify-between">
				<h2 className="card-title text-lg">{t('memberPortal.memberships.newGymTitle')}</h2>
				{memberships.length > 0 &&
					<button type="button" className="btn btn-ghost btn-sm" onClick={cancelAdding}>{t('memberPortal.cancel')}</button>}
			</div>
			<div className="space-y-4 mt-2">
				<div className="join w-full max-w-md">
					<span className="join-item btn btn-disabled"><FontAwesomeIcon icon={faMagnifyingGlass} /></span>
					<input className="join-item input input-bordered w-full" placeholder={t('memberPortal.join.searchPlaceholder')} value={gymSearch} onChange={e => setGymSearch(e.target.value)} />
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{gyms.map((g) => (
						<div key={g.branch_id} className="card bg-base-200 border border-base-300 shadow-sm">
							<div className="card-body gap-2 p-4">
								<h3 className="font-bold">{g.company_name}</h3>
								<p className="text-sm text-base-content/60 flex items-center gap-1">
									<FontAwesomeIcon icon={faLocationDot} className="w-3 h-3" /> {g.name}{g.city ? `, ${g.city}` : ''}
								</p>
								<div className="card-actions justify-end">
									<button type="button" className="btn btn-sm btn-primary" onClick={() => pickGym(g)}>{t('memberPortal.join.select')}</button>
								</div>
							</div>
						</div>
					))}
				</div>
				{gyms.length === 0 && <p className="text-base-content/60 text-sm">{t('memberPortal.join.noResults')}</p>}

				<div className="divider text-sm text-base-content/50">{t('memberPortal.join.orCode')}</div>
				<div className="join w-full max-w-md">
					<input className="join-item input input-bordered w-full" placeholder={t('memberPortal.join.codePlaceholder')} value={code} onChange={e => setCode(e.target.value)} />
					<button type="button" className="join-item btn btn-primary" onClick={resolveCode}>{t('memberPortal.join.useCode')}</button>
				</div>
			</div>
		</div></div>}

		{/* Listing: current plans at the active gym (default view, not while adding). */}
		{!adding && branchID !== -1 && isExistingMember && <div className="mt-6">
			<h2 className="text-xl font-bold mb-3">{t('memberPlans.listTitle')}</h2>
			<BaseTable data={planList} actions={{ path: "/member/memberships", view: true }} getListFunction={getList} tableController={'member_plan'} colHeaderNames={colNames} />
		</div>}

		{/* Subscribe: pick a plan at the target gym → sign → pay. Only in the add flow. */}
		{adding && !joining && branchID !== -1 && <>
			<div className="mt-4 flex items-center justify-between gap-2 flex-wrap">
				{activeGymName ? <div className="flex items-center gap-2">
					<FontAwesomeIcon icon={faLocationDot} className="w-3.5 h-3.5 text-primary" />
					<span className="font-semibold">{activeGymName}</span>
				</div> : <span />}
				<button type="button" className="btn btn-ghost btn-sm" onClick={cancelAdding}>{t('memberPortal.cancel')}</button>
			</div>
			{policy.self_subscribe === false &&
				<div className="alert alert-info mt-4 text-sm">{t('memberPortal.memberships.applicationHint')}</div>}

			<form onSubmit={formSubmit}>
				<div className="mt-6 space-y-6">
					<div className="card bg-base-100 border border-base-200 shadow-sm"><div className="card-body">
						<h2 className="card-title text-xl mb-4"><div className="w-1 h-6 bg-primary rounded me-2"></div>{t('memberPlans.selectPlan')}</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{policy.plans?.map((plan: any, i: number) => (
								<button key={i} type="button" onClick={() => { setPlanData(plan); setAcceptPlan(false) }}
									className={`card bg-base-200 border-2 hover:border-primary transition-colors ${planData.id === plan.id ? 'border-primary' : 'border-base-300'}`}>
									<div className="card-body p-4 text-center">
										<h3 className="card-title justify-center text-lg font-bold">{plan.name}</h3>
										<p className="text-sm">{plan.duration_count} {t(plan.duration)} / <span className="font-semibold">${plan.price}</span></p>
									</div>
								</button>
							))}
						</div>
						{policy.plans?.length === 0 && <p className="text-base-content/60 text-sm">{t('memberPortal.memberships.noPlans')}</p>}
					</div></div>

					{planData.id && <>
						<div className="card bg-base-100 border border-base-200 shadow-sm"><div className="card-body">
							<div className="flex justify-between items-center">
								<span className="font-semibold text-lg">{t('memberPlans.price')}</span>
								<span className="text-2xl font-bold text-primary">${planData.price}</span>
							</div>
						</div></div>

						{policy.terms && <div className="card bg-base-100 border border-base-200 shadow-sm"><div className="card-body">
							<h2 className="card-title text-xl mb-4"><div className="w-1 h-6 bg-primary rounded me-2"></div>{t('memberPortal.memberships.gymTerms')}</h2>
							<div className="prose prose-sm max-w-none bg-base-200 rounded-xl p-4 max-h-96 overflow-y-auto"
								dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(`<div>${policy.terms}</div>`) }} />
							<label className="flex items-center gap-2 mt-3 cursor-pointer">
								<input type="checkbox" className="checkbox checkbox-primary" checked={acceptBranch} onChange={e => setAcceptBranch(e.target.checked)} />
								<span className="text-sm">{t('memberPortal.memberships.acceptBranchTerms')}</span>
							</label>
						</div></div>}

						{planData.terms && <div className="card bg-base-100 border border-base-200 shadow-sm"><div className="card-body">
							<h2 className="card-title text-xl mb-4"><div className="w-1 h-6 bg-primary rounded me-2"></div>{t('memberPlans.contract')}</h2>
							<div className="prose prose-sm max-w-none bg-base-200 rounded-xl p-4 max-h-96 overflow-y-auto"
								dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(`<div>${planData.terms}</div>`) }} />
							<label className="flex items-center gap-2 mt-3 cursor-pointer">
								<input type="checkbox" className="checkbox checkbox-primary" checked={acceptPlan} onChange={e => setAcceptPlan(e.target.checked)} />
								<span className="text-sm">{t('memberPortal.memberships.acceptPlanTerms')}</span>
							</label>
						</div></div>}

						<div className="card bg-base-100 border border-base-200 shadow-sm"><div className="card-body">
							{/* Name comes from the account — not re-asked. DOB/phone only for a new gym. */}
							{!isExistingMember && <p className="text-sm text-base-content/60 mb-4">{t('memberPortal.memberships.signingUpAs', { name: user?.name ?? '', email: user?.email ?? '' })}</p>}
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								{!isExistingMember && !hasIdentityOnFile && <>
									<div>
										<label className="label justify-start"><span className="label-text required">{t('memberPortal.join.birthDate')}</span></label>
										<input name="birth_date" type="date" data-rules="required" className="input input-bordered w-full" />
										<InputError messages={validErrors.birth_date} />
									</div>
									<div>
										<label className="label justify-start"><span className="label-text required">{t('memberPortal.join.phone')}</span></label>
										<PhoneInput name="mobile_phone" rules="required" size="base" />
										<InputError messages={validErrors.mobile_phone} />
									</div>
								</>}
								<div className="sm:col-span-2">
									<label className="label justify-start"><span className="label-text font-semibold required">{t('memberPlans.membershipStart')}</span></label>
									<input name="start_date" data-rules="required" type="datetime-local" className="input input-bordered input-sm w-full" />
									<InputError messages={validErrors.start_date} />
								</div>
							</div>
							{shouldSign && <div className="mt-4">
								<label className="label justify-start label-text required">{t('memberPlans.signature')}</label>
								<SignaturePad savedData={signatureDataUrl}
									onSave={(f, d) => { setSignature(f); setSignatureDataUrl(d) }}
									onClear={() => { setSignature(null); setSignatureDataUrl(null) }} />
								<InputError messages={validErrors.signature} />
							</div>}
						</div></div>
					</>}

					<div className="card-actions justify-end mt-6">
						<button className="btn btn-primary rounded-full" type="submit" disabled={isSubmitting || !planData.id || !termsOk}>
							{isSubmitting && <span className="loading loading-spinner"></span>}
							{selfSubscribe ? t('memberPortal.memberships.subscribe') : t('memberPortal.memberships.submitApplication')}
						</button>
					</div>
				</div>
			</form>
		</>}
	</>
}
