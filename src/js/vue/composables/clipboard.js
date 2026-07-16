export async function copyToClipboard(value) {
	if (!value) return;

	try {
		await navigator.clipboard.writeText(value);
	} catch (err) {
		console.error("Failed to copy: ", err);
	}
}
