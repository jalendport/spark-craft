let originalAppContent = null;

// Preserve the original DOM content from Twig
export function preserveOriginalContent() {
	const appElement = document.querySelector("#app");
	if (appElement && !originalAppContent) {
		originalAppContent = appElement.cloneNode(true);
		console.log("HMR: Preserving DOM");
	}
}

// Restore the original DOM content
export function restoreOriginalContent() {
	const appElement = document.querySelector("#app");
	if (appElement && originalAppContent) {
		// Clear current content and restore original
		appElement.innerHTML = originalAppContent.innerHTML;
		console.log("HMR: Restoring DOM");
	}
}

export function onDispose(app) {
	console.log("HMR: Unmounting current Vue app");
	if (app) {
		app.unmount();
	}
}

export function onAccept() {
	console.log("HMR: Initializing new Vue app");
}

export function logHMRUpdate(moduleName) {
	console.log(`HMR: Hot reloading ${moduleName}`);
}
