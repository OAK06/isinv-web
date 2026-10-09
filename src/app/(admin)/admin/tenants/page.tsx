"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSetAtom } from "jotai"
import { useTranslation } from "next-i18next"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowRightToBracket, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons"

import Header from "@/app/(app)/_components/header"
import { getTenants } from "@/app/(admin)/admin/tenants/_tenant"
import { activePosSession, branch, branch_settings, company, enteredTenantName, posRegister } from "@/_state/globalStore"

/**
 * Super-Admin tenant switcher. Lists every branch (real + demo); "Enter" sets
 * the branch/company context and drops the Super Admin into the normal tenant
 * shell (/dashboard) with full powers (Gate::before authorizes any branch on the
 * API side). A persistent banner in the tenant shell offers "Exit to admin".
 */
export default function TenantsList() {
    const { t } = useTranslation('common')
    const router = useRouter()

    const setBranchID = useSetAtom(branch)
    const setCompanyID = useSetAtom(company)
    const setBranchSettings = useSetAtom(branch_settings)
    const setPosRegisterID = useSetAtom(posRegister)
    const setActivePosSessionID = useSetAtom(activePosSession)
    const setEnteredTenantName = useSetAtom(enteredTenantName)

    const [result, setResult] = useState<any>(null)
    const [search, setSearch] = useState('')

    const load = (page: number = 1, term: string = search) => {
        getTenants(page, term).then((res: any) => setResult(res.response))
    }

    useEffect(() => { load(1, '') }, [])

    const onSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        load(1, search)
    }

    const enterTenant = (row: any) => {
        setBranchID(row.id)
        setCompanyID(row.company_id)
        // The switcher list doesn't carry branch feature settings; default them
        // (optional tenant features render off while browsing as admin).
        setBranchSettings(null)
        setPosRegisterID(-1)
        setActivePosSessionID(-1)
        setEnteredTenantName(row.company_name ?? '')
        router.push('/dashboard')
    }

    const rows: any[] = result?.data ?? []

    return <>
        <Header
            title={t('tenants.listTitle')}
            subtitle={t('tenants.listSubtitle')}
        />

        <form onSubmit={onSearch} className="mb-4 flex gap-2">
            <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t('tenants.searchPlaceholder')}
                className="input input-bordered input-sm w-full max-w-sm"
            />
            <button type="submit" className="btn btn-sm btn-primary">
                <FontAwesomeIcon icon={faMagnifyingGlass} /> {t('tenants.searchBtn')}
            </button>
        </form>

        <div className="card bg-base-100 border border-base-200 shadow-sm">
            <div className="overflow-x-auto">
                <table className="table">
                    <thead>
                        <tr>
                            <th>{t('tenants.table.company')}</th>
                            <th>{t('tenants.table.branch')}</th>
                            <th>{t('tenants.table.members')}</th>
                            <th>{t('tenants.table.created')}</th>
                            <th className="text-end">{t('tenants.table.action')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {result && rows.length === 0 && (
                            <tr><td colSpan={5} className="text-center text-base-content/60 py-8">{t('tenants.empty')}</td></tr>
                        )}
                        {rows.map((row: any) => (
                            <tr key={row.id}>
                                <td className="font-semibold">
                                    {row.company_name}
                                    {row.is_demo && <span className="badge badge-accent badge-sm uppercase tracking-wider ms-2">{t('navbar.demoBadge')}</span>}
                                </td>
                                <td>{row.branch_name}</td>
                                <td>{row.members}</td>
                                <td>{row.created_at}</td>
                                <td className="text-end">
                                    <button onClick={() => enterTenant(row)} className="btn btn-sm btn-primary">
                                        <FontAwesomeIcon icon={faArrowRightToBracket} /> {t('tenants.enter')}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {result && result.last_page > 1 && (
            <div className="join mt-4 flex justify-center">
                <button
                    className="join-item btn btn-sm"
                    disabled={result.current_page <= 1}
                    onClick={() => load(result.current_page - 1)}
                >«</button>
                <button className="join-item btn btn-sm btn-active">{result.current_page} / {result.last_page}</button>
                <button
                    className="join-item btn btn-sm"
                    disabled={result.current_page >= result.last_page}
                    onClick={() => load(result.current_page + 1)}
                >»</button>
            </div>
        )}
    </>
}
