"use client"

import { usePathname } from "next/navigation"
import { useBreadcrumbLabel } from "@/hooks/useBreadcrumbLabel"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCashRegister } from "@fortawesome/free-solid-svg-icons"
import { useEffect, useState } from "react"

import { getPosRegister } from "@/app/(app)/pos-registers/_posRegister"
import { PosRegister } from "@/app/(app)/pos-registers/_posRegister"
import { useAtom } from "jotai"
import { loading } from "@/_state/globalStore"
import Loading from "@/app/(app)/_components/loading"
import { useTranslation } from "next-i18next"
import Header from "@/app/(app)/_components/header"

export default function PosRegisterView({ params }: any) {
    const { t } = useTranslation('common')
    const pathname = usePathname()
	const { pos_register_id }: any = params
	const [data, setData] = useState<PosRegister>({} as PosRegister)
	useBreadcrumbLabel(data)
	const [isLoading] = useAtom(loading)

	useEffect(() => {
		getPosRegister(pos_register_id).then((returnData: any) => {
			setData(returnData.response)
		})
	}, [])

	if (isLoading) return <Loading />
	return <>
		<Header editHref={`${pathname}/edit`} editLabel={t('edit')}
			title={<div className="flex items-center gap-4"><div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"><FontAwesomeIcon icon={faCashRegister} className="text-2xl" /></div><div className="min-w-0"><h1 className="text-2xl font-bold leading-tight truncate">{data.name}</h1><div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-base-content/60"><div className={`badge badge-sm ${data.active ? 'badge-success' : 'badge-error'}`}>{data.active ? t('active') : t('inactive')}</div></div></div></div>}
			containerClass="flex flex-wrap items-center justify-between gap-4"
		/>
		<div className="mt-6 space-y-6">
			<div className="card bg-base-100 border border-base-200 shadow-sm">
				<div className="card-body">
					<h2 className="card-title text-lg mb-4 gap-3">
						<span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><FontAwesomeIcon icon={faCashRegister} /></span>
						{t('posRegisters.details')}
					</h2>
					<div className="space-y-4">
						<div className="flex justify-between items-center py-2">
							<span className="font-semibold text-base-content/70">{t('posRegisters.branch')}</span>
							<span className="text-base-content text-end">{data.branch?.name}</span>
						</div>
						<div className="flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('posRegisters.name')}</span>
							<span className="text-base-content text-end">{data.name}</span>
						</div>
                        {data.description && <div>
                            <span className="font-semibold text-base-content/70 block mb-2">{t('plans.description')}</span>
                            <p className="text-base-content/60 bg-base-200 rounded-lg p-3">{data.description}</p>
                        </div>}
					</div>
				</div>
			</div>
		</div>
	</>
}