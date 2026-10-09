import axios from "@/lib/axios"

// Non-/api web route, same origin/session flow as /login (see hooks/auth.ts) —
// called mid-login when useAuth's `login` sees `{ two_factor: true }` instead
// of a session being established outright. 204 on success, 422 on bad code.
export async function twoFactorChallenge(data: { code?: string; recovery_code?: string }) {
	return await axios.post(`/two-factor-challenge`, data)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function enableTwoFactor() {
	return await axios.post(`/api/user/two-factor/enable`, {}, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function confirmTwoFactor(code: string) {
	return await axios.post(`/api/user/two-factor/confirm`, { code }, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function disableTwoFactor(password: string) {
	return await axios.delete(`/api/user/two-factor`, {
			data: { password },
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function getRecoveryCodes() {
	return await axios.get(`/api/user/two-factor/recovery-codes`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function regenerateRecoveryCodes() {
	return await axios.post(`/api/user/two-factor/recovery-codes`, {}, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}
