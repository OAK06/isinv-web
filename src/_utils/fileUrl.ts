/**
 * Resolves a stored file URL for display.
 * - New files live on object storage (DigitalOcean Spaces) and come back as
 *   absolute URLs (https://...) → used as-is.
 * - Legacy files were stored relative (e.g. "/storage/x.jpg") → prefixed with the
 *   backend URL, preserving old behavior during the transition.
 */
export const fileUrl = (url?: string | null): string => {
    if (!url) return ""
    if (/^https?:\/\//i.test(url)) return url
    return (process.env.NEXT_PUBLIC_BACKEND_URL ?? "") + url
}
