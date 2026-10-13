/**
 * Shrink a camera photo in the browser before upload. Phones shoot 12MP (~3-5MB);
 * a photo is fully legible at ~2000px, so we scale the longest side down to `maxDim`
 * and re-encode. Result is typically a few hundred KB with no visible loss — saving
 * both upload bandwidth and server storage.
 *
 * PNGs are kept as PNG (transparency preserved — logos must not flatten to a JPEG
 * background); everything else re-encodes to JPEG at `quality`. If the result isn't
 * actually smaller (already-small logos, etc.) or the browser can't decode the file
 * (HEIC on Chrome), the original is returned untouched so the backend always gets a file.
 */
export async function compressImage(file: File, maxDim = 2000, quality = 0.82): Promise<File> {
	if (!file.type.startsWith('image/')) return file
	try {
		const bitmap = await createImageBitmap(file)
		const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height))
		const w = Math.round(bitmap.width * scale)
		const h = Math.round(bitmap.height * scale)

		const canvas = document.createElement('canvas')
		canvas.width = w
		canvas.height = h
		const ctx = canvas.getContext('2d')
		if (!ctx) return file
		ctx.drawImage(bitmap, 0, 0, w, h)

		const isPng = file.type === 'image/png'
		const outType = isPng ? 'image/png' : 'image/jpeg'
		const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, outType, isPng ? undefined : quality))
		if (!blob || blob.size >= file.size) return file // encoder failed or made it bigger — keep original

		const ext = isPng ? '.png' : '.jpg'
		return new File([blob], file.name.replace(/\.[^.]+$/, ext), { type: outType })
	} catch {
		return file // browser couldn't decode it (HEIC on Chrome, etc.) — send as-is
	}
}

/**
 * Return a copy of `formData` with every image File entry compressed. Preserves
 * insertion order and repeated keys (e.g. `files[]` multi-uploads). Non-image entries
 * (CSV imports, text fields) pass through unchanged.
 */
export async function compressFormDataImages(formData: FormData): Promise<FormData> {
	const out = new FormData()
	for (const [key, value] of Array.from(formData.entries())) {
		if (value instanceof File && value.type.startsWith('image/') && value.size > 0) {
			out.append(key, await compressImage(value))
		} else {
			out.append(key, value as any)
		}
	}
	return out
}
