import { requestCount, responseMessage, store, validationErrors } from "@/_state/globalStore"
import Axios from "axios"
import i18n from "@/i18n/client"
import { takeListParams } from "@/lib/listParams"

const axios = Axios.create({
	baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
	headers: {
		"X-Requested-With": "XMLHttpRequest",
	},
	withCredentials: true,
	// withXSRFToken: true
})

// In-flight page-data requests (the loading-bar GETs), so a client-side
// navigation can abort the previous page's stragglers instead of letting them
// hold the browser's per-host connection pool and delay the new page's loads.
// NOTE: axios 0.21 has NO AbortController/`signal` support — cancellation must
// go through the legacy CancelToken API or it's silently ignored.
const pendingSources = new Set<any>()

export function cancelPendingRequests() {
	pendingSources.forEach((source) => source.cancel("navigation"))
	pendingSources.clear()
}

const releaseController = (config: any) => {
	const source = config?.__cancelSource
	if (source) pendingSources.delete(source)
}

axios.interceptors.request.use(
	(config) => {
		// List requests always carry `page=`; inject BaseTable's one-shot
		// per_page/search onto that next request only (see lib/listParams).
		if (config.url && /[?&]page=/.test(config.url)) {
			const listParams = takeListParams()
			if (listParams?.per_page) config.url += `&per_page=${listParams.per_page}`
			if (listParams?.search) config.url += `&search=${encodeURIComponent(listParams.search)}`
		}

		if (!config.headers?.["X-SWR-Request"]) {
			store.set(validationErrors, {})
			
			if (!config.headers?.["X-Form-Request"]) {
				store.set(requestCount, (prev) => prev + 1)

				// Only page-data GETs (not forms, not silent SWR) are cancellable
				// on navigation. axios 0.21 -> CancelToken (NOT AbortController).
				if (!(config as any).cancelToken) {
					const source = Axios.CancelToken.source()
					;(config as any).cancelToken = source.token
					;(config as any).__cancelSource = source
					pendingSources.add(source)
				}
			}
		}

		return config
	},
	(error) => {
		if (!error.config?.headers?.["X-SWR-Request"] && !error.config?.headers?.["X-Form-Request"])
			store.set(requestCount, (prev) => Math.max(0, prev - 1))
		
		return Promise.reject(error)
	}
)

axios.interceptors.response.use(
	(response) => {
		releaseController(response.config)
		if (!response.config?.headers?.["X-SWR-Request"] && !response.config.headers?.["X-Form-Request"])
			store.set(requestCount, (prev) => Math.max(0, prev - 1))

		return response
	},
	(error) => {
		releaseController(error.config)

		// Aborted by a client-side navigation — clear its loading-bar slot and
		// bail silently (no error toast for a request we cancelled on purpose).
		if (Axios.isCancel(error)) {
			store.set(requestCount, (prev) => Math.max(0, prev - 1))
			return Promise.reject(error)
		}

        const isFormRequest = error.config?.headers?.["X-Form-Request"]
        const isSwrRequest = error.config?.headers?.["X-SWR-Request"]

		if (!isFormRequest)
			store.set(requestCount, (prev) => Math.max(0, prev - 1))

        if (!error.response) {
            if (!isSwrRequest) 
                store.set(responseMessage, { type: "error", text: i18n.t("apiErrors.noConnection") })

            return Promise.reject(error)
        }

		if (!isSwrRequest) {
            switch (error.response?.status) {
                case 422:
                    // Never set the atom to undefined — a 422 without an `errors` payload
                    // would otherwise crash every page that reads validErrors.x.
                    store.set(validationErrors, error.response.data.errors ?? {})
                    break
                case 400:
                    // Stable machine codes (demo_mode, trial_limit_reached, ...) get a
                    // translated toast; anything else falls back to the raw message.
                    store.set(responseMessage, {
                        type: "error",
                        text: (error.response.data.code && i18n.exists(`apiErrors.${error.response.data.code}`))
                            ? i18n.t(`apiErrors.${error.response.data.code}`)
                            : (error.response.data.message || i18n.t("apiErrors.badRequest"))
                    })
                    break
                case 401:
                    // Session expired -> re-login. Guard against redirecting to
                    // /login while already there (would reload-loop).
                    if (window.location.pathname !== "/login")
                        window.location.pathname = "/login"
                    break
                case 403:
                    // Forbidden is just an error: show a popup, never navigate.
                    // Redirecting here reload-looped when the 403 came from a
                    // background call on the page we'd redirect TO.
                    store.set(responseMessage, { type: "error", text: error.response.data.message || i18n.t("apiErrors.accessDenied") })
                    break
                case 404:
                    store.set(responseMessage, { type: "error", text: i18n.t("apiErrors.notFound") })
                    break
                default:
                    store.set(responseMessage, { type: "error", text: i18n.t("apiErrors.unexpected") })
                    break
            }
		}
		
		return Promise.reject(error)
	}
)

export default axios