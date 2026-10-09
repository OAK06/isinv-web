"use client"

import { useEffect, useState} from "react"

import { getHashedApplication } from "@/app/(auth)/signup/_signup"
import { useAuth } from "@/hooks/auth"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons"
import { useTranslation } from "next-i18next"

export default function SignupSuccess({ params }: any) {
    const { t } = useTranslation('common')
	const { branch_id, application_id }: any = params
	const [app, setApp] = useState<any>({})
	const { user } = useAuth({ middleware: "guest", redirectIfAuthenticated: "/dashboard" })

	const getList = () => {
		getHashedApplication(application_id).then((returnData: any) => {
            setApp(returnData.response)
        })
	}

	useEffect(() => {
		getList()
	}, [])

	return <div className="flex flex-col items-center text-center p-5">
			<FontAwesomeIcon icon={faCircleCheck} className="text-success text-6xl mb-5"/>
			<div className="text-lg">{t('planSignup.registeredMessage', {name: app.fullname})}</div>
		</div>
}