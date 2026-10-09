"use client"

import { useEffect, useState } from "react"
import { useBreadcrumbLabel } from "@/hooks/useBreadcrumbLabel"
import { getPermission } from "@/app/(admin)/admin/permissions/_permission"
import { useTranslation } from "next-i18next"
import Header from "@/app/(app)/_components/header"

export default function PermissionView({ params }: any) {
    const { t } = useTranslation('common')
	const { permission_id }: any = params
	const [data, setData] = useState<any>([])
	useBreadcrumbLabel(data)

	useEffect(() => {
		getPermission(permission_id).then((returnData: any) => {
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
					{t('permissions.details')}
				</h2>
				<div className="space-y-4">
					<div className="flex justify-between items-center py-2 border-b border-base-200">
						<span className="font-semibold text-base-content/70">{t('permissions.name')}</span>
						<span className="text-base-content text-end">{data.name}</span>
					</div>
					<div className="flex justify-between items-center py-2 border-b border-base-200">
						<span className="font-semibold text-base-content/70">{t('permissions.guardName')}</span>
						<span className="text-base-content text-end">{data.guard_name}</span>
					</div>
				</div>
			</div>
		</div>
	</>
}