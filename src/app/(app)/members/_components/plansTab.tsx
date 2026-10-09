import { FormEvent, useState } from "react"
import { fileUrl } from "@/_utils/fileUrl"
import { addEntry, addMemberPlan, cancelMemberPlan, editMemberPlan, pauseMemberPlan, payMemberPlan, sendSignatureMail, unpauseMemberPlan } from "@/app/(app)/members/_member"
import { useAtom } from "jotai"
import { branch, branch_settings, branchTermsAndConditions, responseMessage, store, validationErrors } from "@/_state/globalStore"
import InputError from "@/_components/inputError"
import { useTranslation } from "next-i18next"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowRightToBracket, faCalendar, faCreditCard, faEdit, faPenNib, faPause, faPlay, faXmark, faDownload, faEye, faPlus } from "@fortawesome/free-solid-svg-icons"
import { useAuth } from "@/hooks/auth"
import DOMPurify from "dompurify"
import SignaturePad from "@/_components/signaturePad"
import { useConfirm } from "@/_components/useConfirm"
import { scrollToFirstInvalidElement, validateForm } from "@/app/_helpers/validation"

export default function PlansTab({data, className}: {data: any, className?: string}) {
    const { t } = useTranslation('common')
    const [planData, setPlanData] = useState<any>({})    
	const [ branchID ] = useAtom(branch)
	const [isSubmitting , setIsSubmitting] = useState(false)
	const [validErrors] = useAtom(validationErrors)
    const [selectedMemberPlan, setSelectedMemberPlan] = useState<any>(null)
    const { user } = useAuth({ middleware: "auth" })
	const [showPaymentMethod, setShowPaymentMethod] = useState<boolean>(false)
	const [showRenewalsTable, setShowRenewalsTable] = useState<boolean>(false)
	const [renewalId, setRenewalId] = useState<string>("")
    const [branchTerms] = useAtom(branchTermsAndConditions)
	const [signature, setSignature] = useState<File>(null)
    const { confirm, confirmModal } = useConfirm()
    const [branchSettings] = useAtom(branch_settings)
    const shouldSign = branchSettings?.includes("quick_signup_contract_upload")
    const [acceptanceChoice, setAcceptanceChoice] = useState<'' | 'present' | 'remote'>('')
    const [termsAccepted, setTermsAccepted] = useState(false)
    const [healthConsent, setHealthConsent] = useState(false)

    const contract = `
        <div>${branchTerms ?? ""}</div>
        <div>${planData?.terms ?? ""}</div>
    `

    const addFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const form = event.currentTarget
        const paymentMethod = form.querySelector('[name="payment_method"]:checked') as HTMLFormElement
        const {errors, firstInvalidElement} = validateForm(form, t, {
            ...(showPaymentMethod && { payment_method: { value: paymentMethod?.value || '', rules: ['required'] } }),
            ...(shouldSign && acceptanceChoice !== 'remote' && { signature: { value: signature ? 'true' : '', rules: ['required'] }}),
            ...(acceptanceChoice === 'present' && { terms_accepted: { value: termsAccepted ? 'true' : '', rules: ['required'] } })
        })
        const formData = new FormData(form)

		if (Object.keys(planData).length === 0)
            store.set(responseMessage, { type: 'alert', text: t('members.planAlertMessage') });
        else if (Object.keys(errors).length > 0) {
            store.set(validationErrors, errors)
            if (firstInvalidElement) scrollToFirstInvalidElement(firstInvalidElement)
        }
		else {
            if (acceptanceChoice === 'present') {
                signature && formData.set('signature', signature)
                formData.set('acceptance_method', 'walk_in')
                formData.set('terms_accepted', '1')
                formData.set('health_consent', healthConsent ? '1' : '0')
            } else if (acceptanceChoice === 'remote') {
                formData.set('acceptance_method', 'remote_email')
                formData.set('send_consent_request', '1')
            } else {
                signature && formData.set('signature', signature)
            }

		    setIsSubmitting(true)
			await addMemberPlan(formData, data.memberID).then(() => {
				window.location.reload();
			    store.set(responseMessage, { type: 'success', text: t('members.memberPlanCreatedMessage') });
			})
		    .catch(() => setIsSubmitting(false))
        }
	}

    const editFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const form = event.currentTarget
        const {errors, firstInvalidElement} = validateForm(form, t)
        if (Object.keys(errors).length > 0) {
            store.set(validationErrors, errors)
            if (firstInvalidElement) scrollToFirstInvalidElement(firstInvalidElement)
            return
        }

		const formData = new FormData(form)
        setIsSubmitting(true)
        await editMemberPlan(selectedMemberPlan.id, formData).then(() => {
            window.location.reload();
            store.set(responseMessage, { type: 'success', text: t('members.memberPlanUpdatedMessage') });
        })
        .catch(() => setIsSubmitting(false))
	}

    const pauseFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const form = event.currentTarget
        const paymentMethod = form.querySelector('[name="payment_method"]:checked') as HTMLFormElement
        const {errors, firstInvalidElement} = validateForm(form, t, {
            payment_method: { value: paymentMethod?.value || '', rules: ['required'] }
        })
        if (Object.keys(errors).length > 0) {
            store.set(validationErrors, errors)
            if (firstInvalidElement) scrollToFirstInvalidElement(firstInvalidElement)
            return
        }

		const formData = new FormData(form)
        formData.set('member_plan_id', selectedMemberPlan.id)

        setIsSubmitting(true)
        await pauseMemberPlan(formData).then(() => {
            window.location.reload();
            store.set(responseMessage, { type: 'success', text: t('members.pausedMessage') });
        })
        .catch(() => setIsSubmitting(false))
	}

    const unpauseFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const formData = new FormData(event.currentTarget)

        setIsSubmitting(true)
        await unpauseMemberPlan(selectedMemberPlan.id, formData).then(() => {
            window.location.reload();
            store.set(responseMessage, { type: 'success', text: t('members.unpausedMessage') });
        })
        .catch(() => setIsSubmitting(false))
    }

    const cancelFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const form = event.currentTarget
        const paymentMethod = form.querySelector('[name="payment_method"]:checked') as HTMLFormElement
        const {errors, firstInvalidElement} = validateForm(form, t, {
            payment_method: { value: paymentMethod?.value || '', rules: ['required'] }
        })
        if (Object.keys(errors).length > 0) {
            store.set(validationErrors, errors)
            if (firstInvalidElement) scrollToFirstInvalidElement(firstInvalidElement)
            return
        }

		const formData = new FormData(form)
        setIsSubmitting(true)
        await cancelMemberPlan(selectedMemberPlan.id, formData).then(() => {
            window.location.reload();
            store.set(responseMessage, { type: 'success', text: t('members.canceledMessage') });
        })
        .catch(() => setIsSubmitting(false))
    }

    const entryFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const formData = new FormData(event.currentTarget)
        formData.set('branch_id', `${branchID}`)
        formData.set('member_id', data.memberID)
        formData.set('entry_type', "memberPlan")
        formData.set('member_plan_id', selectedMemberPlan.id)

        setIsSubmitting(true)
        await addEntry(formData).then((response) => {
            window.location.reload();
            store.set(responseMessage, { type: 'success', text: t('members.entryMessage') });
        })
        .catch(() => setIsSubmitting(false))
    }

    const paymentFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const form = event.currentTarget
        const paymentMethod = form.querySelector('[name="payment_method"]:checked') as HTMLFormElement
        const {errors, firstInvalidElement} = validateForm(form, t, {
            payment_method: { value: paymentMethod?.value || '', rules: ['required'] }
        })
        if (Object.keys(errors).length > 0) {
            store.set(validationErrors, errors)
            if (firstInvalidElement) scrollToFirstInvalidElement(firstInvalidElement)
            return
        }

		const formData = new FormData(form)
        formData.set('branch_id', `${branchID}`)
        formData.set('renewal_id', renewalId)
        setIsSubmitting(true)
        await payMemberPlan(selectedMemberPlan.id, formData).then(() => {
            window.location.reload();
            store.set(responseMessage, { type: 'success', text: t('members.paymentMessage') });
        })
        .catch(() => setIsSubmitting(false))
	}

    const handleSendSignatureMail = async (memberPlanID: number) => {
		const confirmation = await confirm(t('members.SignatureLinkConfirmationMessage')) 
        if (confirmation) {
            await sendSignatureMail(memberPlanID).then(() => {
                store.set(responseMessage, { type: 'success', text: t('members.SignatureLinkSentMessage') });
            })
        }
	}

    return <div className={className}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.memberPlans?.map((memberPlan: any, index: number) => {
                const membership_start = new Date(memberPlan.membership_start).toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})
                const membership_end = new Date(memberPlan.membership_end).toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})
                const active = memberPlan.status_name === 'active'
                const paused = memberPlan.status_name === 'paused'
                const canceled = memberPlan.status_name === 'canceled'
                const showSegnatureBtn = !memberPlan.signature_id
                const showPayBtn = user.permissions.includes('pay memberPlans') && !canceled && memberPlan.has_unpaid_periods 
                const showEditBtn = user.permissions.includes('update memberPlans') && active
                const showPauseBtn = user.permissions.includes('pause memberPlans') && !memberPlan.active_pause
                const showUnPauseBtn = user.permissions.includes('unpause memberPlans') && memberPlan.active_pause
                const showCancelBtn = user.permissions.includes('cancel memberPlans')
                
                return (
                    <div key={index} className="card bg-base-100 border border-base-200 shadow-sm relative">
                        <div className="card-body p-4">

                            <div className="flex items-center gap-1 mt-1">
                                <a
                                    href={fileUrl(memberPlan.contract?.url)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-sm btn-outline btn-primary flex items-center gap-2 w-fit"
                                >
                                    <span className="text-xs truncate">{t('members.contract')}</span>
                                    <FontAwesomeIcon icon={faEye} />
                                </a>
                                <a 
                                    key={memberPlan.id}
                                    href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/download/file/${memberPlan.contract_id}`}
                                    className="btn btn-sm btn-outline btn-primary flex items-center gap-2 w-fit"
                                >
                                    <FontAwesomeIcon icon={faDownload} />
                                </a>
                            </div>

                            <div className="absolute top-3 right-3">
                                <div className="flex gap-1">
                                    {showSegnatureBtn && 
                                        <button className="btn btn-xs btn-primary" onClick={() => handleSendSignatureMail(memberPlan.id)}>
                                            <FontAwesomeIcon icon={faPenNib} />
                                        </button>
                                    }
                                    {showPayBtn && ( 
                                        memberPlan.renewals?.length > 0 ? (
                                            <button className="btn btn-xs btn-primary" 
                                                onClick={() => {
                                                    setSelectedMemberPlan(memberPlan)
                                                    setShowRenewalsTable(true)
                                                }}>
                                                <FontAwesomeIcon icon={faCalendar} />
                                            </button>
                                        ) : (
                                            <label htmlFor="payment_memberplan_modal" className="btn btn-xs btn-primary" onClick={() => setSelectedMemberPlan(memberPlan)}>
                                                <FontAwesomeIcon icon={faCreditCard} />
                                            </label>
                                        )
                                    )}
                                    {active && (
                                        <label htmlFor="entry_memberplan_modal" className="btn btn-xs btn-primary" onClick={() => setSelectedMemberPlan(memberPlan)}>
                                            <FontAwesomeIcon icon={faArrowRightToBracket} />
                                        </label>                                        
                                    )}
                                    {showEditBtn && (
                                        <label htmlFor="edit_memberplan_modal" className="btn btn-xs btn-warning" onClick={() => setSelectedMemberPlan(memberPlan)}>
                                            <FontAwesomeIcon icon={faEdit} />
                                        </label>
                                    )}
                                    {showPauseBtn && (
                                        <label htmlFor="pause_memberplan_modal" className="btn btn-xs btn-primary" onClick={() => setSelectedMemberPlan(memberPlan)}>
                                            <FontAwesomeIcon icon={faPause} />
                                        </label>
                                    )}
                                    {showUnPauseBtn && (
                                        <label htmlFor="unpause_memberplan_modal" className="btn btn-xs btn-error" onClick={() => setSelectedMemberPlan(memberPlan)}>
                                            <FontAwesomeIcon icon={faPlay} />
                                        </label>
                                    )}
                                    {showCancelBtn && (
                                        <label htmlFor="cancel_memberplan_modal" className="btn btn-xs btn-error" onClick={() => setSelectedMemberPlan(memberPlan)}>
                                            <FontAwesomeIcon icon={faXmark} />
                                        </label>
                                    )}                                    
                                </div>
                            </div>

                            <div className="pe-12">
                                <h3 className="text-lg font-bold text-base-content mb-2">
                                    {memberPlan.plan_name}
                                </h3>
                                
                                <div className={`badge badge-sm mb-3 ${
                                    active ? 'badge-success' : 
                                    paused ? 'badge-warning' : 
                                    'badge-error'
                                }`}>
                                    {t(memberPlan.status_name)}
                                </div>
                                
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="font-semibold text-base-content/70">{t('members.duration')}:</span>
                                        <span>{memberPlan.duration_count} {t(memberPlan.duration)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-semibold text-base-content/70">{t('members.price')}:</span>
                                        <span className="font-bold text-primary">${memberPlan.price}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-semibold text-base-content/70">{t('from')}:</span>
                                        <span>{membership_start}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-semibold text-base-content/70">{t('to')}:</span>
                                        <span>{membership_end}</span>
                                    </div>
                                    {memberPlan.allowed_entries && (
                                        <div className="flex justify-between">
                                            <span className="font-semibold text-base-content/70">{t('members.entries')}:</span>
                                            <span>{memberPlan.allowed_entries}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>

        {showRenewalsTable && selectedMemberPlan && <div className="card">
            <div className="card-body">
                <div className="bg-base-100 rounded-lg shadow-sm border">
                    <div className="overflow-x-auto">				
                        <table className="table table-zebra table-auto w-full">
                            <thead className="bg-base-200">
                                <tr>
                                    <th className="w-32">{t('members.billAt')}</th>
                                    <th className="w-32">{t('members.amount')}</th>
                                    <th className="w-32"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedMemberPlan?.renewals?.map((renewal: any, i: number) => (
                                    <tr key={i} className="hover">
                                        <td className="max-w-xs truncate">{new Date(renewal.bill_at).toLocaleDateString()}</td>
                                        <td className="max-w-xs truncate">{renewal.price}</td>
                                        <td>
                                            <div className="flex gap-1">
                                                <label htmlFor="payment_memberplan_modal" className="btn btn-xs btn-primary" onClick={() => setRenewalId(renewal.id)}>
                                                    <FontAwesomeIcon icon={faCreditCard} />
                                                </label>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>}

        {user.permissions.includes('create memberPlans') &&
            <div className="card-actions justify-center mt-6">
                <label htmlFor="add_memberplan_modal" className="btn btn-sm btn-primary">
                    <FontAwesomeIcon icon={faPlus} className="me-2" />
                    {t('members.addPlanBtn')}
                </label>
            </div>
        }

        <input type="checkbox" id="add_memberplan_modal" className="modal-toggle" />
        <div className="modal" role="dialog">
            <div className="modal-box max-w-5xl">
                <h3 className="text-lg font-bold mb-2 required">{t('members.plansInfoTitle')}</h3>
                <form onSubmit={addFormSubmit} encType="multipart/form-data">
                    <div className="grid grid-cols-4 gap-3">
                        {data.plans?.map((plan: any, index: number) => {
                        return <button key={index} type="button" className="border rounded-md border-base-300 shadow-sm p-2" onClick={() => setPlanData(plan)}>
                                <div className="w-full">
                                    <span className="font-bold">{plan.name}</span>
                                    <div><span>{plan.duration_count} {t(plan.duration)}</span> / <span>{`$${plan.price}`}</span></div>
                                    {plan.entries_count &&
                                        <div>{plan.entries_count} {t('members.entry')}</div>
                                    }
                                </div>
                            </button>
                        })}
                    </div>
                    
                    <hr className="mt-5"/>
                    
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 my-5">
                        <input name="plan_id" type="hidden" value={planData.id}/>
                        <input name="branch_id" type="hidden" value={branchID}/>

                        <div className="">
                            <label className="label justify-start label-text required">{t('members.duration')}</label>
                            <select name="duration" data-rules="required" className="select select-sm select-bordered w-full" defaultValue={""}>
                                <option value={""} disabled>{t('chooseOption')}</option>
                                <option value={"days"} selected={planData.duration === "days"}>{t('days')}</option>
                                <option value={"weeks"} selected={planData.duration === "weeks"}>{t('weeks')}</option>
                                <option value={"months"} selected={planData.duration === "months"}>{t('months')}</option>
                                <option value={"years"} selected={planData.duration === "years"}>{t('years')}</option>
                            </select>
                            <InputError messages={validErrors.duration} />
                        </div>
                        <div className="">
                            <label className="label justify-start label-text required">{t('members.durationCount')}</label>
                            <input name="duration_count" data-rules="required" type="number" className="input input-bordered input-sm w-full" defaultValue={planData.duration_count}/>
                            <InputError messages={validErrors.duration_count} />
                        </div>
                        <div className="">
                            <label className="label justify-start label-text required">{t('members.startupFee')}</label>
                            <input name="startup_fee" data-rules="required" type="number" className="input input-bordered input-sm w-full" defaultValue={planData.startup_fee}/>
                            <InputError messages={validErrors.startup_fee} />
                        </div>
                        <div className="">
                            <label className="label justify-start label-text required">{t('members.price')}</label>
                            <input name="price" data-rules="required" type="number" className="input input-bordered input-sm w-full" defaultValue={planData.price}/>
                            <InputError messages={validErrors.price} />
                        </div>
                        <div className="">
                            <label className="label justify-start label-text required">{t('members.cancellationFee')}</label>
                            <input name="cancellation_fee" data-rules="required" type="number" className="sm:col-span-2 input input-bordered input-sm w-full" value={planData.cancellation_fee}/>
                            <InputError messages={validErrors.cancellation_fee} />
                        </div>
                        <div className="">
                            <label className="label justify-start label-text required">{t('members.initialPauseFee')}</label>
                            <input name="initial_pause_fee" data-rules="required" type="number" className="input input-bordered input-sm w-full" defaultValue={planData.initial_pause_fee}/>
                            <InputError messages={validErrors.initial_pause_fee} />
                        </div>
                        <div className="">
                            <label className="label justify-start label-text required">{t('members.recurringPauseFee')}</label>
                            <input name="recurring_pause_fee" data-rules="required" type="number" className="input input-bordered input-sm w-full" defaultValue={planData.recurring_pause_fee}/>
                            <InputError messages={validErrors.recurring_pause_fee} />
                        </div>
                        <div className="">
                            <label className="label justify-start label-text required">{t('members.taxPercentage')}</label>
                            <input name="tax_percentage" data-rules="required" type="number" className="sm:col-span-2 input input-bordered input-sm w-full" defaultValue={planData.tax_percentage}/>
                            <InputError messages={validErrors.tax_percentage} />
                        </div>
                        <div className="">
                            <label className="label justify-start label-text">{t('members.trial')}</label>
                            <select name="trial" className="select select-sm select-bordered w-full" defaultValue={""}>
                                <option value={""}>{t('chooseOption')}</option>
                                <option value={"true"} selected={planData.trial === true}>{t('yes')}</option>
                                <option value={"false"} selected={planData.trial === false}>{t('no')}</option>
                            </select>
                            <InputError messages={validErrors.trial} />
                        </div>
                        <div className="">
                            <label className="label justify-start label-text required">{t('members.membershipStart')}</label>
                            <input name="start_date" data-rules="required" type="datetime-local" className="input input-bordered input-sm w-full" />
                            <InputError messages={validErrors.start_date} />
                        </div>	
                        <div className="">
                            <label className="label justify-start label-text required">{t('members.billAt')}</label>
                            <input name="bill_at" data-rules="required" type="date" className="input input-bordered input-sm w-full" onChange={(e) => setShowPaymentMethod(e.target.value === new Date().toISOString().slice(0, 10))} />
                            <InputError messages={validErrors.bill_at} />
                        </div>
                        {showPaymentMethod &&
                            <div className="sm:col-span-2 grid grid-cols-2 w-full">
                                <label className="label justify-start cursor-pointer">
                                    <input name="payment_method" type="radio" className="radio" value="cash" />
                                    <span className="mx-2 label-text">{t('cash')}</span> 
                                </label>
                                <label className="label justify-start cursor-pointer">
                                    <input name="payment_method" type="radio" className="radio" value="visa" />
                                    <span className="mx-2 label-text">{t('visa')}</span> 
                                </label>
                                <div className="sm:col-span-2">
                                    <InputError messages={validErrors.payment_method} />
                                </div>
                            </div>
                        }
                        <div className="sm:col-span-2">
                            <label className="label justify-start label-text">{t('members.acceptanceMethodLabel')}</label>
                            <div className="flex flex-col gap-2 p-3 bg-base-200 rounded-lg">
                                <label className="label justify-start cursor-pointer gap-2">
                                    <input type="radio" className="radio radio-sm" checked={acceptanceChoice === 'present'} onChange={() => setAcceptanceChoice('present')} />
                                    <span className="label-text">{t('members.acceptancePresentOption')}</span>
                                </label>
                                <label className="label justify-start cursor-pointer gap-2">
                                    <input type="radio" className="radio radio-sm" checked={acceptanceChoice === 'remote'} onChange={() => setAcceptanceChoice('remote')} />
                                    <span className="label-text">{t('members.acceptanceRemoteOption')}</span>
                                </label>
                            </div>
                        </div>

                        {acceptanceChoice === 'remote' ? (
                            <div className="sm:col-span-2 alert alert-info">
                                <span>{t('members.acceptanceRemoteInfo')}</span>
                            </div>
                        ) : (<>
                            <div className="sm:col-span-2">
                                <label className="label justify-start label-text">{t('members.contract')}</label>
                                <div
                                    className="prose prose-sm max-w-none bg-base-200 rounded-xl p-4 h-48 overflow-y-auto"
                                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(contract) }}
                                />
                            </div>
                            {acceptanceChoice === 'present' && (
                                <div className="sm:col-span-2">
                                    <label className="label justify-start cursor-pointer gap-2">
                                        <input type="checkbox" className="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />
                                        <span className="label-text required">{t('members.acceptanceTermsCheckbox')}</span>
                                    </label>
                                    <InputError messages={validErrors.terms_accepted} />
                                    <label className="label justify-start cursor-pointer gap-2 mt-1">
                                        <input type="checkbox" className="checkbox" checked={healthConsent} onChange={(e) => setHealthConsent(e.target.checked)} />
                                        <span className="label-text">{t('members.acceptanceHealthConsentCheckbox')}</span>
                                    </label>
                                </div>
                            )}
                            <div className="">
                                <label className={`label justify-start ${shouldSign ? "required" : ""}`}>{t('members.signature')}</label>
                                <SignaturePad onSave={(file) => setSignature(file)} onClear={() => setSignature(null)}/>
                                <InputError messages={validErrors.signature} />
                            </div>
                        </>)}
                    </div>

                    <div className="grid grid-cols-1 justify-items-end mt-5">
                        <button className="btn btn-sm btn-primary w-fit" type="submit" disabled={isSubmitting}>{isSubmitting && <span className="loading loading-spinner"></span>}{t('members.plansTabFormBtn')}</button>
                    </div>
                </form>
            </div>
            <label className="modal-backdrop" htmlFor="add_memberplan_modal">{t('close')}</label>
        </div>

        <input type="checkbox" id="edit_memberplan_modal" className="modal-toggle" />
        <div className="modal" role="dialog">
            <div className="modal-box">
                <h3 className="text-lg font-bold mb-2">{t('members.editMemberPlanTitle')}</h3>
                <form onSubmit={editFormSubmit}>
                    <div className="grid gap-4 grid-cols-1 my-5">
                        <div className="">
                            <label className="label justify-start label-text required">{t('members.membershipEnd')}</label>
                            <input name="membership_end" data-rules="required" type="datetime-local" className="input input-bordered input-sm w-full" defaultValue={selectedMemberPlan?.membership_end}/>
					        <InputError messages={validErrors.membership_end} />
                        </div>
                        {(selectedMemberPlan?.allowed_entries && selectedMemberPlan?.type === 2) &&
                        <div className="">
                            <label className="label justify-start label-text required">{t('members.allowedEntries')}</label>
                            <input name="allowed_entries" data-rules="required" type="number" className="input input-bordered input-sm w-full" defaultValue={selectedMemberPlan?.allowed_entries}/>
					        <InputError messages={validErrors.allowed_entries} />
                        </div>
                        }
                    </div>

                    <div className="grid grid-cols-1 justify-items-end mt-5">
                        <button className="btn btn-sm btn-primary w-fit" type="submit" disabled={isSubmitting}>{isSubmitting && <span className="loading loading-spinner"></span>}{t('members.editMemberPlanModalFormBtn')}</button>
                    </div>
                </form>
            </div>
            <label className="modal-backdrop" htmlFor="edit_memberplan_modal" onClick={() => setSelectedMemberPlan(null)}>{t('close')}</label>
        </div>

        <input type="checkbox" id="pause_memberplan_modal" className="modal-toggle" />
        <div className="modal" role="dialog">
            <div className="modal-box">
                <h3 className="text-lg font-bold mb-2">{t('members.pauseMemberPlanTitle')}</h3>
                <form onSubmit={pauseFormSubmit}>
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 my-5">
                        <div className="">
                            <label className="label justify-start label-text required">{t('members.pauseStart')}</label>
                            <input name="pause_start" data-rules="required" type="datetime-local" className="input input-bordered input-sm w-full"/>
					        <InputError messages={validErrors.pause_start} />
                        </div>
                        <div className="">
                            <label className="label justify-start label-text required">{t('members.pauseEnd')}</label>
                            <input name="pause_end" data-rules="required" type="datetime-local" className="input input-bordered input-sm w-full"/>
					        <InputError messages={validErrors.pause_end} />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="label justify-start label-text">{t('members.pauseFee')}</label>
                            <input name="pause_fee" type="number" readOnly className="input input-bordered input-sm w-full" value={selectedMemberPlan?.pause_count > 0 ? selectedMemberPlan?.recurring_pause_fee : selectedMemberPlan?.initial_pause_fee}/>
					        <InputError messages={validErrors.pause_fee} />
                        </div>

                        <div className="sm:col-span-2 grid grid-cols-2 w-full">
                            <label className="label justify-start cursor-pointer">
                                <input name="payment_method" type="radio" className="radio" value="cash" />
                                <span className="mx-2 label-text">{t('cash')}</span> 
                            </label>
                            <label className="label justify-start cursor-pointer">
                                <input name="payment_method" type="radio" className="radio" value="visa" />
                                <span className="mx-2 label-text">{t('visa')}</span> 
                            </label>
                            <div className="sm:col-span-2">
                                <InputError messages={validErrors.payment_method} />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 justify-items-end mt-5">
                        <button className="btn btn-sm btn-primary w-fit" type="submit" disabled={isSubmitting}>{isSubmitting && <span className="loading loading-spinner"></span>}{t('members.pauseMemberPlanModalFormBtn')}</button>
                    </div>
                </form>
            </div>
            <label className="modal-backdrop" htmlFor="pause_memberplan_modal" onClick={() => setSelectedMemberPlan(null)}>{t('close')}</label>
        </div>

        <input type="checkbox" id="unpause_memberplan_modal" className="modal-toggle" />
        <div className="modal" role="dialog">
            <div className="modal-box">
                <h3 className="text-lg font-bold mb-2">{t('members.unpauseConfirmationMessage')}</h3>
                <form onSubmit={unpauseFormSubmit}>
                    <div className="grid gap-4 grid-cols-1 my-5">
                        {user.permissions.includes('create refunds') &&
                        <div className="">
                            <label className="label justify-start cursor-pointer">
                                <input name="with_refund" type="checkbox" className="checkbox" />
                                <span className="mx-2 label-text">{t('members.withRefund')}</span> 
                            </label>
                        </div>
                        }
                    </div>

                    <div className="grid grid-cols-1 justify-items-end mt-5">
                        <button className="btn btn-sm btn-primary w-fit" type="submit" disabled={isSubmitting}>{isSubmitting && <span className="loading loading-spinner"></span>}{t('members.unpauseMemberPlanModalFormBtn')}</button>
                    </div>
                </form>
            </div>
            <label className="modal-backdrop" htmlFor="unpause_memberplan_modal" onClick={() => setSelectedMemberPlan(null)}>{t('close')}</label>
        </div>

        <input type="checkbox" id="cancel_memberplan_modal" className="modal-toggle" />
        <div className="modal" role="dialog">
            <div className="modal-box">
                <h3 className="text-lg font-bold mb-2">{t('members.cancelConfirmationMessage')}</h3>
                <form onSubmit={cancelFormSubmit}>
                    <div className="grid gap-4 grid-cols-1 my-5">
                        <div className="sm:col-span-2">
                            <label className="label justify-start label-text">{t('members.cancellationFee')}</label>
                            <input name="cancellation_fee" type="number" readOnly className="input input-bordered input-sm w-full" value={selectedMemberPlan?.cancellation_fee}/>
					        <InputError messages={validErrors.cancellation_fee} />
                        </div>
                        <div className="sm:col-span-2 grid grid-cols-2 w-full">
                            <label className="label justify-start cursor-pointer">
                                <input name="payment_method" type="radio" className="radio" value="cash"
                                    />
                                <span className="mx-2 label-text">{t('cash')}</span> 
                            </label>
                            <label className="label justify-start cursor-pointer">
                                <input name="payment_method" type="radio" className="radio" value="visa" />
                                <span className="mx-2 label-text">{t('visa')}</span> 
                            </label>
                            <div className="sm:col-span-2">
                                <InputError messages={validErrors.payment_method} />
                            </div>
                        </div>
                        {user.permissions.includes('create refunds') &&
                        <div className="">
                            <label className="label justify-start cursor-pointer">
                                <input name="with_refund" type="checkbox" className="checkbox" />
                                <span className="mx-2 label-text">{t('members.withRefund')}</span> 
                            </label>
                        </div>
                        }
                    </div>

                    <div className="grid grid-cols-1 justify-items-end mt-5">
                        <button className="btn btn-sm btn-primary w-fit" type="submit" disabled={isSubmitting}>{isSubmitting && <span className="loading loading-spinner"></span>}{t('members.cancelMemberPlanModalFormBtn')}</button>
                    </div>
                </form>
            </div>
            <label className="modal-backdrop" htmlFor="cancel_memberplan_modal" onClick={() => setSelectedMemberPlan(null)}>{t('close')}</label>
        </div>

        <input type="checkbox" id="entry_memberplan_modal" className="modal-toggle" />
        <div className="modal" role="dialog">
            <div className="modal-box">
                <form onSubmit={entryFormSubmit}>
                    <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                        <div className="text-bold">{t('members.planName')}:</div>
                        <div className="text-sm">{selectedMemberPlan?.plan_name}</div>
                        <div className="text-bold">{t('members.planStatus')}:</div>
                        <div className="text-sm">{t(selectedMemberPlan?.status_name)}</div>
                        <div className="text-bold">{t('members.membershipStart')}</div>
                        <div className="text-sm">{new Date(selectedMemberPlan?.membership_start).toLocaleString()}</div>
                        <div className="text-bold">{t('members.membershipEnd')}</div>
                        <div className="text-sm">{new Date(selectedMemberPlan?.membership_end).toLocaleString()}</div>
                        {selectedMemberPlan?.allowed_entries && <>
                            <div className="text-bold">{t('members.entries')}:</div>
                            <div className="text-sm">{selectedMemberPlan?.entries_count} / {selectedMemberPlan?.allowed_entries}</div>
                            <div className="text-bold">{t('members.remainingEntries')}:</div>
                            <div className="text-sm">{selectedMemberPlan?.remaining_entries}</div>
                        </>}
                    </div>

                    <div className="grid grid-cols-1 justify-items-end mt-5">
                        <button className="btn btn-sm btn-primary w-fit" type="submit" disabled={isSubmitting}>{isSubmitting && <span className="loading loading-spinner"></span>}{t('members.entryMemberPlanModalFormBtn')}</button>
                    </div>
                </form>
            </div>
            <label className="modal-backdrop" htmlFor="entry_memberplan_modal" onClick={() => setSelectedMemberPlan(null)}>{t('close')}</label>
        </div>

        <input type="checkbox" id="payment_memberplan_modal" className="modal-toggle" />
        <div className="modal" role="dialog">
            <div className="modal-box">
                <h3 className="text-lg font-bold mb-2">{t('members.paymentMemberPlanTitle')}</h3>
                <form onSubmit={paymentFormSubmit}>
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 my-5">
                        <div className="sm:col-span-2">
                            <label className="label justify-start label-text">{t('members.price')}</label>
                            <input name="price" type="number" readOnly className="input input-bordered input-sm w-full" value={selectedMemberPlan?.price}/>
                            <InputError messages={validErrors.price} />
                        </div>
                        <div className="sm:col-span-2 grid grid-cols-2 w-full">
                            <label className="label justify-start cursor-pointer">
                                <input name="payment_method" type="radio" className="radio" value="cash" />
                                <span className="mx-2 label-text">{t('cash')}</span> 
                            </label>
                            <label className="label justify-start cursor-pointer">
                                <input name="payment_method" type="radio" className="radio" value="visa" />
                                <span className="mx-2 label-text">{t('visa')}</span> 
                            </label>
                            <div className="sm:col-span-2">
                                <InputError messages={validErrors.payment_method} />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 justify-items-end mt-5">
                        <button className="btn btn-sm btn-primary w-fit" type="submit" disabled={isSubmitting}>{isSubmitting && <span className="loading loading-spinner"></span>}{t('members.paymentMemberPlanModalFormBtn')}</button>
                    </div>
                </form>
            </div>
            <label className="modal-backdrop" htmlFor="payment_memberplan_modal" onClick={() => setRenewalId("")}>{t('close')}</label>
        </div>

        {confirmModal}
    </div>
}