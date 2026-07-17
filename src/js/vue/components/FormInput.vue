<template>
	<div class="flex w-full flex-col items-start gap-8">
		<label :for="attributes.id" class="text-14/20 tracking-2" v-if="label"
			>{{ label
			}}<span class="input-required" v-if="attributes.required">&nbsp;*</span></label
		>
		<div
			class="input-container w-full"
			:class="{ 'input-error': errors.length > 0 }"
			@click="focusInput"
		>
			<slot name="left-contents" :meta="meta"></slot>

			<textarea
				v-bind="attributes"
				:name="name"
				:value="vvValue"
				@input="customHandleInput"
				@change="customHandleChange"
				@blur="customHandleBlur"
				v-if="attributes.type == 'textarea'"
			></textarea>

			<template v-else>
				<input
					v-bind="attributes"
					:name="name"
					:value="vvValue"
					@input="customHandleInput"
					@change="customHandleChange"
					@blur="customHandleBlur"
					v-if="mask == null && maskNumber === false"
				/>

				<template v-else>
					<input type="hidden" :name="name" :value="vvValue" />
					<input
						v-bind="attributes"
						v-model="maskedDisplayValue"
						v-maska="maskaOptions"
						@blur="customHandleBlur"
					/>
				</template>
			</template>

			<slot name="right-contents" :meta="meta"></slot>
		</div>
		<p class="text-12 tracking-2 text-error leading-16" v-if="errors.length > 0">
			{{ errorMessage }}
		</p>
		<slot name="bottom-contents" :meta="meta"></slot>
	</div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useField } from "vee-validate";
import * as yup from "yup";

const props = defineProps({
	label: {
		type: String,
		default: null,
	},
	name: {
		type: String,
		required: true,
	},
	value: {
		type: [String, Number],
		default: null,
	},
	validatorString: String,
	validatorContext: {
		type: Object,
		default: () => ({}),
	},
	mask: {
		type: [String, Array],
		default: null,
	},
	maskTokens: {
		type: [String, Object],
		default: null,
	},
	maskReversed: {
		type: Boolean,
		default: false,
	},
	maskNumber: {
		type: Boolean,
		default: false,
	},
	maskPostProcess: {
		type: Function,
		default: null,
	},
	maskUse: {
		type: String,
		default: "unmasked",
		validator: (value) => ["unmasked", "masked"].includes(value),
	},
	attributes: {
		type: Object,
		default: () => ({}),
	},
});

const emit = defineEmits(["input", "change", "blur"]);

// Use v-model if available, otherwise use value prop
const model = defineModel({ required: false });

const isModel = computed(() => {
	return model.value !== undefined;
});

const validator = computed(() => {
	if (!props.validatorString) return null;
	// Create validator function from string with context variables
	const contextKeys = Object.keys(props.validatorContext);
	const contextValues = Object.values(props.validatorContext);
	return new Function("yup", ...contextKeys, `return ${props.validatorString}`)(
		yup,
		...contextValues
	);
});

const { value: vvValue, meta, errors, handleBlur, handleChange } = useField(
	() => props.name,
	validator.value,
	{
		...(isModel.value ? { syncVModel: true } : { initialValue: props.value }),
	}
);

const maskedDisplayValue = ref(vvValue.value);
const hasBlurred = ref(false);
const isUpdatingFromMask = ref(false);

// Sync vvValue to maskedDisplayValue when vvValue changes externally
watch(vvValue, (newValue) => {
	if (!isUpdatingFromMask.value && maskedDisplayValue.value !== newValue) {
		maskedDisplayValue.value = newValue;
	}
});

const customHandleBlur = (e) => {
	hasBlurred.value = true;
	handleBlur(e, true);
	emit("blur", e);
};

const customHandleChange = (e) => {
	// Only validate on change if we've blurred before or there are errors
	const shouldValidate = hasBlurred.value || errors.value.length > 0;
	handleChange(e, shouldValidate);
};

const customHandleInput = (e) => {
	// Only validate on input if we've blurred before or there are errors
	const shouldValidate = hasBlurred.value || errors.value.length > 0;
	handleChange(e, shouldValidate);
};

const maskaOptions = computed(() => {
	return {
		mask: props.mask,
		tokens: props.maskTokens,
		reversed: props.maskReversed,
		number: !props.maskNumber
			? null
			: {
					locale: "us",
					fraction: 0,
					unsigned: true,
				},
		postProcess: props.maskPostProcess,
		onMaska: (detail) => {
			const value = props.maskUse === "masked" ? detail.masked : detail.unmasked;
			if (vvValue.value !== value) {
				isUpdatingFromMask.value = true;
				const shouldValidate = hasBlurred.value || errors.value.length > 0;
				handleChange(value, shouldValidate);
				isUpdatingFromMask.value = false;
			}
		},
	};
});

const focusInput = (e) => {
	// Find the closest .input-container element, regardless of what was clicked
	const containerEl = e.target.closest(".input-container");

	if (containerEl) {
		const inputElement = containerEl.querySelector("input, textarea");
		if (inputElement) {
			inputElement.focus();
		}
	}
};

const errorMessage = computed(() => {
	if (errors.value.length === 0) return "";
	return errors.value
		.map((sentence) => sentence.charAt(0).toUpperCase() + sentence.slice(1))
		.map((sentence) => (sentence.endsWith(".") ? sentence : `${sentence}.`))
		.join(" ");
});
</script>
