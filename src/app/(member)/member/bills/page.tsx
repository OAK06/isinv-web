"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAtom } from "jotai"
import { useTranslation } from "next-i18next"
import Header from "@/app/(app)/_components/header"
import Loading from "@/app/(app)/_components/loading"
import { activeMembership } from "@/_state/globalStore"
import { getInvoices } from "@/app/(member)/member/bills/_bill"

// InvoiceOperationType.Pos = 1 ; InvoiceState.Pending = 1 (backend enums).
const OP_POS = 1
const STATE_PENDING = 1

const TABS = [
	{ key: 'all', op: null as number | null, state: null as number | null },
	{ key: 'purchases', op: OP_POS, state: null as number | null },
	{ key: 'outstanding', op: null as number | null, state: STATE_PENDING },
]

export default function MemberBills() {
	const { t } = useTranslation('common')
	const [branchID] = useAtom(activeMembership)
	const [tab, setTab] = useState('all')
	const [page, setPage] = useState(1)
	const [data, setData] = useState<any>(null)

	const load = (tabKey: string, p: number) => {
		if (branchID === -1) return
		const cfg = TABS.find(x => x.key === tabKey)
		setData(null)
		getInvoices(branchID, p, cfg.op, cfg.state).then(setData).catch(() => setData({ data: [] }))
	}

	useEffect(() => {
		setPage(1)
		load(tab, 1)
	}, [branchID, tab])

	if (branchID === -1) return <div className="text-center py-16 text-base-content/60">
		{t('memberPortal.selectGymFirst')} <Link href="/member" className="link link-primary">{t('memberPortal.nav.overview')}</Link>
	</div>

	const rows = data?.data ?? []
	const lastPage = data?.last_page ?? 1

	return <>
		<Header title={t('memberPortal.nav.bills')} />

		<div role="tablist" className="tabs tabs-bordered mb-4">
			{TABS.map(x => (
				<button
					key={x.key}
					role="tab"
					className={`tab ${tab === x.key ? 'tab-active' : ''}`}
					onClick={() => setTab(x.key)}
				>
					{t(`memberPortal.bills.tabs.${x.key}`)}
				</button>
			))}
		</div>

		{data === null
			? <Loading />
			: rows.length === 0
				? <div className="text-center py-12 text-base-content/60">{t('memberPortal.bills.noBills')}</div>
				: <div className="overflow-x-auto">
					<table className="table">
						<thead>
							<tr>
								<th>{t('memberPortal.bills.table.reference')}</th>
								<th>{t('memberPortal.bills.table.type')}</th>
								<th>{t('memberPortal.bills.table.status')}</th>
								<th>{t('memberPortal.bills.table.total')}</th>
								<th>{t('memberPortal.bills.table.date')}</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{rows.map((inv: any) => (
								<tr key={inv.id}>
									<td className="font-mono text-sm">{inv.reference}</td>
									<td>{t(`memberPortal.bills.opType.${inv.operation_type}`, { defaultValue: inv.operation_type })}</td>
									<td>
										<span className={`badge badge-sm ${inv.state === 'pending' ? 'badge-warning' : inv.state === 'succeeded' ? 'badge-success' : inv.state === 'refunded' ? 'badge-ghost' : 'badge-ghost'}`}>
											{t(`memberPortal.bills.state.${inv.state}`, { defaultValue: inv.state })}
										</span>
									</td>
									<td className="font-semibold">${inv.total_price}</td>
									<td className="text-sm">{inv.bill_at ? new Date(inv.bill_at).toLocaleDateString() : '-'}</td>
									<td className="text-end">
										<Link href={`/member/bills/${inv.id}`} className="btn btn-xs btn-ghost">{t('memberPortal.bills.view')}</Link>
									</td>
								</tr>
							))}
						</tbody>
					</table>

					{lastPage > 1 && <div className="flex justify-center gap-2 mt-4">
						<button className="btn btn-sm" disabled={page <= 1} onClick={() => { const p = page - 1; setPage(p); load(tab, p) }}>«</button>
						<span className="btn btn-sm btn-ghost no-animation">{page} / {lastPage}</span>
						<button className="btn btn-sm" disabled={page >= lastPage} onClick={() => { const p = page + 1; setPage(p); load(tab, p) }}>»</button>
					</div>}
				</div>
		}
	</>
}
