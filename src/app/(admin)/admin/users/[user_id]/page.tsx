"use client"

import { useEffect, useState } from "react"
import { useBreadcrumbLabel } from "@/hooks/useBreadcrumbLabel"

import { getUser } from "@/app/(admin)/admin/users/_user"
import { useTranslation } from "next-i18next"
import Header from "@/app/(app)/_components/header"

export default function UserView({ params }: any) {
    const { t } = useTranslation('common')
	const { user_id }: any = params
	const [user, setUser] = useState<any>([])
	useBreadcrumbLabel(user)

	useEffect(() => {
		getUser(user_id).then((returnData: any) => {
			setUser(returnData.response)
		})
	}, [])

	return <>
		<Header
			title={user.name}
			containerClass={"flex justify-between"}
		/>
		<div className="mt-6 card bg-base-100 border border-base-200 shadow-sm">
			<div className="card-body">
				<h2 className="card-title text-xl mb-4">
					<div className="w-1 h-6 bg-primary rounded me-2"></div>
					{t('users.userData')}
				</h2>
				<div className="space-y-4">
					<div className="flex justify-between items-center py-2 border-b border-base-200">
						<span className="font-semibold text-base-content/70">{t('users.email')}</span>
						<span className="text-base-content">{user.email}</span>
					</div>
					<div className="py-2">
						<span className="font-semibold text-base-content/70">{t('users.table.role')}</span>
						<div className="mt-2 space-y-2">
							{user.roles?.length ? user.roles.map((role: any) => (
								<div key={role.id} className="flex flex-wrap items-center gap-2">
									<span className="badge badge-primary">{role.name}</span>
									{role.branch?.name && <span className="badge badge-ghost">{role.branch.name}</span>}
									{role.company?.name && <span className="text-base-content/60 text-sm">{role.company.name}</span>}
								</div>
							)) : <span className="text-base-content/60">—</span>}
						</div>
					</div>
				</div>
			</div>
		</div>
	</>
}
