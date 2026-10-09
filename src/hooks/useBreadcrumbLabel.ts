import { useEffect } from "react"
import { useSetAtom } from "jotai"
import { breadcrumbLabel } from "@/_state/globalStore"

/**
 * Publish the current entity's display name to the breadcrumb so a view/edit
 * page shows e.g. "Members > John Doe" instead of a generic "Details" for the
 * id segment. Pass either the loaded entity object (a name is picked from the
 * usual fields) or a ready-made string. Clears on unmount so list pages fall
 * back to the generic crumb.
 *
 * @param source loaded entity, or an explicit label string
 */
export function useBreadcrumbLabel(source?: any) {
    const set = useSetAtom(breadcrumbLabel)

    const label = pickLabel(source)

    useEffect(() => {
        set(label || "")
        return () => set("")
    }, [label])
}

function pickLabel(source: any): string {
    if (!source) return ""
    if (typeof source === "string") return source.trim()

    const full = source.fullname
        || [source.fname, source.sname].filter(Boolean).join(" ").trim()
        || source.name
        || source.title
        || source.reference
        || source.invoice_number
        || source.email

    return typeof full === "string" ? full.trim() : ""
}
