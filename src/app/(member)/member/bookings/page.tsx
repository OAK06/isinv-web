"use client"

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useEffect, useState } from 'react'
import { EventInput } from '@fullcalendar/core'
import { useAtom } from 'jotai'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLocationDot, faMagnifyingGlass, faFilter } from '@fortawesome/free-solid-svg-icons'
import { activeMembership, responseMessage, store } from '@/_state/globalStore'
import { ViewMemberSessionModal } from '@/app/(app)/memberSessions/_components/ViewMemberSessionModal'
import { getMemberSessions, getBranchClasses } from '@/app/(app)/memberSessions/_memberSession'
import { getMyBookings, cancelBooking, getPublicSessions } from '@/app/(member)/member/bookings/_booking'
import { getGymBranch } from '@/app/(member)/member/memberships/_plan'
import { getMemberships } from '@/app/(member)/member/_membership'
import { getGyms, getHashedBranch, DirectoryGym } from '@/app/(member)/member/join/_gym'
import arLocale from '@fullcalendar/core/locales/ar'
import deLocale from '@fullcalendar/core/locales/de'
import frLocale from '@fullcalendar/core/locales/fr'
import nlLocale from '@fullcalendar/core/locales/nl'
import enGbLocale from '@fullcalendar/core/locales/en-gb'
import { useTranslation } from 'next-i18next'
import { usePaymentReturn } from '@/hooks/usePaymentReturn'
import { useConfirm } from '@/_components/useConfirm'
import Header from '@/app/(app)/_components/header'
import Loading from '@/app/(app)/_components/loading'

/**
 * Bookings tab — one calendar for the active gym (same idea as the memberships tab, no
 * separate `/add` route). The gym comes from the global navbar switcher; a "find a gym"
 * panel targets one you're not a member of. Member gym → the member-sessions feed +
 * self-book/history; a found gym → its public (available_online) sessions, booked via the
 * public path (the modal collects DOB/phone). Booking always via the calendar event.
 */
export default function MemberBookings() {
    const { t, i18n } = useTranslation('common')
    const [branchID, setBranchID] = useAtom(activeMembership)
    const [memberships, setMemberships] = useState<any[] | null>(null)
    const [events, setEvents] = useState<EventInput[]>([])
    const [filters, setFilters] = useState<any>({ types: [], managers: [], trainers: [], memberBookings: false, availableToMember: false })
    const [filteredEvents, setFilteredEvents] = useState<EventInput[]>([])
    const [clickedEvent, setClickedEvent] = useState<EventInput>([])
    const [classes, setClasses] = useState([])
    const [isViewModalOpen, setIsViewModalOpen] = useState(false)
    const [currentDateRange, setCurrentDateRange] = useState({ startDate: '', endDate: '' })
    const [history, setHistory] = useState<any>(null)
    const [gymFeatures, setGymFeatures] = useState<string[]>([])
    const [gymPhone, setGymPhone] = useState('')
    const { confirm, confirmModal } = useConfirm()

    // Find-a-gym panel (directory search + share code) — book at a non-member gym.
    const [joining, setJoining] = useState(false)
    const [gymSearch, setGymSearch] = useState('')
    const [gyms, setGyms] = useState<DirectoryGym[]>([])
    const [code, setCode] = useState('')
    // Label of a gym picked from the directory (not in `memberships`, so the navbar
    // switcher can't name it) — shown by the calendar so you know which gym you're on.
    const [pickedGymName, setPickedGymName] = useState('')
    // Share code when the active gym was reached by code (unlisted) — proves reach so the
    // public-booking gate accepts it (else the eligibility check 404s).
    const [branchCode, setBranchCode] = useState('')

    // Is the active gym one the member already belongs to? Drives member-vs-public mode.
    const activeMembershipRow = memberships?.find((m) => m.branch_id === branchID)
    const isExistingMember = !!activeMembershipRow
    const activeGymName = activeMembershipRow
        ? `${activeMembershipRow.company_name}${activeMembershipRow.branch_name ? ` — ${activeMembershipRow.branch_name}` : ''}`
        : pickedGymName

    // Member self-booking is a gym opt-in AND needs online payments; else they book via the gym.
    const canSelfBook = gymFeatures.includes('member_self_book') && gymFeatures.includes('online_payments')
    const bookingNotice = canSelfBook
        ? undefined
        : gymPhone
            ? t('memberPortal.bookings.callGym', { phone: gymPhone })
            : t('memberPortal.bookings.visitGym')
    const localeMap = { ar: arLocale, de: deLocale, fr: frLocale, nl: nlLocale, en: enGbLocale }
    const calendarLocale = localeMap[i18n.language as keyof typeof localeMap] ?? enGbLocale

    usePaymentReturn({
        branchId: branchID,
        redirectTo: '/member/bookings',
        successMessage: t('memberSessions.createdMessage'),
        failedMessage: t('memberSessions.createdWithoutPaidMessage')
    })

    // Sessions come from the member feed (own gym) or the public feed (a found gym).
    const loadEvents = async (range: { startDate: string, endDate: string }) => {
        if (branchID === -1 || !range.startDate) return
        const fetcher = isExistingMember ? getMemberSessions : getPublicSessions
        await fetcher(branchID, range.startDate, range.endDate).then((r: any) => setEvents(r.response ?? []))
    }

    const handleDatesSet = async (dateInfo: { startStr: string, endStr: string }) => {
        const newDateRange = { startDate: dateInfo.startStr, endDate: dateInfo.endStr }
        if (branchID !== -1 && JSON.stringify(currentDateRange) !== JSON.stringify(newDateRange)) {
            setCurrentDateRange(newDateRange)
            loadEvents(newDateRange)
        }
    }

    const handleEventClick = (info: any) => {
        setClickedEvent(filteredEvents.find((event) => event.id == info.event.id))
        setIsViewModalOpen(true)
    }

    const loadHistory = () => {
        if (branchID === -1) return
        getMyBookings(branchID).then((r: any) => setHistory(r.response))
    }

    // Load the member's gyms; auto-select the membership branch (or the stored one if still
    // valid). No gyms yet → open find-a-gym so they can book at any gym straight away.
    useEffect(() => {
        getMemberships().then((all: any[]) => {
            setMemberships(all)
            const ids = all.map((m) => m.branch_id)
            if (all.length && (branchID === -1 || !ids.includes(branchID))) setBranchID(all[0].branch_id)
            const wantsJoin = new URLSearchParams(window.location.search).get('join') === '1'
            if (!all.length || wantsJoin) setJoining(true)
        }).catch(() => setMemberships([]))
    }, [])

    // Directory search (debounced) while the find-a-gym panel is open.
    useEffect(() => {
        if (!joining) return
        const timer = setTimeout(() => getGyms(gymSearch).then(setGyms), 250)
        return () => clearTimeout(timer)
    }, [gymSearch, joining])

    // Load per-gym data. Member-only side data (staff/classes filters, features, history)
    // is skipped for a found gym; the calendar reloads for the current range either way.
    useEffect(() => {
        if (branchID === -1) return
        if (isExistingMember) {
            getBranchClasses(branchID).then((r: any) => setClasses(r.response))
            getGymBranch(branchID).then((b) => { setGymFeatures(b.features); setGymPhone(b.phone) }).catch(() => {})
            loadHistory()
        } else {
            setClasses([]); setHistory(null); setGymFeatures([]); setGymPhone('')
        }
        loadEvents(currentDateRange)
    }, [branchID, isExistingMember])

    useEffect(() => {
        const filtered = events.filter((event) => {
            const matchesType = filters.types.length === 0
                || filters.types.includes(event.extendedProps?.class_name)
                || (filters.types.includes('private') && event.extendedProps?.class_name === null)
            const matchesManager = filters.managers.length === 0 || filters.managers.includes(event.extendedProps?.session_manager)
            const matchesTrainer = filters.trainers.length === 0 || filters.trainers.includes(event.extendedProps?.session_trainer)
            // The backend only attaches member_booking for THIS member's own bookings,
            // so presence is enough — no need for member_profile.id (tenant-free here).
            const isMemberBooking = !!event.extendedProps?.member_booking
            let matchesBookingStatus = true
            if (filters.memberBookings !== filters.availableToMember) {
                matchesBookingStatus = filters.memberBookings ? isMemberBooking : !isMemberBooking
            }
            return matchesType && matchesManager && matchesTrainer && matchesBookingStatus
        })
        setFilteredEvents(filtered)
    }, [events, filters])

    const handleCancel = async (id: number) => {
        if (await confirm(t('memberPortal.bookings.cancelConfirm'))) {
            await cancelBooking(id).then(() => {
                store.set(responseMessage, { type: 'success', text: t('memberPortal.bookings.cancelled') })
                loadHistory()
                loadEvents(currentDateRange)
            }).catch(() => {})
        }
    }

    // Target a gym picked from the directory / a share code (public calendar, book publicly).
    // `code` is set only for the share-code path (unlisted gym); directory picks pass "".
    const pickGym = (gym: any, label = '', pickedCode = '') => {
        setBranchID(gym.branch_id)
        setPickedGymName(label || `${gym.company_name ?? ''}${gym.name ? ` — ${gym.name}` : ''}`.trim())
        setBranchCode(pickedCode)
        setJoining(false); setGymSearch(''); setCode('')
        setCurrentDateRange({ startDate: '', endDate: '' })
    }

    const resolveCode = async () => {
        if (!code.trim()) return
        try {
            const trimmed = code.trim()
            const res = await getHashedBranch(trimmed)
            const branch = res.response ?? res
            if (branch?.id) pickGym({ branch_id: branch.id }, `${branch.company?.name ?? ''}${branch.name ? ` — ${branch.name}` : ''}`.trim(), trimmed)
            else store.set(responseMessage, { type: 'alert', text: t('memberPortal.join.codeNotFound') })
        } catch (e) {
            store.set(responseMessage, { type: 'alert', text: t('memberPortal.join.codeNotFound') })
        }
    }

    // A successful in-app booking (no Stripe redirect) — refresh the calendar + history,
    // and re-pull memberships so a just-booked gym flips into member mode (bookings show).
    const onBooked = () => {
        setIsViewModalOpen(false)
        loadEvents(currentDateRange)
        loadHistory()
        getMemberships().then((all: any[]) => setMemberships(all)).catch(() => {})
    }

    return <>
        <Header title={t('memberPortal.nav.bookings')}
            subtitle={!joining && branchID !== -1 && activeGymName ? activeGymName : undefined}
            actions={
            !joining && <button type="button" className="btn btn-sm btn-ghost gap-2" onClick={() => setJoining(true)}>
                <FontAwesomeIcon icon={faMagnifyingGlass} className="w-3 h-3" /> {t('memberPortal.memberships.joinAnother')}
            </button>
        } />

        {/* Find-a-gym: pick any gym to view its public calendar and book a class. */}
        {joining && <div className="card bg-base-100 border border-base-200 shadow-sm mt-4"><div className="card-body">
            <div className="flex items-center justify-between">
                <h2 className="card-title text-lg">{t('memberPortal.memberships.newGymTitle')}</h2>
                {(memberships?.length ?? 0) > 0 &&
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setJoining(false)}>{t('memberPortal.cancel')}</button>}
            </div>
            <div className="space-y-4 mt-2">
                <div className="join w-full max-w-md">
                    <span className="join-item btn btn-disabled"><FontAwesomeIcon icon={faMagnifyingGlass} /></span>
                    <input className="join-item input input-bordered w-full" placeholder={t('memberPortal.join.searchPlaceholder')} value={gymSearch} onChange={e => setGymSearch(e.target.value)} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {gyms.map((g) => (
                        <div key={g.branch_id} className="card bg-base-200 border border-base-300 shadow-sm">
                            <div className="card-body gap-2 p-4">
                                <h3 className="font-bold">{g.company_name}</h3>
                                <p className="text-sm text-base-content/60 flex items-center gap-1">
                                    <FontAwesomeIcon icon={faLocationDot} className="w-3 h-3" /> {g.name}{g.city ? `, ${g.city}` : ''}
                                </p>
                                <div className="card-actions justify-end">
                                    <button type="button" className="btn btn-sm btn-primary" onClick={() => pickGym(g)}>{t('memberPortal.join.select')}</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {gyms.length === 0 && <p className="text-base-content/60 text-sm">{t('memberPortal.join.noResults')}</p>}

                <div className="divider text-sm text-base-content/50">{t('memberPortal.join.orCode')}</div>
                <div className="join w-full max-w-md">
                    <input className="join-item input input-bordered w-full" placeholder={t('memberPortal.join.codePlaceholder')} value={code} onChange={e => setCode(e.target.value)} />
                    <button type="button" className="join-item btn btn-primary" onClick={resolveCode}>{t('memberPortal.join.useCode')}</button>
                </div>
            </div>
        </div></div>}

        {branchID !== -1 && !joining && <>
        {/* Which gym's calendar you're looking at (esp. a found, non-member gym). */}
        {activeGymName && <div className="mt-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faLocationDot} className="w-3.5 h-3.5 text-primary" />
            <span className="font-semibold">{activeGymName}</span>
        </div>}

        {/* Member-friendly, instant filters (own bookings). Only on the member feed —
            a found gym has no bookings of yours to filter. */}
        {isExistingMember && <div className="card bg-base-100 border border-base-200 shadow-sm mt-3 mb-2">
            <div className="card-body py-3 flex-row flex-wrap items-center gap-x-5 gap-y-2">
                <span className="text-sm font-semibold flex items-center gap-2">
                    <FontAwesomeIcon icon={faFilter} className="w-3.5 h-3.5 text-primary" /> {t('sessionFilters.filtersTitle')}
                </span>
                <label className="cursor-pointer flex items-center gap-2">
                    <input type="checkbox" className="checkbox checkbox-sm checkbox-primary" checked={filters.memberBookings}
                        onChange={e => setFilters((f: any) => ({ ...f, memberBookings: e.target.checked }))} />
                    <span className="text-sm">{t('sessionFilters.booked')}</span>
                </label>
                <label className="cursor-pointer flex items-center gap-2">
                    <input type="checkbox" className="checkbox checkbox-sm checkbox-primary" checked={filters.availableToMember}
                        onChange={e => setFilters((f: any) => ({ ...f, availableToMember: e.target.checked }))} />
                    <span className="text-sm">{t('sessionFilters.available')}</span>
                </label>
                {classes.length > 0 && <select className="select select-bordered select-sm min-w-40"
                    value={filters.types[0] ?? ''}
                    onChange={e => setFilters((f: any) => ({ ...f, types: e.target.value ? [e.target.value] : [] }))}>
                    <option value="">{t('memberPortal.bookings.allSessions')}</option>
                    {classes.map((c: any, i: number) => <option key={i} value={c.name}>{c.name}</option>)}
                    <option value="private">{t('sessionFilters.private')}</option>
                </select>}
            </div>
        </div>}

        <div className="card bg-base-100 border border-base-200 shadow-sm p-4">
            <FullCalendar
                key={i18n.language}
                direction={i18n.dir()}
                locale={calendarLocale}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{ start: 'today,prev,next', center: 'title', end: 'dayGridMonth,timeGridWeek,timeGridDay' }}
                datesSet={handleDatesSet}
                events={filteredEvents}
                dayMaxEvents={true}
                eventClick={handleEventClick}
            />
        </div>

        <input type="checkbox" id="view-member-session-modal" className="modal-toggle" checked={isViewModalOpen} onChange={(e) => setIsViewModalOpen(e.target.checked)} />
        <ViewMemberSessionModal data={clickedEvent} branchID={branchID} branchCode={branchCode} canBook={canSelfBook} bookingNotice={bookingNotice} publicBooking={!isExistingMember} onBooked={onBooked} />

        {isExistingMember && <div className="mt-8">
            <h2 className="text-xl font-bold mb-3">{t('memberPortal.bookings.historyTitle')}</h2>
            {history === null
                ? <Loading />
                : (history.data?.length ?? 0) === 0
                    ? <div className="text-center py-10 text-base-content/60">{t('memberPortal.bookings.noBookings')}</div>
                    : <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>{t('memberPortal.bookings.class')}</th>
                                    <th>{t('memberPortal.bookings.when')}</th>
                                    <th>{t('memberPortal.bookings.paymentStatus')}</th>
                                    <th>{t('memberPortal.bookings.attendance')}</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.data.map((b: any) => {
                                    const upcoming = b.start && new Date(b.start) > new Date()
                                    return <tr key={b.id}>
                                        <td>{b.class}{b.session_cancelled && <span className="badge badge-error badge-sm ms-2">{t('memberPortal.bookings.sessionCancelled')}</span>}</td>
                                        <td className="text-sm">{b.start ? new Date(b.start).toLocaleString() : '-'}</td>
                                        <td>{b.payment_status && <span className="badge badge-ghost badge-sm">{t(b.payment_status)}</span>}</td>
                                        <td>{b.attendance_status && <span className="badge badge-ghost badge-sm">{t(b.attendance_status)}</span>}</td>
                                        <td className="text-end">
                                            {upcoming && !b.session_cancelled &&
                                                <button className="btn btn-xs btn-error btn-outline" onClick={() => handleCancel(b.id)}>{t('memberPortal.bookings.cancel')}</button>}
                                        </td>
                                    </tr>
                                })}
                            </tbody>
                        </table>
                    </div>
            }
        </div>}

        </>}

        {confirmModal}
    </>
}
