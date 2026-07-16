import { onMounted, onBeforeUnmount } from "vue";

/**
 * Auto-scroll to an element based on URL hash.
 * Handles both initial page load and same-page hash changes.
 * Retries for up to 10 seconds to handle async data loading.
 *
 * @param {number} initialDelay - Delay before starting scroll attempts in milliseconds (default: 300)
 * @param {number} maxDuration - Maximum time to retry in milliseconds (default: 10000)
 * @param {number} retryInterval - Time between retry attempts in milliseconds (default: 100)
 */
export function useAutoScroll({
	initialDelay = 300,
	maxDuration = 10000,
	retryInterval = 100,
} = {}) {
	const scrollToElement = (targetId) => {
		if (!targetId) return;

		const element = document.getElementById(targetId);
		if (element) {
			element.scrollIntoView({ behavior: "smooth", block: "start" });
			return;
		}

		// Element not found yet, retry until maxDuration
		let startTime = Date.now();
		const intervalId = setInterval(() => {
			const el = document.getElementById(targetId);
			if (el) {
				el.scrollIntoView({ behavior: "smooth", block: "start" });
				clearInterval(intervalId);
			} else if (Date.now() - startTime > maxDuration) {
				console.warn(
					`Auto-scroll: Element #${targetId} not found within ${maxDuration}ms`
				);
				clearInterval(intervalId);
			}
		}, retryInterval);
	};

	const handleHashChange = () => {
		const hash = window.location.hash.substring(1);
		if (hash) {
			scrollToElement(hash);
		}
	};

	const handleAnchorClick = (event) => {
		const link = event.target.closest('a[href*="#"]');
		if (!link) return;

		const url = new URL(link.href, window.location.origin);
		if (url.pathname !== window.location.pathname) return;

		const targetId = url.hash.substring(1);
		if (!targetId) return;

		event.preventDefault();
		history.pushState(null, "", `#${targetId}`);
		scrollToElement(targetId);
	};

	onMounted(() => {
		// Handle hash present on initial page load
		const hash = window.location.hash.substring(1);
		if (hash) {
			setTimeout(() => scrollToElement(hash), initialDelay);
		}

		// Handle same-page hash changes
		window.addEventListener("hashchange", handleHashChange);
		// Intercept same-page anchor clicks to prevent browser's instant jump
		document.addEventListener("click", handleAnchorClick);
	});

	onBeforeUnmount(() => {
		window.removeEventListener("hashchange", handleHashChange);
		document.removeEventListener("click", handleAnchorClick);
	});
}
