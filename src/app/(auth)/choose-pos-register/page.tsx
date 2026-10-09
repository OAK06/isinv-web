"use client"

import { useAtom, useSetAtom } from "jotai"
import { useAuth } from "@/hooks/auth"
import { useRouter } from "next/navigation"
import { FormEvent, useEffect, useState } from "react"
import { activePosSession, branch, posRegister, responseMessage, store } from "@/_state/globalStore"

import Loading from "@/app/(app)/_components/loading"
import { useTranslation } from "next-i18next"
import MessageModal from "@/_components/messageModal"

export default function ChoosePosRegister() {
    const { t } = useTranslation('common')
	const router = useRouter()
    const [posRegisterID, setPosRegisterID] = useAtom(posRegister)
	const setActivePosSessionID = useSetAtom(activePosSession)
	const [ branchID ] = useAtom(branch)
	const { user } = useAuth({ middleware: "auth" })	
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [userPosRegisters, setUserPosRegisters] = useState<any>([])
	
	useEffect(() => {
        if (!user) return
        if (!user.pos_registers?.length) {
            router.replace('/choose-branch')
            return
        }
        setUserPosRegisters(user.pos_registers)
	}, [user])

	const setAtoms = async (selectedRegister: any) => {
		setPosRegisterID(selectedRegister.id)
        setActivePosSessionID(selectedRegister.active_session?.id)
	}

    // Skip the manual picker when there's only one register to choose from
    // (always true right after self-onboarding, which provisions exactly one
    // default register) — auto-select it exactly like submitting the form
    // would, then continue straight to the dashboard.
    useEffect(() => {
        if (userPosRegisters.length === 1) {
            setAtoms(userPosRegisters[0]).then(() => router.replace('/dashboard'))
        }
    }, [userPosRegisters])

	const submitForm = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()		
		const selectedRegister = userPosRegisters.find((register: any) => register.id == event.currentTarget.pos_register_id.value)
		if (!selectedRegister)
            return store.set(responseMessage, { type: 'alert', text: t('choosePosRegister.selectPosAlert') });
        
 		setIsSubmitting(true)
        await setAtoms(selectedRegister).then(() => {
            router.push('/dashboard')
        }).catch(() => setIsSubmitting(false))
	}

    // Same as choose-branch: keep the spinner up through the whole
    // auto-select + redirect window, only ever showing the form for a
    // genuine choice (2+ registers).
	if (!user) return <Loading />
    if (branchID === -1) {
        router.replace('/choose-branch')
        return <Loading />
    }
    if (userPosRegisters.length <= 1) return <Loading />

	return <>
        <MessageModal />
		<form onSubmit={submitForm} className="space-y-4">
			<h1 className="text-lg font-bold text-center">
				{t('choosePosRegister.title')}
			</h1>
			<div>
				<select name="pos_register_id" className="select select-bordered w-full" defaultValue={userPosRegisters[0]?.id}>
					{userPosRegisters?.map((register: any) => {
						return <option key={register.id} value={register.id}>{register.name}</option>
					})}
				</select>
			</div>
			<div className="grid grid-cols-1 justify-items-center">
				<button type="submit" className="btn btn-primary rounded-full w-fit" disabled={!userPosRegisters.length || branchID === -1 || isSubmitting}>
					{isSubmitting && <span className="loading loading-spinner"></span>}
					{t('choosePosRegister.formBtn')}
				</button>
			</div>
		</form>
	</>
}