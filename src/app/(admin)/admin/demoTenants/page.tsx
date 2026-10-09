"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { useAuth } from "@/hooks/auth"
import Header from "@/app/(app)/_components/header"
import BaseTable from "@/app/(app)/_components/baseTable"
import { bulkDeleteDemoTenants, deleteDemoTenant, getDemoTenants } from "@/app/(admin)/admin/demoTenants/_demoTenant"
import { useTranslation } from "next-i18next"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faLayerGroup, faPlus } from "@fortawesome/free-solid-svg-icons"

/**
 * Platform-admin cleanup: lists DEMO companies only (the backend never returns
 * real tenants) and permanently deletes them — one at a time or in bulk via the
 * table's checkbox selection. Deletion is irreversible; the backend hard-guards
 * `is_demo` so a real tenant can never be removed through this path.
 */
export default function DemoTenantList() {
    const { t } = useTranslation('common')
    const [data, setData] = useState<any>([])
    const { user } = useAuth({ middleware: "auth" })

    const canDelete = user.permissions.includes('delete demo tenants')
    const canCreate = user.permissions.includes('create demo tenants')

    const getList = (page: number, sort: string = null, sort_direction: string = 'asc') => {
        getDemoTenants(page, sort, sort_direction).then((returnData: any) => {
            setData(returnData.response)
        })
    }

    useEffect(() => {
        getList(1)
    }, [])

    const colNames = [
        { key: 'name', label: t('demoTenants.table.name') },
        { key: 'branches', label: t('demoTenants.table.branches') },
        { key: 'members', label: t('demoTenants.table.members') },
        { key: 'created_at', label: t('demoTenants.table.createdAt') },
    ]

    const actions = {
        path: "/admin/demoTenants",
        view: false,
        edit: false,
        delete: canDelete,
    }

    return <>
        <Header
            title={t('demoTenants.listTitle')}
            subtitle={t('demoTenants.listSubtitle')}
            containerClass={"flex justify-between"}
            actions={canCreate && <>
                <Link href="/admin/demoTenants/bulk" className="btn btn-sm btn-outline btn-primary"><FontAwesomeIcon icon={faLayerGroup} /> {t('demoTenants.bulk.addBtn')}</Link>
                <Link href="/admin/demoTenants/add" className="btn btn-sm btn-primary"><FontAwesomeIcon icon={faPlus} /> {t('demoTenants.addBtn')}</Link>
            </>}
        />

        <BaseTable
            data={data}
            actions={actions}
            getListFunction={getList}
            deleteFunction={deleteDemoTenant}
            bulkDeleteFunction={canDelete ? bulkDeleteDemoTenants : null}
            tableController={'demo_tenants'}
            colHeaderNames={colNames}
            cardTitleCol={"name"}
        />
    </>
}
