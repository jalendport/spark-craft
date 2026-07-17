// Throttle function to limit the frequency of calls.
// Note: rAF-optimized event listeners (onResize, onScroll, onMouseMove) live in event-utils.js.
export default function throttle(fn, limit) {
	let lastCall = 0;
	return function (...args) {
		const now = Date.now();
		if (now - lastCall >= limit) {
			lastCall = now;
			fn(...args);
		}
	};
}
