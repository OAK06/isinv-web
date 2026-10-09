import axios from "@/lib/axios"

export async function getPaymentProvider() {
	return await axios.get(`/api/admin/payment-provider`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function setPaymentProvider(provider: string, test_charge: boolean) {
	return await axios.post(`/api/admin/payment-provider`, { provider, test_charge }, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}
