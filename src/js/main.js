import "vite/modulepreload-polyfill";
import { onResize } from "@js/utils/event-utils";

/*
 * Import global styles
 */
import "@css/main.css";

/*
 * Import and initialize the Vue app
 */
import { initializeApp } from "@js/vue/app.js";

// Store the app instance for HMR
let app = initializeApp();

/*
 * Keep a real viewport-height custom property in sync so `--vh`-based
 * units stay correct on mobile browsers where `100vh` is unreliable.
 */
function setVh() {
	let vh = window.innerHeight * 0.01;
	document.documentElement.style.setProperty("--vh", `${vh}px`);
}

setVh();
onResize(setVh);

/*
 * HMR
 * Keep this at the bottom of this file
 */

import {
	preserveOriginalContent,
	restoreOriginalContent,
	onDispose,
	onAccept,
	logHMRUpdate,
} from "@js/hmr.js";

// Accept HMR as per: https://vitejs.dev/guide/api-hmr.html
if (import.meta.hot) {
	preserveOriginalContent();

	import.meta.hot.dispose(() => {
		onDispose(app);
		restoreOriginalContent();
	});

	import.meta.hot.accept(() => {
		onAccept();
	});

	import.meta.hot.on("vite:beforeUpdate", (event) => {
		event.updates.forEach((update) => {
			logHMRUpdate(update.path);
		});
	});
}
