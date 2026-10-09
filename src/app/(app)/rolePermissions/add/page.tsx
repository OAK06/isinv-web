"use client"

import { useRouter } from "next/navigation"
import { FormEvent, useEffect, useState } from "react"

import { assignPermissionsToRole, getCompanies, getCompanyBranches, getBranchRoles, getPermissions } from "@/app/(app)/rolePermissions/_rolePermissions"
import { useAtom } from "jotai"
import { branch, company, responseMessage, store, validationErrors } from "@/_state/globalStore"
import InputError from "@/_components/inputError"
import { useTranslation } from "next-i18next"
import { useAuth } from "@/hooks/auth"
import Header from "@/app/(app)/_components/header"
import { scrollToFirstInvalidElement, validateForm } from "@/app/_helpers/validation"

export default function RolePermissionAdd() {
    const { t } = useTranslation('common')
	const router = useRouter()
	const [ branchID ] = useAtom(branch)
	const [ companyID ] = useAtom(company)
	const [companies, setCompanies] = useState<any>([])
	const [selectedCompany, setselectedCompany] = useState<number | "">("")
	const [branches, setBranches] = useState<any>([])
	const [selectedBranch, setselectedBranch] = useState<number | "">("")
	const [roles, setRoles] = useState<any>([])
	const [permissions, setPermissions] = useState<any>([])
	const [selectedPermissions, setSelectedPermissions] = useState<number[]>([])
	const [isSubmitting , setIsSubmitting] = useState(false)
	const [validErrors] = useAtom(validationErrors)
    const { mutate } = useAuth({ middleware: "auth" })

	const selectAll = (e: any) => {
		if (e.target.checked) {
			setSelectedPermissions(permissions.map((p: any) => p.id))
		} else {
			setSelectedPermissions([])
		}
	}

	useEffect(() => {
		getCompanies().then((returnData: any) => {
			setCompanies(returnData.response)
		})
	}, [])

	// Default the company/branch pickers to the current branch the user is working in.
	useEffect(() => {
		if (companyID === -1 || selectedCompany !== "") return
		setselectedCompany(companyID)

		getCompanyBranches(companyID).then((returnData: any) => {
			setBranches(returnData.response)
			if (branchID === -1) return
			setselectedBranch(branchID)

			getBranchRoles(branchID).then((returnData: any) => {
				setRoles(returnData.response)
			})
			getPermissions(branchID).then((returnData: any) => {
				setPermissions(returnData.response)
			})
		})
	}, [companyID])

	const handleCompanyChange = (e: any) => {
		setRoles([])
		setPermissions([])
		setselectedBranch("")
		setselectedCompany(e.target.value)

		getCompanyBranches(e.target.value).then( (returnData: any) => {
			setBranches(returnData.response)
		})
	}

	const handleBranchChange = (e: any) => {
		setSelectedPermissions([])
		setselectedBranch(e.target.value)
		
		getBranchRoles(e.target.value).then((returnData: any) => {
			setRoles(returnData.response)
		})

		getPermissions(e.target.value).then((returnData: any) => {
			setPermissions(returnData.response)
		})
	}

	const handleRoleChange = (e: any) => {
		const role = roles.find((role: any) => role.id == e.target.value)
		setSelectedPermissions(role?.permissions?.map((p: any) => p.id) || [])
	}

	const handleCheckboxChange = (permissionID: number) => {
		setSelectedPermissions((prev) =>
			prev.includes(permissionID)
			? prev.filter((id) => id !== permissionID)
			: [...prev, permissionID]
		)
	}

	const formSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const form = event.currentTarget
        const {errors, firstInvalidElement} = validateForm(form, t, {
            permissions: { value: selectedPermissions.join(','), rules: ['required'] }
        })
        if (Object.keys(errors).length > 0) {
            store.set(validationErrors, errors)
            if (firstInvalidElement) scrollToFirstInvalidElement(firstInvalidElement)
            return
        }

		const formData = new FormData(form)
		setIsSubmitting(true)
		await assignPermissionsToRole(formData).then(() => {
			router.push(`/rolePermissions/`)
			store.set(responseMessage, { type: 'success', text: t('rolePermission.createdMessage') });
            mutate()
		})
		.catch(() => setIsSubmitting(false))
	}

	return <>
		<Header
			title={t('rolePermission.addTitle')}
			containerClass={"flex justify-between"}
		/>
		<div className="mt-6 card bg-base-100 border border-base-200 shadow-sm">
			<div className="card-body">	
				<form onSubmit={formSubmit}>
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('rolePermission.company')}</span>
							</label>
							<select name="company_id" data-rules="required" className="select select-sm select-bordered w-full" value={selectedCompany} onChange={handleCompanyChange}>
								<option value={""} disabled>{t('chooseOption')}</option>
								{companies?.map((company: any) => (	
									<option key={company.id} value={company.id}>{company.name}</option>
								))}
							</select>
							<InputError messages={validErrors.company_id} />
						</div>

						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('rolePermission.branch')}</span>
							</label>
							<select name="branch_id" data-rules="required" className="select select-sm select-bordered w-full" value={selectedBranch ?? ""} onChange={handleBranchChange}>
								<option value={""} disabled>{t('chooseOption')}</option>
								{branches?.map((branch: any) => (
									<option key={branch.id} value={branch.id}>{branch.name}</option>
								))}
							</select>
							<InputError messages={validErrors.branch_id} />
						</div>

						<div className="lg:col-span-2">
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('rolePermission.role')}</span>
							</label>
							<select name="role_id" data-rules="required" className="select select-sm select-bordered w-full" defaultValue={""} onChange={handleRoleChange}>
								<option value={""} disabled>{t('chooseOption')}</option>
								{roles?.map((role: any) => (
									<option key={role.id} value={role.id}>{role.name}</option>
								))}
							</select>
							<InputError messages={validErrors.role_id} />
						</div>
					</div>
					
					{permissions.length !== 0 && (
						<>
							<div className="divider my-6"></div>
							<div className="space-y-4">
								<div>
									<h3 data-name="permissions" className="text-lg font-semibold text-primary mb-2 required">{t('rolePermission.permissions')}</h3>
									<InputError messages={validErrors.permissions} />
								</div>
								<label className="label justify-start cursor-pointer w-max bg-base-200 rounded-lg px-4 py-2">
									<input id="selectAll" type="checkbox" className="checkbox permissions" onChange={(e) => selectAll(e)}/>
									<span className="mx-2 label-text font-semibold">{t('rolePermission.selectAll')}</span>
								</label>
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
									{permissions?.map((permission: any) => (
										<label key={permission.id} className="flex items-center gap-3 p-3 bg-base-200 rounded-lg cursor-pointer hover:bg-base-300 transition-colors">
											<input 
												name="permissions[]"
												type="checkbox"
												className="checkbox"
												checked={selectedPermissions.includes(permission.id)}
												onChange={() => handleCheckboxChange(permission.id)}
												value={permission.name} 
											/>
											<span className="label-text">{permission.name}</span>
										</label>
									))}
								</div>
							</div>
						</>
					)}
					
					<div className="card-actions justify-end mt-6">
						<button className="btn btn-primary" type="submit" disabled={isSubmitting}>
							{isSubmitting && <span className="loading loading-spinner"></span>}
							{t('rolePermission.addFormBtn')}
						</button>
					</div>
				</form>
			</div>
		</div>
	</>
}