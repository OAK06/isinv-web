"use client"

import { useTranslation } from "next-i18next"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCircleQuestion, faHeadset } from "@fortawesome/free-solid-svg-icons"

/**
 * Member portal Help / FAQ — moved off the dashboard into its own tab so the
 * questions have room to breathe. Header + collapse-plus accordions (reusing the
 * shared `memberPortal.faq.*` copy) + a front-desk contact affordance so the page
 * reads as a destination, not a stray accordion.
 */
export default function MemberHelp() {
	const { t } = useTranslation('common')

	return (
		<div className="space-y-6 max-w-3xl">
			{/* Header */}
			<div className="flex items-start gap-3">
				<span className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
					<FontAwesomeIcon icon={faCircleQuestion} className="w-5 h-5" />
				</span>
				<div>
					<h1 className="text-2xl font-bold">{t('memberPortal.faq.title')}</h1>
					<p className="text-base-content/60 mt-0.5">{t('memberPortal.help.subtitle')}</p>
				</div>
			</div>

			{/* Questions */}
			<div className="space-y-2">
				{[1, 2, 3, 4, 5].map((n) => (
					<div key={n} tabIndex={0} className="collapse collapse-plus bg-base-100 border border-base-200 rounded-xl">
						<div className="collapse-title font-semibold">{t(`memberPortal.faq.q${n}.question`)}</div>
						<div className="collapse-content text-base-content/70 text-sm">{t(`memberPortal.faq.q${n}.answer`)}</div>
					</div>
				))}
			</div>

			{/* Still need help → the gym's front desk (member data is controlled by the gym). */}
			<div className="card bg-base-100 border border-base-200">
				<div className="card-body flex-row items-center gap-4 py-4">
					<span className="w-11 h-11 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
						<FontAwesomeIcon icon={faHeadset} className="w-5 h-5" />
					</span>
					<div>
						<p className="font-semibold">{t('memberPortal.help.contactTitle')}</p>
						<p className="text-sm text-base-content/60">{t('memberPortal.help.contactBody')}</p>
					</div>
				</div>
			</div>
		</div>
	)
}
