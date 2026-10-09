"use client"

import { useState } from "react"
import { useTranslation } from "next-i18next"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons"

/**
 * Drop-in replacement for a password `<input>`: renders type="password" with a
 * trailing eye button that toggles reveal. Forwards every input prop (name,
 * value/defaultValue, onChange, className, placeholder, autoComplete,
 * data-rules, readOnly, ...) so it slots into the existing uncontrolled-FormData
 * and controlled forms alike. RTL-safe (icon on the logical end).
 */
export default function PasswordInput({ className = "input input-bordered input-sm w-full", ...props }: any) {
	const { t } = useTranslation('common')
	const [show, setShow] = useState(false)

	return (
		<div className="relative">
			<input {...props} type={show ? "text" : "password"} className={`${className} pe-10`} />
			<button
				type="button"
				tabIndex={-1}
				onClick={() => setShow((s) => !s)}
				className="absolute end-3 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content transition-colors"
				aria-label={show ? t('hidePassword') : t('showPassword')}
			>
				<FontAwesomeIcon icon={show ? faEyeSlash : faEye} className="text-sm" />
			</button>
		</div>
	)
}
