import useSWR from "swr"
import axios from "@/lib/axios"
import { useAtom, useSetAtom } from "jotai"
import { useEffect } from "react"
import { branch, resetAppState } from "@/_state/globalStore"
import { useParams, useRouter } from "next/navigation"
import { twoFactorChallenge as postTwoFactorChallenge } from "@/app/(app)/profile/_twoFactor"

export const useAuth = ({ middleware, redirectIfAuthenticated }: { middleware?: string, redirectIfAuthenticated?: string } = {}) => {
	const router = useRouter()
	const params = useParams()
	const [branchID, setBranchID] = useAtom(branch)
    const resetState = useSetAtom(resetAppState)

	const { data: user, error, mutate } = useSWR(
		branchID != -1 ? `/api/user?branch=${branchID}` : "/api/user",
		() =>
			axios.get(branchID != -1 ? `/api/user?branch=${branchID}` : "/api/user", {
				headers: { "X-SWR-Request": "true" }
			})
            .then(res => res.data.data)
            .catch(error => {
                if (error.response?.status !== 409) throw error
                router.push("/verify-email")
            }),
        {
            refreshInterval: 300000,
            revalidateOnFocus: middleware === "guest",
            revalidateIfStale: false
        }
	)

	const csrf = (setIsSubmitting: any) => {
        return axios.get("/sanctum/csrf-cookie").catch(() => setIsSubmitting(false))
    }

	const register = async ({ setErrors, setIsSubmitting, ...props }) => {
        setIsSubmitting(true)
		await csrf(setIsSubmitting)
		setErrors([])
		axios.post("/register", props)
			.then(() => mutate())
			.catch(error => {
                setIsSubmitting(false)
				if (error.response?.status !== 422) throw error
				setErrors(error.response.data.errors)
			})
	}

	const login = async ({ setErrors, setStatus, setIsSubmitting, onTwoFactor, ...props }) => {
        setIsSubmitting(true)
		await csrf(setIsSubmitting)
		setErrors([])
		setStatus(null)
		axios.post("/login", props)
			.then((response) => {
                // 200 + { two_factor: true } means no session yet — the login form
                // switches to the challenge step instead of completing login.
                if (response.data?.two_factor) {
                    setIsSubmitting(false)
                    onTwoFactor?.()
                } else {
                    mutate()
                }
            })
			.catch(error => {
                setIsSubmitting(false)
				if (error.response?.status !== 422) throw error
				setErrors(error.response.data.errors)
			})
	}

    // Completes login after the two_factor challenge step (code or recovery_code).
    // 204 -> session established, same completion as the normal login path; 422 -> inline error.
    const twoFactorChallenge = async ({ setErrors, setIsSubmitting, ...props }) => {
        setIsSubmitting(true)
        setErrors([])
        postTwoFactorChallenge(props)
            .then(() => mutate())
            .catch(error => {
                setIsSubmitting(false)
                if (error.response?.status !== 422) throw error
                setErrors(error.response.data.errors)
            })
    }

	const forgotPassword = async ({ setErrors, setStatus, setIsSubmitting, email }) => {
        setIsSubmitting(true)
		await csrf(setIsSubmitting)
		setErrors([])
		setStatus(null)
		axios.post("/forgot-password", { email })
			.then(response => setStatus(response.data.status))
			.catch(error => {
				if (error.response?.status !== 422) throw error
				setErrors(error.response.data.errors)
			})
            .finally(() => setIsSubmitting(false))
	}

	const resetPassword = async ({ setErrors, setStatus, setIsSubmitting, ...props }) => {
        setIsSubmitting(true)
		await csrf(setIsSubmitting)
		setErrors([])
		setStatus(null)
		axios.post("/reset-password", { token: params.token, ...props })
			.then(response => router.push("/login?reset=" + btoa(response.data.status)))
			.catch(error => {
                setIsSubmitting(false)
				if (error.response?.status !== 422) throw error
				setErrors(error.response.data.errors)
			})
	}

	const resendEmailVerification = ({ setStatus, setIsSubmitting }) => {
        setIsSubmitting(true)
		axios.post("/email/verification-notification")
			.then(response => setStatus(response.data.status))
			.catch(error => {
				if (error.response?.status !== 422) throw error
			})
            .finally(() => setIsSubmitting(false))
	}

	const logout = async () => {
		if (!error) await axios.post("/logout").then(async () => {
			await resetState()
			mutate()
		})
		// Drop the manual language choice so the visitor reverts to their IP/geo
		// default. The saved preference still lives on the account and is
		// re-applied on the next login. The full navigation below re-runs
		// middleware, which re-detects the locale by geo.
		document.cookie = "NEXT_LOCALE=; path=/; max-age=0"
		document.cookie = "LANG_MANUAL=; path=/; max-age=0"
		window.location.pathname = "/login"
	}

	useEffect(() => {
        if (user?.theme) {
            const root = window.document.documentElement
            if (user.theme === "dark") {
                root.classList.add("dark")
            } else {
                root.classList.remove("dark")
            }
        }
    }, [user?.theme])

	// Apply the user's saved language as soon as they're authenticated (covers
	// choose-branch / choose-pos-register, not just the dashboard). It's the
	// source of truth across devices: if it differs from the active cookie, set
	// it (with LANG_MANUAL so geo doesn't override) and reload so SSR, <html lang>
	// and i18n all pick it up. After the reload the cookie matches, so no loop.
	useEffect(() => {
        if (!user?.locale) return
        const current = document.cookie.match(/(?:^|; )NEXT_LOCALE=([^;]*)/)?.[1]
        if (current !== user.locale) {
            document.cookie = `NEXT_LOCALE=${user.locale}; path=/; max-age=31536000`
            document.cookie = `LANG_MANUAL=1; path=/; max-age=31536000`
            window.location.reload()
        }
    }, [user?.locale])

	useEffect(() => {
		// replace, not push: these fire automatically off auth state, not a
		// user click — landing back on a login/verify page via the browser's
		// back button only to be bounced forward again is exactly the kind of
		// phantom "switching" this avoids.
		if (middleware === "guest" && redirectIfAuthenticated && user)
			router.replace(redirectIfAuthenticated)
		if (window.location.pathname === "/verify-email" && user?.email_verified_at)
			router.replace(redirectIfAuthenticated)
		if (middleware === "auth" && error) logout()
	}, [user, error])

	return {
		user,
		register,
		login,
        twoFactorChallenge,
		forgotPassword,
		resetPassword,
		resendEmailVerification,
		logout,
        mutate
	}
}
