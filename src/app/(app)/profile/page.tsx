"use client"

import { useRouter } from "next/navigation"
import PasswordInput from "@/_components/passwordInput"
import { fileUrl } from "@/_utils/fileUrl"
import { FormEvent, useEffect, useState } from "react"

import { editProfile, managePaymentMethods, getPaymentMethods } from "@/app/(app)/profile/_profile"
import { useAtom } from "jotai"
import { branch, branch_settings, responseMessage, store, validationErrors } from "@/_state/globalStore"
import InputError from "@/_components/inputError"
import PhoneInput from "@/_components/phoneInput"
import { validateEmail, validatePassword } from "@/app/(auth)/_helpers/validation"
import { useTranslation } from "next-i18next"
import Header from "@/app/(app)/_components/header"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCreditCard, faInbox } from "@fortawesome/free-solid-svg-icons"
import { useAuth } from "@/hooks/auth"
import TwoFactorSection from "@/app/(app)/profile/_components/twoFactorSection"

export default function Profile() {
    const { t } = useTranslation('common')
	const router = useRouter()
	const [data, setData] = useState<any>([])
	const [isSubmitting , setIsSubmitting] = useState(false)
	const [isRedirecting , setIsRedirecting] = useState(false)
	const [validErrors] = useAtom(validationErrors)
	const [photoUrl, setPhotoUrl] = useState("")
	const [email, setEmail] = useState("")
	const [birthDate, setBirthDate] = useState("")
	const [currentPassword, setCurrentPassword] = useState("")
	const [password, setPassword] = useState("")
	const [passwordConfirmation, setPasswordConfirmation] = useState("")
	const [errors, setErrors] = useState<any>({})
	const [paymentMethods, setPaymentMethods] = useState<any>([])
    const [branchSettings] = useAtom(branch_settings)
    const [ branchID ] = useAtom(branch)
    const { user, mutate } = useAuth()

	useEffect(() => {
        if (!user) return

        setData(user)
        setEmail(user.email)
        setBirthDate(user.birth_date ?? "")
        if (user.photo?.url)
            setPhotoUrl(fileUrl(user.photo?.url))
	}, [user])

    useEffect(() => {
        if (!data.member_profile) return

		getPaymentMethods(branchID, data.member_profile.id).then((returnData: any) => {
			setPaymentMethods(returnData.response)
		})
	}, [data])
	
	const previewImage = () => {
		const fileInput: any = document.getElementById("profilePicInput");
		if (fileInput.files && fileInput.files[0]) {
			const reader = new FileReader();
			reader.onload = function (e) {
				setPhotoUrl(String(e.target.result))
			};
			reader.readAsDataURL(fileInput.files[0]);
		}
	}

	const formSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const formData = new FormData(event.currentTarget)
		if (validateEmail(email))
			setErrors({ email: [`${t('invalidEmail')}`] })
		else if (validatePassword(password, passwordConfirmation))
			setErrors({ password: [`${t('invalidPasswordConfirmation')}`] })
		else {
			setIsSubmitting(true)
			await editProfile(formData).then((response) => {
				setIsSubmitting(false)
				setCurrentPassword('')
				setPassword('')
				setPasswordConfirmation('')
				setErrors({})
				// Revalidate the SWR user so the new photo (and email) show across
				// the app (navbar, etc.) without a hard refresh.
				mutate()
				store.set(responseMessage, { type: 'success', text: `${t('profiles.updatedMessage')}` });
			})
			.catch(() => setIsSubmitting(false))
		}
	}

    const handlePaymentMethods = async () => {
        const paymentMethodData = {
            branch_id: branchID,
            member_id: data.member_profile?.id,
            name: data.member_profile?.fullname,
            email: data.member_profile?.email,
            return_url: window.location.href
        }
        
        setIsRedirecting(true)
        await managePaymentMethods(paymentMethodData).then((returnData) => {
            router.push(returnData.response.url)
            setIsRedirecting(false)
        })
        .catch(() => setIsRedirecting(false))
    }

	return <>
		<Header
			title={t('profiles.title')}
			containerClass={"flex justify-between"}
		/>
		<div className="mt-6 card bg-base-100 border border-base-200 shadow-sm">
			<div className="card-body">	
				<form onSubmit={formSubmit} encType="multipart/form-data">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
						<div className="lg:col-span-2">
							<div className="flex flex-col sm:flex-row items-center gap-6">
								<div className="flex-shrink-0">
									{photoUrl ? (
										<img src={photoUrl} alt="Profile Image" className="w-36 h-36 rounded-full object-cover border-4 border-base-200" />
									) : (
										<div className="w-36 h-36 rounded-full border-4 border-base-200 bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
											<span className="text-4xl font-bold text-white">
												{data.name?.[0]}
											</span>
										</div>
									)}
								</div>

								<div className="flex-1">
									<label className="label justify-start mb-2">
										<span className="label-text font-semibold">{t('profiles.profilePicture')}</span>
									</label>
									<label htmlFor="profilePicInput" className="btn btn-sm btn-outline cursor-pointer">
										{t('profiles.uploadPhoto')}
									</label>
									<input name="photo_id" type="file" accept="image/*" className="hidden" id="profilePicInput" onChange={previewImage} />
									<InputError messages={validErrors.photo_id} />
								</div>
							</div>
						</div>
						
						<div className="lg:col-span-2">
							<label className="label justify-start">
								<span className="label-text font-semibold required">{t('profiles.email')}</span>
							</label>
							<input
								name="email"
								type="text"
								className={"input input-bordered input-sm w-full" + (errors.email ? " input-error" : "")}
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
							<InputError messages={[errors.email, validErrors.email]} />
						</div>

						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('profiles.birthDate')}</span>
							</label>
							<input name="birth_date" type="date" className="input input-bordered input-sm w-full" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
							<InputError messages={validErrors.birth_date} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('profiles.mobilePhone')}</span>
							</label>
							<PhoneInput name="mobile_phone" key={`phone-${data.id ?? 'new'}`} defaultValue={data.mobile_phone} />
							<InputError messages={validErrors.mobile_phone} />
						</div>

						<div className="lg:col-span-2 mt-4">
							<h3 className="text-lg font-semibold mb-4">{t('profiles.passwordChange')}</h3>
						</div>
						<div className="lg:col-span-2">
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('profiles.currentPassword')}</span>
							</label>
							<PasswordInput 
								name="current_password" 
								value={currentPassword}
								 
								className="input input-bordered input-sm w-full" 
								onChange={e => setCurrentPassword(e.target.value)}
							/>	
							<InputError messages={validErrors.current_password} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('profiles.newPassword')}</span>
							</label>
							<PasswordInput 
								name="password" 
								value={password}
								 
								className="input input-bordered input-sm w-full" 
								onChange={e => setPassword(e.target.value)}
							/>	
							<InputError messages={[errors.password, validErrors.password]} />
						</div>
						<div>
							<label className="label justify-start">
								<span className="label-text font-semibold">{t('profiles.confirmNewPassword')}</span>
							</label>
							<PasswordInput 
								name="confirm-password" 
								value={passwordConfirmation}
								 
								className="input input-bordered input-sm w-full" 
								onChange={e => setPasswordConfirmation(e.target.value)}
							/>
							{passwordConfirmation && password !== passwordConfirmation && (
								<span className="text-xs text-error">{t('invalidPasswordConfirmation')}</span>
							)}
						</div>
					</div>
					
					<div className="card-actions justify-end mt-6">
						<button className="btn btn-primary" type="submit" disabled={isSubmitting || isRedirecting || (password && password !== passwordConfirmation)}>
							{isSubmitting && <span className="loading loading-spinner"></span>}
							{t('profiles.submitBtn')}
						</button>
					</div>
				</form>
			</div>
		</div>

		<div className="mt-6">
			<TwoFactorSection user={user} mutate={mutate} />
		</div>

        {data.member_profile && branchSettings?.includes("online_payments") &&
            
        <div className="mt-6 card bg-base-100 border border-base-200 shadow-sm">
			<div className="card-body">	
                <div className="grid grid-cols-1 gap-4">                    
                    <div className="flex justify-between">
                        <h3 className="text-lg font-semibold mb-4">{t('profiles.paymentMethodsTitle')}</h3>

                        <button className="btn btn-sm btn-primary" onClick={handlePaymentMethods} disabled={isSubmitting || isRedirecting || (password && password !== passwordConfirmation)}>
							{isRedirecting && <span className="loading loading-spinner"></span>}
							{t('profiles.manageMethodsBtn')}
						</button>
                    </div>
                    {(paymentMethods.length === 0) && (
                        <div className="text-center py-12 text-base-content/60">
                            <FontAwesomeIcon icon={faInbox} className="text-4xl mb-3 opacity-50" />
                            <div className="text-lg">{t('profiles.noCards')}</div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {paymentMethods.map((pm: any) => (
                        <div key={pm.id} className="bg-base-100 shadow-lg rounded-xl p-5 border border-base-300 relative">
                            <div className="flex gap-2 absolute top-5 end-5">
                                {pm.is_default === "true" && (
                                    <div className="badge badge-primary">{t('profiles.default')}</div>
                                )}
                                <div className={`badge ${Number(pm.status) === 1 ? 'badge-success' : 'badge-error'}`}>
                                    {Number(pm.status) === 1 ? t('active') : t('inactive')}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-base-200 p-3 rounded-full">
                                    <FontAwesomeIcon icon={faCreditCard} className="w-6 h-6" />
                                </div>

                                <div>
                                    <h3 className="font-bold uppercase">
                                        {pm.card_brand}
                                    </h3>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="opacity-70">{t('profiles.cardNumber')}</span>
                                    <span className="font-semibold">
                                        **** **** **** {pm.last_four}
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="opacity-70">{t('profiles.expires')}</span>
                                    <span className="font-semibold">
                                        {pm.exp_month}/{pm.exp_year}
                                    </span>
                                </div>
                            </div>

                        </div>
                        ))}
                    </div>
                </div>
			</div>
		</div>
        }
	</>
}