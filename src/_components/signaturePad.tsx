'use client'

import { responseMessage, store } from '@/_state/globalStore'
import { useTranslation } from 'next-i18next'
import { useEffect, useRef, useState } from 'react'
import SignatureCanvas from 'react-signature-canvas'

export default function SignaturePad({
    savedData,
    onSave,
    onClear
}: {
    savedData?: string | null,
    onSave: (file: File, dataUrl: string) => void,
    onClear: () => void
}) {
    const { t } = useTranslation('common')
    const [isSigned, setIsSigned] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const sigPadRef = useRef<SignatureCanvas>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [canvasWidth, setCanvasWidth] = useState(0)
    const initialWidthRef = useRef<number | null>(null)

    const hasLoadedSignature = useRef(false)
    const lastLoadedFor = useRef<string | null>(null)

    useEffect(() => {
        if (!savedData || !sigPadRef.current || isSigned) return
        if (hasLoadedSignature.current) return
        if (canvasWidth === 0) return            // wait for a real measurement
        if (lastLoadedFor.current === savedData) return  // already drawn for this exact data

        sigPadRef.current.fromDataURL(savedData)
        setIsSigned(true)
        lastLoadedFor.current = savedData
        hasLoadedSignature.current = true
    }, [savedData, canvasWidth])

    useEffect(() => {
        if (!containerRef.current) return
        const observer = new ResizeObserver(entries => {
            for (let entry of entries) {
                const width = entry.contentRect.width
                if (width > 0) {
                    setCanvasWidth(width)
                }
                // width === 0 means the container is hidden (display:none) — ignore it,
                // otherwise we'd resize the canvas to 0 and wipe the drawing.
            }
        })

        observer.observe(containerRef.current)
        return () => observer.disconnect()
    }, [])

    useEffect(() => {
        if (canvasWidth === 0 || !isSigned) return

        if (initialWidthRef.current === null) {
            initialWidthRef.current = canvasWidth
            return
        }

        if (canvasWidth !== initialWidthRef.current) {
            handleClear()
            store.set(responseMessage, { type: "alert", text: t("signaturePad.resizeAlertMessage") })
            initialWidthRef.current = canvasWidth 
        }
    }, [canvasWidth, isSigned])

    // const handleSave = () => {
    //     if (sigPadRef.current?.isEmpty()) {
    //         store.set(responseMessage, { type: 'alert', text: t("signaturePad.saveAlertMessage") })
    //         return
    //     }
    //     const canvas = sigPadRef.current?.getCanvas()
    //     if (!canvas) return
    //     const dataUrl = canvas.toDataURL("image/png")

    //     canvas.toBlob(blob => {
    //         if (!blob) return
    //         const file = new File([blob], 'signature.png', {type: 'image/png'})
    //         onSave(file, dataUrl)
    //         setIsSaved(true)
    //         sigPadRef.current?.off()
    //     })
    // }
    const autoSave = () => {
        if (!sigPadRef.current) return
        if (sigPadRef.current.isEmpty()) return
        if (isSaving) return

        setIsSaving(true)

        const canvas = sigPadRef.current.getCanvas()
        const dataUrl = canvas.toDataURL("image/png")

        canvas.toBlob(blob => {
            if (!blob) return
            const file = new File([blob], "signature.png", { type: "image/png" })
            onSave(file, dataUrl)
            setIsSaving(false)
        })
    }

    const handleClear = () => {
        sigPadRef.current?.clear()
        sigPadRef.current.on()
        setIsSigned(false)
        onClear()
    }

    return (
        <div ref={containerRef} className="w-full space-y-3">
            <SignatureCanvas
                ref={sigPadRef}
                onBegin={() => setIsSigned(true)}
                onEnd={autoSave}
                canvasProps={{
                    width: canvasWidth,
                    height: 192,
                    className: "border border-gray-300 rounded-xl bg-white shadow-sm cursor-crosshair"
                }}
            />

            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={handleClear}
                    className="btn btn-sm btn-primary"
                >
                    {t('signaturePad.clearBtn')}
                </button>

                {/* <button
                    type="button"
                    onClick={handleSave}
                    disabled={!isSigned || isSaved}
                    className="btn btn-sm btn-primary"
                >
                    {isSaved ? t('signaturePad.saveBtnSaved') : t('signaturePad.saveBtnUnSaved')}
                </button> */}
            </div>
        </div>
    )
}
