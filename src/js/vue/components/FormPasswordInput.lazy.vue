<template>
	<form-input
		:label="label"
		:name="name"
		:validator-string="showValidationRules ? passwordValidator : validatorString"
		:attributes="attributes"
	>
		<template #right-contents>
			<button
				type="button"
				class="cursor-pointer text-gray/75"
				:aria-label="passwordShown ? 'Hide password' : 'Show password'"
				@click="showPassword"
			>
				<svg
					v-if="passwordShown"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="size-20"
				>
					<path
						d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
					/>
					<line x1="1" y1="1" x2="23" y2="23" />
				</svg>
				<svg
					v-else
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="size-20"
				>
					<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
					<circle cx="12" cy="12" r="3" />
				</svg>
			</button>
		</template>
		<template #bottom-contents>
			<ul class="space-y-11" v-if="showValidationRules">
				<li
					v-for="rule in passwordValidationRules"
					class="flex items-center gap-10 text-black"
					:key="rule.name"
				>
					<svg
						v-if="rule.isValid"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="size-24 text-success"
					>
						<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
						<polyline points="22 4 12 14.01 9 11.01" />
					</svg>
					<svg
						v-else
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="size-24 text-gray"
					>
						<circle cx="12" cy="12" r="10" />
						<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
						<line x1="12" y1="17" x2="12" y2="17" />
					</svg>
					<span>{{ rule.message }}</span>
				</li>
			</ul>
		</template>
	</form-input>
</template>

<script setup>
import { ref, computed } from "vue";
import { useFormValues } from "vee-validate";

const props = defineProps({
	label: {
		type: String,
		default: null,
	},
	name: {
		type: String,
		required: true,
	},
	validatorString: String,
	attributes: {
		type: Object,
		default: () => ({}),
	},
	showValidationRules: {
		type: Boolean,
		default: true,
	},
});

const formValues = useFormValues();
const value = computed(() => formValues.value[props.name]);

// Create validator function from string
const passwordValidator = `yup.string()
	.required()
	.test('no-spaces', 'Cannot contain any spaces', value => !value || !/\\s/.test(value))
	.min(8, 'Must be at least 8 characters long')
	.test('uppercase', 'Must contain at least 1 capital letter', value => /[A-Z]/.test(value))
	.test('number', 'Must contain at least 1 numeral', value => /[0-9]/.test(value))
	.test('special-char', 'Must contain at least 1 special character', value => /[!@#$%^&*(),.?":{}|<>]/.test(value))`
	.replace(/\s+/g, " ")
	.trim();

const passwordShown = ref(false);
const showPassword = (e) => {
	const input = e.target.closest(".input-container").querySelector("input");
	if (input) {
		if (input.type === "password") {
			input.type = "text";
			passwordShown.value = true;
		} else {
			input.type = "password";
			passwordShown.value = false;
		}
	}
};

const passwordValidationRules = computed(() => {
	const currentValue = value.value || "";

	return [
		{
			name: "noSpaces",
			message: "Cannot contain any spaces",
			isValid: currentValue.length > 0 && !/\s/.test(currentValue),
		},
		{
			name: "minLength",
			message: "Must be at least 8 characters long",
			isValid: currentValue.length >= 8,
		},
		{
			name: "uppercase",
			message: "Must contain at least 1 capital letter",
			isValid: /[A-Z]/.test(currentValue),
		},
		{
			name: "number",
			message: "Must contain at least 1 numeral",
			isValid: /[0-9]/.test(currentValue),
		},
		{
			name: "specialChar",
			message: "Must contain at least 1 special character",
			isValid: /[!@#$%^&*(),.?":{}|<>]/.test(currentValue),
		},
	];
});
</script>
