import axios from "@/lib/axios"

export async function getScannedMember(qrContent: string, branchID: number) {
	return await axios.get(`/api/member-qr?qr_content=${qrContent}&branch_id=${branchID}`)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function addEntry(data: any) {
	return await axios.post(`/api/member-qr`, data, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}