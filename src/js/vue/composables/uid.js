export function generateUniqueId(prefix = "id") {
	return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
