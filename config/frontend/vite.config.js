import { defineConfig } from "vite";
import legacy from "@vitejs/plugin-legacy";
import path from "path";
import compression from "vite-plugin-compression";
import vue from "@vitejs/plugin-vue";

export default defineConfig(({ command, mode }) => {
	return {
		base: mode === "development" ? "/" : "/dist/",
		build: {
			outDir: "web/dist",
			emptyOutDir: true,
			manifest: true,
			rollupOptions: {
				input: {
					main: "src/js/main.js",
				},
			},
			sourcemap: true,
		},
		css: {
			postcss: "config/frontend",
		},
		plugins: [
			compression({
				filter: /\.(js|mjs|json|css|map)$/i,
			}),
			legacy({
				targets: ["defaults", "not IE 11"],
			}),
			vue({
				template: {
					compilerOptions: {},
				},
			}),
		],
		resolve: {
			alias: {
				"@js": path.resolve("src/js"),
				"@css": path.resolve("src/css"),
				vue: "vue/dist/vue.esm-bundler.js",
			},
			preserveSymlinks: true,
		},
		server: {
			host: true,
			port: 8080,
			strictPort: true,
			origin: "http://localhost:8080",
			watch: {
				ignored: ["storage/**", "vendor/**"],
			},
		},
	};
});
