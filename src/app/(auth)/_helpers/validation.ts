export function validateEmail(email: string) {
	return !(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/).test(email)
}

export function validatePassword(password: string, confirmPassword: string) {
	return password != confirmPassword
}