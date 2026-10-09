export function validateForm(
	form: HTMLFormElement,
	t: any,
	customFields: Record<string, any> = {}
) {
	const errors: Record<string, string[]> = {}
    let firstInvalidElement: HTMLElement | null = null 

	const addError = (name: string, message: string) => {
		if (!errors[name]) errors[name] = []
		errors[name].push(message)

        if (!firstInvalidElement) {
			const el = form.querySelector(`[name="${name}"]`) as HTMLElement 
                || form.querySelector(`[data-name="${name}"]`) as HTMLElement
			if (el) firstInvalidElement = el
		}
	}

	const applyRules = (name: string, value: string, rules: string[]) => {
		for (const rule of rules) {
			if (rule === 'required' && !value.trim()) {
				addError(name, t('validation.required'))
				break
			}
            if (rule === 'email' && value && !(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/).test(value)) {
				addError(name, t('validation.email'))
				break
			}
			if (rule === 'numeric' && value && isNaN(Number(value))) {
				addError(name, t('validation.numeric'))
				break
			}
		}
	}

	// Handle form elements
	Array.from(form.elements).forEach((el: any) => {
		const rules = el.dataset.rules?.split('|') || []
		if (rules.length) applyRules(el.name, el.value, rules)
	})
	// Handle custom fields (non-inputs)
	Object.entries(customFields).forEach(([name, { value, rules } = {} as any]) => {
		if (rules) applyRules(name, value, rules)
	})

	return { errors, firstInvalidElement }
}

export function scrollToFirstInvalidElement(element: HTMLElement) {
	element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    element.focus({ preventScroll: true })
}