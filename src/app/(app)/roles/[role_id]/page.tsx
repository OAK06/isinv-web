"use client"

import { usePathname } from "next/navigation"
import { useBreadcrumbLabel } from "@/hooks/useBreadcrumbLabel"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUserShield } from "@fortawesome/free-solid-svg-icons"
import { useEffect, useState } from "react"

import { getRole } from "@/app/(app)/roles/_role"
import { Role } from "@/app/(app)/roles/_role"
import { useTranslation } from "next-i18next"
import Header from "@/app/(app)/_components/header"

export default function RoleView({ params }: any) {
    const { t } = useTranslation('common')
    const pathname = usePathname()
	const { role_id }: any = params
	const [data, setData] = useState<Role>({} as Role)
	useBreadcrumbLabel(data)

	useEffect(() => {
		getRole(role_id).then((returnData: any) => {
			setData(returnData.response)
		})
	}, [])

	return <>
		<Header editHref={`${pathname}/edit`} editLabel={t('edit')}
			title={<div className="flex items-center gap-4"><div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"><FontAwesomeIcon icon={faUserShield} className="text-2xl" /></div><h1 className="text-2xl font-bold leading-tight truncate">{data.name}</h1></div>}
			containerClass="flex flex-wrap items-center justify-between gap-4"
		/>
		<div className="mt-6 space-y-6">
			<div className="card bg-base-100 border border-base-200 shadow-sm">
				<div className="card-body">
					<h2 className="card-title text-lg mb-4 gap-3">
						<span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><FontAwesomeIcon icon={faUserShield} /></span>
						{t('roles.details')}
					</h2>
					<div className="space-y-4">
						<div className="flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('roles.roleName')}</span>
							<span className="text-base-content text-end">{data.name}</span>
						</div>
						<div className="flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('roles.guardName')}</span>
							<span className="text-base-content text-end">{data.guard_name}</span>
						</div>
						<div className="flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('roles.company')}</span>
							<span className="text-base-content text-end">{data.company?.name}</span>
						</div>
						<div className="flex justify-between items-center py-2">
							<span className="font-semibold text-base-content/70">{t('roles.branch')}</span>
							<span className="text-base-content text-end">{data.branch?.name}</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</>
}