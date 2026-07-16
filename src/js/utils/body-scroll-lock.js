export function lock() {
	document.documentElement.classList.add("body-scroll-lock");
}

export function unlock() {
	document.documentElement.classList.remove("body-scroll-lock");
}
