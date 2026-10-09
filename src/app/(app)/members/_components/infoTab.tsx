import { FormEvent, useState } from "react"
import PhoneInput from "@/_components/phoneInput"
import { editMember, Member } from "@/app/(app)/members/_member"
import { useRouter } from "next/navigation"
import { responseMessage, store, validationErrors } from "@/_state/globalStore"
import { useAtom } from "jotai"
import InputError from "@/_components/inputError"
import { useTranslation } from "next-i18next"
import { scrollToFirstInvalidElement, validateForm } from "@/app/_helpers/validation"

export default function InfoTab({data, className}: {data?: Member, className?: string}) {
    const { t } = useTranslation('common')
    const router = useRouter()
	const [isSubmitting , setIsSubmitting] = useState(false)
	const [validErrors] = useAtom(validationErrors)
	const [status , setStatus] = useState(data.status)

    const formSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const form = event.currentTarget
        const {errors, firstInvalidElement} = validateForm(form, t)
        if (Object.keys(errors).length > 0) {
            store.set(validationErrors, errors)
            if (firstInvalidElement) scrollToFirstInvalidElement(firstInvalidElement)
            return
        }

        const formData = new FormData(form)
		setIsSubmitting(true)
		await editMember(data.id, formData).then((response) => {
			router.refresh()
            setIsSubmitting(false)
			store.set(responseMessage, { type: 'success', text: t('members.updatedMessage') });
		})
		.catch(() => setIsSubmitting(false))
	}

     return <form onSubmit={formSubmit} className={className}>
        <div className="card bg-base-100 border border-base-200 shadow-sm">
            <div className="card-body">
                <h2 className="card-title text-xl mb-4">
                    <div className="w-1 h-6 bg-primary rounded me-2"></div>
                    {t('members.personalInfo')}
                </h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                        <label className="label justify-start">
                            <span className="label-text font-semibold required">{t('members.fname')}</span>
                        </label>
                        <input name="fname" data-rules="required" type="text" className="input input-bordered input-sm w-full" defaultValue={data.fname} />
                        <InputError messages={validErrors.fname} />
                    </div>
                    <div>
                        <label className="label justify-start">
                            <span className="label-text font-semibold required">{t('members.sname')}</span>
                        </label>
                        <input name="sname" data-rules="required" type="text" className="input input-bordered input-sm w-full" defaultValue={data.sname} />
                        <InputError messages={validErrors.sname} />
                    </div>
                    <div>
                        <label className="label justify-start">
                            <span className="label-text font-semibold required">{t('members.gender')}</span>
                        </label>
                        <select name="gender" data-rules="required" className="select select-sm select-bordered w-full">
                            <option value={""} disabled>{t('chooseOption')}</option>
                            <option value={"M"} selected={data.gender === "M"}>{t('male')}</option>
                            <option value={"F"} selected={data.gender === "F"}>{t('female')}</option>
                            <option value={"O"} selected={data.gender === "O"}>{t('other')}</option>
                        </select>
                        <InputError messages={validErrors.gender} />
                    </div>
                    <div>
                        <label className="label justify-start">
                            <span className="label-text font-semibold required">{t('members.mobilePhone')}</span>
                        </label>
                        <PhoneInput name="mobile_phone" rules="required" size="sm" defaultValue={data.mobile_phone} />
                        <InputError messages={validErrors.mobile_phone} />
                    </div>
                    <div>
                        <label className="label justify-start">
                            <span className="label-text font-semibold">{t('members.homePhone')}</span>
                        </label>
                        <PhoneInput name="home_phone" size="sm" defaultValue={data.home_phone} />
                        <InputError messages={validErrors.home_phone} />
                    </div>
                    <div>
                        <label className="label justify-start">
                            <span className="label-text font-semibold required">{t('members.birthDate')}</span>
                        </label>
                        <input name="birth_date" data-rules="required" type="date" className="input input-bordered input-sm w-full" defaultValue={data.birth_date} />
                        <InputError messages={validErrors.birth_date} />
                    </div>
                    <div>
                        <label className="label justify-start">
                            <span className="label-text font-semibold required">{t('members.email')}</span>
                        </label>
                        <input name="email" data-rules="required|email" type="text" className="input input-bordered input-sm w-full" defaultValue={data.email} />
                        <InputError messages={validErrors.email} />
                    </div>
                    <div>
                        <label className="label justify-start">
                            <span className="label-text font-semibold">{t('members.address')}</span>
                        </label>
                        <input name="address" type="text" className="input input-bordered input-sm w-full" defaultValue={data.address} />
                        <InputError messages={validErrors.address} />
                    </div>
                    <div>
                        <label className="label justify-start">
                            <span className="label-text font-semibold">{t('members.city')}</span>
                        </label>
                        <input name="city" type="text" className="input input-bordered input-sm w-full" defaultValue={data.city} />
                        <InputError messages={validErrors.city} />
                    </div>
                    <div>
                        <label className="label justify-start">
                            <span className="label-text font-semibold">{t('members.country')}</span>
                        </label>
                        <input name="country" type="text" className="input input-bordered input-sm w-full" defaultValue={data.country} />
                        <InputError messages={validErrors.country} />
                    </div>
                    <div>
                        <label className="label justify-start">
                            <span className="label-text font-semibold">{t('members.medications')}</span>
                        </label>
                        <input name="medications" type="text" className="input input-bordered input-sm w-full" defaultValue={data.medications} />
                        <InputError messages={validErrors.medications} />
                    </div>
                    <div>
                        <label className="label justify-start">
                            <span className="label-text font-semibold">{t('members.notes')}</span>
                        </label>
                        <input name="notes" type="text" className="input input-bordered input-sm w-full" defaultValue={data.notes} />
                        <InputError messages={validErrors.notes} />
                    </div>
                </div>

                <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">{t('members.emergencyContact')}</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                            <label className="label justify-start">
                                <span className="label-text font-semibold">{t('members.emgContactRelation')}</span>
                            </label>
                            <input name="emg_contact_relation" type="text" className="input input-bordered input-sm w-full" defaultValue={data.emg_contact_relation} />
                            <InputError messages={validErrors.emg_contact_relation} />
                        </div>
                        <div>
                            <label className="label justify-start">
                                <span className="label-text font-semibold">{t('members.emgContactName')}</span>
                            </label>
                            <input name="emg_contact_name" type="text" className="input input-bordered input-sm w-full" defaultValue={data.emg_contact_name} />
                            <InputError messages={validErrors.emg_contact_name} />
                        </div>
                        <div>
                            <label className="label justify-start">
                                <span className="label-text font-semibold">{t('members.emgContactMobileNumber')}</span>
                            </label>
                            <PhoneInput name="emg_contact_mobilenumber" size="sm" defaultValue={data.emg_contact_mobilenumber} />
                            <InputError messages={validErrors.emg_contact_mobilenumber} />
                        </div>
                        <div>
                            <label className="label justify-start">
                                <span className="label-text font-semibold">{t('members.emgContactEmail')}</span>
                            </label>
                            <input name="emg_contact_email" type="email" className="input input-bordered input-sm w-full" defaultValue={data.emg_contact_email} />
                            <InputError messages={validErrors.emg_contact_email} />
                        </div>
                        <div>
                            <label className="label justify-start">
                                <span className="label-text font-semibold">{t('members.emgContactAddress')}</span>
                            </label>
                            <input name="emg_contact_address" type="text" className="input input-bordered input-sm w-full" defaultValue={data.emg_contact_address} />
                            <InputError messages={validErrors.emg_contact_address} />
                        </div>
                        <div>
                            <label className="label justify-start">
                                <span className="label-text font-semibold">{t('members.emgContactCity')}</span>
                            </label>
                            <input name="emg_contact_city" type="text" className="input input-bordered input-sm w-full" defaultValue={data.emg_contact_city} />
                            <InputError messages={validErrors.emg_contact_city} />
                        </div>
                        <div>
                            <label className="label justify-start">
                                <span className="label-text font-semibold">{t('members.emgContactCountry')}</span>
                            </label>
                            <input name="emg_contact_country" type="text" className="input input-bordered input-sm w-full" defaultValue={data.emg_contact_country} />
                            <InputError messages={validErrors.emg_contact_country} />
                        </div>
                    </div>
                </div>

                <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">{t('members.additionalInfo')}</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                            <label className="label justify-start">
                                <span className="label-text font-semibold required">{t('members.blockBooking')}</span>
                            </label>
                            <select name="block_booking" data-rules="required" className="select select-sm select-bordered w-full" defaultValue={data.block_booking}>
                                <option value={""}>{t('chooseOption')}</option>
                                <option value={"true"}>{t('yes')}</option>
                                <option value={"false"}>{t('no')}</option>
                            </select>
                            <InputError messages={validErrors.block_booking} />
                        </div>
                        <div>
                            <label className="label justify-start">
                                <span className="label-text font-semibold required">{t('members.hasHealthConditions')}</span>
                            </label>
                            <select name="has_health_conditions" data-rules="required" className="select select-sm select-bordered w-full" defaultValue={data.has_health_conditions}>
                                <option value={""}>{t('chooseOption')}</option>
                                <option value={"true"}>{t('yes')}</option>
                                <option value={"false"}>{t('no')}</option>
                            </select>
                            <InputError messages={validErrors.has_health_conditions} />
                        </div>
                        <div>
                            <label className="label justify-start">
                                <span className="label-text font-semibold">{t('members.photo')}</span>
                            </label>
                            <input name="photo_id" type="file" className="file-input file-input-bordered input-sm w-full" accept="image/*" />
                            <InputError messages={validErrors.photo_id} />
                        </div>
                        <div>
                            <label className="label justify-start">
                                <span className="label-text font-semibold required">{t('members.status')}</span>
                            </label>
                            <select name="status" data-rules="required" className="select select-sm select-bordered w-full" defaultValue={data.status} onChange={(e) => setStatus(e.target.value)}>
                                <option value={""} disabled>{t('chooseOption')}</option>
                                <option value={0}>{t('members.operational')}</option>
                                <option value={1}>{t('members.suspended')}</option>
                                <option value={2}>{t('members.blacklist')}</option>
                            </select>
                            <InputError messages={validErrors.status} />
                        </div>
                        {(status == 1 || status == 2) && 
                            <div>
                                <label className="label justify-start">
                                    <span className="label-text font-semibold required">{t('members.statusEnd')}</span>
                                </label>
                                <input name="status_end" data-rules="required" type="date" className="input input-bordered input-sm w-full" defaultValue={(data.status == 1 || data.status == 2) ? data.status_end : ''} />
                                <InputError messages={validErrors.status_end} />
                            </div>
                        }
                        <div className="lg:col-span-2">
                            <label className="label justify-start">
                                <span className="label-text font-semibold">{t('members.healthConditions')}</span>
                            </label>
                            <textarea name="health_conditions" className="textarea textarea-bordered w-full min-h-32" defaultValue={data.health_conditions}></textarea>
                            <InputError messages={validErrors.health_conditions} />
                        </div>
                    </div>
                </div>
                
                <div className="card-actions justify-end mt-6">
                    <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
                        {isSubmitting && <span className="loading loading-spinner"></span>}
                        {t('members.infoTabFormBtn')}
                    </button>
                </div>
            </div>
        </div>
    </form>
}