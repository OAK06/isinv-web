"use client"

import { FormEvent, useState } from "react"
import { useAtom } from "jotai"
import { useTranslation } from "next-i18next"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCheckCircle, faCopy, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons"

import Header from "@/app/(app)/_components/header"
import InputError from "@/_components/inputError"
import { store, validationErrors } from "@/_state/globalStore"
import { scrollToFirstInvalidElement, validateForm } from "@/app/_helpers/validation"
import { bulkCreateDemoTenants } from "@/app/(admin)/admin/demoTenants/_demoTenant"

/**
 * Bulk demo tenants for developers who want a pile of correctly-provisioned test
 * data fast. Each is created through the canonical provisioning path server-side;
 * the generated owner credentials are shown so they can be logged into.
 */
export default function BulkDemoTenants() {
    const { t } = useTranslation('common')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [copied, setCopied] = useState(false)
    const [validErrors] = useAtom(validationErrors)

    const formSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const form = event.currentTarget
        const { errors, firstInvalidElement } = validateForm(form, t)
        if (Object.keys(errors).length > 0) {
            store.set(validationErrors, errors)
            if (firstInvalidElement) scrollToFirstInvalidElement(firstInvalidElement)
            return
        }

        const formData = new FormData(form)
        setIsSubmitting(true)
        await bulkCreateDemoTenants(formData).then((returnData: any) => {
            setResult(returnData.response)
        })
        .finally(() => setIsSubmitting(false))
    }

    const accounts: any[] = result?.accounts ?? []

    const copyAll = async () => {
        const text = accounts
            .map(a => `${a.company_name} — ${a.email} / ${a.password}`)
            .join('\n')
        await navigator.clipboard.writeText(text)
        setCopied(true)
    }

    if (result) {
        return <>
            <Header
                title={t('demoTenants.bulk.createdTitle', { count: result.created })}
                subtitle={t('demoTenants.bulk.createdHint')}
            />
            {result.failed?.length > 0 && (
                <div className="alert alert-warning mt-4">
                    <FontAwesomeIcon icon={faTriangleExclamation} />
                    <span>{t('demoTenants.bulk.failed', { count: result.failed.length })}</span>
                </div>
            )}
            <div className="mt-6 card bg-base-100 border border-base-200 shadow-sm">
                <div className="card-body">
                    <div className="flex justify-end">
                        <button className="btn btn-sm btn-outline btn-primary" onClick={copyAll}>
                            <FontAwesomeIcon icon={faCopy} /> {copied ? t('demoTenants.copied') : t('demoTenants.bulk.copyAll')}
                        </button>
                    </div>
                    <div className="overflow-x-auto" dir="ltr">
                        <table className="table table-sm font-mono text-sm">
                            <thead>
                                <tr>
                                    <th>{t('demoTenants.bulk.table.company')}</th>
                                    <th>{t('demoTenants.email')}</th>
                                    <th>{t('demoTenants.password')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {accounts.map((a: any) => (
                                    <tr key={a.company_id}>
                                        <td className="whitespace-nowrap"><FontAwesomeIcon icon={faCheckCircle} className="text-success me-1" />{a.company_name}</td>
                                        <td>{a.email}</td>
                                        <td>{a.password}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    }

    return <>
        <Header
            title={t('demoTenants.bulk.title')}
            subtitle={t('demoTenants.bulk.subtitle')}
            containerClass={"flex justify-between"}
        />
        <div className="mt-6 card bg-base-100 border border-base-200 shadow-sm">
            <div className="card-body">
                <form onSubmit={formSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                            <label className="label justify-start">
                                <span className="label-text font-semibold required">{t('demoTenants.bulk.count')}</span>
                            </label>
                            <input name="count" data-rules="required" type="number" min={1} max={50} defaultValue={5} className="input input-bordered input-sm w-full" />
                            <p className="text-xs text-base-content/60 mt-1">{t('demoTenants.bulk.countHint')}</p>
                            <InputError messages={validErrors.count} />
                        </div>
                        <div>
                            <label className="label justify-start">
                                <span className="label-text font-semibold">{t('demoTenants.bulk.prefix')}</span>
                            </label>
                            <input name="prefix" type="text" className="input input-bordered input-sm w-full" placeholder={t('demoTenants.bulk.prefixHint')} />
                            <InputError messages={validErrors.prefix} />
                        </div>
                    </div>

                    <div className="card-actions justify-end mt-6">
                        <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
                            {isSubmitting && <span className="loading loading-spinner"></span>}
                            {t('demoTenants.bulk.submit')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </>
}
