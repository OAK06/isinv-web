import axios from "@/lib/axios"

export async function addSignature(uuid: any, data: any) {
	return await axios.post(`/api/signatures/${uuid}?_method=PUT`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}
