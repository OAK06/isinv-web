"use client"

import { useEffect, useState } from "react"
import { useBreadcrumbLabel } from "@/hooks/useBreadcrumbLabel"
import { fileUrl } from "@/_utils/fileUrl"

import { getMember, getBranchPlans, exportMemberData, eraseMember, Member } from "@/app/(app)/members/_member"
import { useAuth } from "@/hooks/auth"
import { useConfirm } from "@/_components/useConfirm"
import { useRouter } from "next/navigation"
import PlansTab from "@/app/(app)/members/_components/plansTab"
import InfoTab from "@/app/(app)/members/_components/infoTab"
import NotesTab from "@/app/(app)/members/_components/notesTab"
import InvoicesTab from "@/app/(app)/members/_components/invoicesTab"
import { useAtom } from "jotai"
import { branch, store, validationErrors } from "@/_state/globalStore"
import { useTranslation } from "next-i18next"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCartShopping, faCircleInfo, faEnvelope, faFileContract, faGlobe, faLocationDot, faMobileScreen, faNoteSticky, faPhone, faDownload, faUserSlash } from "@fortawesome/free-solid-svg-icons"
import Header from "@/app/(app)/_components/header"

export default function MemberView({ params }: any) {
    const { t } = useTranslation('common')
	const { member_id }: any = params
	const [data, setData] = useState<Member>({} as Member)
	useBreadcrumbLabel(data)
	const [plans, setplans] = useState<any>([])
	const [clicked, setClicked] = useState<string>('plans')
	const [ branchID ] = useAtom(branch)
	const { user } = useAuth({ middleware: 'auth' })
	const { confirm, confirmModal } = useConfirm()
	const router = useRouter()

	const handleExport = async () => {
		const res = await exportMemberData(member_id)
		const blob = new Blob([JSON.stringify(res.response ?? res, null, 2)], { type: 'application/json' })
		const url = URL.createObjectURL(blob)
		const link = document.createElement('a')
		link.href = url
		link.download = `member-${member_id}-data.json`
		link.click()
		URL.revokeObjectURL(url)
	}

	const handleErase = async () => {
		if (!await confirm(t('members.eraseConfirm'))) return
		const res = await eraseMember(member_id)
		if (res.status === 'success') router.replace('/members')
	}

	useEffect(() => {
		getMember(member_id).then((returnData: any) => {
			setData(returnData.response)
		})
		getBranchPlans(branchID).then((returnData: any) => {
			setplans(returnData.response)
		})
	}, [])

    const contactRows = [
        [
            { icon: faEnvelope, label: t('members.email'), value: data.email },
            { icon: faMobileScreen, label: t('members.mobilePhone'), value: data.mobile_phone },
            { icon: faPhone, label: t('members.homePhone'), value: data.home_phone },
        ],
        [
            { icon: faLocationDot, label: t('members.address'), value: data.address },
            { icon: faGlobe, label: t('members.location'), value: [data.country, data.city].filter(Boolean).join(" / ") },
        ],
    ]

    const tabs = [
        { key: 'plans', icon: faFileContract, label: t('members.plansTab') },
        { key: 'information', icon: faCircleInfo, label: t('members.informationTab') },
        { key: 'notes', icon: faNoteSticky, label: t('members.notesTab') },
        { key: 'purchases', icon: faCartShopping, label: t('members.purchasesTab') },
    ]

	return <>
        {confirmModal}
        <Header
            title={<div className="flex items-start gap-2">
                <h1 className="text-2xl font-bold">{data.fname} {data.sname}</h1>
                <div className="flex gap-2 pt-2">
                    <div className="badge badge-lg badge-info">
                        {t('members.member')}
                    </div>
                </div>
            </div>}
            containerClass={"flex justify-between"}
            actions={<div className="flex gap-2">
                {user.permissions.includes('view members') && (
                    <button onClick={handleExport} className="btn btn-sm btn-outline">
                        <FontAwesomeIcon icon={faDownload} /> <span className="hidden sm:inline">{t('members.exportData')}</span>
                    </button>
                )}
                {user.permissions.includes('delete members') && (
                    <button onClick={handleErase} className="btn btn-sm btn-outline btn-error">
                        <FontAwesomeIcon icon={faUserSlash} /> <span className="hidden sm:inline">{t('members.eraseData')}</span>
                    </button>
                )}
            </div>}
        />
        <div className="space-y-4 mt-4">
            <div className="card bg-base-100 border border-base-200 shadow-sm">
                <div className="card-body">
                    <div className="flex flex-col lg:flex-row items-center gap-8">
                        <div className="flex-shrink-0">
                            {data.file?.url ? (
                                <img src={fileUrl(data.file?.url)} alt={`${data.fname ?? ''} ${data.sname ?? ''}`} className="w-36 h-36 rounded-full object-cover border-4 border-base-200" />
                            ) : (
                                <div className="w-36 h-36 rounded-full border-4 border-base-200 bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                    <span className="text-4xl font-bold text-white">
                                        {data.fname?.[0]}{data.sname?.[0]}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 w-full">
                            {contactRows.map((column, i) => (
                                <div key={i} className="space-y-1">
                                    {column.map((row, j) => (
                                        <div key={j} className={`flex justify-between items-center gap-4 py-3 ${j < column.length - 1 ? 'border-b border-base-200' : ''}`}>
                                            <div className="flex items-center gap-3 shrink-0">
                                                <FontAwesomeIcon icon={row.icon} className="w-5 text-base-content/50" />
                                                <span className="font-semibold text-base-content/70">{row.label}</span>
                                            </div>
                                            <span className="text-end break-all">{row.value}</span>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-b border-base-200 overflow-x-auto">
                <div className="flex justify-center min-w-max gap-8 px-4">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => {
                                store.set(validationErrors, {})
                                setClicked(tab.key)
                            }}
                            className={`flex items-center py-3 px-4 border-b-2 transition-colors flex-shrink-0 ${clicked === tab.key ? 'border-primary text-primary font-semibold' : 'border-transparent text-base-content/60 hover:text-base-content'}`}
                        >
                            <FontAwesomeIcon icon={tab.icon} className="me-2" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {clicked === "plans" && <PlansTab data={{memberPlans: data.member_plans, plans: plans, memberID: member_id}} />}
            {clicked === "information" && <InfoTab data={data} />}
            {clicked === "notes" && <NotesTab data={data} />}
            {clicked === "purchases" && <InvoicesTab data={data.invoices} />}
        </div>
    </>
}
