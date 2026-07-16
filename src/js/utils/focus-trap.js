/**
 * Minimal, dependency-free focus trap.
 *
 * Keeps keyboard focus within a given element while active and restores focus
 * to the previously focused element on deactivate. Exposes the same
 * create / activate / deactivate surface used across the codebase.
 */

const FOCUSABLE_SELECTOR = [
	"a[href]",
	"button:not([disabled])",
	"textarea:not([disabled])",
	'input:not([disabled]):not([type="hidden"])',
	"select:not([disabled])",
	'[tabindex]:not([tabindex="-1"])',
].join(", ");

export function create(el, options = {}) {
	const config = {
		escapeDeactivates: false,
		allowOutsideClick: true,
		preventScroll: true,
		initialFocus: el,
		...options,
	};

	let previouslyFocused = null;

	const getFocusable = () =>
		Array.from(el.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
			(node) => node.offsetParent !== null || node === el
		);

	const onKeydown = (event) => {
		if (event.key === "Escape" && config.escapeDeactivates) {
			trap.deactivate();
			return;
		}

		if (event.key !== "Tab") return;

		const focusable = getFocusable();
		if (focusable.length === 0) {
			event.preventDefault();
			if (typeof el.focus === "function") {
				el.focus({ preventScroll: config.preventScroll });
			}
			return;
		}

		const first = focusable[0];
		const last = focusable[focusable.length - 1];

		if (event.shiftKey && document.activeElement === first) {
			event.preventDefault();
			last.focus({ preventScroll: config.preventScroll });
		} else if (!event.shiftKey && document.activeElement === last) {
			event.preventDefault();
			first.focus({ preventScroll: config.preventScroll });
		}
	};

	const trap = {
		activate() {
			previouslyFocused = document.activeElement;
			document.addEventListener("keydown", onKeydown, true);

			const target =
				typeof config.initialFocus === "function"
					? config.initialFocus()
					: config.initialFocus;
			const initial = target || getFocusable()[0] || el;
			if (initial && typeof initial.focus === "function") {
				initial.focus({ preventScroll: config.preventScroll });
			}
			return trap;
		},
		deactivate() {
			document.removeEventListener("keydown", onKeydown, true);
			if (previouslyFocused && typeof previouslyFocused.focus === "function") {
				previouslyFocused.focus({ preventScroll: config.preventScroll });
			}
			return trap;
		},
	};

	return trap;
}

export function activate(trap) {
	trap.activate();
}

export function deactivate(trap) {
	trap.deactivate();
}
