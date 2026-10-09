"use client"

import { useEffect, useState } from "react"
import { useBreadcrumbLabel } from "@/hooks/useBreadcrumbLabel"

import { getActivity } from "@/app/(admin)/admin/activityLogs/_activityLog"
import { useTranslation } from "next-i18next"
import Header from "@/app/(app)/_components/header"

export default function ActivityLogView({ params }: any) {
    const { t } = useTranslation('common')
	const { activityLog_id }: any = params
	const [data, setData] = useState<any>([])
	useBreadcrumbLabel(data)

	useEffect(() => {
		getActivity(activityLog_id).then((returnData: any) => {
			setData(returnData.response)
		})
	}, [])

	return <>
		<Header
			title={t('logs.activityLog')}
			containerClass={"flex justify-between"}
		/>
		<div className="mt-6 space-y-6">
			<div className="card bg-base-100 border border-base-200 shadow-sm">
				<div className="card-body">
					<h2 className="card-title text-xl mb-4">
						<div className="w-1 h-6 bg-primary rounded me-2"></div>
						{t('logs.details')}
					</h2>
					<div className="space-y-4">
						<div className="flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('logs.operationType')}</span>
							<span className="text-base-content text-end">{t(`logs.${data.operation_type}`)}</span>
						</div>
						<div className="flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('logs.objectType')}</span>
							<span className="text-base-content text-end">{data.object_type}</span>
						</div>
						<div className="flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('logs.companyName')}</span>
							<span className="text-base-content text-end">{data.company?.name}</span>
						</div>
						<div className="flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('logs.branchName')}</span>
							<span className="text-base-content text-end">{data.branch?.name || '-'}</span>
						</div>
						<div className="flex justify-between items-center py-2">
							<span className="font-semibold text-base-content/70">{t('logs.createdAt')}</span>
							<span className="text-base-content text-end">{new Date(data.created_at).toLocaleString()}</span>
						</div>
					</div>
				</div>
			</div>
			{data.object_changes && data.object_changes.old_values && (
				<div className="card bg-base-100 border border-base-200 shadow-sm">
					<div className="card-body">
						<h2 className="card-title text-xl mb-4">
							<div className="w-1 h-6 bg-primary rounded me-2"></div>
							{t('logs.changes')}
						</h2>
						<div className="space-y-4">
							{Object.keys(data.object_changes.old_values).map((type: any) => (
								<div key={type} className="flex justify-between items-center py-2 border-b border-base-200">
									<span className="font-semibold text-base-content/70 capitalize">{type}</span>
									<span className="text-base-content text-end">
										<span className="line-through text-error me-2">{data.object_changes.old_values[type]}</span>
										→ 
										<span className="text-success ms-2">{data.object_changes.new_values[type]}</span>
									</span>
								</div>
							))}
						</div>
					</div>
				</div>
			)}
		</div>
	</>
}