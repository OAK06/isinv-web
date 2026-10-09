'use client'

import { useEffect, useRef, useState } from 'react'
import { fileUrl } from "@/_utils/fileUrl"
import { Html5Qrcode } from 'html5-qrcode'
import { useTranslation } from 'next-i18next'
import { addEntry, getScannedMember } from '@/app/(app)/scanner/_scanner'
import Loading from '@/app/(app)/_components/loading'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleXmark, faCircleCheck, faUserCircle, faUserSlash } from '@fortawesome/free-solid-svg-icons'
import { useAtom } from 'jotai'
import { branch, responseMessage, store } from '@/_state/globalStore'
import Header from '@/app/(app)/_components/header'

export default function QrScanner() {
    const { t } = useTranslation('common')
    const [cameraId, setCameraId] = useState<string | null>(null)
    const [noCamera, setNoCamera] = useState(false)
    const scannerRef = useRef<Html5Qrcode | null>(null)
    const [isScanning, setIsScanning] = useState(false)
    const [scanHandled, setScanHandled] = useState(false)
    const [isMemberModalOpen, setIsMemberModalOpen] = useState(false)
	const [isSubmitting , setIsSubmitting] = useState(false)
	const [data, setData] = useState<any>([])
	const [branchID] = useAtom(branch)
	const [canEnter, setCanEnter] = useState(true)

    let membershipStatus = { icon: faUserSlash, text: t('scanner.noMemberPlan'), badgeColor: "text-warning", iconColor: "text-warning-content" }
    if (data.member?.member_plans?.length > 0 || data.memberPlan) {
        if (data.member?.member_plans?.some((mp: any) => mp.status_name === 'active') || data.memberPlan?.status_name === 'active') {
            membershipStatus = { icon: faCircleCheck, text: t('scanner.active'), badgeColor: "text-success", iconColor: "text-success-content" }
        } else {
            membershipStatus = { icon: faCircleXmark, text: t('scanner.expired'), badgeColor: "text-error", iconColor: "text-error-content" }
        }
    }

    useEffect(() => {
        Html5Qrcode.getCameras()
            .then(devices => {
                if (devices.length > 0) {
                    setCameraId(devices[0].id)
                } else {
                    setNoCamera(true)
                }
            })
            .catch(() => setNoCamera(true))

        return () => {
            stopScanner()
        }
    }, [])

    const handleDecodedText = async (decodedText: string) => {
        if (!scanHandled) {
            const parts = decodedText.split('|')
            const [uuid, qrTimestampStr, qrTarget] = parts
            const uuidRegex = /^[0-9a-fA-F-]{36}$/
            const qrTimestamp = parseInt(qrTimestampStr, 10)
            const invalid =
                parts.length !== 3 ||
                !uuidRegex.test(uuid || '') ||
                isNaN(qrTimestamp)

            if (invalid) {
                store.set(responseMessage, { type: 'alert', text: t('members.invalidQrMessage') });
		        await stopScanner();
                return
            }

            const now = new Date()
            const blockDate = new Date(
                Math.floor(now.getTime() / (15 * 60 * 1000)) * (15 * 60 * 1000)
            )
            const currentTimestamp = Math.floor(blockDate.getTime() / 1000)

            if (qrTarget !== "member" && currentTimestamp !== qrTimestamp) {
                store.set(responseMessage, { type: 'alert', text: t('members.expiredQrTimeMessage') });
		        await stopScanner();
                return
            }

            setScanHandled(true)
            getScannedMember(decodedText, branchID)
                .then((returnData) => {
                    setData(returnData.response)
                    const { memberPlan, memberSession } = returnData.response
                    let entryAllowed = false
                    
                    if (memberPlan) {
                        entryAllowed = memberPlan.status_name === 'active'
                    } else if (memberSession) {
                        entryAllowed = memberSession.attendance_status_name === 'notAttended'
                    }
                    
                    setCanEnter(entryAllowed)
                    setIsMemberModalOpen(true)
                })
                .catch(() => {})

            stopScanner()
        }
    }

    const startScanner = async () => {
        if (!cameraId || isScanning) return

        if (!scannerRef.current) {
            scannerRef.current = new Html5Qrcode('qr-reader')
        }

        try {
            setScanHandled(false)
            setIsScanning(true)

            await scannerRef.current.start(
                { deviceId: { exact: cameraId } },
                { fps: 10 },
                (decodedText) => handleDecodedText(decodedText),
                (errorMessage) => {
                    if (!errorMessage.includes('NotFoundException')) {
                        console.warn(errorMessage)
                    }
                }
            )
        } catch (err) {
            console.error('Error starting scanner:', err)
            setIsScanning(false)
        }
    }

    const stopScanner = async () => {
        if (scannerRef.current) {
            try {
                await scannerRef.current.stop()
                scannerRef.current.clear()
            } catch (err) {
                console.warn("Error stopping scanner", err)
            } finally {
                scannerRef.current = null
                setIsScanning(false)
                setScanHandled(false)
            }
        }
    }

    const scanFromFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        await stopScanner()

        if (!scannerRef.current) {
            scannerRef.current = new Html5Qrcode('qr-reader')
        }

        try {
            setScanHandled(false)
            const decodedText = await scannerRef.current.scanFile(file, true)
            handleDecodedText(decodedText)
        } catch (err) {
            console.error('Failed to scan from file:', err)
        } finally {
            if (scannerRef.current) {
                scannerRef.current.clear()
                scannerRef.current = null
            }
        }
    }

    const handleEntry = async () => {
		setIsSubmitting(true)
        const entryData = {
            'member_id': data.member?.id,
            'entry_type': data.memberPlan ? "memberPlan" : "memberSession",
            ...(data.memberPlan && { member_plan_id: data.memberPlan.id }),
            ...(data.memberSession && { member_session_id: data.memberSession.id }),
        };
        
		await addEntry(entryData).then((response) => {
			store.set(responseMessage, { type: 'success', text: t('scanner.createdMessage') });
		})
		.finally(() => {
            setIsMemberModalOpen(false)
            setIsSubmitting(false)
        })
	}

    return <>
        <Header
            title={t('scanner.memberScanner')}
            containerClass={"flex justify-between"}
        />
        
        <div className="mt-6 card bg-base-100 border border-base-200 shadow-sm">
            <div className="card-body">
                <h2 className="card-title text-xl mb-4">
                    <div className="w-1 h-6 bg-primary rounded me-2"></div>
                    {t('scanner.scanQrCode')}
                </h2>
                
                <div className="flex flex-col items-center">
                    <div id="qr-reader" className="border-2 border-base-300 rounded-lg sm:w-[400px] sm:h-[400px] w-72 h-72 flex items-center justify-center bg-base-200">
                        {!cameraId && noCamera && (
                            <p className="text-base-content/60 text-center p-4">{t('scanner.noCameraFound')}</p>
                        )}
                    </div>

                    {!noCamera ? (
                        <div className="mt-6 flex gap-3">
                            <button 
                                onClick={startScanner} 
                                disabled={!cameraId || isScanning} 
                                className="btn btn-sm btn-primary disabled:opacity-50"
                            >
                                {t('scanner.startScanBtn')}
                            </button>
                            {isScanning && (
                                <button onClick={stopScanner} className="btn btn-sm btn-error">
                                    {t('scanner.stopBtn')}
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="mt-6 text-center">
                            <label className="btn btn-sm btn-outline cursor-pointer">
                                {t('scanner.uploadImage')}
                                <input type="file" accept="image/*" onChange={scanFromFile} className="hidden" />
                            </label>
                            <p className="text-sm mt-3 text-base-content/60">
                                {t('scanner.noCameraDetected')}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>

        <input type="checkbox" id="scanMemberModal" className="modal-toggle" checked={isMemberModalOpen} onChange={(e) => setIsMemberModalOpen(e.target.checked)}/>
        <div className="modal">
            <div className="modal-box max-w-2xl">
                <button 
                    onClick={() => setIsMemberModalOpen(false)} 
                    className="btn btn-sm btn-circle btn-ghost absolute end-2 top-2"
                >
                    ✕
                </button>
                
                {!data && <Loading />}
                
                {data && (
                    <div className="card bg-base-100 border border-base-200 shadow-sm">
                        <div className="card-body">
                            <div className="flex flex-col sm:flex-row items-center gap-6">
                                <div className="flex-shrink-0">
                                    {data.member?.file?.url ? (
                                        <img
                                            src={fileUrl(data.member.file.url)}
                                            alt={data.member?.fullname ?? ''}
                                            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-2 border-base-300"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-2 border-base-300 bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                            <span className="text-3xl font-bold text-white">{data.member?.fullname?.[0]}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 text-center sm:text-start">
                                    <h3 className="text-xl font-bold mb-2">{data.member?.fullname}</h3>
                                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                                        <FontAwesomeIcon icon={faUserCircle} className="text-primary" />
                                        <span className="text-base-content/60">{t('scanner.member')}</span>
                                    </div>
                                    <div className="flex items-center justify-center sm:justify-start gap-2">
                                        <FontAwesomeIcon icon={membershipStatus.icon} className={`text-lg ${membershipStatus.iconColor}`} />
                                        <span className={`badge ${membershipStatus.badgeColor}`}>{membershipStatus.text}</span>
                                    </div>
                                </div>
                            </div>

                            {(data.memberPlan || data.memberSession) && (
                                <>
                                    <div className="divider my-6"></div>

                                    {data.memberPlan && (
                                        <div className="space-y-4">
                                            <h4 className="text-lg font-semibold mb-3">{t('scanner.membershipPlan')}</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="flex justify-between sm:block">
                                                    <span className="font-semibold text-base-content/70">{t('scanner.planName')}</span>
                                                    <span className="text-base-content">{data.memberPlan.plan_name}</span>
                                                </div>
                                                <div className="flex justify-between sm:block">
                                                    <span className="font-semibold text-base-content/70">{t('scanner.planStatus')}</span>
                                                    <span className="badge badge-sm">{t(`scanner.${data.memberPlan.status_name}`)}</span>
                                                </div>
                                                <div className="flex justify-between sm:block">
                                                    <span className="font-semibold text-base-content/70">{t('from')}</span>
                                                    <span className="text-base-content">{new Date(data.memberPlan.membership_start).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex justify-between sm:block">
                                                    <span className="font-semibold text-base-content/70">{t('to')}</span>
                                                    <span className="text-base-content">{new Date(data.memberPlan.membership_end).toLocaleDateString()}</span>
                                                </div>
                                                {data.memberPlan.allowed_entries && (
                                                    <>
                                                        <div className="flex justify-between sm:block">
                                                            <span className="font-semibold text-base-content/70">{t('scanner.entries')}</span>
                                                            <span className="text-base-content">{data.memberPlan.entries_count} / {data.memberPlan.allowed_entries}</span>
                                                        </div>
                                                        <div className="flex justify-between sm:block">
                                                            <span className="font-semibold text-base-content/70">{t('scanner.remainingEntries')}</span>
                                                            <span className="text-primary font-bold">{data.memberPlan.remaining_entries}</span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {data.memberSession && (
                                        <div className="space-y-4 mt-6">
                                            <h4 className="text-lg font-semibold mb-3">{t('scanner.sessionDetails')}</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="flex justify-between sm:block">
                                                    <span className="font-semibold text-base-content/70">{t('scanner.sessionName')}</span>
                                                    <span className="text-base-content">{data.memberSession.session?.name}</span>
                                                </div>
                                                <div className="flex justify-between sm:block">
                                                    <span className="font-semibold text-base-content/70">{t('from')}</span>
                                                    <span className="text-base-content">{new Date(data.memberSession.session?.start).toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between sm:block">
                                                    <span className="font-semibold text-base-content/70">{t('to')}</span>
                                                    <span className="text-base-content">{new Date(data.memberSession.session?.end).toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between sm:block">
                                                    <span className="font-semibold text-base-content/70">{t('scanner.cancelled')}</span>
                                                    <span className={`badge ${data.memberSession.cancelled ? 'badge-error' : 'badge-success'}`}>
                                                        {data.memberSession.cancelled ? t('true') : t('false')}
                                                    </span>
                                                </div>
                                                {data.memberSession.cancelled_note && (
                                                    <div className="sm:col-span-2 flex justify-between sm:block">
                                                        <span className="font-semibold text-base-content/70">{t('scanner.cancelledNote')}</span>
                                                        <span className="text-base-content">{data.memberSession.cancelled_note}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="card-actions justify-end mt-6">
                                        <button 
                                            className="btn btn-sm btn-primary" 
                                            disabled={isSubmitting || !canEnter} 
                                            onClick={handleEntry}
                                        >
                                            {isSubmitting && <span className="loading loading-spinner"></span>}
                                            {t('scanner.EntryBtn')}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    </>
}
