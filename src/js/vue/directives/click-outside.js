export default {
	beforeMount(el, binding) {
		el.clickOutsideEvent = function (event) {
			// Check if the clicked element is neither the element
			// to which the directive is applied nor its child
			if (!(el === event.target || el.contains(event.target))) {
				// Invoke the provided method
				binding.value(event);
			}
		};
		// We wrap the event listener registration in a timeout
		// to ensure that the click event that triggered the
		// element to be displayed does not also trigger the
		// click-outside event.
		el.__clickOutsideTimeoutId__ = setTimeout(() => {
			document.addEventListener("click", el.clickOutsideEvent);
		});
	},
	unmounted(el) {
		// Make sure to clear the timeout as well
		clearTimeout(el.__clickOutsideTimeoutId__);
		// Remove the event listener when the bound element is unmounted
		document.removeEventListener("click", el.clickOutsideEvent);
	},
};
