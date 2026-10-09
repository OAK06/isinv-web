"use client"

import { useEffect, useState } from "react"
import { useTranslation } from "next-i18next"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTrashCanArrowUp, faTrash } from "@fortawesome/free-solid-svg-icons"

import Header from "@/app/(app)/_components/header"
import { useConfirm } from "@/_components/useConfirm"
import { store, responseMessage } from "@/_state/globalStore"
import { getArchived, restoreArchived, eraseArchived, ArchivedRecord } from "@/app/(admin)/admin/archive/_archive"

const ENTITIES = ['products', 'product-categories', 'suppliers', 'purchase-orders', 'stocktakes', 'work-orders'] as const

/**
 * Super-Admin "Archive" (trash) screen. Pick one of the six archivable
 * entities, browse its soft-deleted rows, and either restore a row or
 * permanently erase it (irreversible — gated behind useConfirm).
 */
export default function ArchiveList() {
    const { t } = useTranslation('common')
    const { confirm, confirmModal } = useConfirm()

    const [entity, setEntity] = useState<typeof ENTITIES[number]>('products')
    const [result, setResult] = useState<any>(null)

    const load = (page: number = 1) => {
        getArchived(entity, page).then((res: any) => setResult(res.response))
    }

    useEffect(() => { setResult(null); load(1) }, [entity])

    const restore = async (id: number) => {
        if (!await confirm(t('archive.restoreConfirm'))) return
        const response = await restoreArchived(entity, id)
        if (response.status === 'success') {
            store.set(responseMessage, { type: 'success', text: t('archive.restored') })
            load(result?.current_page ?? 1)
        }
    }

    const erase = async (id: number) => {
        if (!await confirm(t('archive.permanentlyDeleteConfirm'))) return
        const response = await eraseArchived(entity, id)
        if (response.status === 'success') {
            store.set(responseMessage, { type: 'success', text: t('archive.erased') })
            load(result?.current_page ?? 1)
        }
    }

    const rows: ArchivedRecord[] = result?.data ?? []

    return <>
        {confirmModal}

        <Header
            title={t('archive.title')}
            subtitle={t('archive.subtitle')}
        />

        <div className="mb-4 max-w-xs">
            <select
                value={entity}
                onChange={e => setEntity(e.target.value as typeof ENTITIES[number])}
                className="select select-bordered select-sm w-full"
            >
                {ENTITIES.map(slug => (
                    <option key={slug} value={slug}>{t(`archive.entities.${slug}`)}</option>
                ))}
            </select>
        </div>

        <div className="card bg-base-100 border border-base-200 shadow-sm">
            <div className="overflow-x-auto">
                <table className="table">
                    <thead>
                        <tr>
                            <th>{t('archive.table.item')}</th>
                            <th>{t('archive.table.archivedAt')}</th>
                            <th className="text-end">{t('baseTable.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {result && rows.length === 0 && (
                            <tr><td colSpan={3} className="text-center text-base-content/60 py-8">{t('archive.empty')}</td></tr>
                        )}
                        {rows.map((row) => (
                            <tr key={row.id}>
                                <td className="font-semibold">{row.label}</td>
                                <td>{row.deleted_at}</td>
                                <td className="text-end">
                                    <div className="flex gap-1 justify-end">
                                        <button onClick={() => restore(row.id)} className="btn btn-sm btn-outline btn-primary">
                                            <FontAwesomeIcon icon={faTrashCanArrowUp} /> {t('archive.restore')}
                                        </button>
                                        <button onClick={() => erase(row.id)} className="btn btn-sm btn-error">
                                            <FontAwesomeIcon icon={faTrash} /> {t('archive.permanentlyDelete')}
                                        </button>
                                    </div>
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
