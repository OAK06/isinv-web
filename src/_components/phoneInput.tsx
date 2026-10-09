"use client"

import { useState } from "react"
import { useTranslation } from "next-i18next"
import { PhoneInput as IntlPhoneInput } from "react-international-phone"
import "react-international-phone/style.css"

// Sensible default country per active UI language (ISO2, lowercase).
const LANG_COUNTRY: Record<string, string> = {
	en: "us", ar: "sa", de: "de", fr: "fr", nl: "nl", ja: "jp",
}

/**
 * International phone input with a country selector (flag + dial code).
 *
 * Drop-in for the app's uncontrolled-FormData phone `<input>`s: it writes the
 * full E.164 number (e.g. "+201001234567") into a hidden `<input name=...>` so
 * FormData submission AND the shared `validateForm` (which reads name/value/
 * data-rules off `form.elements`) keep working unchanged — pass the old
 * `data-rules` string via `rules`. A dial-code-only value (nothing typed yet)
 * submits as empty, so `required` still catches a blank field.
 *
 * Themed via the library's CSS variables mapped to daisyUI tokens, so it tracks
 * the active gymFlyte / gymFlyteDark theme (and RTL, inherited from the tree).
 */
export default function PhoneInput({
	name,
	defaultValue = "",
	rules,
	id,
	size = "sm",
	defaultCountry,
}: {
	name: string
	defaultValue?: string | null
	rules?: string
	id?: string
	size?: "sm" | "base"
	defaultCountry?: string
}) {
	const { i18n } = useTranslation("common")
	const [phone, setPhone] = useState<string>(defaultValue || "")
	const [dialCode, setDialCode] = useState<string>("")

	const initialCountry = defaultCountry || LANG_COUNTRY[i18n.language] || "us"
	const height = size === "sm" ? "2rem" : "3rem"

	// A dial-code-only value means the user hasn't entered a number yet → submit
	// "" so a `required` rule still fires on an otherwise-blank field.
	const submitValue = dialCode && phone === `+${dialCode}` ? "" : phone

	return (
		<div className="w-full">
			<IntlPhoneInput
				defaultCountry={initialCountry as any}
				value={phone}
				onChange={(p, meta) => { setPhone(p); setDialCode(meta.country.dialCode) }}
				inputProps={{ id, autoComplete: "tel" }}
				className="w-full"
				inputClassName="!w-full"
				style={{
					// Library CSS vars → daisyUI theme tokens (dark-mode aware).
					"--react-international-phone-height": height,
					"--react-international-phone-font-size": "0.875rem",
					"--react-international-phone-border-radius": "0.5rem",
					"--react-international-phone-border-color": "hsl(var(--bc) / 0.2)",
					"--react-international-phone-background-color": "hsl(var(--b1))",
					"--react-international-phone-text-color": "hsl(var(--bc))",
					"--react-international-phone-country-selector-background-color": "hsl(var(--b1))",
					"--react-international-phone-country-selector-background-color-hover": "hsl(var(--b2))",
					"--react-international-phone-country-selector-border-color": "hsl(var(--bc) / 0.2)",
					"--react-international-phone-dropdown-item-background-color": "hsl(var(--b1))",
					"--react-international-phone-dropdown-item-text-color": "hsl(var(--bc))",
					"--react-international-phone-selected-dropdown-item-background-color": "hsl(var(--b2))",
					"--react-international-phone-dropdown-shadow": "0 4px 12px hsl(var(--bc) / 0.15)",
				} as React.CSSProperties}
			/>
			<input type="hidden" name={name} value={submitValue} data-rules={rules} readOnly />
		</div>
	)
}
