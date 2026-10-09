"use client"

import FullCalendar from '@fullcalendar/react'
import PasswordInput from "@/_components/passwordInput"
import PhoneInput from "@/_components/phoneInput"
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid' 
import interactionPlugin from '@fullcalendar/interaction'
import { FormEvent, useEffect, useState } from 'react'
import { EventInput } from '@fullcalendar/core'
import { getOnlineEvents } from '@/app/(app)/calendar/_calendar'
import { useAtom } from 'jotai'
import { loading, responseMessage, store, validationErrors } from '@/_state/globalStore'
import Loading from "@/app/(app)/_components/loading"
import { useRouter, useSearchParams } from 'next/navigation'
import { getBranchStaff, getBranchClasses, bookingByLogin, bookingByRegister, getHashedBranch, verifyPaymentSession } from "@/app/(auth)/signup/_signup"
import Link from 'next/link'
import InputError from '@/_components/inputError'
import MessageModal from '@/_components/messageModal'
import arLocale from '@fullcalendar/core/locales/ar'
import deLocale from '@fullcalendar/core/locales/de'
import frLocale from '@fullcalendar/core/locales/fr'
import nlLocale from '@fullcalendar/core/locales/nl'
import enGbLocale from '@fullcalendar/core/locales/en-gb'
import { useTranslation } from 'next-i18next'
import { scrollToFirstInvalidElement, validateForm } from '@/app/_helpers/validation'
import SessionFilters from '@/app/(app)/_components/sessionFilters'

export default function SignupCalendar({ params }: any) {
    const { t, i18n } = useTranslation('common')
	const router = useRouter()
	const { branch_id }: any = params
	const [isLoading] = useAtom(loading)
	const [events, setEvents] = useState<EventInput[]>([])
	const [branchData, setBranchData] = useState<any>({})
	const [pageRendered, setPageRendered] = useState(false)
	const [isSubmitting , setIsSubmitting] = useState(false)

    const [filters, setFilters] = useState<any>({ types: [], managers: [], trainers: [] })
    const [filteredEvents, setFilteredEvents] = useState<EventInput[]>([])
	const [clickedEvent, setClickedEvent] = useState<any>([])
    const [staff, setStaff] = useState([])
    const [classes, setClasses] = useState([])
    const [newDateRange, setNewDateRange] = useState({ startDate: '', endDate: '' })
    const [currentDateRange, setCurrentDateRange] = useState({ startDate: '', endDate: '' })
    const [bookingStep, setBookingStep] = useState<number>(0)
	const [validErrors] = useAtom(validationErrors)
	const [message] = useAtom(responseMessage)
    const localeMap = {ar: arLocale, de: deLocale, fr: frLocale, nl: nlLocale, en: enGbLocale}
    const calendarLocale = localeMap[i18n.language as keyof typeof localeMap] ?? enGbLocale
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
    const searchParams = useSearchParams()
    const sParams = new URLSearchParams(searchParams.toString())
    const paymentSessionId = searchParams.get("payment_session_id")
    const activePaymentSetting = branchData?.active_settings?.find((s: any) => s.feature_name === "online_payments")    
    
    useEffect(() => {
        getHashedBranch(branch_id).then((returnData: any) => {
            setBranchData(returnData.response)
            setPageRendered(true)
        })
        .catch(() => setPageRendered(true))
    }, [])
    
    const handleDatesSet = async () => {    
        if ( JSON.stringify(currentDateRange) !== JSON.stringify(newDateRange) ) {
            setCurrentDateRange(newDateRange)
            await getOnlineEvents(branchData?.id, newDateRange.startDate, newDateRange.endDate).then((returnData: any) => {
                setEvents(returnData.response)
            })
        }
    }
    
    useEffect(() => {
        if (!branchData?.id) return
        handleDatesSet()
    }, [branchData, newDateRange])

    useEffect(() => {
        if (!branchData?.id) return 
        getBranchStaff(branchData.id).then((returnData: any) => {
            setStaff(returnData.response)
        })
        
        getBranchClasses(branchData.id).then((returnData: any) => {
            setClasses(returnData.response)
        })
        
        if (paymentSessionId) {
            verifyPaymentSession({
                branch_id: branchData?.id,
                payment_session_id: paymentSessionId
            }).then((returnData) => {
                if (returnData.response.payment_status === 'unpaid') 
                    return store.set(responseMessage, { type: 'alert', text: 'Unpaid' });
                    
                store.set(responseMessage, { type: 'success', text: t('sessionSignup.bookedSuccessfully') });
            })
            .catch(() => setIsSubmitting(false))

            sParams.delete('payment_session_id');
            router.replace(`?${sParams.toString()}`, { scroll: false });
        }   
    }, [branchData])
    
    const handleEventClick = (info: any) => {
        setClickedEvent(filteredEvents.find((event) => event.id == info.event.id))
        setIsBookingModalOpen(true)
        setBookingStep(1)
    }

    useEffect(() => {
        const filtered = events.filter((event) => {
            const matchesType = filters.types.length === 0 
                || filters.types.includes(event.extendedProps?.class_name) 
                || (filters.types.includes('private') && event.extendedProps?.class_name === null) 

            const matchesManager = filters.managers.length === 0 
                || filters.managers.includes(event.extendedProps?.session_manager)

            const matchesTrainer = filters.trainers.length === 0 
                || filters.trainers.includes(event.extendedProps?.session_trainer)

            return matchesType && matchesManager && matchesTrainer
        })

        setFilteredEvents(filtered)
    }, [events, filters])
    
    const loginFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const form = event.currentTarget
        const {errors, firstInvalidElement} = validateForm(form, t)
        if (Object.keys(errors).length > 0) {
            store.set(validationErrors, errors)
            if (firstInvalidElement) scrollToFirstInvalidElement(firstInvalidElement)
            return
        }

        const formData = new FormData(form)
        formData.set('branch_id', branchData.id)
        formData.set('session_id', clickedEvent.id)
        formData.set('success_url', window.location.href)
        formData.set('cancel_url', window.location.href)
        setIsSubmitting(true)
        await bookingByLogin(formData).then((returnData) => {
            if (returnData.status === 'exists') {
                setIsSubmitting(false)
                setIsBookingModalOpen(false)
                store.set(responseMessage, { type: 'alert', text: t('sessionSignup.bookedBefore') });
                return
            }
            const res = returnData.response
            if (res?.checkout_url) return router.push(res.checkout_url)
            // Free class — booked immediately, no payment.
            setIsSubmitting(false)
            setIsBookingModalOpen(false)
            store.set(responseMessage, { type: 'success', text: t('sessionSignup.bookedSuccessfully') });
        })
        .catch(() => setIsSubmitting(false))
    }

    const registerFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const form = event.currentTarget
        const {errors, firstInvalidElement} = validateForm(form, t)
        if (Object.keys(errors).length > 0) {
            store.set(validationErrors, errors)
            if (firstInvalidElement) scrollToFirstInvalidElement(firstInvalidElement)
            return
        }

        const formData = new FormData(form)
        formData.set('branch_id', branchData.id)
        formData.set('session_id', clickedEvent.id)
        // Deferred flow: the member + booking are created only after payment. The backend
        // returns a Stripe checkout URL (or done:true for a free class) — no member is
        // created up front anymore.
        formData.set('success_url', window.location.href)
        formData.set('cancel_url', window.location.href)

        setIsSubmitting(true)
        await bookingByRegister(formData).then((returnData) => {
            const res = returnData.response
            if (res?.checkout_url) return router.push(res.checkout_url)
            // Free class — booked immediately, no payment.
            setIsSubmitting(false)
            setIsBookingModalOpen(false)
            store.set(responseMessage, { type: 'success', text: t('sessionSignup.bookedSuccessfully') })
        })
        .catch(() => setIsSubmitting(false))
    }
    
    return <div> 
        <style>
            {`
                .sm\\:max-w-md {
                max-width: 100% !important;
                }
            `}
        </style>
        {(isLoading || !pageRendered) && <Loading />}

        {message.type && <MessageModal/>}
        
        <SessionFilters 
            staff={staff}
            classes={classes}
            onFilter={(filters) => setFilters(filters)}
        />

        <div className="card bg-base-100 border border-base-200 shadow-sm p-4">
        <FullCalendar 
            key={i18n.language} 
            direction={i18n.dir()}
            locale={calendarLocale}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
                start: 'today,prev,next',
                center: 'title',
                end: 'dayGridMonth,timeGridWeek,timeGridDay',
            }} 
            datesSet={(date) => setNewDateRange({startDate: date.startStr, endDate: date.endStr})}
            events={filteredEvents}
            dayMaxEvents={true}
            eventClick={handleEventClick}
        />
        </div>

        <input type="checkbox" id="booking-modal" className="modal-toggle" checked={isBookingModalOpen} onChange={(e) => setIsBookingModalOpen(e.target.checked)}/>
        <div className="modal">
            <div className="modal-box">
                {bookingStep === 1 && <> 
                    <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 my-3 items-center">
                        <div className="text-lg text-bold">{t('sessionSignup.className')}:</div>
                        <div className="text-sm">{clickedEvent.extendedProps?.class_name}</div>
                        <div className="text-lg text-bold">{t('sessionSignup.sessionName')}:</div>
                        <div className="text-sm">{clickedEvent.title}</div>
                        <div className="text-lg text-bold">{t('sessionSignup.sessionManager')}:</div>
                        <div className="text-sm">{clickedEvent.extendedProps?.session_manager}</div>
                        <div className="text-lg text-bold">{t('sessionSignup.sessionTrainer')}:</div>
                        <div className="text-sm">{clickedEvent.extendedProps?.session_trainer}</div>
                        <div className="text-lg text-bold">{t('sessionSignup.description')}:</div>
                        <div className="text-sm">{clickedEvent.extendedProps?.description}</div>
                        <div className="text-lg text-bold">{t('sessionSignup.price')}:</div>
                        <div className="text-sm">{clickedEvent.extendedProps?.price}</div>
                        <div className="text-lg text-bold">{t('sessionSignup.taxPercentage')}:</div>
                        <div className="text-sm">{clickedEvent.extendedProps?.tax_percentage}</div>
                        <div className="text-lg text-bold">{t('sessionSignup.startDate')}:</div>
                        <div className="text-sm">{clickedEvent.start}</div>
                        <div className="text-lg text-bold">{t('sessionSignup.endDate')}:</div>
                        <div className="text-sm">{clickedEvent.end}</div>
                        <div className="text-lg text-bold">{t('sessionSignup.allDay')}:</div>
                        <div className="text-sm">{clickedEvent.start == clickedEvent.end ? 'true' : 'false'}</div>
                        <div className="text-lg text-bold">{t('sessionSignup.color')}:</div>
                        <div className="text-sm w-1/4 h-7" style={{backgroundColor: clickedEvent.backgroundColor}}></div>
                    </div>
                    <div className={`grid grid-cols-1 justify-items-center mt-5 ${!activePaymentSetting && clickedEvent.extendedProps?.price > 0 ? "tooltip tooltip-top" : ""}`} data-tip={t('featureNotAccessible')}>
                        <button className="btn btn-primary rounded-full w-fit" type="button" 
                            onClick={() => setBookingStep(2)}
                            disabled={!activePaymentSetting && clickedEvent.extendedProps?.price > 0} 
                        >
                            {t('sessionSignup.bookingBtn')}
                        </button>
                    </div> 
                </>}

                {bookingStep === 2 && 
                    <form onSubmit={loginFormSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email">{t('sessionSignup.email')}</label>
                            <input
                                name="login_email"
                                data-rules="required|email"
                                type="text"
                                className={"mt-1 input input-bordered w-full" }
                                autoFocus
                            />
                            <InputError messages={validErrors.login_email} />
                        </div>
                        <div>
                            <label htmlFor="password">{t('sessionSignup.password')}</label>
                            <PasswordInput
 name="password"
 data-rules="required"
 
 className={"mt-1 input input-bordered w-full"}
 />
                            <InputError messages={validErrors.password} />
                        </div>
                        <div className="flex items-center justify-end">
                            <Link href="/forgot-password" className="text-sm font-semibold link-primary">{t('sessionSignup.forgotPass')}</Link>
                            <button type="submit" className="btn btn-primary rounded-full ms-3" disabled={isSubmitting}>{isSubmitting && <span className="loading loading-spinner"></span>}{t('sessionSignup.loginBtn')}</button>
                        </div>
                        <div className="flex items-center justify-center">
                            <div className="text-center text-sm">
                                {t('sessionSignup.notMember')}{" "}
                                <button className="font-semibold link-primary" onClick={() => setBookingStep(3)}>{t('sessionSignup.createAccount')}</button>
                            </div>
                        </div>
                    </form>
                }

                {bookingStep === 3 && 
                <form onSubmit={registerFormSubmit} className="space-y-4">
                    <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 mb-3">
                        <div className="">
                            <label className="label justify-start label-text required">{t('sessionSignup.fname')}</label>
                            <input name="fname" data-rules="required" type="text" className="input input-bordered w-full" />
                            <InputError messages={validErrors.fname} />
                        </div>
                        <div className="">
                            <label className="label justify-start label-text required">{t('sessionSignup.sname')}</label>
                            <input name="sname" data-rules="required" type="text" className="input input-bordered w-full" />
                            <InputError messages={validErrors.sname} />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="label justify-start label-text required">{t('sessionSignup.email')}</label>
                            <div className="w-full">
                                <input 
                                    name="email" 
                                    data-rules="required|email"
                                    type="text" 
                                    className="input input-sm input-bordered w-full" 
                                />
                                <InputError messages={validErrors.email} />
                            </div>
                        </div>
                        <div className="sm:col-span-2">
                            <label className="label justify-start label-text required">{t('sessionSignup.gender')}</label>
                            <select name="gender" data-rules="required" className="select select-sm select-bordered w-full" defaultValue={""} >
                                <option value={""} disabled>{t('chooseOption')}</option>
                                <option value={"M"}>{t('male')}</option>
                                <option value={"F"}>{t('female')}</option>
                                <option value={"O"}>{t('other')}</option>
                            </select>
                            <InputError messages={validErrors.gender} />
                        </div>
                        <div className="">
                            <label className="label justify-start label-text required">{t('sessionSignup.mobilePhone')}</label>
                            <PhoneInput name="mobile_phone" rules="required" size="base" />
                            <InputError messages={validErrors.mobile_phone} />
                        </div>
                        <div className="">
                            <label className="label justify-start label-text required">{t('sessionSignup.birthDate')}</label>
                            <input name="birth_date" data-rules="required" type="date" className="input input-bordered w-full" />
                            <InputError messages={validErrors.birth_date} />
                        </div>
                    </div>
                    <div className="flex items-center justify-end">
                        <button className="text-sm font-semibold link-primary" onClick={() => setBookingStep(2)}>{t('sessionSignup.alreadyRegistered')}</button>
                        <button type="submit" className="btn btn-primary rounded-full ms-3">{t('sessionSignup.registerBtn')}</button>
                    </div>
                </form>
                }
            </div>
            <label className="modal-backdrop" htmlFor="booking-modal" aria-label="Close"></label>
        </div>

    </div>
}
