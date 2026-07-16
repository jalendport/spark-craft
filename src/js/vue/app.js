import { createApp } from "vue";
import { store, mutations } from "@js/vue/store";
import { registerComponents } from "@js/vue/components";
import { registerDirectives } from "@js/vue/directives";

import { copyToClipboard } from "@composables/clipboard";
import { useAutoScroll } from "@composables/scroll";

import { vMaska } from "maska/vue"; // https://beholdr.github.io/maska/v3/#/vue

export function initializeApp() {
	// Create the app
	const app = createApp({
		delimiters: ["${", "}"],
		setup() {
			// Auto-scroll to elements based on URL hash
			useAutoScroll();

			return { store, mutations, copyToClipboard };
		},
	});

	app.provide("store", store);
	app.provide("mutations", mutations);

	app.config.errorHandler = (err, instance, info) => {
		console.error("Error:", err);
		console.log("Vue component:", instance);
		console.log("Additional info:", info);
	};

	// Register all components
	registerComponents(app);

	// Register all directives
	registerDirectives(app);
	app.directive("maska", vMaska);

	// Mount the app and return the instance for HMR cleanup
	app.mount("#app");

	// Return the app instance so it can be unmounted later
	return app;
}
