"use client"

import { useRouter } from "next/navigation"
import { useBreadcrumbLabel } from "@/hooks/useBreadcrumbLabel"
import { fileUrl } from "@/_utils/fileUrl"
import { FormEvent, useEffect, useState } from "react"

import { getClass, editClass, getCompanyBranches, getBranchPlans, getBranchStaff } from "@/app/(app)/classes/_class"

import { useAtom } from "jotai"
import { branch, company, responseMessage, store, validationErrors } from "@/_state/globalStore"
import InputError from "@/_components/inputError"
import { useTranslation } from "next-i18next"
import { useAuth } from "@/hooks/auth"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons"
import Header from "@/app/(app)/_components/header"
import { scrollToFirstInvalidElement, validateForm } from "@/app/_helpers/validation"

export default function ClassEdit({ params }: any) {
    const { t } = useTranslation('common')
	const router = useRouter()
	const { class_id }: any = params
	const [data, setData] = useState<any>([])
	useBreadcrumbLabel(data)
	const [branches, setBranches] = useState<any>([])
	const [staff, setStaff] = useState<any>([])
	const [plans, setPlans] = useState<any>([])
	const [selectedBranch, setSelectedBranch] = useState<number | null | undefined>(undefined)
    const [isPlansLoading, setIsPlansLoading] = useState(false)
    const [isStaffLoading, setIsStaffLoading] = useState(false)
	const [ branchID ] = useAtom(branch)
	const [ companyID ] = useAtom(company)
	const [isSubmitting , setIsSubmitting] = useState(false)
	const [validErrors] = useAtom(validationErrors)
    const [logoPreview, setLogoPreview] = useState<string | null>(null)
    const { user } = useAuth()
    const canAccessCompanyLevel = user.permissions.includes('update company classes')

	useEffect(() => {
        if (companyID === -1) return

		getClass(class_id).then((returnData: any) => { 
            const classData = returnData.response
			setData(classData)
            setSelectedBranch(classData.branch_id)
            
            if (classData.file)
                setLogoPreview(fileUrl(classData.file?.url))
		})
		getCompanyBranches(companyID).then((returnData: any) => {
			setBranches(returnData.response)			
		})	
	}, [companyID])

	useEffect(() => {
        if (selectedBranch === undefined || branchID === -1) return
        const plansScope = selectedBranch ? 'all' : 'global'
        const branchId = selectedBranch ?? branchID 

        setIsPlansLoading(true)
        getBranchPlans(branchId, plansScope).then((returnData) => {
            setPlans(returnData.response)
        })
        .catch(() => {})
        .finally(() => setIsPlansLoading(false))

        if (selectedBranch === null) {
            setStaff([])
            return
        } 
        setIsStaffLoading(true)
        getBranchStaff(selectedBranch).then((returnData) => {
            setStaff(returnData.response)
        })
        .catch(() => {})
        .finally(() => setIsStaffLoading(false))
	}, [branchID, selectedBranch])

	const formSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const form = event.currentTarget
        const {errors, firstInvalidElement} = validateForm(form, t)
        if (Object.keys(errors).length > 0) {
            store.set(validationErrors, errors)
            if (firstInvalidElement) scrollToFirstInvalidElement(firstInvalidElement)
            return
        }

        const formData = new FormData(form)
		formData.set('login_branch_id', `${branchID}`)
		formData.set('company_id', `${companyID}`)
		setIsSubmitting(true)

		await editClass(class_id, formData).then((response) => {
			router.push(`/classes/${response.response.id}`)
			store.set(responseMessage, { type: 'success', text: `${t('classes.updatedMessage')}` });
		})
		.catch(() => setIsSubmitting(false))
	}

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = () => setLogoPreview(reader.result as string)
            reader.readAsDataURL(file)
        }
    }

	return <>
		<Header
			title={t('classes.editTitle')}
			containerClass={"flex justify-between"}
		/>
		<div className="mt-6 card bg-base-100 border border-base-200 shadow-sm">
			<div className="card-body">	
				<form onSubmit={formSubmit}>
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
						{/* Logo Upload Section */}
						<div className="lg:col-span-2 flex items-center gap-4 p-4 bg-base-200 rounded-lg">
							<div className="w-28 h-28 bg-base-200 border-2 rounded-full flex items-center justify-center overflow-hidden">
								{logoPreview ? (
									<img src={logoPreview} alt="" className="w-full h-full object-cover" />
								) : data.file?.url ? (
									<img src={fileUrl(data.file?.url)} alt="Class Logo" className="w-full h-full object-cover" />
								) : (
									<span className="text-base-content/60 text-sm">{t('imagePreview')}</span>
								)}
							</div>
							<div>
								<label className="cursor-pointer">
									<span className="btn btn-sm btn-outline btn-primary">
										{t('branches.uploadLogo')}
									</span>
									<input name="photo_id" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
								</label>
								<InputError messages={validErrors.logo} />
							</div>
						</div>

						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('classes.name')}</span>
							</label>
							<input name="name" data-rules="required" type="text" className="input input-bordered input-sm w-full" defaultValue={data.name} />
							<InputError messages={validErrors.name} />
						</div>
						<div>
							<label className={`label justify-start flex items-center ${canAccessCompanyLevel ? "" : "required"}`}>
								<span className="label-text font-semibold">{t('classes.branch')}</span>
								{canAccessCompanyLevel && (
									<div className="tooltip tooltip-top ms-2" data-tip={t('classes.branchSelectNote')}>
										<FontAwesomeIcon icon={faInfoCircle} className="text-base-content/50" />
									</div>
								)}
							</label>
							<select name="branch_id" data-rules={canAccessCompanyLevel ? "" : "required"} className="select select-sm select-bordered w-full" value={selectedBranch ?? ""} onChange={(ev) => setSelectedBranch(ev.target.value ? Number(ev.target.value) : null)}>
								<option value={""} disabled={canAccessCompanyLevel ? false : true}>{t('chooseOption')}</option>
								{branches?.map((branch: any) => (
									<option key={branch.id} value={branch.id}>{branch.name}</option>
								))}
							</select>
							<InputError messages={validErrors.branch_id} />
						</div>
						<div className="lg:col-span-2">
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('classes.description')}</span>
							</label>
							<textarea name="description" className="textarea textarea-bordered w-full min-h-32" defaultValue={data.description}></textarea>
							<InputError messages={validErrors.description} />
						</div>
                        {selectedBranch && <>
                            <div>
                                <label className="label justify-start">
                                    <span className="label-text font-semibold">{t('classes.classManager')}</span>
                                    {isStaffLoading && (
                                        <span className="loading loading-spinner loading-sm ms-3"></span>
                                    )}
                                </label>
                                <select name="class_manager" className="select select-sm select-bordered w-full" disabled={isStaffLoading} defaultValue={data.class_manager}>
                                    <option value={""}>{t('chooseOption')}</option>	
                                    {staff?.map((staf: any) => (
                                        <option key={staf.id} value={staf.id} selected={data.class_manager == staf.id}>{staf.fullname}</option>
                                    ))}						
                                </select>
                                <InputError messages={validErrors.class_manager} />
                            </div>
                            <div>
                                <label className="label justify-start">
                                    <span className="label-text font-semibold">{t('classes.classTrainer')}</span>
                                    {isStaffLoading && (
                                        <span className="loading loading-spinner loading-sm ms-3"></span>
                                    )}
                                </label>
                                <select name="class_trainer" className="select select-sm select-bordered w-full" disabled={isStaffLoading} defaultValue={data.class_trainer}>
                                    <option value={""}>{t('chooseOption')}</option>		
                                    {staff?.map((staf: any) => (
                                        <option key={staf.id} value={staf.id} selected={data.class_trainer == staf.id}>{staf.fullname}</option>
                                    ))}					
                                </select>
                                <InputError messages={validErrors.class_trainer} />
                            </div>
                        </>}
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('classes.price')}</span>
							</label>
							<input name="price" data-rules="required" type="number" className="input input-bordered input-sm w-full" defaultValue={data.price} />
							<InputError messages={validErrors.price} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('classes.taxPercentage')}</span>
							</label>
							<input name="tax_percentage" data-rules="required" type="number" className="input input-bordered input-sm w-full" defaultValue={data.tax_percentage} />
							<InputError messages={validErrors.tax_percentage} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('classes.waitList')}</span>
							</label>
							<input name="wait_list" type="number" className="input input-bordered input-sm w-full" defaultValue={data.wait_list} />
							<InputError messages={validErrors.wait_list} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('classes.waitListTime')}</span>
							</label>
							<input name="wait_list_time" type="number" className="input input-bordered input-sm w-full" defaultValue={data.wait_list_time} />
							<InputError messages={validErrors.wait_list_time} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('classes.slots')}</span>
							</label>
							<input name="slots" type="number" className="input input-bordered input-sm w-full" defaultValue={data.slots} />
							<InputError messages={validErrors.slots} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('classes.status')}</span>
							</label>
							<select name="active" data-rules="required" className="select select-sm select-bordered w-full" defaultValue={data.active}>
								<option value={""} disabled>{t('chooseOption')}</option>
								<option value={"true"} selected={data.active == true}>{t('classes.active')}</option>
								<option value={"false"} selected={data.active == false}>{t('classes.inactive')}</option>
							</select>
							<InputError messages={validErrors.active} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('classes.color')}</span>
							</label>
							<input name="color" type="color" className="w-full h-12 rounded border-0 cursor-pointer" defaultValue={data.color} />
							<InputError messages={validErrors.color} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('classes.plan')}</span>
                                {isPlansLoading && (
                                    <span className="loading loading-spinner loading-sm ms-3"></span>
                                )}
							</label>
							<select name="plan_id" className="select select-sm select-bordered w-full" disabled={isPlansLoading} defaultValue={data.plan?.id}>
								<option value={""}>{t('chooseOption')}</option>
								{plans?.map((plan: any) => (
									<option key={plan.id} value={plan.id} selected={data.plan?.id == plan.id}>{plan.name}</option>
								))}						
							</select>
							<InputError messages={validErrors.plan_id} />
						</div>
					</div>
					
					<div className="card-actions justify-end mt-6">
						<button type="button" onClick={() => router.back()} className="btn btn-ghost me-2">{t('cancel')}</button>
						<button className="btn btn-primary" type="submit" disabled={isSubmitting}>
							{isSubmitting && <span className="loading loading-spinner"></span>}
							{t('classes.editFormBtn')}
						</button>
					</div>
				</form>
			</div>
		</div>
	</>
}