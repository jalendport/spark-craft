<template>
	<div :class="{ 'input-error': errors.length > 0 }">
		<input
			type="hidden"
			:name="name"
			:value="uncheckedValue"
			v-if="uncheckedValue && !checked"
		/>
		<input
			v-bind="attributes"
			type="checkbox"
			:name="name"
			:value="checkedValue"
			:checked="checked"
			@change="customHandleChange"
		/>
		<label :for="attributes.id" v-html="label"></label>
	</div>
</template>

<script setup>
import { computed, watch } from "vue";
import { useField } from "vee-validate";
import * as yup from "yup";

const props = defineProps({
	label: {
		type: String,
		required: true,
		default: null,
	},
	name: {
		type: String,
		required: true,
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
	uncheckedValue: {
		type: [String, Number, Boolean],
		default: null,
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

const { checked, meta, errors, handleChange } = useField(
	() => props.name,
	validator,
	{
		initialValue: getInitialValue(),
		type: "checkbox",
		checkedValue: props.checkedValue,
		uncheckedValue: props.uncheckedValue,
	}
);

// Watch for external modelValue changes and sync to vee-validate
watch(
	() => model.value,
	(newValue) => {
		if (
			newValue !== undefined &&
			newValue !== null &&
			newValue !== checked.value
		) {
			checked.value = newValue;
		}
	}
);

// Watch vee-validate value and emit to parent
watch(checked, (newValue) => {
	emit("update:modelValue", newValue);
});

const customHandleChange = (e) => {
	handleChange(e, errors.value.length > 0);
};
</script>
