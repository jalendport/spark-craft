<template>
	<slot
		:setReference="setReference"
		:setFloating="setFloating"
		:isOpen="isOpen"
		:toggle="toggle"
		:close="close"
		:floatingStyles="floatingStyles"
	></slot>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from "vue";
import { useFloating, offset, flip, shift, autoUpdate } from "@floating-ui/vue";

const props = defineProps({
	placement: {
		type: String,
		default: "bottom-end",
	},
	offsetValue: {
		type: Number,
		default: 8,
	},
});

const isOpen = ref(false);
const reference = ref(null);
const floating = ref(null);

const { floatingStyles } = useFloating(reference, floating, {
	placement: props.placement,
	strategy: "fixed",
	middleware: [offset(props.offsetValue), flip(), shift({ padding: 8 })],
	whileElementsMounted: autoUpdate,
	open: isOpen,
});

function setReference(el) {
	reference.value = el;
}

function setFloating(el) {
	floating.value = el;
}

function toggle() {
	isOpen.value = !isOpen.value;
}

function close() {
	isOpen.value = false;
}

function onClickOutside(event) {
	if (
		!reference.value?.contains(event.target) &&
		!floating.value?.contains(event.target)
	) {
		close();
	}
}

function onKeydown(event) {
	if (event.key === "Escape" && isOpen.value) {
		close();
	}
}

watch(isOpen, (val) => {
	if (val) {
		document.addEventListener("click", onClickOutside, true);
		document.addEventListener("keydown", onKeydown);
	} else {
		document.removeEventListener("click", onClickOutside, true);
		document.removeEventListener("keydown", onKeydown);
	}
});

onBeforeUnmount(() => {
	document.removeEventListener("click", onClickOutside, true);
	document.removeEventListener("keydown", onKeydown);
});
</script>
