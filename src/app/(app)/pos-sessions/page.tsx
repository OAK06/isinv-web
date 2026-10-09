"use client"

import { useEffect, useState } from "react"

import { useAuth } from "@/hooks/auth"
import Header from "@/app/(app)/_components/header"
import BaseTable from "@/app/(app)/_components/baseTable"
import { getPosSessions } from "@/app/(app)/pos-sessions/_posSession"
import { useAtom } from "jotai"
import { activePosSession, branch, loading, posRegister } from "@/_state/globalStore"
import Loading from "@/app/(app)/_components/loading"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCashRegister, faPlus } from "@fortawesome/free-solid-svg-icons"
import { useTranslation } from "next-i18next"
import StartPosSessionModal from "@/app/(app)/pos-sessions/_components/startPosSessionModal"
import EndPosSessionModal from "@/app/(app)/pos-sessions/_components/endPosSessionModal"

export default function PosSessionList() {
    const { t } = useTranslation('common')
	const [data, setData] = useState<any>([])
	const { user } = useAuth({ middleware: "auth" })
    const [isLoading] = useAtom(loading)
    const [ branchID ] = useAtom(branch)
    const [isStartPosSessionModalOpen, setIsStartPosSessionModalOpen] = useState(false)
    const [isEndPosSessionModalOpen, setIsEndPosSessionModalOpen] = useState(false)
	const [sessionToEnd, setSessionToEnd] = useState<number | null>(null)
	const [ activePosSessionID ] = useAtom(activePosSession)
	const [ posRegisterID ] = useAtom(posRegister)
	const actions = {
		path: "/pos-sessions",
		view: user.permissions.includes('view pos sessions'),
        extra: [
            user.permissions.includes('finish pos sessions') && {
                type: 'btn',
                display: (row: any): boolean => {
                    return row.status?.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() === 'active'
                },
                action: (rowId: number) => {
                    setIsEndPosSessionModalOpen(true)
                    setSessionToEnd(rowId)
                },
                classes: "btn-error",
                icon: <FontAwesomeIcon icon={faCashRegister} />
            }
        ]
	}
	
	const getList = (page: number, sort: string=null, sort_direction: string='asc') => {
		getPosSessions(page, branchID, posRegisterID, sort, sort_direction).then((returnData: any) => {
			setData(returnData.response)
		})
	}
	
	useEffect(() => {
		getList(1)
	}, [])

    const colNames = [
        { key: 'start', label: t('posSessions.table.start') },
        { key: 'end', label: t('posSessions.table.end') },
        { key: 'open_cash', label: t('posSessions.table.openCash') },
        { key: 'close_cash', label: t('posSessions.table.closeCash') },
        { key: 'started_by', label: t('posSessions.table.startedBy') },
        { key: 'ended_by', label: t('posSessions.table.endedBy') },
        { key: 'status', label: t('posSessions.table.status') }
	]
	
	if (isLoading) return <Loading />
	return <>
        <StartPosSessionModal 
            isOpen={isStartPosSessionModalOpen} 
            onClose={() => setIsStartPosSessionModalOpen(false)}
            onSubmitSuccess={() => {
                getList(data.current_page)
                setIsStartPosSessionModalOpen(false)
            }}
            cancelBtn={{ display: false }}
        />

        <EndPosSessionModal 
            isOpen={isEndPosSessionModalOpen} 
            onClose={() => setIsEndPosSessionModalOpen(false)}
            sessionID={sessionToEnd}
            onSubmitSuccess={() => {
                getList(data.current_page)
                setIsEndPosSessionModalOpen(false)
            }}
            cancelBtn={{ display: false }}
        />

		<Header
			title={t('posSessions.listTitle')}
			containerClass={"flex justify-between"}
			actions={user.permissions.includes('create pos sessions') && 
                <span className={activePosSessionID !== -1 ? 'tooltip tooltip-left rtl:tooltip-right' : ''} data-tip={t('posSessions.disabledAddMessage')}> 
                    <button 
                        onClick={() => setIsStartPosSessionModalOpen(true)} 
                        disabled={activePosSessionID !== -1} 
                        className={`btn btn-sm btn-primary`}
                    >
                        <FontAwesomeIcon icon={faPlus} /> {t('posSessions.addBtn')}
                    </button>
                </span>
            }
		/>
		<BaseTable data={data} actions={actions} getListFunction={getList} tableController={'pos_session'} colHeaderNames={colNames} />
	</>
}