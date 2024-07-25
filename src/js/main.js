import "vite/modulepreload-polyfill";

/*
 * Import global styles
 */
import "@css/main.css";

/*
 * Import and initialize the Vue app
 */
import { initializeApp } from "@js/vue/app.js";

initializeApp();
