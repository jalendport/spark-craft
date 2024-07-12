import "vite/modulepreload-polyfill";
import { createApp, defineAsyncComponent, onMounted } from "vue";
import { store } from "@js/store.js";

/*
 * Import global styles
 */
import "@css/main.css";

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

/*
 * Create the app
 */
const app = createApp({
	delimiters: ["${", "}"],
	setup() {
		return { store };
	},
});

/*
 * Register eager components
 */
Object.entries(eagerComponents).forEach(([path, definition]) => {
	const componentName = path.split("/").pop().replace(".vue", "");
	app.component(componentName, definition.default);
});

// const asyncComponentTester = function (path, latency) {
// 	return new Promise((resolve) => {
// 		setTimeout(() => {
// 			resolve(import(path));
// 		}, latency);
// 	});
// }; // loader: () => asyncComponentTester(path, 4000),

/*
 * Register lazy components, with their corresponding loading and error components
 */
Object.entries(lazyComponents).forEach(([path, module]) => {
	const componentName = path.split("/").pop().replace(".lazy.vue", "");
	const loadingComponent = Object.entries(loadingComponents).find(
		([lPath]) => lPath.replace(".loading.vue", ".lazy.vue") === path
	);
	const errorComponent = Object.entries(errorComponents).find(
		([ePath]) => ePath.replace(".error.vue", ".lazy.vue") === path
	);
	const componentDefinition = defineAsyncComponent({
		loader: module,
		loadingComponent: loadingComponent ? loadingComponent[1].default : null,
		delay: 500,
		errorComponent: errorComponent ? errorComponent[1].default : null,
		timeout: 5000,
		suspensible: loadingComponent ? false : true,
	});
	app.component(componentName, componentDefinition);
});

/*
 * Mount the app
 */
app.mount("#app");
