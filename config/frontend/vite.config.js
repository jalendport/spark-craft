import path from "path";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import compression from "vite-plugin-compression";

export default ({ command }) => ({
	base: command === "serve" ? "" : "/dist/",
	build: {
		manifest: "manifest.json",
		outDir: "web/dist",
		emptyOutDir: true,
		rollupOptions: {
			input: {
				main: "src/js/main.js",
				css: "src/css/main.css",
			},
			output: {
				manualChunks(id) {
					if (!id.includes("node_modules")) return;
					if (id.includes("vee-validate") || id.includes("yup")) return "validation";
					if (id.includes("@floating-ui")) return "floating-ui";
					if (id.includes("maska")) return "maska";
					if (id.includes("/vue/") || id.includes("\\vue\\")) return "vue";
				},
			},
		},
		sourcemap: true,
	},
	plugins: [
		compression({
			filter: /\.(js|mjs|json|css|map)$/i,
		}),
		vue(),
		tailwindcss(),
		{
			// Restart the server for new/deleted Vue components, because
			// import.meta.glob() is only evaluated at startup and new
			// components won't be registered until the server restarts.
			name: "watch-vue-components",
			configureServer(server) {
				const componentsPath = path.resolve(process.cwd(), "src/js/vue/components");
				server.watcher.add(componentsPath);

				const restartOnVueComponent = (file) => {
					if (file.includes("/components/") && file.endsWith(".vue")) {
						server.restart();
					}
				};

				server.watcher.on("add", restartOnVueComponent);
				server.watcher.on("unlink", restartOnVueComponent);
			},
		},
		{
			// Force a full page reload for Twig changes, because the Vue
			// plugin prefers hot updates over full reloads.
			name: "force-reload-on-twig-changes",
			handleHotUpdate({ file, server }) {
				if (file.includes(".twig")) {
					const timeString = new Date().toLocaleTimeString("en-US", {
						hour: "numeric",
						minute: "2-digit",
						second: "2-digit",
						hour12: true,
					});
					const relativePath = file.replace(process.cwd() + "/", "");
					console.log(`${timeString} [vite] (client) page reload ${relativePath}`);
					server.ws.send({
						type: "full-reload",
					});
					return [];
				}
			},
		},
	],
	resolve: {
		alias: {
			"@root": path.resolve("."),
			"@js": path.resolve("src/js"),
			"@composables": path.resolve("src/js/vue/composables"),
			"@css": path.resolve("src/css"),
			vue: "vue/dist/vue.esm-bundler.js",
		},
		preserveSymlinks: true,
	},
	server: {
		host: "0.0.0.0",
		origin: process.env.VITE_DEV_SERVER_PUBLIC || "http://localhost:8080",
		port: parseInt(process.env.DOCKER_NODE_INTERNAL_PORT) || 8080,
		strictPort: true,
		watch: {
			ignored: ["storage/**", "vendor/**"],
		},
		proxy: {
			"/assets": process.env.VITE_WEB_SERVER_INTERNAL || "http://nginx:80",
		},
		allowedHosts: ["node", process.env.VITE_DEV_SERVER_ALLOWED_HOST || ""],
		hmr: {
			overlay: true,
			path: "/hmr",
		},
	},
});
