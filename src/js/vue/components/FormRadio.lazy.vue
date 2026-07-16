<template>
	<div
		class="flex items-center"
		:class="{ 'input-error': errors.length > 0, 'input-checked': checked }"
	>
		<input
			v-bind="computedAttributes"
			type="radio"
			:name="computedName"
			:value="checkedValue"
			:checked="checked"
			@change="customHandleChange"
		/>
		<template v-if="!$slots['custom-label']">
			<label :for="computedAttributes.id" class="pl-10">{{ label }}</label>
		</template>
		<template v-else>
			<label :for="computedAttributes.id"><slot name="custom-label"></slot></label>
		</template>
	</div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useField } from "vee-validate";
import * as yup from "yup";
import { generateUniqueId } from "@composables/uid.js";

const props = defineProps({
	label: {
		type: String,
		required: true,
		default: null,
	},
	name: {
		type: String,
		default: null,
	},
	value: {
		type: [String, Number, Boolean],
		default: false,
	},
	checkedValue: {
		type: [String, Number, Boolean],
		required: true,
		default: true,
	},
	validatorString: String,
	attributes: {
		type: Object,
		default: () => ({}),
	},
});

const emit = defineEmits(["update:modelValue"]);

// Use v-model if available, otherwise use value prop
const model = defineModel({ required: false });

// Generate a unique ID if one isn't provided in attributes
const computedAttributes = computed(() => ({
	...props.attributes,
	id: props.attributes.id || "form-radio-" + generateUniqueId(),
}));

// Determine initial value: prioritize modelValue, then initialValue
const getInitialValue = () => {
	if (model.value !== null && model.value !== undefined) {
		return model.value;
	}
	return props.value;
};

// Create validator function from string
const validator = computed(() => {
	if (
		props.validatorString === "" ||
		props.validatorString === null ||
		props.validatorString === undefined
	) {
		return null;
	}
	return new Function("yup", `return ${props.validatorString}`)(yup);
});

// Only use vee-validate if we have a validator or name was explicitly provided
const useVeeValidate = computed(() => !!props.validatorString || !!props.name);

// Generate a name if none provided
const computedName = computed(() => props.name || "form-radio-" + generateUniqueId());

let vvValue, meta, errors, handleChange;

if (useVeeValidate.value) {
	const field = useField(() => computedName.value, validator.value, {
		initialValue: getInitialValue(),
		syncVModel: true,
		type: "radio",
		checkedValue: props.checkedValue,
	});
	vvValue = field.value;
	meta = field.meta;
	errors = field.errors;
	handleChange = field.handleChange;

	// Watch for external modelValue changes and sync to vee-validate (only when using vee-validate)
	watch(
		() => model.value,
		(newValue) => {
			if (
				newValue !== undefined &&
				newValue !== null &&
				newValue !== vvValue.value
			) {
				customHandleChange(newValue);
			}
		}
	);
} else {
	// Use model directly without vee-validate
	vvValue = model;
	meta = ref({});
	errors = ref([]);
	handleChange = (val) => {
		// When not using vee-validate, val will be an Event object
		// We want to set the checkedValue instead
		model.value = props.checkedValue;
	};
}

const customHandleChange = (e) => {
	handleChange(e, true);
};

const checked = computed(() => {
	return vvValue.value === props.checkedValue;
});
</script>
