import axios from "@/lib/axios"

export async function getFileHeadings(data: any) {
	return await axios.post(`/api/import`, data)
		.then(res => res.data)
		.catch(error => { throw error })
}

export async function batchStatus(batchID: string) {
	return await axios.get(`/api/import?batch_id=${batchID}`, {
			headers: { 'X-Form-Request': true }
		})
		.then(res => res.data)
		.catch(error => { throw error })
}

export const downloadTemplate = (headings: any, fileName: string) => {
    const blob = new Blob([`\uFEFF${headings.join(',')}`], {
        type: 'text/csv;charset=utf-8;',
    })

    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${fileName}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}