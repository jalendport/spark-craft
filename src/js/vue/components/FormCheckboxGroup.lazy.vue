<template>
	<fieldset class="flex w-full flex-col items-start gap-8">
		<legend class="text-14/20 tracking-2 mb-8" v-if="props.label"
			>{{ props.label
			}}<span class="input-required" v-if="required">&nbsp;*</span></legend
		>
		<slot></slot>
		<p class="text-12 tracking-2 text-error leading-16" v-if="errorMessage">
			{{ errorMessage }}
		</p>
	</fieldset>
</template>

<script setup>
import { computed } from "vue";
import { useFormValues, useFormErrors } from "vee-validate";

const props = defineProps({
	label: {
		type: String,
		default: null,
	},
	name: {
		type: String,
		required: true,
	},
	required: {
		type: Boolean,
		default: false,
	},
});

const formValues = useFormValues();
const formErrors = useFormErrors();

const value = computed(() => formValues.value[props.name]);
const errors = computed(() => formErrors.value[props.name] || []);

const errorMessage = computed(() => {
	const errorArray = Array.isArray(errors.value) ? errors.value : [errors.value];
	if (errorArray.length === 0) return "";

	return (
		errorArray
			.map((msg) => msg.charAt(0).toUpperCase() + msg.slice(1))
			.join(". ") + "."
	);
});
</script>
