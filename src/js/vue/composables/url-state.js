/**
 * A modified version of https://github.com/Sanjivchy/vue-url-state/blob/main/src/index.ts
 * - converted from ts to js
 * - uses history api instead of vue-router to solve errors
 * - `options.replace` is now `options.push` default `false`
 *
 * For page state, assume `history.replaceState` is the default
 * so the browser's back button doesn't take you through every
 * filter selection you've made.
 */
import { ref, watch, onMounted, onUnmounted } from "vue";

// Custom debounce function
function debounce(fn, delay) {
	let timer = null;

	return (...args) => {
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => fn(...args), delay);
	};
}

/**
 * Main composable
 * Usage: https://github.com/Sanjivchy/vue-url-state/blob/main/README.md
 */
export function useQueryState(key, defaultValue, options = {}) {
	const parse = options.parse ?? defaultParser(defaultValue);
	const serialize = options.serialize ?? defaultSerializer(defaultValue);
	const push = options.push ?? false;
	const debounceDelay = options.debounce ?? 0;
	const state = ref(defaultValue);

	const syncQuery = (val) => {
		const url = new URL(window.location.href);
		const serialized = serialize(val);
		const isEmpty =
			serialized === null ||
			(Array.isArray(serialized) && serialized.length === 0) ||
			(typeof serialized === "string" && serialized.trim() === "");

		if (isEmpty) {
			url.searchParams.delete(key);
		} else {
			// Clear all instances to handle array updates
			url.searchParams.delete(key);
			if (Array.isArray(serialized)) {
				serialized?.forEach((v) => url.searchParams.append(key, v));
			} else {
				url.searchParams.set(key, String(serialized));
			}
		}

		if (url.href !== window.location.href) {
			const historyState = { ...history.state, [key]: val };
			if (push) {
				window.history.pushState(historyState, "", url.href);
			} else {
				window.history.replaceState(historyState, "", url.href);
			}
		}
	};

	const updateQuery =
		debounceDelay > 0 ? debounce(syncQuery, debounceDelay) : syncQuery;

	const updateStateFromURL = () => {
		const params = new URLSearchParams(window.location.search);
		const values = params.getAll(key);
		const raw = values.length <= 1 ? values[0] : values;
		state.value = parse(raw);
	};

	const onPopState = (event) => {
		if (event.state && event.state[key] !== undefined) {
			state.value = event.state[key];
		} else {
			updateStateFromURL();
		}
	};

	onMounted(() => {
		updateStateFromURL();
		window.addEventListener("popstate", onPopState);
	});

	onUnmounted(() => {
		window.removeEventListener("popstate", onPopState);
	});

	watch(state, (newVal) => {
		updateQuery(newVal);
	});

	return state;
}

// Default parser
function defaultParser(defaultVal) {
	return (val) => {
		if (val === undefined || val === null) return defaultVal;

		if (typeof defaultVal === "number") {
			const num = Number(val);
			return isNaN(num) ? defaultVal : num;
		}

		if (typeof defaultVal === "boolean") {
			return val === "true";
		}

		if (Array.isArray(defaultVal)) {
			if (!val) return defaultVal;
			const arr = Array.isArray(val) ? val : [val];
			if (defaultVal.length === 0) return arr;
			return arr.map((v) => (typeof defaultVal[0] === "number" ? Number(v) : v));
		}

		return val;
	};
}

// Default serializer
function defaultSerializer(defaultVal) {
	return (val) => {
		if (val === defaultVal) return null;
		if (val === null || val === undefined) return null;
		if (typeof val === "boolean") return val ? "true" : "false";
		if (typeof val === "number") return String(val);
		if (typeof val === "string") return val;
		if (Array.isArray(val)) return val.map((v) => String(v));
		return null;
	};
}

// Export utility functions for advanced usage
export { defaultParser, defaultSerializer };
