"use client"

import InputError from "@/_components/inputError";
import ModalPortal from "@/app/(app)/_components/modalPortal";
import { branch, store, validationErrors } from "@/_state/globalStore";
import { attachMember, detachMember, searchMembers } from "@/app/(app)/calendar/_calendar";
import { useAuth } from "@/hooks/auth";
import { useAtom } from "jotai";
import { useTranslation } from "next-i18next";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { scrollToFirstInvalidElement, validateForm } from "@/app/_helpers/validation";

export function ViewSessionForm(
    { 
        data,
        onDelete,
        onAttach,
        onDetach
    }: 
    {
        data: any,
        onDelete: (eventID: number) => void,
        onAttach: (member: any) => void,
        onDetach: (memberId: number) => void
    }
){
    const { t } = useTranslation('common')
    const [sessionData, setSessionData] = useState(data);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [branchID] = useAtom(branch)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isDetachSubmitting, setIsDetachSubmitting] = useState(false)
	const [validErrors] = useAtom(validationErrors)
	const [selectedMemberID, setSelectedMemberID] = useState(null)
	const [isAttachModalOpen, setIsAttachModalOpen] = useState(false)
	const [isDetachModalOpen, setIsDetachModalOpen] = useState(false)
    const { user } = useAuth({ middleware: "auth" })

    useEffect(() => {
        setSessionData(data)
    }, [data])

    const debouncedSearch = useCallback(async (searchQuery: string, currentSession: any) => {
        if (searchQuery.length < 4) {
            setResults([]);
            setSearchLoading(false);
            return;
        }

        setSearchLoading(true);
        await searchMembers(currentSession.id, branchID, searchQuery).then((response) => {
            setResults(response.response);
            setSearchLoading(false);
        })
    }, []);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            debouncedSearch(query, sessionData);
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [query, sessionData, debouncedSearch]);

    const handleAddMember = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const form = event.currentTarget
        const paymentMethod = form.querySelector('[name="payment_method"]:checked') as HTMLFormElement
        const {errors, firstInvalidElement} = validateForm(form, t, {
            ...(sessionData.extendedProps?.price > 0 && {payment_method: { value: paymentMethod?.value || '', rules: ['required'] }})
        })
        if (Object.keys(errors).length > 0) {
            store.set(validationErrors, errors)
            if (firstInvalidElement) scrollToFirstInvalidElement(firstInvalidElement)
                console.log (errors)
            return
        }

		const formData = new FormData(form)
        formData.set('branch_id', `${branchID}`)
        formData.set('session_id', sessionData.id)
        formData.set('member_id', selectedMemberID)
        
		setIsSubmitting(true)
        setResults([])
        setQuery("")
        await attachMember(formData)
            .then((response) => {
                if (response.status === 'success') {
                    onAttach(response.response)
                    setIsAttachModalOpen(false)
                    setSessionData((prev: any) => ({
                        ...prev,
                        extendedProps: {
                            ...prev.extendedProps,
                            members: [...(prev.extendedProps?.members || []), response.response]
                        }
                    }))
                }
            })
            .catch(() => {})
            .finally(() => {
                setIsSubmitting(false)
            })
    }

    const handleDetachMember = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        
		setIsDetachSubmitting(true)
        await detachMember(sessionData.id, selectedMemberID, formData.get('with_refund'))
            .then(() => {
                onDetach(selectedMemberID)     
                setIsDetachModalOpen(false)
                setSessionData((prev: any) => ({
                    ...prev,
                    extendedProps: {
                        ...prev.extendedProps,
                        members: prev.extendedProps?.members.filter((member: any) => member.id !== selectedMemberID)
                    }
                }))        
            })
		    .catch(() => {})
            .finally(() => {
                setIsDetachSubmitting(false)
            })
    }

    return <div className="modal">
        <div className="modal-box">
            {user.permissions.includes('attach member') && <div className="grid grid-cols-1 justify-items-center">
                <div className="relative w-full max-w-md mx-auto">
                    <input type="text" onChange={(ev) => setQuery(ev.target.value)} value={query} placeholder={t('calendar.memberSearch')} className="input input-bordered input-sm w-full" />
                    {searchLoading && <div className="absolute top-0 right-0 p-2">{t('loading')}</div>}
                    {results.length > 0 && (
                        <ul className="absolute z-10 w-full mt-1 border border-base-300 bg-base-100 rounded-sm shadow-lg max-h-36 overflow-y-auto">
                        {results.map((member: any) => (
                            <li	key={member.id}	className="px-4 py-2 cursor-pointer hover:bg-base-200 input input-sm h-auto" 
                                onClick={() => {
                                    setSelectedMemberID(member.id)
                                    setIsAttachModalOpen(true)
                                }}
                            >
                                {member.fullname} | {member.email}
                            </li>
                        ))}
                        </ul>
                    )}
                    {query.length >= 4 && !searchLoading && results.length === 0 && (
                        <div className="absolute left-0 right-0 z-10 mt-1 p-2 bg-base-200 border border-base-300 rounded-md shadow-lg">
                            {t('calendar.noSearchResult')}
                        </div>
                    )}
                </div>
            </div>}

            <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 my-3 items-center">
                <div className="text-lg text-bold">{t('calendar.class')}</div>
                <div className="text-sm">{sessionData.extendedProps?.class_name}</div>
                <div className="text-lg text-bold">{t('calendar.name')}</div>
                <div className="text-sm">{sessionData.title}</div>
                <div className="text-lg text-bold">{t('calendar.sessionManager')}</div>
                <div className="text-sm">{sessionData.extendedProps?.session_manager}</div>
                <div className="text-lg text-bold">{t('calendar.sessionTrainer')}</div>
                <div className="text-sm">{sessionData.extendedProps?.session_trainer}</div>
                <div className="text-lg text-bold">{t('calendar.description')}</div>
                <div className="text-sm">{sessionData.extendedProps?.description}</div>
                <div className="text-lg text-bold">{t('calendar.price')}</div>
                <div className="text-sm">{sessionData.extendedProps?.price}</div>
                <div className="text-lg text-bold">{t('calendar.taxPercentage')}</div>
                <div className="text-sm">{sessionData.extendedProps?.tax_percentage}</div>
                <div className="text-lg text-bold">{t('calendar.startDate')}</div>
                <div className="text-sm">{sessionData.start}</div>
                <div className="text-lg text-bold">{t('calendar.endDate')}</div>
                <div className="text-sm">{sessionData.end}</div>
                <div className="text-lg text-bold">{t('calendar.allDay')}</div>
                <div className="text-sm">{sessionData.start == sessionData.end ? t('true') : t('false')}</div>
                <div className="text-lg text-bold">{t('calendar.color')}</div>
                <div className="text-sm w-1/4 h-7" style={{backgroundColor: sessionData.backgroundColor}}></div>
            </div>

            <details className="collapse collapse-arrow bg-base-200 max-h-36 overflow-y-auto">
                <summary className="collapse-title text-lg font-medium">{t('calendar.memberCollapseTitle')}</summary>
                <div className="collapse-content">
                    <ul className="w-full mt-1 grid gap-2 grid-cols-1 px-1">
                        {( !sessionData.extendedProps?.members || sessionData.extendedProps.members.length === 0 ) ? (
                            <li className="text-base-content/60 italic">{t('calendar.noMembersRelated')}</li>
                        ) : (
                            sessionData.extendedProps.members.map((member: any) => (
                                <li className="flex justify-between items-center rtl:space-x-reverse space-x-10">
                                    <span>{member.fullname} | {member.email}</span>
                                    {user.permissions.includes('detach member') &&
                                        <button className="btn btn-xs btn-primary w-fit" type="button" 
                                            onClick={() => {
                                                setSelectedMemberID(member.id) 
                                                setIsDetachModalOpen(true)
                                            }} 
                                        >
                                            x
                                        </button>
                                    }
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            </details>
            
            <div className="grid grid-cols-1 justify-items-center mt-5">
                <button className="btn btn-sm btn-primary w-fit" type="button" onClick={() => onDelete(sessionData.id)}>{t('calendar.deleteBtn')}</button>
            </div>

            <ModalPortal>
                <input type="checkbox" id="attach_member_modal" className="modal-toggle" checked={isAttachModalOpen} onChange={(e) => setIsAttachModalOpen(e.target.checked)}/>
                <div className="modal" role="dialog">
                    <div className="modal-box max-w-[450px]">
                        <h3 className="text-lg font-bold mb-2">{t('calendar.attachConfirmationMessage')}</h3>
                        <form onSubmit={handleAddMember}>
                            <div className="grid gap-4 grid-cols-1 my-5">
                                <div className="sm:col-span-2">
                                    <label className="label justify-start label-text">{t('calendar.price')}</label>
                                    <input name="price" type="number" readOnly className="input input-bordered input-sm w-full" defaultValue={sessionData.extendedProps?.price}/>
                                    <InputError messages={validErrors.price} />
                                </div>
                                {sessionData.extendedProps?.price > 0 &&                        
                                <div className="sm:col-span-2 grid grid-cols-2 w-full">
                                    <label className="label justify-start cursor-pointer">
                                        <input name="payment_method" type="radio" className="radio" value="cash"
                                            />
                                        <span className="mx-2 label-text">{t('cash')}</span> 
                                    </label>
                                    <label className="label justify-start cursor-pointer">
                                        <input name="payment_method" type="radio" className="radio" value="visa" />
                                        <span className="mx-2 label-text">{t('visa')}</span> 
                                    </label>
                                    <div className="sm:col-span-2">
                                        <InputError messages={validErrors.payment_method} />
                                    </div>
                                </div>
                                }
                            </div>

                            <div className="grid grid-cols-1 justify-items-end mt-5">
                                <button className="btn btn-sm btn-primary w-fit" type="submit" disabled={isSubmitting}>{isSubmitting && <span className="loading loading-spinner"></span>}{t('calendar.attachMemberModalFormBtn')}</button>
                            </div>
                        </form>
                    </div>
                    <label className="modal-backdrop" htmlFor="attach_member_modal" aria-label="Close"></label>
                </div>
            </ModalPortal>
            <ModalPortal>
                <input type="checkbox" id="detach_member_modal" className="modal-toggle" checked={isDetachModalOpen} onChange={(e) => setIsDetachModalOpen(e.target.checked)}/>
                <div className="modal" role="dialog">
                    <div className="modal-box max-w-[450px]">
                        <h3 className="text-lg font-bold mb-2">{t('calendar.detachConfirmationMessage')}</h3>
                        <form onSubmit={handleDetachMember}>
                            <div className="grid gap-4 grid-cols-1 my-5">
                                {user.permissions.includes('create refunds') && 
                                sessionData.extendedProps?.price > 0 &&
                                <div className="">
                                    <label className="label justify-start cursor-pointer">
                                        <input name="with_refund" type="checkbox" className="checkbox" />
                                        <span className="mx-2 label-text">{t('calendar.withRefund')}</span> 
                                    </label>
                                </div>
                                }
                            </div>

                            <div className="grid grid-cols-1 justify-items-end mt-5">
                                <button className="btn btn-sm btn-primary w-fit" type="submit" disabled={isDetachSubmitting}>{isDetachSubmitting && <span className="loading loading-spinner"></span>}{t('calendar.detachMemberModalFormBtn')}</button>
                            </div>
                        </form>
                    </div>
                    <label className="modal-backdrop" htmlFor="detach_member_modal" aria-label="Close"></label>
                </div>
            </ModalPortal>    
        </div>
        <label className="modal-backdrop" htmlFor="view-session-modal" aria-label="Close"></label>
    </div>
}
