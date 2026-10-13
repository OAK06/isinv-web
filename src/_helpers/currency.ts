/**
 * Formats a monetary amount as EGP with thousands separators. Trailing zero
 * decimals are trimmed: 10.00 -> "EGP 10", 5.50 -> "EGP 5.5", 5.55 -> "EGP 5.55".
 */
export function formatCurrency(amount: number | string | null | undefined, locale = "en-US"): string {
	const n = Number(amount) || 0
	return new Intl.NumberFormat(locale, { style: "currency", currency: "EGP", minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n)
}

/**
 * Trims trailing zero decimals from a number for display: "5.00" -> "5",
 * "2.50" -> "2.5", "5.55" -> "5.55". Use for quantities and other non-currency
 * numeric display. Non-numeric input is returned unchanged.
 */
export function formatNumber(value: number | string | null | undefined): string {
	if (value === null || value === undefined || value === "") return ""
	const n = Number(value)
	return isNaN(n) ? String(value) : n.toString()
}
