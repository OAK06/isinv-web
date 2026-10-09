// One-shot carrier for BaseTable list params (per_page / search).
//
// The per-entity API wrappers (`_<entity>.ts`) build their own `?page=...` URLs
// and don't know about page size or search. Rather than thread two new args
// through every wrapper + page, BaseTable stashes them here right before it
// triggers a list request; the axios request interceptor consumes them for the
// next `page=`-carrying request and clears them. One-shot = no leakage into a
// later request from a different table/page.
//
// ponytail: assumes one active BaseTable per page (holds for this app). If two
// lists ever load concurrently, key this by tableController instead.

export type ListParams = { per_page?: number; search?: string }

let pending: ListParams | null = null

export const setNextListParams = (params: ListParams) => { pending = params }

export const takeListParams = (): ListParams | null => {
	const params = pending
	pending = null
	return params
}
