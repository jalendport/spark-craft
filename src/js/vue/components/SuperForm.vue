<template>
	<form ref="form" @submit="onSubmit" novalidate>
		<slot
			:meta="meta"
			:values="values"
			:clean-values="cleanValues"
			:success="success"
			:is-submitting="isSubmitting"
			:set-submitting="setSubmitting"
		></slot>
		<p class="mt-20 text-error" v-if="internalErrorMessage">
			{{ internalErrorMessage }}
		</p>
	</form>
</template>

<script setup>
import { ref, watch } from "vue";
import { useForm } from "vee-validate";
import { httpPost } from "@js/utils/http";

const props = defineProps({
	resetOnSuccess: {
		type: Boolean,
		default: false,
	},
	cleanOnSuccess: {
		type: Boolean,
		default: false,
	},
	errorMessage: {
		type: String,
		default: null,
	},
	// Field handle to attach errors to when the server response uses Craft's
	// asFailure($msg, $model->getErrors($attr)) pattern (numerically-indexed
	// errors without a field name).
	errorField: {
		type: String,
		default: null,
	},
	// Number of seconds to keep isSubmitting true after submission completes
	submitCooldown: {
		type: Number,
		default: 0,
	},
});

const form = ref(null);

const emit = defineEmits(["submit"]);

const { meta, values, handleSubmit, resetForm, setFieldError, setErrors } =
	useForm();

const success = ref(false);
const isSubmitting = ref(false);
const internalErrorMessage = ref(null);

const setSubmitting = (value) => {
	isSubmitting.value = value;
};

watch(
	() => props.errorMessage,
	(newVal) => {
		internalErrorMessage.value = newVal;
	}
);

const resetSubmitting = () => {
	isSubmitting.value = false;
};

const applyServerErrors = (data) => {
	if (!data || typeof data !== "object") return;
	// asModelFailure: { errors: { fieldHandle: [...] } }
	if (data.errors && typeof data.errors === "object" && !Array.isArray(data.errors)) {
		setErrors(data.errors);
	}
	// asFailure with getErrors($attr): numerically-indexed messages at top level
	if (props.errorField) {
		const messages = Object.entries(data)
			.filter(([k]) => /^\d+$/.test(k))
			.flatMap(([, v]) => (Array.isArray(v) ? v : [v]))
			.filter((v) => typeof v === "string");
		if (messages.length) setFieldError(props.errorField, messages.join(" "));
	}
};

defineExpose({ resetSubmitting });

const onSubmit = handleSubmit(async (values) => {
	if (isSubmitting.value) return;
	const actionInput = form.value.querySelector('input[name="action"]');
	if (actionInput?.value) {
		isSubmitting.value = true;
		internalErrorMessage.value = null;
		const formData = new FormData(form.value);
		formData.delete("action");

		try {
			const response = await httpPost(`/actions/${actionInput.value}`, formData, {
				headers: { Accept: "application/json" },
			});
			success.value = true;
			emit("submit", {
				success: true,
				data: response.data,
			});

			if (props.resetOnSuccess) {
				resetForm();
			}

			if (props.cleanOnSuccess) {
				resetForm({ values });
			}
		} catch (error) {
			console.error("Form submission error:", error.response?.data?.errorCode);
			const data = error.response?.data;
			internalErrorMessage.value =
				data?.message || "An error occurred while submitting the form.";
			applyServerErrors(data);
			emit("submit", {
				success: false,
				error: data,
			});
		} finally {
			if (props.submitCooldown > 0) {
				setTimeout(() => {
					isSubmitting.value = false;
				}, props.submitCooldown * 1000);
			} else {
				isSubmitting.value = false;
			}
		}
	} else {
		success.value = true;
		emit("submit", values);
	}
});

const cleanValues = (obj) => {
	/**
	 * This function flattens the vee-validate values object for debugging purposes.
	 *
	 * vee-validate parses bracketed field names into a nested object structure.
	 * When numeric keys are used in the field name, vee-validate creates sparse
	 * arrays with many null values (the actual data sits at the numeric index).
	 *
	 * This function converts the nested structure back into a flat object with
	 * bracket notation keys that match the original field names, filtering out all
	 * the null values from sparse arrays. This makes the debug output readable and
	 * shows exactly what field names and values exist in the form.
	 *
	 * Note: The actual form submission uses FormData directly from the DOM, so this
	 * sparse array issue only affects the vee-validate values object used for
	 * debugging and conditional rendering.
	 */
	const result = {};

	const flatten = (current, prefix = "") => {
		if (Array.isArray(current)) {
			current.forEach((item, index) => {
				if (item !== null && item !== undefined) {
					flatten(item, `${prefix}[${index}]`);
				}
			});
		} else if (current !== null && typeof current === "object") {
			for (const [key, value] of Object.entries(current)) {
				const newKey = prefix
					? key.startsWith("[")
						? `${prefix}${key}`
						: `${prefix}[${key}]`
					: key;
				flatten(value, newKey);
			}
		} else {
			result[prefix] = current;
		}
	};

	flatten(obj);
	return result;
};
</script>
