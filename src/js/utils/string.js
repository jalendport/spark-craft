export function toKebabCase(str) {
	return str
		.replace(/([a-z])([A-Z])/g, "$1-$2") // Insert a hyphen between lowercase and uppercase letters
		.replace(/[\s_]+/g, "-") // Replace spaces and underscores with hyphens
		.toLowerCase(); // Convert the entire string to lowercase
}
