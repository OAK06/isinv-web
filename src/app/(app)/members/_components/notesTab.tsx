import { FormEvent, useState } from "react"
import { addMemberNote, deleteMemberNote } from "@/app/(app)/members/_member"
import { useAtom } from "jotai"
import { branch, responseMessage, store, validationErrors } from "@/_state/globalStore"
import { useRouter } from "next/navigation"
import InputError from "@/_components/inputError"
import { useTranslation } from "next-i18next"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faDownload, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons"
import { scrollToFirstInvalidElement, validateForm } from "@/app/_helpers/validation"
import { useAuth } from "@/hooks/auth"

export default function NotesTab({data, className}: {data?: any, className?: string}) {
    const { t } = useTranslation('common')
    const [ branchID ] = useAtom(branch)
    const router = useRouter()
	const [isSubmitting , setIsSubmitting] = useState(false)
	const [validErrors] = useAtom(validationErrors)
    const { user } = useAuth()
    
    const hadelDelete = async (id: number, i: number) => {
        await deleteMemberNote(id).then((response) => {
            if(response.status === 'success') {
                data.member_notes.splice(i, 1)
                router.refresh()
            }
            
			store.set(responseMessage, { type: 'success', text: t('members.memberNoteDeletedMessage') });
        })
    }

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
		await addMemberNote(formData).then(() => {
			window.location.reload();
			store.set(responseMessage, { type: 'success', text: t('members.memberNoteCreatedMessage') });
		})
		.catch(() => setIsSubmitting(false))
	}

    return <div className={className}>
        <div className="space-y-4">
            {data.member_notes?.map((memberNote: any, index: number) => (
                <div key={index} className="card bg-base-100 border border-base-200 shadow-sm">
                    <div className="card-body">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-base-content mb-1">{memberNote.title}</h3>
                                <div className="flex items-center gap-4 text-sm text-base-content/60">
                                    <span>{new Date(memberNote.created_at).toLocaleDateString()}</span>
                                    <span>•</span>
                                    <span>{t('members.createdBy')}: <span className="font-medium">{memberNote.created_by?.name}</span></span>
                                </div>
                            </div>
                            {user.permissions.includes('delete memberNotes') &&
                                <button className="btn btn-sm btn-error btn-outline ml-4" onClick={() => hadelDelete(memberNote.id, index)}>
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
                            }
                        </div>

                        {memberNote.description && (
                            <div className="text-base-content/70 mb-4 min-h-20 max-h-32 overflow-y-auto">
                                {memberNote.description}
                            </div>
                        )}

                        {memberNote.files?.length > 0 && (
                            <div className="border-t pt-3">
                                <div className="flex flex-wrap gap-2">
                                    {memberNote.files?.map((file: any) => (
                                        <a 
                                            key={file.id}
                                            href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/download/file/${file.id}`}
                                            className="btn btn-sm btn-outline btn-primary flex items-center gap-2"
                                        >
                                            <FontAwesomeIcon icon={faDownload} />
                                            <span className="text-xs max-w-32 truncate">{file.original_name}</span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>

        <div className="card-actions justify-center mt-6">
            <label htmlFor="add_note_modal" className="btn btn-sm btn-primary">
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                {t('members.addNoteBtn')}
            </label>

            <input type="checkbox" id="add_note_modal" className="modal-toggle" />
            <div className="modal" role="dialog">
                <div className="modal-box">
                    <form onSubmit={formSubmit} encType="multipart/form-data">
                        <div className="text-lg text-bold mb-4">{t('members.noteFormTitle')}</div>
                        <div className="grid gap-2 grid-cols-1 mb-3">
                            <input hidden name="branch_id" value={branchID} />
                            <input hidden name="member_id" value={data.id} />
                            <div className="">
                                <label className="label justify-start label-text required">{t('members.title')}</label>
                                <input name="title" data-rules="required" type="text" className="input input-bordered input-sm w-full" />
                                <InputError messages={validErrors.title} />
                            </div>
                            <div className="">
                                <label className="label justify-start label-text required">{t('members.description')}</label>
                                <textarea name="description" data-rules="required" className="textarea input-bordered w-full min-h-40"></textarea>
                                <InputError messages={validErrors.description} />
                            </div>
                            <div className="">
                                <label className="label justify-start label-text">{t('members.files')}</label>
                                <input name="files[]" type="file" className="input input-bordered input-sm w-full" multiple />
                                <InputError messages={validErrors.files} />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 justify-items-end mt-5">
                            <button className="btn btn-sm btn-primary w-fit" type="submit" disabled={isSubmitting}>{isSubmitting && <span className="loading loading-spinner"></span>}{t('members.notesTabFormBtn')}</button>
                        </div>
                    </form>
                </div>
                <label className="modal-backdrop" htmlFor="add_note_modal">Close</label>
            </div>
        </div>
    </div>
}