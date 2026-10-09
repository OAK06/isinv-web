"use client"

import { FormEvent, useEffect, useState } from "react"

import { addSession } from "@/app/(app)/calendar/_calendar"

import { useAtom } from "jotai"
import { branch, loading, responseMessage, store, validationErrors } from "@/_state/globalStore"
import { useRouter } from "next/navigation"
import { EventInput } from "@fullcalendar/core"
import InputError from "@/_components/inputError"
import { useTranslation } from "next-i18next"
import { scrollToFirstInvalidElement, validateForm } from "@/app/_helpers/validation"

export function AddSessionForm(
    {
        staff,
        classes,
        redirectTo,
        clickedDate,
        onClose,
        onAddEvent
    }: 
    {
        staff: any
        classes: any
        redirectTo: string,
        clickedDate?: any,
        onClose?: () => void,
        onAddEvent?: (event: EventInput) => void
    }
){
    const { t } = useTranslation('common')
    const [branchID] = useAtom(branch)
	const [isLoading] = useAtom(loading)
    const [classDetails, setClassDetails] = useState<any>([])
    const [allDay, setAllDay] = useState(false)
    const router = useRouter()
	const [isSubmitting , setIsSubmitting] = useState(false)
	const [validErrors] = useAtom(validationErrors)

    useEffect(() => {
        setAllDay(clickedDate?.allDay)
    }, [clickedDate])

    const handleClassChange = (ev: any) => {
        setClassDetails(classes.find(c => c.id === Number(ev.target.value)));
    }

    const formSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const form = event.currentTarget
        const {errors, firstInvalidElement} = validateForm(form, t)
        if (Object.keys(errors).length > 0) {
            store.set(validationErrors, errors)
            if (firstInvalidElement) scrollToFirstInvalidElement(firstInvalidElement)
            return
        }

        const formData = new FormData(form)
        formData.set('branch_id', `${branchID}`)
		setIsSubmitting(true)
        
        await addSession(formData).then((response) => {
            form.reset()
            setClassDetails([])
            if (onClose) onClose()
            if (onAddEvent) onAddEvent(response.response)
            router.push(redirectTo)
            setIsSubmitting(false)
			store.set(responseMessage, { type: 'success', text: `${t('calendar.createdMessage')}` });
        })
		.catch(() => setIsSubmitting(false))
    }

    return <div className="modal">
        <div className="modal-box">
            <form onSubmit={formSubmit}>
                <div className="text-xl text-bold mb-4">{t('calendar.addTitle')}</div>
                <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 mb-3">
                    <div className="sm:col-span-2">
                        <label className="label justify-start label-text">{t('calendar.class')}</label>
                        <select name="class_id" className="select select-sm select-bordered w-full" defaultValue={""} onChange={handleClassChange}>
                            <option value={""}>{t('chooseOption')}</option>
                            {classes?.map((gymClass: any) => (
                                <option key={gymClass.id} value={gymClass.id}>{gymClass.name}</option>
                            ))}
                        </select>
                        <InputError messages={validErrors.class_id} />
                    </div>
                    
                    <div className="">
                        <label className="label justify-start label-text required">{t('calendar.name')}</label>
                        <input name="name" data-rules="required" type="text" className="input input-bordered input-sm w-full" defaultValue={classDetails?.name} />
                        <InputError messages={validErrors.name} />
                    </div>

                    <div className="">
                        <label className="label justify-start label-text">{t('calendar.sessionManager')}</label>
                        <select name="session_manager" className="select select-sm select-bordered w-full" defaultValue={""} >
                            <option value={""}>{t('chooseOption')}</option>	
                            {staff?.map((staf: any) => (
                                <option key={staf.id} value={staf.id} selected={staf.id == classDetails?.class_manager}>{staf.fname + ' ' + staf.sname}</option>
                            ))}
                        </select>
                        <InputError messages={validErrors.session_manager} />
                    </div>
                    
                    <div className="sm:col-span-2">
                        <label className="label justify-start label-text">{t('calendar.sessionTrainer')}</label>
                        <select name="session_trainer" className="select select-sm select-bordered w-full" defaultValue={""} >
                            <option value={""}>{t('chooseOption')}</option>	
                            {staff?.map((staf: any) => (
                                <option key={staf.id} value={staf.id} selected={staf.id == classDetails?.class_trainer}>{staf.fname + ' ' + staf.sname}</option>
                            ))}
                        </select>
                        <InputError messages={validErrors.session_trainer} />
                    </div>
                    
                    <div className="">
                        <label className="label justify-start label-text required">{t('calendar.price')}</label>
                        <input name="price" data-rules="required" type="number" className="input input-bordered input-sm w-full" defaultValue={classDetails?.price} />
                        <InputError messages={validErrors.price} />
                    </div>
                    
                    <div className="">
                        <label className="label justify-start label-text required">{t('calendar.taxPercentage')}</label>
                        <input name="tax_percentage" data-rules="required" type="number" className="input input-bordered input-sm w-full" defaultValue={classDetails?.tax_percentage} />
                        <InputError messages={validErrors.tax_percentage} />
                    </div>
                    <div className="sm:col-span-2">
                        <label className="label justify-start label-text">{t('calendar.description')}</label>
                        <textarea name="description" className="textarea input-bordered w-full min-h-40" defaultValue={classDetails?.description}></textarea>
                        <InputError messages={validErrors.description} />
                    </div>
                    
                    <div className="">
                        <label className="label justify-start label-text required">{t('calendar.startDate')}</label>
                        <input name="start_date" data-rules="required" type="date" className="input input-bordered input-sm w-full" defaultValue={clickedDate?.start_date} />
                        <InputError messages={validErrors.start_date} />
                    </div>
                    <div className="">
                        <label className="label justify-start label-text required">{t('calendar.endDate')}</label>
                        <input name="end_date" data-rules="required" type="date" className="input input-bordered input-sm w-full" />
                        <InputError messages={validErrors.end_date} />
                    </div>

                    <div className="sm:col-span-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
                            <label className="label justify-start cursor-pointer">
                                <input name="available_online" type="checkbox" className="checkbox" />
                                <span className="mx-2 label-text">{t('calendar.availableOnline')}</span> 
                            </label>
                            <label className="label justify-start cursor-pointer">
                                <input name="all_day" type="checkbox" className="checkbox" onChange={ev => setAllDay(ev.target.checked)} checked={allDay} />
                                <span className="mx-2 label-text">{t('calendar.allDay')}</span> 
                            </label>
                        </div>
                    </div>
                    {!allDay && <>
                        <div className="">
                            <label className="label justify-start label-text">{t('calendar.startTime')}</label>
                            <input name="start_time" type="time" className="input input-bordered input-sm w-full" disabled={allDay} defaultValue={clickedDate?.start_time} />
                            <InputError messages={validErrors.start_time} />
                        </div>
                        <div className="">
                            <label className="label justify-start label-text">{t('calendar.endTime')}</label>
                            <input name="end_time" type="time" className="input input-bordered input-sm w-full" disabled={allDay} />
                            <InputError messages={validErrors.end_time} />
                        </div>
                    </>}

                    <div className="sm:col-span-2 ">
                        <label className="label justify-start label-text required">{t('calendar.color')}</label>
                        <input name="color" data-rules="required" type="color" className="input input-bordered input-sm w-full" defaultValue={classDetails?.color} />
                        <InputError messages={validErrors.color} />
                    </div>
                </div>
                <div className="grid grid-cols-1 justify-items-end mt-5">
                    <button className="btn btn-sm btn-primary w-fit" type="submit" disabled={isSubmitting}>{isSubmitting && <span className="loading loading-spinner"></span>}{t('calendar.addFormBtn')}</button>
                </div>
            </form>
        </div>
        <label className="modal-backdrop" htmlFor="create-session-modal" aria-label="Close"></label>
    </div>
}
