/**
 * @fileoverview Event handling utilities for managing resize, scroll, and mouse movement events
 * with performance optimizations.
 *
 * @example Import and usage:
 * import { throttle, onResize, onScroll, onMouseMove } from '@js/utils/event-utils';
 *
 * // Throttle Example
 * const throttledFn = throttle(() => console.log('Throttled!'), 1000);
 * throttledFn(); // Will only execute once per second
 *
 * // Resize Event Example
 * const resizeCleanup = onResize((event) => {
 *   console.log('Window resized!', window.innerWidth, window.innerHeight);
 * });
 * // Later: resizeCleanup(); // Removes the event listener
 *
 * // Scroll Event Example
 * const scrollCleanup = onScroll((event) => {
 *   console.log('Scrolled!', window.scrollY);
 * });
 * // Later: scrollCleanup(); // Removes the event listener
 *
 * // Mouse Movement Example
 * const mouseCleanup = onMouseMove((event) => {
 *   console.log('Mouse moved!', event.clientX, event.clientY);
 * });
 * // Later: mouseCleanup(); // Removes the event listener
 *
 * @exports throttle - Function to limit the frequency of function calls
 * @exports onResize - Window resize event handler with requestAnimationFrame
 * @exports onScroll - Window scroll event handler with requestAnimationFrame
 * @exports onMouseMove - Document mouse movement handler with requestAnimationFrame
 */

/**
 * Throttles a function to limit how often it can be called
 * @param {Function} fn - The function to throttle
 * @param {number} limit - The time limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(fn, limit) {
	let lastCall = 0;
	return function throttled(...args) {
		const now = Date.now();
		if (now - lastCall >= limit) {
			lastCall = now;
			return fn.apply(this, args);
		}
	};
}

/**
 * Creates a resize event listener with requestAnimationFrame optimization
 * @param {Function} callback - Function to call when resize occurs
 * @returns {Function} Cleanup function to remove the event listener
 */
export function onResize(callback) {
	let resizeTimeout;

	// Internal resize handler
	function handleResize(e) {
		// Cancel the previous requestAnimationFrame if it exists
		if (resizeTimeout) {
			cancelAnimationFrame(resizeTimeout);
		}

		// Request a new animation frame
		resizeTimeout = requestAnimationFrame(() => {
			// Call the provided callback function
			callback(e);
		});
	}

	// Add the resize event listener
	window.addEventListener("resize", handleResize);

	// Return a function to remove the listener if needed
	return () => {
		window.removeEventListener("resize", handleResize);
		if (resizeTimeout) {
			cancelAnimationFrame(resizeTimeout);
		}
	};
}

/**
 * Creates a mousemove event listener with requestAnimationFrame optimization
 * @param {Function} callback - Function to call when mouse moves
 * @returns {Function} Cleanup function to remove the event listener
 */
export function onMouseMove(callback) {
	let mouseMoveTimeout;

	// Internal mousemove handler
	function handleMouseMove(e) {
		// Cancel the previous requestAnimationFrame if it exists
		if (mouseMoveTimeout) {
			cancelAnimationFrame(mouseMoveTimeout);
		}

		// Request a new animation frame
		mouseMoveTimeout = requestAnimationFrame(() => {
			// Call the provided callback function
			callback(e);
		});
	}

	// Add the mousemove event listener
	document.addEventListener("mousemove", handleMouseMove);

	// Return a function to remove the listener if needed
	return () => {
		document.removeEventListener("mousemove", handleMouseMove);
		if (mouseMoveTimeout) {
			cancelAnimationFrame(mouseMoveTimeout);
		}
	};
}

/**
 * Creates a scroll event listener with requestAnimationFrame optimization
 * @param {Function} callback - Function to call when scroll occurs
 * @returns {Function} Cleanup function to remove the event listener
 */
export function onScroll(callback) {
	let scrollTimeout;

	// Internal scroll handler
	function handleScroll(e) {
		// Cancel the previous requestAnimationFrame if it exists
		if (scrollTimeout) {
			cancelAnimationFrame(scrollTimeout);
		}

		// Request a new animation frame
		scrollTimeout = requestAnimationFrame(() => {
			// Call the provided callback function
			callback(e);
		});
	}

	// Add the scroll event listener
	window.addEventListener("scroll", handleScroll);

	// Return a function to remove the listener if needed
	return () => {
		window.removeEventListener("scroll", handleScroll);
		if (scrollTimeout) {
			cancelAnimationFrame(scrollTimeout);
		}
	};
}
