import axios from "@/lib/axios"

/**
 * Per-tenant custom UI translations. Company is resolved server-side from the
 * active `branch`. `X-SWR-Request` keeps the fetch silent so a failure falls
 * back to the base locale with no error toast.
 */
export async function getTranslationOverrides(branchID: number, locale: string) {
	return await axios.get(`/api/translations?branch=${branchID}&locale=${locale}`, {
			headers: { 'X-SWR-Request': true },
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function saveTranslationOverrides(branchID: number, locale: string, overrides: Record<string, string>) {
	return await axios.put(`/api/translations`, { branch: branchID, locale, overrides }, {
			headers: { 'X-Form-Request': true },
		})
		.then(res => res.data)
		.catch(error => { throw error })
}
