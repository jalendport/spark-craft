/*
 * Import all directives
 */
const directives = import.meta.glob(["./directives/**/*.js"], { eager: true });

export function registerDirectives(app) {
	/*
	 * Register all directives
	 */
	Object.entries(directives).forEach(([path, definition]) => {
		const directiveName = path.split("/").pop().replace(".js", "");
		app.directive(directiveName, definition.default);
	});
}
