"use client"

import { FormEvent, useState } from "react"
import { addDemoTenant } from "@/app/(admin)/admin/demoTenants/_demoTenant"
import { useAtom } from "jotai"
import { store, validationErrors } from "@/_state/globalStore"
import InputError from "@/_components/inputError"
import { useTranslation } from "next-i18next"
import Header from "@/app/(app)/_components/header"
import { scrollToFirstInvalidElement, validateForm } from "@/app/_helpers/validation"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCheckCircle, faCopy, faEnvelope } from "@fortawesome/free-solid-svg-icons"
import PasswordInput from "@/_components/passwordInput"

/**
 * One-click demo account for a new salesperson: provisions a full demo tenant
 * pre-seeded with plans, classes, members and POS products, then shows the
 * credentials to hand over.
 */
export default function DemoTenantAdd() {
    const { t } = useTranslation('common')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [credentials, setCredentials] = useState<any>(null)
    const [copied, setCopied] = useState(false)
    const [validErrors] = useAtom(validationErrors)

    const formSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const form = event.currentTarget
        const {errors, firstInvalidElement} = validateForm(form, t)
        if (Object.keys(errors).length > 0) {
            store.set(validationErrors, errors)
            if (firstInvalidElement) scrollToFirstInvalidElement(firstInvalidElement)
            return
        }

        const formData = new FormData(event.currentTarget)
        setIsSubmitting(true)
        await addDemoTenant(formData).then((returnData: any) => {
            setCredentials(returnData.response)
        })
        .finally(() => setIsSubmitting(false))
    }

    const copyCredentials = async () => {
        await navigator.clipboard.writeText(`${credentials.company_name}\n${t('demoTenants.email')}: ${credentials.email}\n${t('demoTenants.password')}: ${credentials.password}`)
        setCopied(true)
    }

    if (credentials) {
        return <>
            <Header
                title={t('demoTenants.createdTitle')}
                containerClass={"flex justify-between"}
            />
            <div className="mt-6 card bg-base-100 border border-base-200 shadow-sm max-w-xl">
                <div className="card-body">
                    <h3 className="card-title text-lg mb-2">
                        <span className="text-success"><FontAwesomeIcon icon={faCheckCircle} /></span>
                        {credentials.company_name}
                    </h3>
                    <p className="text-sm text-base-content/70 mb-4">{t('demoTenants.createdHint')}</p>
                    <div className="space-y-3 bg-base-200 rounded-lg p-4">
                        <div className="font-mono text-sm" dir="ltr">{t('demoTenants.email')}: {credentials.email}</div>
                        <div>
                            <span className="label-text text-sm font-semibold">{t('demoTenants.password')}</span>
                            <PasswordInput readOnly value={credentials.password} className="input input-bordered input-sm w-full font-mono mt-1" />
                        </div>
                    </div>
                    {credentials.emailed && <div className="mt-3 flex items-center gap-2 text-sm text-success">
                        <FontAwesomeIcon icon={faEnvelope} /> {t('demoTenants.credentialsEmailed', { email: credentials.email })}
                    </div>}
                    <div className="card-actions justify-end mt-4">
                        <button className="btn btn-sm btn-outline btn-primary" onClick={copyCredentials}>
                            <FontAwesomeIcon icon={faCopy} /> {copied ? t('demoTenants.copied') : t('demoTenants.copyBtn')}
                        </button>
                    </div>
                </div>
            </div>
        </>
    }

    return <>
        <Header
            title={t('demoTenants.addTitle')}
            subtitle={t('demoTenants.addSubtitle')}
            containerClass={"flex justify-between"}
        />
        <div className="mt-6 card bg-base-100 border border-base-200 shadow-sm">
            <div className="card-body">
                <form onSubmit={formSubmit}>
                    <h3 className="card-title text-lg mb-4">
                        <div className="w-1 h-5 bg-primary rounded me-2"></div>
                        {t('demoTenants.details')}
                    </h3>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="lg:col-span-2">
                            <label className="label justify-start">
                                <span className="label-text font-semibold required">{t('demoTenants.salespersonName')}</span>
                            </label>
                            <input name="salesperson_name" data-rules="required" type="text" className="input input-bordered input-sm w-full" />
                            <p className="text-xs text-base-content/60 mt-1">{t('demoTenants.salespersonNameHint')}</p>
                            <InputError messages={validErrors.salesperson_name} />
                        </div>
                        <div>
                            <label className="label justify-start">
                                <span className="label-text font-semibold required">{t('demoTenants.email')}</span>
                            </label>
                            <input name="email" data-rules="required" type="email" autoComplete="off" className="input input-bordered input-sm w-full" />
                            <InputError messages={validErrors.email} />
                        </div>
                        <div>
                            <label className="label justify-start">
                                <span className="label-text font-semibold">{t('demoTenants.password')}</span>
                            </label>
                            <PasswordInput name="password" autoComplete="off" className="input input-bordered input-sm w-full" placeholder={t('demoTenants.passwordHint')} />
                            <InputError messages={validErrors.password} />
                        </div>
                        <div className="lg:col-span-2">
                            <label className="label cursor-pointer justify-start gap-3">
                                <input name="send_credentials" type="checkbox" className="checkbox checkbox-primary" />
                                <span className="label-text font-semibold">{t('demoTenants.sendCredentials')}</span>
                            </label>
                            <p className="text-xs text-base-content/60 mt-1">{t('demoTenants.sendCredentialsHint')}</p>
                        </div>
                    </div>

                    <div className="card-actions justify-end mt-6">
                        <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
                            {isSubmitting && <span className="loading loading-spinner"></span>}
                            {t('demoTenants.addFormBtn')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </>
}
