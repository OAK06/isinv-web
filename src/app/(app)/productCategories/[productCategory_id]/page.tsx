"use client"

import { usePathname } from "next/navigation"
import { useBreadcrumbLabel } from "@/hooks/useBreadcrumbLabel"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTags } from "@fortawesome/free-solid-svg-icons"
import { useEffect, useState } from "react"

import { getCategory, ProductCategory } from "@/app/(app)/productCategories/_productCategory"
import { useTranslation } from "next-i18next"
import Header from "@/app/(app)/_components/header"

export default function CategoryView({ params }: any) {
    const { t } = useTranslation('common')
    const pathname = usePathname()
	const { productCategory_id }: any = params
	const [data, setData] = useState<ProductCategory>({} as ProductCategory)
	useBreadcrumbLabel(data)

	useEffect(() => {
		getCategory(productCategory_id).then((returnData: any) => {
			setData(returnData.response)
		})
	}, [])

	return <>
		<Header editHref={`${pathname}/edit`} editLabel={t('edit')}
			title={<div className="flex items-center gap-4"><div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"><FontAwesomeIcon icon={faTags} className="text-2xl" /></div><div className="min-w-0"><h1 className="text-2xl font-bold leading-tight truncate">{data.name}</h1><div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-base-content/60"><div className={`badge badge-sm ${data.active ? 'badge-success' : 'badge-error'}`}>{data.active ? t('active') : t('inactive')}</div></div></div></div>}
			containerClass="flex flex-wrap items-center justify-between gap-4"
		/>
		<div className="mt-6 space-y-6">
			<div className="card bg-base-100 border border-base-200 shadow-sm">
				<div className="card-body">
					<h2 className="card-title text-lg mb-4 gap-3">
						<span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><FontAwesomeIcon icon={faTags} /></span>
						{t('categories.details')}
					</h2>
					<div className="space-y-4">
						<div className="flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('categories.companyName')}</span>
							<span className="text-base-content text-end">{data.company?.name}</span>
						</div>
						<div className="flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('categories.branchName')}</span>
							<span className="text-base-content text-end">{data.branch?.name}</span>
						</div>
						{data.description && <div className="flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('categories.description')}</span>
							<span className="text-base-content text-end">{data.description}</span>
						</div>}
						<div className="flex justify-between items-center py-2 border-b border-base-200">
							<span className="font-semibold text-base-content/70">{t('categories.createdBy')}</span>
							<span className="text-base-content text-end">{data.created_by?.name}</span>
						</div>
						<div className="flex justify-between items-center py-2">
							<span className="font-semibold text-base-content/70">{t('categories.updatedBy')}</span>
							<span className="text-base-content text-end">{data.updated_by?.name}</span>
						</div>
					</div>
				</div>
			</div>

            <div className="card bg-base-100 border border-base-200 shadow-sm">
				<div className="card-body">
					<h2 className="card-title text-lg mb-4 gap-3">
						<span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><FontAwesomeIcon icon={faTags} /></span>
						{t('categories.posRegisters')}
					</h2>
					
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {data.pos_registers?.map((register: any) => (
                            <label key={register.id} className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                                <input type="checkbox" className="checkbox" checked readOnly />
                                <span className="label-text">{register.name}</span>
                            </label>
                        ))}
                    </div>
				</div>
			</div>
		</div>
	</>
}