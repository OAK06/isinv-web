"use client"

import { ChangeEvent, FormEvent, useEffect, useState } from "react"
import PasswordInput from "@/_components/passwordInput"

import { getBranchSettings, editBranchSettings, saveApiKeys, handleOnboarding } from "@/app/(app)/branch_settings/_branchSetting"
import { useAtom } from "jotai"
import { branch, branch_settings, responseMessage, store } from "@/_state/globalStore"
import { useTranslation } from "next-i18next"
import Header from "@/app/(app)/_components/header"
import { useRouter, useSearchParams } from "next/navigation"
import { useConfirm } from "@/_components/useConfirm"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faLock, faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons"

// Glass shop: online payments / member self-service settings don't apply here.
// Flip to true to bring the Stripe connect/API-keys section back.
const PAYMENTS_ENABLED = false

// Gym/membership/online-payment settings hidden for the glass shop. Kept out of the
// rendered list (not deleted) so they're easy to restore if the business model changes;
// their stored DB value is preserved on save (see formSubmit).
const HIDDEN_SETTINGS = new Set([
	'quick_signup_contract_upload',
	'member_qr_code',
	'member_plan_qr_code',
	'member_session_qr_code',
	'online_payments',
	'cross_location_access',
	'member_self_cancel',
	'member_self_pause',
	'member_self_subscribe',
	'member_self_book',
	'listed_in_directory',
])

export default function BranchSettingList() {
    const { t } = useTranslation('common')
	const router = useRouter()
	const [data, setData] = useState<any>([])
	const [activeSettings, setActiveSettings] = useState<number[]>([])
	const [ branchID ] = useAtom(branch)
	const [isSubmitting , setIsSubmitting] = useState(false)
	const [isConnectionSubmitting , setIsConnectionSubmitting] = useState(false)
	const [secretKey, setSecretKey] = useState("")
	const [publicKey, setPublicKey] = useState("")
	const [connectEnabled, setConnectEnabled] = useState(false)
    const [branchSettings, setBranchSettings] = useAtom(branch_settings)
	const [branchData, setBranchData] = useState<any>([])
    const { confirm, confirmModal } = useConfirm()
    const searchParams = useSearchParams()
    const params = new URLSearchParams(searchParams.toString())
    const connectionParam = searchParams.get("connection")
    const isConnected = data?.[0]?.branch?.payment_int_status == 1
    const canAcceptPayments = data?.[0]?.branch?.payment_gateway_status == 1

	const getList = () => {
		getBranchSettings(branchID).then((returnData: any) => {
			setData(returnData.response)
			setConnectEnabled(!!returnData.stripe_connect_enabled)
		})
	}

    const featureNames = {
		'quick_signup_contract_upload': t('branchSettings.shouldSign'),
        'member_qr_code': t('branchSettings.memberQrCode'),
        'member_plan_qr_code': t('branchSettings.memberPlanQrCode'),
        'member_session_qr_code': t('branchSettings.memberSessionQrCode'),
        'online_payments': t('branchSettings.onlinePayments'),
        'cross_location_access': t('branchSettings.crossLocationAccess'),
        'tax_inclusive': t('branchSettings.taxInclusive'),
        'member_self_cancel': t('branchSettings.memberSelfCancel'),
        'member_self_pause': t('branchSettings.memberSelfPause'),
        'member_self_subscribe': t('branchSettings.memberSelfSubscribe'),
        'member_self_book': t('branchSettings.memberSelfBook'),
        'listed_in_directory': t('branchSettings.listedInDirectory'),
	}

    // useEffect(() => {
    //     getList()
    //     const handleVisibilityChange = () => {
    //         if (document.visibilityState === 'visible') 
    //             getList()
    //     }
    //     document.addEventListener('visibilitychange', handleVisibilityChange)
    //     return () => {
    //         document.removeEventListener('visibilitychange', handleVisibilityChange)
    //     }
    // }, [branchID])

	useEffect(() => {
		getList()

        if (!connectionParam) return;
        switch (connectionParam) {
            case "connected":
                store.set(responseMessage, { type: 'success', text: `${t('branchSettings.stripeConnectionSuccess')}` });
                break;
            case "pending":
                store.set(responseMessage, { type: 'success', text: `${t('branchSettings.stripeConnectionNotComplete')}` });
                break;
            case "canceled":
                store.set(responseMessage, { type: 'alert', text: `${t('branchSettings.stripeConnectionCanceled')}` });
                break;
            case "failed":
                store.set(responseMessage, { type: 'error', text: `${t('branchSettings.stripeConnectionFaild')}` });
                break;
        }
        params.delete('connection');
        router.replace(`?${params.toString()}`, { scroll: false });
	}, [])

	useEffect(() => {
        let active = data.filter((setting: any) => setting.status === 1)
                
		setActiveSettings(active.map((setting: any) => setting.id))
        setBranchSettings(active.map((setting: any) => setting.feature_name))
	}, [data])

	const handleCheckboxChange = async (event: ChangeEvent<HTMLInputElement>) => {
		const { value, checked } = event.target
		const settingId = Number(value)

        setActiveSettings((prev) =>
            checked ? [...prev, settingId] : prev.filter((id) => id !== settingId)
        )
	}

    const handleSaveKeys = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setIsConnectionSubmitting(true)
        saveApiKeys({ branch_id: branchID, secret_key: secretKey.trim(), public_key: publicKey.trim() })
            .then(() => {
                setSecretKey("")
                setPublicKey("")
                getList()
                store.set(responseMessage, { type: 'success', text: `${t('branchSettings.stripeConnectionSuccess')}` })
            })
            .catch(() => {})
            .finally(() => setIsConnectionSubmitting(false))
	}

    // Stripe Connect OAuth flow — only reached when connectEnabled (platform has
    // a STRIPE_CLIENT_ID). Otherwise the keys form (handleSaveKeys) is shown.
    const handleConnect = async () => {
        const confirmation = await confirm(t('branchSettings.stripeRedirectConfirmation'))
        if (!confirmation) return;

        setIsConnectionSubmitting(true)
        await handleOnboarding({ branch_id: branchID, return_url: window.location.href })
            .then((returnData) => { window.location.href = returnData.response })
            .catch(() => setIsConnectionSubmitting(false))
	}

	const formSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const formData = new FormData(event.currentTarget)
		formData.set('branch_id', `${branchID}`)

		// Only visible settings render a checkbox, so FormData alone would silently turn
		// every hidden setting off. `activeSettings` already tracks the desired on/off
		// state for ALL settings (hidden ones are never touched by handleCheckboxChange,
		// so they keep whatever value was loaded from the DB) — rebuild settings[] from it.
		formData.delete('settings[]')
		activeSettings.forEach((id) => formData.append('settings[]', String(id)))

		setIsSubmitting(true)
		await editBranchSettings(formData).then((returnData) => {
			setData(returnData.response)
			setIsSubmitting(false)
			store.set(responseMessage, { type: 'success', text: `${t('branchSettings.updatedMessage')}` });
		})
		.catch(() => setIsSubmitting(false))
	}

	return <>
		<Header
			title={t('branchSettings.listTitle')}
			containerClass={"flex justify-between"}
		/>
		<div className="mt-6 card bg-base-100 border border-base-200 shadow-sm">
			<div className="card-body">	
				<form onSubmit={formSubmit}>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
						{data?.filter((setting: any) => !HIDDEN_SETTINGS.has(setting.feature_name)).map((setting: any) => (
							<label key={setting.id} className="flex items-center gap-3 p-4 bg-base-200 rounded-lg cursor-pointer hover:bg-base-300 transition-colors">
								<input 
									name="settings[]"
									type="checkbox"
									className="checkbox checkbox-primary"
									checked={activeSettings.includes(setting.id)}
									onChange={handleCheckboxChange}
									value={setting.id} 
                                    disabled={setting.feature_name === 'online_payments' && !canAcceptPayments}
								/>
								<span className="label-text font-medium">{featureNames[setting.feature_name] ?? setting.feature_name}</span>
							</label>
						))}
					</div>
					
					<div className="card-actions justify-end mt-6">
						<button className="btn btn-primary" type="submit" disabled={isSubmitting || isConnectionSubmitting || !data.length}>
							{isSubmitting && <span className="loading loading-spinner"></span>}
							{t('branchSettings.addFormBtn')}
						</button>
					</div>
				</form>
			</div>
		</div>

        {PAYMENTS_ENABLED && (!isConnected || !canAcceptPayments) && data.length != 0 &&
            <div className="mt-6 card bg-base-100 border border-base-200 shadow-sm">
                <div className="card-body">
                    {!isConnected ?
                        <>
                            {connectEnabled &&
                                <>
                                    <div className="card-actions">
                                        <button className="btn btn-sm btn-primary" disabled={isSubmitting || isConnectionSubmitting} onClick={handleConnect}>
                                            {isConnectionSubmitting && <span className="loading loading-spinner"></span>}
                                            {t('branchSettings.stripeConnectBtn')}
                                        </button>
                                    </div>
                                    <div className="divider text-sm text-base-content/50">{t('branchSettings.stripeOrKeys')}</div>
                                </>
                            }
                            <form onSubmit={handleSaveKeys} className="space-y-3">
                            <div className="space-y-2">
                                <h3 className="font-semibold">{t('branchSettings.stripeKeysTitle')}</h3>
                                <p className="text-sm text-base-content/60">{t('branchSettings.stripeKeysHelp')}</p>
                                <ol className="text-sm text-base-content/60 list-decimal ps-5 space-y-1">
                                    <li>{t('branchSettings.stripeKeysStep1')}</li>
                                    <li>{t('branchSettings.stripeKeysStep2')}</li>
                                    <li>{t('branchSettings.stripeKeysStep3')}</li>
                                </ol>
                                <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-sm text-primary underline">
                                    <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-xs rtl:rotate-180" />
                                    {t('branchSettings.stripeKeysLink')}
                                </a>
                            </div>
                            <PasswordInput className="input input-bordered w-full" placeholder={t('branchSettings.stripeSecretKey')} value={secretKey} onChange={(e) => setSecretKey(e.target.value)} autoComplete="off" />
                            <input type="text" className="input input-bordered w-full" placeholder={t('branchSettings.stripePublicKey')} value={publicKey} onChange={(e) => setPublicKey(e.target.value)} autoComplete="off" />
                            <div className="flex items-start gap-2 rounded-lg bg-base-200 p-3 text-xs text-base-content/70">
                                <FontAwesomeIcon icon={faLock} className="mt-0.5 text-success" />
                                <span>{t('branchSettings.stripeKeysSecurity')}</span>
                            </div>
                            <div className="card-actions justify-end">
                                <button type="submit" className="btn btn-sm btn-primary" disabled={isConnectionSubmitting || !secretKey || !publicKey}>
                                    {isConnectionSubmitting && <span className="loading loading-spinner"></span>}
                                    {t('branchSettings.stripeKeysSubmitBtn')}
                                </button>
                            </div>
                        </form>
                        </>
                    :
                        <div className="card-actions">
                            <a className="btn btn-sm btn-primary" href="https://dashboard.stripe.com/" target="_blank">
                                {t('branchSettings.stripeContinueDataBtn')}
                            </a>
                        </div>
                    }
                </div>
            </div>
        }
        {confirmModal}
	</>
}