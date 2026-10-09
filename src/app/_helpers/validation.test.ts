import { describe, it, expect } from "vitest"
import { validateForm } from "./validation"

// Identity translator → assertions read on the raw key names.
const t = (key: string) => key

function makeForm(html: string): HTMLFormElement {
	const form = document.createElement("form")
	form.innerHTML = html
	return form
}

describe("validateForm", () => {
	it("flags required fields that are empty or whitespace", () => {
		const form = makeForm('<input name="firstName" data-rules="required" value="   " />')
		const { errors, firstInvalidElement } = validateForm(form, t)
		expect(errors.firstName).toEqual(["validation.required"])
		expect((firstInvalidElement as HTMLInputElement)?.name).toBe("firstName")
	})

	it("passes a required field that has a value", () => {
		const form = makeForm('<input name="firstName" data-rules="required" value="Joe" />')
		expect(validateForm(form, t).errors.firstName).toBeUndefined()
	})

	it("checks email format only when the value is non-empty", () => {
		expect(validateForm(makeForm('<input name="email" data-rules="email" value="not-an-email" />'), t).errors.email)
			.toEqual(["validation.email"])
		expect(validateForm(makeForm('<input name="email" data-rules="email" value="" />'), t).errors.email)
			.toBeUndefined()
		expect(validateForm(makeForm('<input name="email" data-rules="email" value="a@b.co" />'), t).errors.email)
			.toBeUndefined()
	})

	it("rejects non-numeric values for the numeric rule", () => {
		expect(validateForm(makeForm('<input name="qty" data-rules="numeric" value="abc" />'), t).errors.qty)
			.toEqual(["validation.numeric"])
		expect(validateForm(makeForm('<input name="qty" data-rules="numeric" value="12" />'), t).errors.qty)
			.toBeUndefined()
	})

	it("short-circuits on the first failing rule (required before email)", () => {
		const form = makeForm('<input name="email" data-rules="required|email" value="" />')
		expect(validateForm(form, t).errors.email).toEqual(["validation.required"])
	})

	it("validates custom (non-input) fields passed in", () => {
		const { errors } = validateForm(makeForm(""), t, { avatar: { value: "", rules: ["required"] } })
		expect(errors.avatar).toEqual(["validation.required"])
	})

	it("resolves firstInvalidElement via data-name for custom fields", () => {
		const form = makeForm('<div data-name="avatar"></div>')
		const { firstInvalidElement } = validateForm(form, t, { avatar: { value: "", rules: ["required"] } })
		expect((firstInvalidElement as HTMLElement)?.dataset.name).toBe("avatar")
	})
})
