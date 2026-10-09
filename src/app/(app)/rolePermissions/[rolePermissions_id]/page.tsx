"use client"

import { useEffect, useState } from "react"
import { useBreadcrumbLabel } from "@/hooks/useBreadcrumbLabel"

import { getRoleWithPermissions } from "@/app/(app)/rolePermissions/_rolePermissions"
import { useTranslation } from "next-i18next"
import Header from "@/app/(app)/_components/header"

export default function ViewPermissionsAssignedRole({ params }: any) {
    const { t } = useTranslation('common')
	const { rolePermissions_id }: any = params
	const [data, setData] = useState<any>([])
	useBreadcrumbLabel(data)

	useEffect(() => {
		getRoleWithPermissions(rolePermissions_id).then((returnData: any) => {
            setData(returnData.response)
        })
	}, [])

	return <>
		<Header
			title={data.name}
			containerClass={"flex justify-between"}
		/>
		<div className="mt-6 card bg-base-100 border border-base-200 shadow-sm">
			<div className="card-body">
				<h2 className="card-title text-xl mb-4">
					<div className="w-1 h-6 bg-primary rounded me-2"></div>
					{t('rolePermission.permissions')}
				</h2>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
					{data.permissions?.map((permission: any) => (
						<label key={permission.id} className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
							<input type="checkbox" className="checkbox" checked readOnly />
							<span className="label-text">{permission.name}</span>
						</label>
					))}
				</div>
			</div>
		</div>
	</>
}