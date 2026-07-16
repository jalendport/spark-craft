<template>
	<fieldset class="flex w-full flex-col items-start gap-8">
		<legend class="text-14/20 tracking-2 mb-8" v-if="props.label"
			>{{ props.label
			}}<span class="input-required" v-if="required">&nbsp;*</span></legend
		>
		<div class="flex w-full flex-wrap gap-20">
			<input
				type="hidden"
				:name="name"
				:value="''"
				v-if="value === null || value === undefined || value === ''"
			/>
			<slot></slot>
		</div>
		<p class="text-12 tracking-2 text-error leading-16" v-if="errorMessage">
			{{ errorMessage }}
		</p>
	</fieldset>
</template>

<script setup>
import { ref, computed } from "vue";
import { useFormValues, useFormErrors } from "vee-validate";

const props = defineProps({
	label: {
		type: String,
		default: null,
	},
	name: {
		type: String,
		default: null,
	},
	required: {
		type: Boolean,
		default: false,
	},
});

// Use v-model if available
const model = defineModel({ required: false });

// Only use vee-validate if name is provided
const useVeeValidate = computed(() => !!props.name);

let value, errors;

if (useVeeValidate.value) {
	const formValues = useFormValues();
	const formErrors = useFormErrors();

	value = computed(() => formValues.value[props.name]);
	errors = computed(() => formErrors.value[props.name] || []);
} else {
	// Use model directly without vee-validate
	value = model;
	errors = ref([]);
}

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
