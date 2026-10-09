/**
 * Formats a monetary amount as EGP with thousands separators and 2 decimals.
 */
export function formatCurrency(amount: number | string | null | undefined, locale = "en-US"): string {
	const n = Number(amount) || 0
	return new Intl.NumberFormat(locale, { style: "currency", currency: "EGP", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}
