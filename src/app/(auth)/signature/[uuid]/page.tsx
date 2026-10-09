'use client'

import { useParams, useRouter } from "next/navigation";
import SignaturePad from "@/_components/signaturePad";
import { useTranslation } from "next-i18next";
import { FormEvent, useState } from "react";
import InputError from "@/_components/inputError";
import { useAtom } from "jotai";
import { responseMessage, store, validationErrors } from "@/_state/globalStore";
import { addSignature } from "@/app/(auth)/signature/_signature";
import MessageModal from "@/_components/messageModal";
import { scrollToFirstInvalidElement, validateForm } from "@/app/_helpers/validation";

export default function Signature() {
    const { t } = useTranslation('common')
    const { uuid } = useParams()
	const router = useRouter()
    const [signature, setSignature] = useState<File>(null)
	const [validErrors] = useAtom(validationErrors)
	const [isSubmitting , setIsSubmitting] = useState(false)
    
    const formSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const form = event.currentTarget
        const {errors, firstInvalidElement} = validateForm(form, t, {
            signature: { value: signature ? 'true' : '', rules: ['required'] }
        })
        if (Object.keys(errors).length > 0) {
            store.set(validationErrors, errors)
            if (firstInvalidElement) scrollToFirstInvalidElement(firstInvalidElement)
            return
        }

        const formData = new FormData(form)
		signature && formData.set('signature', signature)
		setIsSubmitting(true)

		await addSignature(uuid, formData).then((response) => {
			router.push(`/login`)
			store.set(responseMessage, { type: 'success', text: `${t('signature.createdMessage')}` });
		})
		.catch(() => setIsSubmitting(false))
	}

	return <form onSubmit={formSubmit}>
            <MessageModal /> 
        <div className="text-xl text-primary font-bold mb-4">{t('signature.title')}</div>

        <div className="grid gap-2 grid-cols-1 mb-3">
            <div className="">
                <div className="mb-2">
                    <SignaturePad onSave={(file) => setSignature(file)} onClear={() => setSignature(null)}/>
                </div>
                <InputError messages={validErrors.signature} />
            </div>
        </div>
        <div className="grid grid-cols-1 justify-items-end mt-5">
            <button className="btn btn-primary rounded-full w-fit" type="submit" disabled={isSubmitting}>{isSubmitting && <span className="loading loading-spinner"></span>}{t('signature.addBtn')}</button>
        </div>
    </form>
}