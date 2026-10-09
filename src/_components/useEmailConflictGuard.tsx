"use client"

import { useRouter } from "next/navigation"
import { useTranslation } from "next-i18next"
import { useConfirm } from "@/_components/useConfirm"
import { checkEmailPublic, checkEmailStaff } from "@/_utils/emailConflict"

/**
 * Reusable "this email already belongs to an account" guard for every
 * account-creating form. Call `guard(email, mode, authed)` before submitting:
 *  - returns true  → no conflict (or the user confirmed) → proceed.
 *  - returns false → stop the submit (user cancelled, or was sent to log in).
 *
 * mode 'login' → register / owner signup (offers to log in instead).
 * mode 'link'  → staff add member/staff/user + public application (link to existing).
 * `authed` picks the richer staff check (returns the account holder's name).
 *
 * Render the returned `emailConflictModal` in the form.
 */
export function useEmailConflictGuard() {
	const router = useRouter()
	const { t } = useTranslation('common')
	const { confirm, confirmModal } = useConfirm()

	const guard = async (email: string, mode: 'login' | 'link', authed = false): Promise<boolean> => {
		if (!email) return true
		const res = authed ? await checkEmailStaff(email) : await checkEmailPublic(email)
		if (!res?.exists) return true

		if (mode === 'login') {
			if (await confirm(t('emailConflict.loginPrompt')))
				router.push(`/login?email=${encodeURIComponent(email)}`)
			return false
		}

		const name = (res as any).name
		return await confirm(name ? t('emailConflict.linkPromptNamed', { name }) : t('emailConflict.linkPrompt'))
	}

	return { guard, emailConflictModal: confirmModal }
}
