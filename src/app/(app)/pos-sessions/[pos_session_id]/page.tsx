"use client"

import { useEffect, useState } from "react"
import { useBreadcrumbLabel } from "@/hooks/useBreadcrumbLabel"

import { getPosSession } from "@/app/(app)/pos-sessions/_posSession"
import { PosSession } from "@/app/(app)/pos-sessions/_posSession"
import { useAtom } from "jotai"
import { loading } from "@/_state/globalStore"
import Loading from "@/app/(app)/_components/loading"
import { useTranslation } from "next-i18next"
import Header from "@/app/(app)/_components/header"

export default function PosSessionView({ params }: any) {
    const { t } = useTranslation('common')
	const { pos_session_id }: any = params
	const [data, setData] = useState<PosSession>({} as PosSession)
	useBreadcrumbLabel(data)
	const [isLoading] = useAtom(loading)

	useEffect(() => {
		getPosSession(pos_session_id).then((returnData: any) => {
			setData(returnData.response)
		})
	}, [])

	if (isLoading) return <Loading />
	return <>
		<Header
			title={<div className="flex items-start gap-2">
				<div className="flex gap-2 pt-2">
					<div className={`badge badge-lg ${data.status_name === 'active' ? 'badge-success' : 'badge-error'}`}>
						{data.status_name === 'active' ? t('active') : t('inactive')}
					</div>
				</div>
			</div>}
			containerClass={"flex justify-between"}
		/>
		<div className="mt-6 space-y-6">
			<div className="card bg-base-100 border border-base-200 shadow-sm">
				<div className="card-body">
					<h2 className="card-title text-xl mb-4">
						<div className="w-1 h-6 bg-primary rounded me-2"></div>
						{t('posSessions.details')}
					</h2>
					<div className="space-y-4">
						<div className="flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('posSessions.start')}</span>
							<span className="text-base-content text-end">{data.start}</span>
						</div>
						<div className="flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('posSessions.end')}</span>
							<span className="text-base-content text-end">{data.end}</span>
						</div>
                        <div className="flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('posSessions.openCash')}</span>
							<span className="text-base-content text-end">{data.open_cash}</span>
						</div>
						<div className="flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('posSessions.closeCash')}</span>
							<span className="text-base-content text-end">{data.close_cash}</span>
						</div>
                        <div className="flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('posSessions.startedBy')}</span>
							<span className="text-base-content text-end">{data.started_by?.name}</span>
						</div>
                        <div className="flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('posSessions.endedBy')}</span>
							<span className="text-base-content text-end">{data.ended_by?.name}</span>
						</div>
                        <div className="flex justify-between items-center py-2">
							<span className="font-semibold text-base-content/70">{t('posSessions.posRegister')}</span>
							<span className="text-base-content text-end">{data.pos_register?.name}</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</>
}