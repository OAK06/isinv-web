"use client"

import { useEffect, useState } from "react"
import { useTranslation } from "next-i18next"
import { store, responseMessage } from "@/_state/globalStore"
import Header from "@/app/(app)/_components/header"
import { getPaymentProvider, setPaymentProvider } from "@/app/(admin)/admin/settings/_settings"

const PROVIDERS = [
    { value: 'stripe', labelKey: 'paymentSettings.stripe', descKey: 'paymentSettings.stripeDesc' },
    { value: 'paddle', labelKey: 'paymentSettings.paddle', descKey: 'paymentSettings.paddleDesc' },
]

export default function PaymentProviderSettings() {
    const { t } = useTranslation('common')
    const [provider, setProvider] = useState<string>('stripe')
    const [testCharge, setTestCharge] = useState<boolean>(false)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        getPaymentProvider().then((returnData: any) => {
            if (returnData.response?.provider) setProvider(returnData.response.provider)
            setTestCharge(!!returnData.response?.test_charge)
        })
    }, [])

    const save = () => {
        setSaving(true)
        setPaymentProvider(provider, testCharge).then(() => {
            store.set(responseMessage, { type: 'success', text: t('paymentSettings.saved') })
        }).finally(() => setSaving(false))
    }

    return <>
        <Header title={t('paymentSettings.title')} subtitle={t('paymentSettings.subtitle')} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            {PROVIDERS.map(option => {
                const selected = provider === option.value
                return <button
                    key={option.value}
                    type="button"
                    onClick={() => setProvider(option.value)}
                    className={`text-start card border bg-base-100 shadow-sm transition-colors ${selected ? 'border-primary ring-1 ring-primary' : 'border-base-200 hover:border-base-300'}`}
                >
                    <div className="card-body">
                        <div className="flex items-center justify-between">
                            <h3 className="card-title text-base">{t(option.labelKey)}</h3>
                            <div className={`w-4 h-4 rounded-full border ${selected ? 'border-primary bg-primary' : 'border-base-300'}`} />
                        </div>
                        <p className="text-sm text-base-content/60">{t(option.descKey)}</p>
                    </div>
                </button>
            })}
        </div>

        <div className="mt-6 card border border-warning/40 bg-warning/5">
            <div className="card-body">
                <label className="flex items-start gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        className="checkbox checkbox-warning mt-0.5"
                        checked={testCharge}
                        onChange={e => setTestCharge(e.target.checked)}
                    />
                    <span>
                        <span className="font-semibold block">{t('paymentSettings.testCharge')}</span>
                        <span className="text-sm text-base-content/60">{t('paymentSettings.testChargeHint')}</span>
                    </span>
                </label>
            </div>
        </div>

        <div className="mt-6">
            <button className="btn btn-primary w-full sm:w-auto" onClick={save} disabled={saving}>
                {saving && <span className="loading loading-spinner"></span>}
                {t('paymentSettings.save')}
            </button>
        </div>
    </>
}
