<template>
	<Transition
		:enter-from-class="enterFromClasses"
		:leave-to-class="leaveToClasses"
		:enter-active-class="enterActiveClasses"
		:leave-active-class="leaveActiveClasses"
		class="origin-top"
	>
		<div
			class="pointer-events-auto absolute inset-0 z-20 flex items-start justify-center overflow-y-scroll px-24 clamp-[py,80,120]"
			v-if="modalOpen"
			:key="id"
			@click.self="mutations.closeModal()"
		>
			<div
				class="min-w-[min(100%,_--spacing(450))] rounded-8 bg-white shadow-modal clamp-[p,20,30]"
				:class="class"
			>
				<slot></slot>
			</div>
		</div>
	</Transition>
</template>

<script setup>
import { ref, inject, onMounted, onBeforeUnmount, computed, watch } from "vue";

const store = inject("store");
const mutations = inject("mutations");

const props = defineProps({
	id: {
		type: String,
		required: true,
	},
	isOpen: {
		type: Boolean,
		default: false,
	},
	class: {
		type: String,
		default: "",
	},
});

const modalOpen = computed(() => {
	return store.openModal == props.id;
});

const handleKeydown = (e) => {
	if (e.key === "Escape" && modalOpen.value) {
		mutations.closeModal();
	}
};

onMounted(() => {
	if (props.isOpen) {
		mutations.openModal(props.id);
	}
	document.addEventListener("keydown", handleKeydown);
});

onBeforeUnmount(() => {
	document.removeEventListener("keydown", handleKeydown);
});

const enterFromClasses = ref("");
const leaveToClasses = ref("");
const enterActiveClasses = ref("");
const leaveActiveClasses = ref("");

watch(
	() => store.openModal,
	(newVal, oldVal) => {
		// When switching between modals, oldVal and newVal will both have a value.
		// When opening or closing, one of them will be null.
		const isSwitching = oldVal !== null && newVal !== null;

		if (isSwitching) {
			enterFromClasses.value = "";
			leaveToClasses.value = "";
			enterActiveClasses.value = "";
			leaveActiveClasses.value = "";
		} else {
			enterFromClasses.value = "opacity-0 blur-[5px] scale-95";
			leaveToClasses.value = "opacity-0 blur-[5px] scale-95";
			enterActiveClasses.value = "transition-all duration-300 ease-in-out";
			leaveActiveClasses.value = "transition-all duration-300 ease-in-out";
		}
	},
	{ immediate: true }
);
</script>
