<template>
	<div
		class="flex w-full flex-col items-start gap-8"
		:class="{ 'cursor-not-allowed opacity-50': disabled }"
	>
		<span
			class="text-14/20 tracking-2 cursor-default"
			v-if="label"
			@click="openDropdown()"
			>{{ label }}<span class="input-required" v-if="required">&nbsp;*</span></span
		>
		<template v-if="isValueAnArray">
			<input type="hidden" :name="computedName" />
			<input
				type="hidden"
				:name="computedName + '[]'"
				:value="item"
				:key="index"
				v-for="(item, index) in vvValue"
			/>
		</template>
		<input type="hidden" :name="computedName" :value="vvValue" v-else />
		<div
			:tabindex="searchable ? -1 : 0"
			@focus="openDropdown()"
			@blur="closeDropdown()"
			@keydown.self.down.prevent="pointerForward()"
			@keydown.self.up.prevent="pointerBackward()"
			@keydown.enter.tab.stop.self="addPointerElement($event)"
			@keyup.esc="closeDropdown()"
			class="input-container relative w-full gap-8"
			:class="{ 'input-error': errors.length > 0 }"
			role="combobox"
			:aria-expanded="isOpen"
			:aria-owns="'listbox-' + computedId"
			:aria-activedescendant="
				isOpen && pointer !== null ? computedId + '-' + pointer : null
			"
			ref="selectEl"
		>
			<div ref="tags" class="flex w-full flex-wrap gap-x-4 gap-y-8">
				<template v-if="props.multiple && normalizedValue.length > 0">
					<div
						class="pointer-events-auto -my-2 flex rounded-2 bg-gray/10"
						v-for="(option, index) of normalizedValue"
						@mousedown.prevent
						:key="index"
					>
						<div
							class="text-14/22 tracking-3 line-clamp-1 px-6 py-2"
							v-html="getOptionLabel(getOptionByValue(option))"
						></div>
						<button
							tabindex="1"
							class="group flex cursor-pointer items-center px-2 hover:bg-error/10"
							@mousedown.prevent="removeSelectedOption(option)"
							@keydown.enter.prevent="removeSelectedOption(option)"
						>
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								class="size-16 text-gray group-hover:text-error"
							>
								<line x1="18" y1="6" x2="6" y2="18" />
								<line x1="6" y1="6" x2="18" y2="18" />
							</svg>
						</button>
					</div>
				</template>
				<span v-if="props.internalLabel" class="text-16/22">{{
					props.internalLabel +
					(props.internalLabel && currentOptionLabel ? ":&nbsp;" : "")
				}}</span>
				<span
					v-if="
						!props.multiple &&
						(!isOpen || !props.searchable) &&
						currentOptionLabel
					"
					class="text-16/22 text-black"
					>{{ currentOptionLabel }}</span
				>
				<div
					class="inline-grid max-w-full flex-auto flex-shrink flex-grow grid-cols-[0px_min-content] overflow-hidden after:invisible after:max-w-full after:text-16/22 after:tracking-3 after:whitespace-pre after:content-[attr(data-value)] after:[grid-area:1/2]"
					:data-value="search.length > 0 ? search : computedPlaceholder"
					v-if="props.searchable || computedPlaceholder"
				>
					<input
						ref="searchInput"
						v-if="props.searchable"
						type="text"
						autocomplete="off"
						:placeholder="computedPlaceholder"
						:disabled="disabled"
						:id="computedId + '-searchbox'"
						v-model="search"
						@focus.prevent="openDropdown()"
						@blur.prevent="closeDropdown()"
						@keyup.esc="closeDropdown()"
						@keydown.down.prevent="pointerForward()"
						@keydown.up.prevent="pointerBackward()"
						@keydown.enter.prevent.stop.self="addPointerElement($event)"
						@keydown.delete.stop="removeLastSelectedOption()"
						@keydown="handleComma($event)"
						class="min-w-[2px] max-w-full text-16/22 text-black [grid-area:1/2]"
						:class="{
							'text-error placeholder:text-error focus:placeholder:text-error/50':
								errors.length > 0,
						}"
						:aria-controls="'listbox-' + computedId"
						:aria-label="computedName + '-searchbox'"
					/>
					<span v-else class="text-16/22 tracking-3 text-nowrap">{{
						computedPlaceholder
					}}</span>
				</div>
			</div>
			<button
				@click="removeAllSelectedOptions()"
				v-if="props.multiple && normalizedValue.length"
				type="button"
				class="group relative cursor-pointer"
			>
				<svg
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="size-16 flex-shrink-0 text-gray group-hover:text-error"
				>
					<line x1="18" y1="6" x2="6" y2="18" />
					<line x1="6" y1="6" x2="18" y2="18" />
				</svg>
			</button>
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="size-16 flex-shrink-0 text-gray"
			>
				<polyline points="6 9 12 15 18 9" />
			</svg>
			<div
				v-if="isOpen"
				ref="dropdown"
				class="relative z-10 max-h-200 overflow-scroll rounded-4 border border-gray/15 bg-white text-black shadow-card"
				:style="{ ...floatingStyles, minWidth: `${selectWidth}px` }"
				@focus="openDropdown()"
				tabindex="-1"
				@mousedown.prevent
			>
				<ul
					class="w-full"
					role="listbox"
					:id="'listbox-' + computedId"
					:aria-multiselectable="multiple"
				>
					<li
						v-for="(option, index) of filteredOptions"
						:key="index"
						:aria-selected="isSelected(option)"
						:id="computedId + '-' + index"
						role="option"
					>
						<span
							@click.stop="select(option)"
							@mouseenter.self="pointerSet(index)"
							class="block select-none px-16 py-6"
							:class="{
								'bg-brand-accent text-brand-on-accent':
									index === pointer && !isSelected(option),
								'bg-brand-accent/10 text-brand-accent font-bold':
									isSelected(option),
							}"
							v-html="getOptionLabel(option, true)"
						></span>
					</li>
					<li v-if="showTagOption" role="option">
						<span
							@click.stop="addTag()"
							@mouseenter.self="pointerSet(filteredOptions.length)"
							class="block select-none px-16 py-6"
							:class="{
								'bg-brand-accent text-brand-on-accent':
									pointer === filteredOptions.length,
							}"
						>
							Add “{{ search }}”.
						</span>
					</li>
					<li v-show="showAlreadyExists">
						<span class="block select-none px-16 py-6"
							>“{{ search }}” already exists.</span
						>
					</li>
					<li
						v-show="
							showNoResults &&
							filteredOptions.length === 0 &&
							search &&
							!loading &&
							!taggable
						"
					>
						<span class="block select-none px-16 py-6">No results found.</span>
					</li>
					<li
						v-show="
							showNoOptions &&
							options.length === 0 &&
							!search &&
							!loading &&
							internalSearch
						"
					>
						<span class="block select-none px-16 py-6"
							>No available options.</span
						>
					</li>
					<li
						v-show="
							showNoOptions &&
							options.length === 0 &&
							!search &&
							!loading &&
							!internalSearch
						"
					>
						<span class="block select-none px-16 py-6">Start typing...</span>
					</li>
				</ul>
			</div>
		</div>
		<p class="text-12 tracking-2 text-error leading-16" v-if="errors.length > 0">
			{{ errorMessage }}
		</p>
	</div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from "vue";
import { useField, useFieldArray } from "vee-validate";
import * as yup from "yup";
import { useFloating, autoUpdate, offset, flip } from "@floating-ui/vue";
import { generateUniqueId } from "@composables/uid.js";

// Props
const props = defineProps({
	label: {
		type: String,
		default: null,
	},
	name: {
		type: String,
		default: null,
	},
	id: {
		type: String,
		default: "",
	},
	value: {
		type: [String, Array],
		default: null,
	},
	options: {
		type: Array,
		required: true,
	},
	initialCachedOptions: {
		type: Array,
		default: () => [],
	},
	validatorString: String,
	placeholder: {
		type: String,
		default: "Select option",
	},
	internalLabel: {
		type: String,
		default: null,
	},
	loading: {
		type: Boolean,
		default: false,
	},
	disabled: {
		type: Boolean,
		default: false,
	},
	required: {
		type: Boolean,
		default: false,
	},
	multiple: {
		type: Boolean,
		default: false,
	},
	searchable: {
		type: Boolean,
		default: false,
	},
	optionsLimit: {
		type: Number,
		default: 1000,
	},
	showNoOptions: {
		type: Boolean,
		default: true,
	},
	showNoResults: {
		type: Boolean,
		default: true,
	},
	preserveSearch: {
		type: Boolean,
		default: false,
	},
	clearOnSelect: {
		type: Boolean,
		default: true,
	},
	closeOnSelect: {
		type: Boolean,
		default: true,
	},
	allowEmpty: {
		type: Boolean,
		default: true,
	},
	taggable: {
		type: Boolean,
		default: false,
	},
	internalSearch: {
		type: Boolean,
		default: true,
	},
	filteringSortFunc: {
		type: Function,
		default: null,
	},
});

// Use v-model if available, otherwise use value prop
const model = defineModel({ required: false });

const isModel = computed(() => {
	return model.value !== undefined;
});

const validator = computed(() => {
	if (!props.validatorString) return null;
	// Create validator function from string
	return new Function("yup", `return ${props.validatorString}`)(yup);
});

// Only use vee-validate if we have a validator or name was explicitly provided
const useVeeValidate = computed(() => !!props.validatorString || !!props.name);

// Generate a name if none provided (for hidden inputs)
const computedName = computed(() => props.name || "form-select-" + generateUniqueId());

let vvValue, meta, errors, handleChange, push, prepend, remove, swap, insert, update, replace, move;

if (useVeeValidate.value) {
	const field = useField(() => computedName.value, validator, {
		...(isModel.value ? { syncVModel: true } : { initialValue: props.value }),
	});
	vvValue = field.value;
	meta = field.meta;
	errors = field.errors;
	handleChange = field.handleChange;

	const fieldArray = useFieldArray(() => computedName.value);
	push = fieldArray.push;
	prepend = fieldArray.prepend;
	remove = fieldArray.remove;
	swap = fieldArray.swap;
	insert = fieldArray.insert;
	update = fieldArray.update;
	replace = fieldArray.replace;
	move = fieldArray.move;
} else {
	// Use model directly without vee-validate
	vvValue = model;
	meta = ref({});
	errors = ref([]);
	handleChange = (val) => {
		model.value = val;
	};

	// Simple array manipulation without vee-validate
	push = (val) => {
		if (Array.isArray(model.value)) model.value.push(val);
	};
	prepend = (val) => {
		if (Array.isArray(model.value)) model.value.unshift(val);
	};
	remove = (idx) => {
		if (Array.isArray(model.value)) model.value.splice(idx, 1);
	};
	swap = (a, b) => {
		if (Array.isArray(model.value))
			[model.value[a], model.value[b]] = [model.value[b], model.value[a]];
	};
	insert = (idx, val) => {
		if (Array.isArray(model.value)) model.value.splice(idx, 0, val);
	};
	update = (idx, val) => {
		if (Array.isArray(model.value)) model.value[idx] = val;
	};
	replace = (arr) => {
		model.value = arr;
	};
	move = (from, to) => {
		if (Array.isArray(model.value))
			model.value.splice(to, 0, model.value.splice(from, 1)[0]);
	};
}

const customHandleChange = (e) => {
	handleChange(e, errors.value.length > 0);
};

const errorMessage = computed(() => {
	return errors.value.length > 0
		? errors.value
				.map((sentence) => sentence.charAt(0).toUpperCase() + sentence.slice(1))
				.join(". ") + "."
		: "";
});

////////////////////

const emit = defineEmits(["search", "select"]);

const searchInput = ref(null);
const selectEl = ref(null);
const dropdown = ref(null);

// Convert value to always be an array for easier handling
const normalizedValue = computed(() => {
	if (props.multiple || isValueAnArray.value) {
		return Array.isArray(vvValue.value)
			? vvValue.value
			: vvValue.value
				? [vvValue.value]
				: [];
	} else {
		return vvValue.value ? [vvValue.value] : [];
	}
});

const isValueAnArray = computed(() => {
	return Array.isArray(isModel.value ? model.value : props.value);
});

const computedId = computed(() => {
	return props.id ? props.id : generateUniqueId();
});

const computedPlaceholder = computed(() => {
	if (
		!props.multiple &&
		props.searchable &&
		isOpen.value &&
		normalizedValue.value.length > 0
	)
		return currentOptionLabel.value;
	if (normalizedValue.value.length === 0) {
		return props.placeholder;
	}
	return "";
});

const search = ref("");
const isOpen = ref(false);

function openDropdown() {
	if (isOpen.value || props.disabled) return;

	// Update width before opening
	updateSelectWidth();

	isOpen.value = true;

	nextTick(() => {
		if (props.searchable) {
			if (!props.preserveSearch) search.value = "";
			searchInput.value?.focus();
		} else {
			selectEl.value?.focus();
		}
	});
}

function closeDropdown() {
	if (!isOpen.value) return;

	isOpen.value = false;

	if (props.searchable) {
		if (!props.preserveSearch) search.value = "";
		searchInput.value?.blur();
	} else {
		selectEl.value?.blur();
	}
}

const cachedOptions = ref([...props.initialCachedOptions]);

// Watch for updates to initialCachedOptions
watch(
	() => props.initialCachedOptions,
	(newOptions) => {
		cachedOptions.value = [...newOptions];
	},
	{ deep: true }
);

function select(option, key) {
	if (props.disabled || option.disabled) return;

	const optionValue = getOptionValue(option);

	if (props.multiple) {
		push(optionValue);
	} else if (isValueAnArray.value) {
		replace([optionValue]);
	} else {
		customHandleChange(optionValue);
	}

	if (!cachedOptions.value.find((opt) => getOptionValue(opt) === optionValue)) {
		cachedOptions.value.push(option);
	}

	if (props.clearOnSelect) search.value = "";
	if (props.closeOnSelect) closeDropdown();
}

const filteredOptions = computed(() => {
	const searchTerm = search.value || "";
	const normalizedSearch = searchTerm.toLowerCase().trim();

	let options = props.options.concat();

	if (props.internalSearch) {
		options = filterOptions(options, normalizedSearch);
	}

	if (props.multiple) {
		options = options.filter((option) => !isSelected(option));
	}

	return options.slice(0, props.optionsLimit);
});

const showTagOption = computed(() => {
	if (!props.taggable || !search.value.trim()) return false;

	const searchTerm = search.value.trim();

	// Don't show if already selected
	if (normalizedValue.value.includes(searchTerm)) return false;

	// Don't show if exact match exists in filtered options
	return !filteredOptions.value.find((opt) => getOptionValue(opt) === searchTerm);
});

const showAlreadyExists = computed(() => {
	if (!props.taggable || !search.value.trim()) return false;

	const searchTerm = search.value.trim();
	return normalizedValue.value.includes(searchTerm);
});

function filterOptions(options, search) {
	return search
		? options
				.filter((option) => getOptionLabel(option).toLowerCase().includes(search))
				.sort((a, b) => {
					if (typeof props.filteringSortFunc === "function") {
						return props.filteringSortFunc(a, b);
					}
					return getOptionLabel(a).length - getOptionLabel(b).length;
				})
		: options;
}

function getOptionByValue(value) {
	const allOptions = [...props.options, ...cachedOptions.value];
	const option = allOptions.find((option) => getOptionValue(option) === value);
	if (option) {
		return option;
	} else {
		return { value: value, text: value };
	}
}

function getOptionLabel(option, search = false) {
	if (!option) return "";
	if (typeof option === "object") {
		if (search && option.searchText) {
			return option.searchText;
		}
		if ("text" in option) {
			return option.text;
		}
		if ("value" in option) {
			return option.value;
		}
		return JSON.stringify(option);
	}
	return option.toString();
}

function getOptionValue(option) {
	if (!option) return null;
	if (typeof option === "object") {
		if ("value" in option) {
			return option.value;
		}
		return JSON.stringify(option);
	}
	return option.toString();
}

const currentOptionLabel = computed(() => {
	let option = null;
	if (isValueAnArray.value) {
		option = getOptionByValue(vvValue.value[0]);
	} else {
		option = getOptionByValue(vvValue.value);
	}
	return getOptionLabel(option);
});

function isSelected(option) {
	const optionValue = getOptionValue(option);
	return normalizedValue.value.indexOf(optionValue) > -1;
}

function removeSelectedOption(optionValue, shouldClose = true) {
	if (props.disabled) return;
	if (!props.allowEmpty && normalizedValue.value.length <= 1) {
		closeDropdown();
		return;
	}

	if (props.multiple) {
		const index = normalizedValue.value.indexOf(optionValue);
		remove(index);
	} else if (isValueAnArray.value) {
		replace([]);
	} else {
		customHandleChange("");
	}

	if (props.closeOnSelect && shouldClose) closeDropdown();
}

function removeLastSelectedOption() {
	if (
		search.value.length === 0 &&
		Array.isArray(normalizedValue.value) &&
		normalizedValue.value.length
	) {
		removeSelectedOption(
			normalizedValue.value[normalizedValue.value.length - 1],
			false
		);
	}
}

function addTag() {
	if (!search.value.trim()) return;

	const tagValue = search.value.trim();
	const tagOption = { value: tagValue, text: tagValue };
	select(tagOption);
}

function handleComma(event) {
	if (props.taggable && event.key === "," && search.value.trim()) {
		event.preventDefault();
		addTag();
		nextTick(() => {
			searchInput.value?.focus();
		});
	}
}

function removeAllSelectedOptions() {
	if (props.multiple || isValueAnArray.value) {
		replace([]);
	} else {
		customHandleChange("");
	}
}

watch(search, () => {
	emit("search", search.value);
});

// POINTER SETUP

const pointer = ref(0);
const pointerDirty = ref(false);

function addPointerElement({ key } = "Enter") {
	if (pointer.value === filteredOptions.value.length && showTagOption.value) {
		addTag();
	} else if (
		filteredOptions.value.length > 0 &&
		pointer.value < filteredOptions.value.length
	) {
		select(filteredOptions.value[pointer.value], key);
	}
	pointerReset();
}

function pointerForward() {
	const maxPointer = showTagOption.value
		? filteredOptions.value.length
		: filteredOptions.value.length - 1;
	if (pointer.value < maxPointer) {
		pointer.value++;
		scrollToPointer();
	}
	pointerDirty.value = true;
}

function pointerBackward() {
	if (pointer.value > 0) {
		pointer.value--;
		scrollToPointer();
	}
	pointerDirty.value = true;
}

function pointerReset() {
	if (!props.closeOnSelect) return;
	pointer.value = 0;
	if (dropdown.value) {
		dropdown.value.scrollTop = 0;
	}
}

function pointerAdjust() {
	if (pointer.value >= filteredOptions.value.length - 1) {
		pointer.value = filteredOptions.value.length
			? filteredOptions.value.length - 1
			: 0;
	}
}

function pointerSet(index) {
	pointer.value = index;
	pointerDirty.value = true;
}

function scrollToPointer() {
	if (!dropdown.value) return;

	nextTick(() => {
		const options = dropdown.value.querySelectorAll("li > span");
		const highlightedElement = options[pointer.value];

		if (!highlightedElement) return;

		const dropdownRect = dropdown.value.getBoundingClientRect();
		const elementRect = highlightedElement.getBoundingClientRect();

		// Check if element is above the visible area
		if (elementRect.top < dropdownRect.top) {
			dropdown.value.scrollTop -= dropdownRect.top - elementRect.top;
		}
		// Check if element is below the visible area
		else if (elementRect.bottom > dropdownRect.bottom) {
			dropdown.value.scrollTop += elementRect.bottom - dropdownRect.bottom;
		}
	});
}

watch(filteredOptions, () => {
	pointerAdjust();
});

watch(isOpen, () => {
	pointerDirty.value = false;
});

watch(pointer, () => {
	searchInput.value?.setAttribute(
		"aria-activedescendant",
		props.id + "-" + pointer.value.toString()
	);
});

// END POINTER SETUP

// DROPDOWN SETUP

const selectWidth = ref(0);

const { floatingStyles } = useFloating(selectEl, dropdown, {
	placement: "bottom-start",
	whileElementsMounted: autoUpdate,
	middleware: [offset(8), flip()],
});

// Update select width
const updateSelectWidth = () => {
	if (selectEl.value) {
		selectWidth.value = selectEl.value.offsetWidth;
	}
};

// Watch for width changes
watch(
	() => selectEl.value,
	() => {
		updateSelectWidth();
	},
	{ immediate: true }
);

const resizeObserver = ref(null);

onMounted(() => {
	// Set up ResizeObserver to track width changes
	if (selectEl.value && typeof ResizeObserver !== "undefined") {
		resizeObserver.value = new ResizeObserver(() => {
			updateSelectWidth();
		});
		resizeObserver.value.observe(selectEl.value);
	}
});

onBeforeUnmount(() => {
	if (resizeObserver.value && selectEl.value) {
		resizeObserver.value.unobserve(selectEl.value);
	}
});

// END DROPDOWN SETUP
</script>
