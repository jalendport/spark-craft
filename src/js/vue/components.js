import { defineAsyncComponent } from "vue";

/*
 * Import all components
 */
const eagerComponents = import.meta.glob(
	[
		"./components/**/*.vue",
		"!./components/**/*.lazy.vue",
		"!./components/**/*.loading.vue",
		"!./components/**/*.error.vue",
	],
	{ eager: true }
);
const lazyComponents = import.meta.glob("./components/**/*.lazy.vue");
const loadingComponents = import.meta.glob("./components/**/*.loading.vue", {
	eager: true,
});
const errorComponents = import.meta.glob("./components/**/*.error.vue", {
	eager: true,
});

export function registerComponents(app) {
	/*
	 * Register eager components
	 */
	Object.entries(eagerComponents).forEach(([path, definition]) => {
		const componentName = path.split("/").pop().replace(".vue", "");
		app.component(componentName, definition.default);
	});

	/*
	 * Register lazy components, with their corresponding loading and error components
	 */
	Object.entries(lazyComponents).forEach(([path, module]) => {
		const componentName = path.split("/").pop().replace(".lazy.vue", "");
		const loadingComponent = Object.entries(loadingComponents).find(
			([lPath]) => lPath.replace(".loading.vue", ".lazy.vue") === path
		)?.[1].default;
		const errorComponent = Object.entries(errorComponents).find(
			([ePath]) => ePath.replace(".error.vue", ".lazy.vue") === path
		)?.[1].default;

		app.component(
			componentName,
			defineAsyncComponent({
				loader: module,
				loadingComponent: loadingComponent || null,
				delay: 500,
				errorComponent: errorComponent || null,
				timeout: 5000,
				suspensible: !loadingComponent,
			})
		);
	});
}
