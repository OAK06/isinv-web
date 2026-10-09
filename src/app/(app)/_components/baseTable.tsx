"use client"

import Link from "next/link"
import { FormEvent, useEffect, useRef, useState } from "react"
import { saveFilters, saveVisibleColumns } from "@/app/(admin)/admin/users/_user"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArchive, faEdit, faEye, faFilter, faInbox, faSort, faSortDown, faSortUp, faTrash, faTable, faGrip, faDownload, faMagnifyingGlass, faXmark } from "@fortawesome/free-solid-svg-icons"
import { useTranslation } from "next-i18next"
import { useAtom } from "jotai"
import { branch, baseTablePerPage } from "@/_state/globalStore"
import { useConfirm } from "@/_components/useConfirm"
import { setNextListParams } from "@/lib/listParams"

// Columns commonly used as a record's heading. When a page doesn't pass an
// explicit cardTitleCol, the card view auto-picks the first of these present so
// rows read as a titled card instead of a flat key/value dump. Order = priority.
const AUTO_TITLE_KEYS = ['name', 'title', 'fullname', 'full_name', 'reference', 'label', 'username', 'email']

export default function BaseTable({ data, actions, getListFunction, deleteFunction, bulkDeleteFunction=null, active=true, archiveable=false, tableController=null, colHeaderNames = [], defaultMode = "table", cardTitleCol = null, emptyAction = null, searchable = true }: any) {
    const { t } = useTranslation('common')
    const { confirm, confirmModal } = useConfirm()
	const [ branchID ] = useAtom(branch)

	const hasCheckboxes = bulkDeleteFunction != null

    const [viewMode, setViewMode] = useState<'table' | 'cards'>(defaultMode)

	const [selectAll, setSelectAll] = useState(false)
    const [selectedIDs, setSelectedIDs] = useState<number[]>([])

	const [sortColumn, setSortColumn] = useState<string[]>([])

	const perPageKey = tableController || 'default'
	const [perPageMap, setPerPageMap] = useAtom(baseTablePerPage)
	const perPage = perPageMap[perPageKey] ?? 10
	const [search, setSearch] = useState('')
	const searchTimer = useRef<any>(null)
	// id -> row cache so Export includes rows checked on OTHER pages too (selection
	// spans pages, but data.data only holds the current one).
	const selectedRows = useRef<Record<number, any>>({})

	// Seed the persisted page size onto the page's own initial getList(1) (which
	// otherwise bypasses BaseTable and would use the server default of 10). Done
	// once at first render so the pending params are set BEFORE the page effect
	// fires its request. ponytail: cheaper + race-free vs reloading in an effect,
	// which would fire a second request that loses to the page's default-size load.
	const bootstrappedPerPage = useRef(false)
	if (!bootstrappedPerPage.current) {
		bootstrappedPerPage.current = true
		if (perPage !== 10) setNextListParams({ per_page: perPage, search: '' })
	}

	// Every reload BaseTable itself triggers routes through here so the current
	// page size + search ride along (via the one-shot listParams carrier). The
	// page's own initial getList(1) intentionally bypasses this - server defaults.
	const runList = (page: number, sort: string = sortColumn[0] ?? null, dir: string = sortColumn[1] ?? null, searchValue: string = search) => {
		setNextListParams({ per_page: perPage, search: searchValue })
		getListFunction(page, sort, dir, active)
	}

	const handleSearch = (value: string) => {
		setSearch(value)
		if (searchTimer.current) clearTimeout(searchTimer.current)
		searchTimer.current = setTimeout(() => runList(1, sortColumn[0] ?? null, sortColumn[1] ?? null, value), 350)
	}

	const handlePerPage = (value: number) => {
		setPerPageMap((prev) => ({ ...prev, [perPageKey]: value }))
		setNextListParams({ per_page: value, search })
		getListFunction(1, sortColumn[0] ?? null, sortColumn[1] ?? null, active)
	}

	const exportSelected = () => {
		const rows = selectedIDs
			.map((id) => selectedRows.current[id] || data.data.find((row: any) => row.id === id))
			.filter(Boolean)
		if (rows.length === 0) return
		const keys = Object.keys(rows[0]).filter((key) => key !== 'id')
		const escape = (val: any) => {
			const str = val === null || val === undefined ? '' : String(val)
			return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
		}
		const header = keys.map((key) => escape(colHeaderNames.find(col => col.key === key)?.label || key))
		const lines = [header.join(','), ...rows.map((row: any) => keys.map((key) => escape(row[key])).join(','))]
		const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
		const url = URL.createObjectURL(blob)
		const link = document.createElement('a')
		link.href = url
		link.download = `${tableController || 'export'}-${Date.now()}.csv`
		link.click()
		URL.revokeObjectURL(url)
	}

	const [columns, setColumns] = useState([])
	const [filters, setFilters] = useState({})
	const [selectedColumns, setSelectedColumns] = useState({})
	const [isVisibleColumnsModalOpen, setIsVisibleColumnsModalOpen] = useState(false)

	const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false)

	const handleSelectAll = () => {
		setSelectAll(!selectAll)
		if (!selectAll) {
			const map: Record<number, any> = {}
			data.data.forEach((row: any) => { map[row.id] = row })
			selectedRows.current = map
			setSelectedIDs(data.data.map((item: any) => item.id))
		} else {
			selectedRows.current = {}
			setSelectedIDs([])
		}
	}

    const handleSelect = (row: any) => {
		const id = row.id
        setSelectedIDs((prevSelected) => {
			const isSelected = prevSelected.includes(id)
			if (isSelected) delete selectedRows.current[id]
			else selectedRows.current[id] = row
			const updatedSelected = isSelected ? prevSelected.filter((selectedId) => selectedId !== id) : [...prevSelected, id]
			if (updatedSelected.length !== data.data.length)
				setSelectAll(false)
			if (updatedSelected.length === data.data.length && updatedSelected.length > 0)
				setSelectAll(true)
			return updatedSelected
		})
    }

    const deleteRecord = async (id: number) => {
        if (!await confirm(t(archiveable ? 'baseTable.confirmArchive' : 'baseTable.confirmDelete'))) return
        const response = await deleteFunction(id)
        if (response.status === "success") {
            delete selectedRows.current[id]
            setSelectedIDs((prev) => prev.filter(selectedId => selectedId !== id))
            runList(data.current_page)
        }
    }

    const bulkDelete = async () => {
        if (!await confirm(t(archiveable ? 'baseTable.confirmBulkArchive' : 'baseTable.confirmBulkDelete', { count: selectedIDs.length }))) return
        const response = await bulkDeleteFunction({ data: { ids: selectedIDs, branch_id: branchID } })
        if (response.status === 'success') {
            selectedRows.current = {}
            setSelectedIDs([])
			runList(1)
        }
    }

    const sortTable = async (sort: string=null) => {
		let sort_direction = 'asc'
		if (sortColumn[0] == sort)
			switch (sortColumn[1]) {
				case 'asc':
					sort_direction = 'desc'
					break
				case 'desc':
					sort = null
					sort_direction = null
					break 
			}
		setSortColumn([sort, sort_direction])
		runList(1, sort, sort_direction)
    }

	const saveSelectedFilters = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const formData = new FormData(event.currentTarget)
		formData.append('controller', tableController)
		const response = await saveFilters(formData)
		if (response.status === 'success') {
			runList(1)
			setIsFiltersModalOpen(false)
		}
	}

	const handleCheckboxChange = (column) => {
		setSelectedColumns((prevSelected) => ({ ...prevSelected, [column]: !prevSelected[column] }))
	}

	const saveSelectedColumns = async () => {
		const formattedColumns = Object.keys(selectedColumns).reduce((acc, column) => {
			acc[column] = selectedColumns[column]
			return acc
		}, {})
		const response = await saveVisibleColumns({ columns: formattedColumns, controller: tableController })
		if (response.status === 'success') {
			runList(1)
			setIsVisibleColumnsModalOpen(false)
		}
	}

	const isDate = (val) => {
		if (typeof val !== 'string') return false
		if (!/^\d{4}-\d{2}-\d{2}/.test(val)) return false
		return !isNaN(Date.parse(val))
	}

	const formatDate = (value) => {
		const timeMatch = value.match(/T(\d{2}):(\d{2}):(\d{2})/)
		const timePart = timeMatch ? `${timeMatch[1]}:${timeMatch[2]}:${timeMatch[3]}` : null
		const isDateOnly = !timePart || timePart === '00:00:00'
		return isDateOnly
			? new Date(value).toLocaleDateString()
			: new Date(value).toLocaleString([], { 
				year: 'numeric',
				month: '2-digit',
				day: '2-digit',
				hour: '2-digit',
				minute: '2-digit',
				hour12: false
			})
	}

	const formatCreated = (row) => {
		const { created_at, created_by } = row
		let datePart = ""
		if (created_at) { datePart = formatDate(created_at) }
		return [datePart, created_by].filter(Boolean).join(" - ")
	}

    const canDisplayAction = (
        action: boolean | ((row: any) => boolean),
        row: any
    ): boolean => {
        return typeof action === 'function' ? action(row) : action
    }

	const scrollRef = useRef<HTMLDivElement | null>(null)
	useEffect(() => {
		const el = scrollRef.current
		if (!el) return
		// Mouse wheels only scroll vertically by default; when the table overflows
		// sideways but not vertically, translate the wheel into horizontal scroll.
		const onWheel = (e: WheelEvent) => {
			if (e.deltaY === 0 || e.shiftKey) return
			const horizontal = el.scrollWidth > el.clientWidth
			const vertical = el.scrollHeight > el.clientHeight
			if (horizontal && !vertical) {
				e.preventDefault()
				el.scrollLeft += e.deltaY
			}
		}
		el.addEventListener('wheel', onWheel, { passive: false })
		return () => el.removeEventListener('wheel', onWheel)
	}, [viewMode, data])

	useEffect(() => {
		if (data.filters)
			setFilters(data.filters)
		if (data.visible_columns) {
			setSelectedColumns(data.visible_columns)
			setColumns(Object.keys(data.visible_columns))
		}
	}, [data])

    return <>
		{confirmModal}
		<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
			<div className="flex gap-2 items-center">
				{searchable && (
					<div className="relative max-w-xs">
						<FontAwesomeIcon icon={faMagnifyingGlass} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-xs opacity-50" />
						<input
							type="text"
							className="input input-sm input-bordered w-full ps-8 pe-8"
							placeholder={t('baseTable.searchPlaceholder')}
							aria-label={t('baseTable.searchPlaceholder')}
							value={search}
							onChange={(e) => handleSearch(e.target.value)}
						/>
						{search && (
							<button type="button" className="absolute end-2 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100" aria-label={t('baseTable.searchClear')} onClick={() => handleSearch('')}>
								<FontAwesomeIcon icon={faXmark} className="text-xs" />
							</button>
						)}
					</div>
				)}
                <div className="join">
                    <button 
                        className={`join-item btn btn-sm ${viewMode === 'table' ? 'btn-active' : ''}`}
                        onClick={() => setViewMode('table')}
                    >
                        <FontAwesomeIcon icon={faTable} />
                    </button>
                    <button 
                        className={`join-item btn btn-sm ${viewMode === 'cards' ? 'btn-active' : ''}`}
                        onClick={() => setViewMode('cards')}
                    >
                        <FontAwesomeIcon icon={faGrip} />
                    </button>
                </div>
            </div>
            
			<div className="flex flex-wrap gap-2">
				{filters && Object.keys(filters).length > 0 && (
					<button onClick={() => setIsFiltersModalOpen(true)} className="btn btn-sm btn-outline">
						<FontAwesomeIcon icon={faFilter} />
						<span className="hidden sm:inline ms-1">{t('baseTable.filtersBtn')}</span>
					</button>
				)}
				{columns && columns.length > 0 && (
					<button onClick={() => setIsVisibleColumnsModalOpen(true)} className="btn btn-sm btn-outline">
						<FontAwesomeIcon icon={faEye} />
						<span className="ms-1">{t('baseTable.visibleColumnsBtn')}</span>
					</button>
				)}
				{hasCheckboxes && selectedIDs.length > 0 && (
					<button onClick={exportSelected} className="btn btn-sm btn-outline">
						<FontAwesomeIcon icon={faDownload} />
						<span className="ms-1">{t('baseTable.exportBtn')}</span>
						<span className="badge badge-sm ms-1">{selectedIDs.length}</span>
					</button>
				)}
				{hasCheckboxes && selectedIDs.length > 0 && (
					<button onClick={bulkDelete} className="btn btn-sm btn-error">
						{archiveable ? <FontAwesomeIcon icon={faArchive} /> : <FontAwesomeIcon icon={faTrash} />}
						<span className="ms-1">
							{archiveable ? t('baseTable.archiveBtn') : t('baseTable.deleteBtn')}
						</span>
						<span className="badge badge-sm ms-1">{selectedIDs.length}</span>
					</button>
				)}
			</div>
		</div>

		<div className="bg-base-100 rounded-lg shadow-sm border max-w-full">
			{data.data === undefined ? (
				<div className="p-4 space-y-3 animate-pulse" aria-busy="true">
					{[...Array(6)].map((_, i) => (
						<div key={i} className="flex items-center gap-4">
							<div className="h-4 bg-base-200 rounded w-1/4"></div>
							<div className="h-4 bg-base-200 rounded w-1/3"></div>
							<div className="h-4 bg-base-200 rounded flex-1"></div>
							<div className="h-8 bg-base-200 rounded w-24"></div>
						</div>
					))}
				</div>
			) : data.data.length === 0 ? (
				<div className="text-center py-12 text-base-content/60">
					<FontAwesomeIcon icon={faInbox} className="text-4xl mb-3 opacity-50" />
					<div className="text-lg">{t('baseTable.noData')}</div>
					{emptyAction && <div className="mt-4">{emptyAction}</div>}
				</div>
			) : (
				<>
                    {viewMode === 'table' ? (
                        <div ref={scrollRef} className="overflow-auto max-h-[70vh]">
                            <table className="table table-zebra table-auto w-full">
                                <thead className="bg-base-200 sticky top-0 z-10">
                                    <tr>
                                        {hasCheckboxes && (
                                            <th className="w-12">
                                                <input type="checkbox" className="checkbox checkbox-sm" checked={selectAll} onChange={handleSelectAll} />
                                            </th>
                                        )}
                                        {Object.keys(data.data[0]).map((value: any, i: number) => {
                                            if (i === 0) return null
                                            return (
                                                <th key={i} className="cursor-pointer hover:bg-base-300 transition-colors" onClick={() => sortTable(value)}>
                                                    <div className="flex justify-between items-center gap-1 font-semibold">
                                                        <div>{colHeaderNames.find(col => col.key === value)?.label || value}</div>
                                                        <FontAwesomeIcon
                                                            icon={sortColumn[0] === value ? (sortColumn[1] === 'asc' ? faSortUp : faSortDown) : faSort}
                                                            className={`text-xs ${sortColumn[0] === value ? '' : 'opacity-30'}`}
                                                        />
                                                    </div>
                                                </th>
                                            )
                                        })}
                                        <th className="w-32">{t('baseTable.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.data.map((row: any, i: number) => (
                                        <tr key={i} className="hover">
                                            {hasCheckboxes && (
                                                <td>
                                                {canDisplayAction(actions.delete, row) && 
                                                    <input name="selectedIDs" value={row.id} type="checkbox" className="checkbox checkbox-sm" onChange={() => handleSelect(row)} checked={selectedIDs.includes(row.id)} />
                                                }
                                                </td>
                                            )}
                                            {Object.values(row).map((value: any, j: number) => {
                                                if (j === 0) return null
                                                let content = value
                                                
                                                if (typeof value === 'boolean' || value === "true" || value === "false") {
                                                    const isChecked = value === true || value === "true"
                                                    content = <input type="checkbox" className="checkbox checkbox-sm" checked={isChecked} disabled />
                                                } 
                                                else if (typeof value === 'string' && isDate(value)) {
                                                    content = formatDate(value)
                                                }
                                                return <td key={j} className="max-w-xs truncate" title={String(content)}>{content}</td>
                                            })}
                                            <td>
                                                <div className="flex gap-1">
                                                    {canDisplayAction(actions.view, row) && (
                                                        <Link href={`${actions.path}/${row.id}`} className="btn btn-sm btn-square btn-ghost">
                                                            <FontAwesomeIcon icon={faEye} />
                                                        </Link>
                                                    )}
                                                    {canDisplayAction(actions.edit, row) && (
                                                        <Link href={`${actions.path}/${row.id}/edit`} className="btn btn-sm btn-square btn-ghost">
                                                            <FontAwesomeIcon icon={faEdit} />
                                                        </Link>
                                                    )}
                                                    {canDisplayAction(actions.delete, row) && (
                                                        <button onClick={() => deleteRecord(row.id)} className="btn btn-sm btn-square btn-ghost">
                                                            <FontAwesomeIcon icon={faTrash} />
                                                        </button>
                                                    )}
                                                    {actions.extra?.map((item: any, idx: number) => (
                                                        (!item.display || item.display(row)) && (
                                                            item.type === 'btn' ? (
                                                                <button key={idx} className={`btn btn-ghost btn-sm btn-square ${item.classes}`} onClick={() => item.action(row.id)}>
                                                                    {item.icon}
                                                                </button>
                                                            ) : (
                                                                <Link key={idx} href={item.path.includes(':id') ? item.path.replace(':id', row.id) : item.path} className={`p-2 ${item.classes}`}>
                                                                    {item.icon}
                                                                </Link>
                                                            )
                                                        )
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-base-200">
							{data.data.map((row: any, i: number) => {
								// Resolve the card's heading: explicit cardTitleCol wins, else
								// auto-detect a common title column; titleKeys are skipped in the body.
								const titleKeys: string[] = Array.isArray(cardTitleCol)
									? cardTitleCol
									: (typeof cardTitleCol === 'string' && row[cardTitleCol])
										? [cardTitleCol]
										: (() => { const k = AUTO_TITLE_KEYS.find((key) => row[key]); return k ? [k] : [] })()
								const titleText = titleKeys.map((k) => row[k]).filter(Boolean).join(' ')
								const created = formatCreated(row)

								return (
								<div key={i} className="card bg-base-100 border border-base-200 shadow-sm hover:shadow-md hover:border-primary/30 transition-all">
									<div className="card-body p-4 gap-0">
										<div className="flex items-start justify-between gap-2">
											<div className="flex items-center gap-3 min-w-0">
												{(hasCheckboxes && canDisplayAction(actions.delete, row)) && <input
													type="checkbox"
													className="checkbox checkbox-sm shrink-0"
													onChange={() => handleSelect(row)}
													checked={selectedIDs.includes(row.id)}
												/>}
												{titleText ? (
													<div className="min-w-0">
														<div className="font-bold text-base-content truncate" title={titleText}>{titleText}</div>
														{created && <div className="text-xs text-base-content/50 truncate">{created}</div>}
													</div>
												) : (
													<span className="text-xs text-base-content/60">{created}</span>
												)}
											</div>
											<div className="flex gap-1 shrink-0">
												{canDisplayAction(actions.view, row) && (
													<Link href={`${actions.path}/${row.id}`} className="btn btn-sm btn-square btn-ghost">
														<FontAwesomeIcon icon={faEye} />
													</Link>
												)}
												{canDisplayAction(actions.edit, row) && (
													<Link href={`${actions.path}/${row.id}/edit`} className="btn btn-sm btn-square btn-ghost">
														<FontAwesomeIcon icon={faEdit} />
													</Link>
												)}
												{canDisplayAction(actions.delete, row) && (
													<button onClick={() => deleteRecord(row.id)} className="btn btn-sm btn-square btn-ghost">
														<FontAwesomeIcon icon={faTrash} />
													</button>
												)}
												{actions.extra?.map((item: any, idx: number) => (
                                                    (!item.display || item.display(row)) && (
                                                        item.type === 'btn' ? (
                                                            <button key={idx} className={`btn btn-ghost btn-sm btn-square ${item.classes}`} onClick={() => item.action(row.id)}>
                                                                {item.icon}
                                                            </button>
                                                        ) : (
                                                            <Link key={idx} href={item.path.includes(':id') ? item.path.replace(':id', row.id) : item.path} className={`p-2 ${item.classes}`}>
                                                                {item.icon}
                                                            </Link>
                                                        )
                                                    )
												))}
											</div>
										</div>
										<div className="divider my-2"></div>
										<div>
											{Object.entries(row).map(([key, value]: [string, any], j: number) => {
												if (['id', 'created_at', 'created_by'].includes(key) || titleKeys.includes(key)) return null

												let content: any = value
												const label = colHeaderNames.find(col => col.key === key)?.label || key

												// Format content based on type (same logic as table)
												if (typeof value === 'boolean' || value === "true" || value === "false") {
													const isChecked = value === true || value === "true"
													content = <span className={`badge badge-sm ${isChecked ? 'badge-success' : 'badge-ghost'}`}>{isChecked ? t('yes') : t('no')}</span>
												} else if (typeof value === 'string' && isDate(value)) {
													content = formatDate(value)
												}

												const isEmpty = content === null || content === undefined || content === ''
												return (
													<div key={j} className="flex justify-between items-start gap-3 py-2 border-b border-base-200/70 last:border-0">
														<span className="text-xs font-medium text-base-content/60 uppercase shrink-0">{label}</span>
														<span className="text-sm text-end break-words min-w-0" title={typeof content === 'string' ? content : undefined}>{isEmpty ? '-' : content}</span>
													</div>
												)
											})}
										</div>
									</div>
								</div>
								)
							})}
						</div>
                    )}

                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-t">
                        <div className="flex items-center gap-3">
                            <div className="text-sm text-base-content/70">
                                {t('baseTable.showing')} {(data.current_page - 1) * data.per_page + 1}-{Math.min(data.current_page * data.per_page, data.total)} {t('baseTable.of')} {data.total}
                            </div>
                            <select className="select select-sm select-bordered" value={perPage} onChange={(e) => handlePerPage(Number(e.target.value))}>
                                {[10, 25, 50, 100].map((size) => <option key={size} value={size}>{size}</option>)}
                            </select>
                        </div>
                        <div className="join">
                            <button 
                                className="join-item btn btn-sm" 
                                disabled={data.current_page === 1}
                                onClick={() => runList(1)}
                            >
                                «
                            </button>
                            <button 
                                className="join-item btn btn-sm" 
                                disabled={data.current_page === 1}
                                onClick={() => runList(data.current_page - 1)}
                            >
                                ‹
                            </button>
                            <button className="join-item btn btn-sm btn-active">{data.current_page} / {data.last_page}</button>
                            <button 
                                className="join-item btn btn-sm" 
                                disabled={data.current_page === data.last_page}
                                onClick={() => runList(data.current_page + 1)}
                            >
                                ›
                            </button>
                            <button 
                                className="join-item btn btn-sm" 
                                disabled={data.current_page === data.last_page}
                                onClick={() => runList(data.last_page)}
                            >
                                »
                            </button>
                        </div>
                    </div>
                </>
            )}
		</div>

		{/* Filters Modal */}
		<input type="checkbox" id="filtersModal" className="modal-toggle" checked={isFiltersModalOpen} onChange={(e) => setIsFiltersModalOpen(e.target.checked)}/>
		<div className="modal">
			<div className="modal-box">
				<h3 className="text-lg font-bold mb-4">{t('baseTable.filtersTitle')}</h3>
				<form onSubmit={saveSelectedFilters}>
					<table className="table-auto w-full">
						<tbody>
							{Object.entries(filters).map(([key, filter]: [string, any], i) => (
								<tr key={i}>
									<td className="py-2 pe-2"><b>{colHeaderNames.find(col => col.key === filter.label)?.label || filter.label}</b></td>
									<td>
										{filter.type === "dropdown" && (
											<select className="select select-sm select-bordered w-full" name={key} defaultValue={filter.value || ""}>
												<option value="">{t('chooseOption')}</option>
												{filter.options.map((option, idx) => (
													<option key={idx} value={option.value}>{option.label}</option>
												))}
											</select>
										)}
										{(filter.type === "text" || filter.type === "numeric") && (
											<input type={filter.type} className="input input-bordered input-sm w-full" name={key} defaultValue={filter.value || ""} />
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
					<div className="modal-action">
						<button className="btn btn-sm btn-primary" type="submit">{t('baseTable.filtersFormBtn')}</button>
					</div>
				</form>
			</div>
			<label className="modal-backdrop" htmlFor="filtersModal" aria-label="Close"></label>
		</div>

		{/* Visible Columns Modal */}
		<input type="checkbox" id="visibleColumnsModal" className="modal-toggle" checked={isVisibleColumnsModalOpen} onChange={(e) => setIsVisibleColumnsModalOpen(e.target.checked)}/>
		<div className="modal">
			<div className="modal-box">
				<h3 className="text-lg font-bold mb-4">{t('baseTable.visibleTitle')}</h3>
				<div className="py-4 space-y-2">
					{columns.slice(1).map((column, i) => (
						<label key={i} className="flex items-center rtl:space-x-reverse space-x-2">
							<input type="checkbox" className="checkbox" checked={selectedColumns[column] || false} onChange={() => handleCheckboxChange(column)} />
							<span>{colHeaderNames.find(col => col.key === column)?.label || column}</span>
						</label>
					))}
				</div>
				<div className="modal-action">
					<button className="btn btn-sm btn-primary" onClick={saveSelectedColumns}>{t('baseTable.visibleFormBtn')}</button>
				</div>
			</div>
			<label className="modal-backdrop" htmlFor="visibleColumnsModal" aria-label="Close"></label>
		</div>
	</>
}