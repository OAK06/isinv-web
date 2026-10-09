"use client"

import { useAtom } from "jotai"
import { branchHashedId } from "@/_state/globalStore"
import { useTranslation } from "next-i18next"
import Header from "@/app/(app)/_components/header"

export default function BranchUrls() {
    const { t } = useTranslation('common')
    const [branchHasedID] = useAtom(branchHashedId)

	return <>
		<Header
			title={t('urls.publicUrls')}
			containerClass={"flex justify-between"}
		/>
		<div className="mt-6 space-y-6">
			<div className="card bg-base-100 border border-base-200 shadow-sm">
				<div className="card-body">
					<h2 className="card-title text-xl mb-4">
						<div className="w-1 h-6 bg-primary rounded me-2"></div>
						{t('urls.branchUrls')}
					</h2>
					<div className="space-y-4">
						<div className="flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('urls.plansUrl')}</span>
							<span className="text-base-content font-mono text-sm">{`${process.env.NEXT_PUBLIC_BASE_URL}/signup/${branchHasedID}/plans`}</span>
						</div>
						<div className="flex justify-between items-center py-2">
							<span className="font-semibold text-base-content/70">{t('urls.SessionsUrl')}</span>
							<span className="text-base-content font-mono text-sm">{`${process.env.NEXT_PUBLIC_BASE_URL}/signup/${branchHasedID}/sessions`}</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</>
}
