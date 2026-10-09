"use client"

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowsRotate, faChevronDown, faFilter } from '@fortawesome/free-solid-svg-icons'
import { useTranslation } from 'next-i18next'

interface SessionFiltersProps {
    staff: any[],
    classes: any[],
    onFilter: (filters: { 
        types: string[], 
        managers: string[], 
        trainers: string[], 
        memberBookings?: boolean,
        availableToMember?: boolean
    }) => void,
    showMemberFilters?: boolean
}
export default function SessionFilters({staff, classes, onFilter, showMemberFilters}: SessionFiltersProps) {
    const { t } = useTranslation('common')

    const filterFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
    
        onFilter({
            types: formData.getAll('type[]') as string[],
            managers: formData.getAll('manager[]') as string[],
            trainers: formData.getAll('trainer[]') as string[],
            memberBookings: !!formData.get('current_bookings'),
            availableToMember: !!formData.get('available_bookings')
        })
    }

    return <div className="card bg-base-100 border border-base-200 shadow-sm mb-6">
        <div className="card-body">
            <h3 className="card-title text-lg mb-4">
                <div className="w-1 h-5 bg-primary rounded me-2"></div>
                {t('sessionFilters.filtersTitle')}
            </h3>
            
            <form onSubmit={filterFormSubmit} className="flex flex-wrap gap-3 items-center">   
                {/* Type */}
                <div className="dropdown dropdown-hover">
                    <div tabIndex={0} role="button" className="btn btn-sm btn-outline">
                        {t('sessionFilters.type')} <FontAwesomeIcon icon={faChevronDown} />
                    </div>
                    <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[2] w-52 p-2 shadow max-h-72 overflow-y-auto border-2 border-base-200">
                        {classes?.map((gymClass: any, index: number) => (
                            <li key={index}>
                                <label className="label justify-start cursor-pointer p-2 hover:bg-base-200 rounded">
                                    <input name="type[]" value={gymClass.name} type="checkbox" className="checkbox checkbox-sm" />
                                    <span className="label-text ms-2">{gymClass.name}</span> 
                                </label>
                            </li>
                        ))}
                        <li>
                            <label className="label justify-start cursor-pointer p-2 hover:bg-base-200 rounded">
                                <input name="type[]" value="private" type="checkbox" className="checkbox checkbox-sm" />
                                <span className="label-text ms-2">{t('sessionFilters.private')}</span> 
                            </label>
                        </li>
                    </ul>
                </div>
                
                {/* Manager */}
                <div className="dropdown dropdown-hover">
                    <div tabIndex={0} role="button" className="btn btn-sm btn-outline">
                        {t('sessionFilters.manager')} <FontAwesomeIcon icon={faChevronDown} />
                    </div>
                    <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[2] w-52 p-2 shadow max-h-72 overflow-y-auto border-2 border-base-200">
                        {staff?.map((staf: any, index: number) => (
                            <li key={index}>
                                <label className="label justify-start cursor-pointer p-2 hover:bg-base-200 rounded">
                                    <input name="manager[]" value={staf.fname + ' ' + staf.sname} type="checkbox" className="checkbox checkbox-sm" />
                                    <span className="label-text ms-2">{staf.fname + ' ' + staf.sname}</span> 
                                </label>
                            </li>
                        ))}
                    </ul>
                </div>
                
                {/* Trainer */}
                <div className="dropdown dropdown-hover">
                    <div tabIndex={0} role="button" className="btn btn-sm btn-outline">
                        {t('sessionFilters.trainer')} <FontAwesomeIcon icon={faChevronDown} />
                    </div>
                    <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[2] w-52 p-2 shadow max-h-72 overflow-y-auto border-2 border-base-200">
                        {staff?.map((staf: any, index: number) => (
                            <li key={index}>
                                <label className="label justify-start cursor-pointer p-2 hover:bg-base-200 rounded">
                                    <input name="trainer[]" value={staf.fname + ' ' + staf.sname} type="checkbox" className="checkbox checkbox-sm" />
                                    <span className="label-text ms-2">{staf.fname + ' ' + staf.sname}</span> 
                                </label>
                            </li>
                        ))}
                    </ul>
                </div>

                {showMemberFilters && <>
                    <label className="labe justify-start cursor-pointer py-2 px-4 hover:bg-base-200 rounded-lg">
                        <input name="current_bookings" type="checkbox" className="checkbox checkbox-sm" />
                        <span className="ms-2">{t('sessionFilters.booked')}</span> 
                    </label>
                    <label className="label justify-start cursor-pointer py-2 px-4 hover:bg-base-200 rounded-lg">
                        <input name="available_bookings" type="checkbox" className="checkbox checkbox-sm" />
                        <span className="ms-2">{t('sessionFilters.available')}</span> 
                    </label>
                </>}

                <div className="flex gap-2 ml-auto">
                    <button type="submit" className="btn btn-sm btn-primary">
                        <FontAwesomeIcon icon={faFilter} className="me-1" />
                        {t('sessionFilters.filterBtn')}
                    </button>

                    <button type="reset" 
                        className="btn btn-sm btn-outline" 
                        onClick={() => onFilter({ types: [], managers: [], trainers: [] })}
                    >
                        <FontAwesomeIcon icon={faArrowsRotate} />
                    </button>
                </div>
            </form>
        </div>
    </div>
}