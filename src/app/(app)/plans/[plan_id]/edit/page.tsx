"use client"

import { useRouter } from "next/navigation"
import { useBreadcrumbLabel } from "@/hooks/useBreadcrumbLabel"
import { FormEvent, useEffect, useState } from "react"

import { getPlan, editPlan, getCompanyBranches } from "@/app/(app)/plans/_plan"
import { useAtom } from "jotai"
import { branch, company, responseMessage, store, validationErrors } from "@/_state/globalStore"
import InputError from "@/_components/inputError"
import { useTranslation } from "next-i18next"
import { useAuth } from "@/hooks/auth"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons"
import Header from "@/app/(app)/_components/header"
import { scrollToFirstInvalidElement, validateForm } from "@/app/_helpers/validation"

export default function PlanEdit({ params }: any) {
    const { t } = useTranslation('common')
	const router = useRouter()
	const { plan_id }: any = params
	const [data, setData] = useState<any>([])
	useBreadcrumbLabel(data)
	const [branches, setBranches] = useState([])
	const [ branchID ] = useAtom(branch)
	const [ companyID ] = useAtom(company)
	const [terms, setTerms] = useState('')
	const [isSubmitting , setIsSubmitting] = useState(false)
	const [validErrors] = useAtom(validationErrors)
    const [upfront, setUpfront] = useState<boolean>(false)
    const [entries, setEntries] = useState<boolean>(false)
    const { user } = useAuth()
    const canAccessCompanyLevel = user.permissions.includes('update company plans')

	useEffect(() => {
        if (companyID === -1) return
		getPlan(plan_id).then((returnData: any) => {
			setData(returnData.response)
			setTerms(returnData.response.terms)
            setUpfront(returnData.response.type !== 0)
            setEntries(returnData.response.type === 2)
		})

		getCompanyBranches(companyID).then((returnData: any) => {
			setBranches(returnData.response)
		})
	}, [companyID])

	const formSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const form = event.currentTarget
        const {errors, firstInvalidElement} = validateForm(form, t, {
            terms: { value: terms, rules: ['required'] }
        })
        if (Object.keys(errors).length > 0) {
            store.set(validationErrors, errors)
            if (firstInvalidElement) scrollToFirstInvalidElement(firstInvalidElement)
            return
        }

        const formData = new FormData(form)
		formData.set('terms', terms)
		formData.set('company_id', `${companyID}`)
		formData.set('login_branch_id', `${branchID}`)
		setIsSubmitting(true)

		await editPlan(plan_id, formData).then((response) => {
			router.push(`/plans/${response.response.id}`)
			store.set(responseMessage, { type: 'success', text: `${t('plans.updatedMessage')}` });
		})
		.catch(() => setIsSubmitting(false))
	}

	return <>
		<Header
			title={t('plans.editTitle')}
			containerClass={"flex justify-between"}
		/>
		<div className="mt-6 card bg-base-100 border border-base-200 shadow-sm">
			<div className="card-body">	
				<form onSubmit={formSubmit}>
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('plans.name')}</span>
							</label>
							<input name="name" data-rules="required" type="text" className="input input-bordered input-sm w-full" defaultValue={data.name} />
							<InputError messages={validErrors.name} />
						</div>
						<div>
							<label className={`label justify-start ${canAccessCompanyLevel ? "" : "required"}`}>
								<span className="label-text font-semibold flex items-center">
									{t('plans.branch')}
									{canAccessCompanyLevel && (
										<div className="tooltip tooltip-top ms-2" data-tip={t('plans.branchSelectNote')}>
											<FontAwesomeIcon icon={faInfoCircle} className="text-info" />
										</div>
									)}
								</span>
							</label>
							<select name="branch_id" data-rules={canAccessCompanyLevel ? "" : "required"} className="select select-sm select-bordered w-full" defaultValue={data.branch_id ?? ""}>
								<option value={""} disabled={canAccessCompanyLevel ? false : true}>{t('chooseOption')}</option>
								{branches?.map((branch: any) => (
									<option key={branch.id} value={branch.id} selected={branch.id == data.branch_id}>{branch.name}</option>
								))}
							</select>
							<InputError messages={validErrors.branch_id} />
						</div>
						<div className="lg:col-span-2">
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('plans.defaultAccessType')}</span>
							</label>
							<select name="default_access_type" data-rules="required" className="select select-sm select-bordered w-full" defaultValue={data.default_access_type}>
								<option value={""} disabled>{t('chooseOption')}</option>
								<option value={"M"} selected={data.default_access_type === "M"}>{t('male')}</option>
								<option value={"F"} selected={data.default_access_type === "F"}>{t('female')}</option>
								<option value={"O"} selected={data.default_access_type === "O"}>{t('other')}</option>
							</select>
							<InputError messages={validErrors.default_access_type} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('plans.duration')}</span>
							</label>
							<select name="duration" data-rules="required" className="select select-sm select-bordered w-full" defaultValue={data.duration}>
								<option value={""} disabled>{t('chooseOption')}</option>
								<option value={"days"} selected={data.duration === "days"}>{t('days')}</option>
								<option value={"weeks"} selected={data.duration === "weeks"}>{t('weeks')}</option>
								<option value={"months"} selected={data.duration === "months"}>{t('months')}</option>
								<option value={"years"} selected={data.duration === "years"}>{t('years')}</option>
							</select>
							<InputError messages={validErrors.duration} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('plans.durationCount')}</span>
							</label>
							<input name="duration_count" data-rules="required" type="number" className="input input-bordered input-sm w-full" defaultValue={data.duration_count} />
							<InputError messages={validErrors.duration_count} />
						</div>
						<div className="lg:col-span-2">
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('plans.description')}</span>
							</label>
							<textarea name="description" className="textarea textarea-bordered w-full min-h-32" defaultValue={data.description}></textarea>
							<InputError messages={validErrors.description} />
						</div>
						
						<div className="lg:col-span-2 mt-4">
							<h3 className="text-lg font-semibold mb-4">{t('plans.pricing')}</h3>
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('plans.startupFee')}</span>
							</label>
							<input name="startup_fee" data-rules="required" type="number" className="input input-bordered input-sm w-full" defaultValue={data.startup_fee} />
							<InputError messages={validErrors.startup_fee} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('plans.price')}</span>
							</label>
							<input name="price" data-rules="required" type="number" className="input input-bordered input-sm w-full" defaultValue={data.price} />
							<InputError messages={validErrors.price} />
						</div>
						<div className="lg:col-span-2">
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('plans.cancellationFee')}</span>
							</label>
							<input name="cancellation_fee" data-rules="required" type="number" className="input input-bordered input-sm w-full" defaultValue={data.cancellation_fee} />
							<InputError messages={validErrors.cancellation_fee} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('plans.initialPauseFee')}</span>
							</label>
							<input name="initial_pause_fee" data-rules="required" type="number" className="input input-bordered input-sm w-full" defaultValue={data.initial_pause_fee} />
							<InputError messages={validErrors.initial_pause_fee} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('plans.recurringPauseFee')}</span>
							</label>
							<input name="recurring_pause_fee" data-rules="required" type="number" className="input input-bordered input-sm w-full" defaultValue={data.recurring_pause_fee} />
							<InputError messages={validErrors.recurring_pause_fee} />
						</div>
						<div className="lg:col-span-2">
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('plans.taxPercentage')}</span>
							</label>
							<input name="tax_percentage" data-rules="required" type="number" className="input input-bordered input-sm w-full" defaultValue={data.tax_percentage} />
							<InputError messages={validErrors.tax_percentage} />
						</div>
						
						<div className="lg:col-span-2 mt-4">
							<h3 className="text-lg font-semibold mb-4">{t('plans.settings')}</h3>
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('plans.trial')}</span>
							</label>
							<select name="trial" data-rules="required" className="select select-sm select-bordered w-full" defaultValue={data.trial}>
								<option value={""} disabled>{t('chooseOption')}</option>
								<option value={"true"} selected={data.trial == true}>{t('yes')}</option>
								<option value={"false"} selected={data.trial == false}>{t('no')}</option>
							</select>
							<InputError messages={validErrors.trial} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('plans.active')}</span>
							</label>
							<select name="active" data-rules="required" className="select select-sm select-bordered w-full" defaultValue={data.active}>
								<option value={""} disabled>{t('chooseOption')}</option>
								<option value={"true"} selected={data.active == true}>{t('active')}</option>
								<option value={"false"} selected={data.active == false}>{t('inactive')}</option>
							</select>
							<InputError messages={validErrors.active} />
						</div>
						<div className="lg:col-span-2">
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-base-200 rounded-lg">
								<label className="label justify-start cursor-pointer">
									<input name="auto_renew_forever" type="checkbox" className="checkbox" disabled={upfront} checked={data.auto_renew_forever} onChange={(e) => setData({ ...data, auto_renew_forever: e.target.checked })} />
									<span className="mx-2 label-text">{t('plans.autoRenewForever')}</span> 
								</label>
								<label className="label justify-start cursor-pointer">
									<input name="type" type="checkbox" className="checkbox" 
										checked={upfront} 
										onChange={(e) => {
											const checked = e.target.checked
											setUpfront(checked)
											if (checked)
												setData({ ...data, auto_renew_forever: false })
										}} />
									<span className="mx-2 label-text">{t('plans.type')}</span> 
								</label>
								<label className="label justify-start cursor-pointer">
									<input name="entries" type="checkbox" className="checkbox" 
										checked={entries}
										onChange={(e) => setEntries(e.target.checked)}
									/>
									<span className="mx-2 label-text">{t('plans.entries')}</span> 
								</label>
                                <label className="label justify-start cursor-pointer">
									<input name="available_online" type="checkbox" className="checkbox" checked={data.available_online} onChange={(e) => setData({ ...data, available_online: e.target.checked })} />
									<span className="mx-2 label-text">{t('plans.availableOnline')}</span> 
								</label>
							</div>
						</div>
						{entries && <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div>
								<label className="label justify-start">
									<span className="label-text font-semibold required">{t('plans.entriesCount')}</span>
								</label>
								<input name="entries_count" data-rules="required" type="number" className="input input-bordered input-sm w-full" defaultValue={data.entries_count} />
								<InputError messages={validErrors.entries_count} />
							</div>
							<div>
								<label className="label justify-start">
									<span className="label-text font-semibold required">{t('plans.reentryTime')}</span>
								</label>
								<input name="reentry_time" data-rules="required" type="number" className="input input-bordered input-sm w-full" defaultValue={data.reentry_time} />
								<InputError messages={validErrors.reentry_time} />
							</div>
						</div>}
						<div data-name="terms" className="lg:col-span-2">
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('plans.terms')}</span>
							</label>
							<textarea value={terms} onChange={(ev) => setTerms(ev.target.value)} className="textarea textarea-bordered w-full min-h-48" />
							<InputError messages={validErrors.terms} />
						</div>
					</div>
					
					<div className="card-actions justify-end mt-6">
						<button type="button" onClick={() => router.back()} className="btn btn-ghost me-2">{t('cancel')}</button>
						<button className="btn btn-primary" type="submit" disabled={isSubmitting}>
							{isSubmitting && <span className="loading loading-spinner"></span>}
							{t('plans.editFormBtn')}
						</button>
					</div>
				</form>
			</div>
		</div>
	</>
}