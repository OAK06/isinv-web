"use client"

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid' 
import interactionPlugin from '@fullcalendar/interaction'
import { useEffect, useState } from 'react'
import { AddSessionForm } from '@/app/(app)/calendar/_components/addSessionForm'
import { EventInput } from '@fullcalendar/core'
import { useAtom } from 'jotai'
import { branch, responseMessage, store } from '@/_state/globalStore'
import { ViewSessionForm } from '@/app/(app)/calendar/_components/viewSessionForm'
import { getEvents, deleteSession, getBranchStaff, getBranchClasses } from '@/app/(app)/calendar/_calendar'
import arLocale from '@fullcalendar/core/locales/ar'
import deLocale from '@fullcalendar/core/locales/de'
import frLocale from '@fullcalendar/core/locales/fr'
import nlLocale from '@fullcalendar/core/locales/nl'
import enGbLocale from '@fullcalendar/core/locales/en-gb'
import { useTranslation } from 'next-i18next'
import { useConfirm } from '@/_components/useConfirm'
import { useAuth } from '@/hooks/auth'
import Header from '@/app/(app)/_components/header'
import SessionFilters from '@/app/(app)/_components/sessionFilters'

export default function Calendar() {
    const { t, i18n } = useTranslation('common')
    const [branchID] = useAtom(branch)
	const [events, setEvents] = useState<EventInput[]>([])
    const [filters, setFilters] = useState<any>({ types: [], managers: [], trainers: [] })
    const [filteredEvents, setFilteredEvents] = useState<EventInput[]>([])
	const [clickedDate, setClickedDate] = useState<any>([])
	const [clickedEvent, setClickedEvent] = useState<EventInput>([])
    const [staff, setStaff] = useState([])
    const [classes, setClasses] = useState([])
    const [currentDateRange, setCurrentDateRange] = useState({ startDate: '', endDate: '' })
    const localeMap = {ar: arLocale, de: deLocale, fr: frLocale, nl: nlLocale, en: enGbLocale}
    const calendarLocale = localeMap[i18n.language as keyof typeof localeMap] ?? enGbLocale
    const { confirm, confirmModal } = useConfirm()
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isViewModalOpen, setIsViewModalOpen] = useState(false)
    const { user } = useAuth({ middleware: "auth" })


    const handleDatesSet = async (dateInfo: { startStr: string, endStr: string }) => {
        const newDateRange = { 
            startDate: dateInfo.startStr, 
            endDate: dateInfo.endStr
        }
    
        if ( JSON.stringify(currentDateRange) !== JSON.stringify(newDateRange) ) {
            setCurrentDateRange(newDateRange)
            await getEvents(branchID, dateInfo.startStr, dateInfo.endStr).then((returnData: any) => {
                setEvents(returnData.response)
            })
        }
    }

    const getList = () => {
        getBranchStaff(branchID).then((returnData: any) => {
            setStaff(returnData.response)
        })
        
        getBranchClasses(branchID).then((returnData: any) => {
            setClasses(returnData.response)
        })
    }

    useEffect(() => {
        getList()
    }, [])
    
    const handleDateClick = (info: any) => {
        if (!user.permissions.includes('create sessions')) return

        const [date, timeWithOffset] = info.dateStr.split('T')
        const time = timeWithOffset?.split('+')[0]

        setClickedDate({
            start_date: date,
            start_time: time,
            allDay: info.allDay
        })
        
        setIsCreateModalOpen(true)
    }
    
    const handleEventClick = (info: any) => {
        setClickedEvent(filteredEvents.find((event) => event.id == info.event.id))
        setIsViewModalOpen(true)
    }
    
    const addNewEvent = (newEvent: EventInput) => {
        setEvents((prev) => [...prev, newEvent])
    }

    const deleteEvent = async (eventID: number) => {
        const confirmation = await confirm(t('calendar.deleteEventConfirm')) 
        if (confirmation) {
            const event = events.find(event => Number(event.id) === eventID)
            if (event.extendedProps.members.length !== 0)
                return store.set(responseMessage, { type: 'alert', text: t('calendar.deleteEventAlert') });
            
            await deleteSession(eventID).then(() => {
                setIsViewModalOpen(false)
                setEvents((prev) => prev.filter((event) => Number(event.id) !== eventID))
            })
        }
    }

    const attachMember = (member: any) => {
        setEvents((prev: any) => {
            const eventIndex = prev.findIndex(event => event.id === clickedEvent.id)            
            if (eventIndex === -1) return prev
            
            let newEvents = [...prev]
            newEvents[eventIndex] = {
                ...prev[eventIndex],
                extendedProps: {
                    ...prev[eventIndex].extendedProps,
                    members: [...(prev[eventIndex].extendedProps?.members || []), member]
                }
            }
            
            return newEvents
        })
    }

    const detachMember = (memberID: number) => {
        setEvents((prev: any) => {
            const eventIndex = prev.findIndex(event => event.id === clickedEvent.id)            
            if (eventIndex === -1) return prev
            
            let newEvents = [...prev]
            newEvents[eventIndex] = {
                ...prev[eventIndex],
                extendedProps: {
                    ...prev[eventIndex].extendedProps,
                    members: prev[eventIndex].extendedProps?.members?.filter((member: any) => member.id !== memberID)
                }
            }
            
            return newEvents
        })
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
    
    return <>
        <Header title={t('calendar.title')} />

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
                datesSet={handleDatesSet}
                events={filteredEvents}
                dayMaxEvents={true}
                eventClick={handleEventClick}
                dateClick={handleDateClick}
            />
        </div>

        <input type="checkbox" id="create-session-modal" className="modal-toggle" checked={isCreateModalOpen} onChange={(e) => setIsCreateModalOpen(e.target.checked)}/>
        <AddSessionForm 
            staff={staff}
            classes={classes}
            redirectTo='/calendar' 
            onClose={() => setIsCreateModalOpen(false)} 
            onAddEvent={addNewEvent} 
            clickedDate={clickedDate}
        />

        {isViewModalOpen && <>
        <input type="checkbox" id="view-session-modal" className="modal-toggle" checked={isViewModalOpen} onChange={(e) => setIsViewModalOpen(e.target.checked)}/>
        <ViewSessionForm 
            data={clickedEvent} 
            onDelete={deleteEvent} 
            onAttach={attachMember}
            onDetach={detachMember}
        />
        </>}
        
        {confirmModal}
    </>
}
