"use client"

import { useAuth } from "@/hooks/auth"
import { useTranslation } from "next-i18next"
import { useEffect, useState } from "react"
import { useAtom } from "jotai"
import Link from "next/link"
import { branch } from "@/_state/globalStore"
import Loading from "@/app/(app)/_components/loading"
import Header from "@/app/(app)/_components/header"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCheckCircle, faDumbbell, faShieldHalved } from "@fortawesome/free-solid-svg-icons"
import { getBranch, getMyDashboardCards } from "./_dashboard"
import { SMALL_CARD_REGISTRY, WIDE_CARD_REGISTRY } from "./_cards"

export default function Dashboard() {
	const { t } = useTranslation("common")
	const { user } = useAuth({ middleware: "auth" })
	const [branchID] = useAtom(branch)
	const [cards, setCards] = useState<string[] | null>(null)
	const [onboardingSteps, setOnboardingSteps] = useState<any>({})

	const isOwner = user?.permissions?.includes("view owner dashboard")

	useEffect(() => {
		if (!branchID || branchID === -1) return
		getMyDashboardCards(branchID).then(setCards)
		if (isOwner) getBranch(branchID).then((r: any) => setOnboardingSteps(r.response?.onboarding_steps || {}))
	}, [branchID, isOwner])

	if (!user) return <Loading />

	const steps = Object.entries(onboardingSteps || {})
	const completedSteps = steps.filter(([, value]) => value === true)
	// Per-user security nudge: prompt owners to turn on 2FA (links to the profile page).
	const mfaNeeded = isOwner && !user.two_factor_enabled
	const onboardingRoutes: any = { added_staff: "/staff/add", created_plan: "/plans/add", created_class: "/classes/add", invited_member: "/members/add" }
	const onboardingTitles: any = {
		added_staff: t("onboarding.addedStaff"), created_plan: t("onboarding.createdPlan"),
		created_class: t("onboarding.createdClass"), invited_member: t("onboarding.invitedMember"),
	}

	// Render in registry order (stable), only the cards this user's roles enable.
	const activeSmallCards = cards ? Object.keys(SMALL_CARD_REGISTRY).filter(k => cards.includes(k)) : []
	const activeWideCards = cards ? Object.keys(WIDE_CARD_REGISTRY).filter(k => cards.includes(k)) : []

	return <>
		<Header
			title={
				<div>
					<h1 className="text-2xl font-bold text-base-content">{t("ownerDashboard.mainTitle")}</h1>
					<p className="text-base-content/60 text-lg font-normal">{t("ownerDashboard.subTitle1")} {user.name}. {t("ownerDashboard.subTitle2")}</p>
				</div>
			}
			containerClass="flex justify-between items-start"
		/>

		{isOwner && (mfaNeeded || (steps.length > 0 && completedSteps.length < steps.length)) && (
			<div className="card mt-6 border border-base-200 shadow-sm bg-base-100">
				<div className="card-body">
					<h2 className="card-title text-xl mb-4">
						<div className="w-1 h-6 bg-primary rounded me-2"></div>
						{t("onboarding.title")}
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
						{/* Security first: prompt to enable 2FA → profile page (where the 2FA card lives). */}
						{mfaNeeded && (
							<Link href="/profile">
								<div className="card bg-base-100 border border-accent/50 p-4 flex-row items-center gap-2 transition-colors hover:border-accent">
									<div className="min-w-10 min-h-10 rounded-full flex items-center justify-center bg-accent/10 text-accent shrink-0">
										<FontAwesomeIcon icon={faShieldHalved} className="text-xl" />
									</div>
									<div>
										<p className="text-lg font-semibold">{t("onboarding.enableMfa")}</p>
										<p className="text-xs text-base-content/60">{t("onboarding.enableMfaHint")}</p>
									</div>
								</div>
							</Link>
						)}
						{steps.map(([key, value], j) => {
							const completed = value === true
							const content = (
								<div className={`card ${completed ? "bg-base-200" : "bg-base-100"} border border-base-200 p-4 flex-row items-center gap-2 transition-colors hover:border-primary/40`}>
									<div className={`min-w-10 min-h-10 rounded-full flex items-center justify-center ${!completed ? "border border-base-300 text-base-content/60" : ""}`}>
										{!completed ? <span className="text-xl">{j + 1}</span> : <FontAwesomeIcon icon={faCheckCircle} className="text-4xl text-success" />}
									</div>
									<div><p className="text-lg font-semibold">{onboardingTitles[key as string]}</p></div>
								</div>
							)
							return <div key={j}>{!completed ? <Link href={onboardingRoutes[key as string]}>{content}</Link> : content}</div>
						})}
					</div>
					<progress className="progress progress-primary mt-2" value={completedSteps.length} max={steps.length}></progress>
					<div className="text-lg mt-2">{completedSteps.length} / {steps.length} {t("completed")}</div>
				</div>
			</div>
		)}

		{cards === null ? (
			<div className="mt-6 flex justify-center py-16"><span className="loading loading-spinner loading-lg text-primary"></span></div>
		) : activeSmallCards.length === 0 && activeWideCards.length === 0 ? (
			<div className="py-12 px-4">
				<div className="max-w-2xl mx-auto card bg-base-100 border border-base-200 shadow-sm">
					<div className="card-body items-center text-center gap-3">
						<div className="bg-primary/10 text-primary rounded-2xl w-16 h-16 flex items-center justify-center">
							<FontAwesomeIcon icon={faDumbbell} className="text-2xl" />
						</div>
						<h2 className="text-xl font-bold">{user.name}</h2>
						<p className="text-base-content/60">{t("mainDashboard.loggedIn")}</p>
					</div>
				</div>
			</div>
		) : (
			<>
				<div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
					{activeSmallCards.map(key => {
						const { Component } = SMALL_CARD_REGISTRY[key]
						return <div key={key} ><Component branchID={branchID} /></div>
					})}
				</div>
				<div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
					{activeWideCards.map(key => {
						const { Component } = WIDE_CARD_REGISTRY[key]
						return <div key={key} className={"sm:col-span-2"}><Component branchID={branchID} /></div>
					})}
				</div>
			</>
		)}
	</>
}
