<template>
	<div>
		<span class="text-14/18 tracking-2 font-semibold text-black" v-if="label">{{
			label
		}}</span>

		<div
			ref="dropZone"
			class="my-15 h-125 rounded-4 border border-dashed"
			:class="
				isDragOver
					? 'border-brand-accent bg-brand-accent/10'
					: 'border-gray bg-gray-light'
			"
			@dragenter.prevent="handleDragEnter"
			@dragover.prevent="handleDragOver"
			@dragleave.prevent="handleDragLeave"
			@drop.prevent="handleDrop"
			@click="openFileDialog"
		>
			<div
				class="pointer-events-none flex h-full flex-col items-center justify-center gap-10"
			>
				<svg
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="size-30 text-brand-accent"
				>
					<polyline points="16 16 12 12 8 16" />
					<line x1="12" y1="12" x2="12" y2="21" />
					<path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
					<polyline points="16 16 12 12 8 16" />
				</svg>
				<p class="text-14/20 tracking-2 text-center">Drag &amp; drop files here</p>
			</div>
		</div>

		<!-- File Input (Hidden) -->
		<input
			hidden
			ref="fileInput"
			type="file"
			:multiple="multiple"
			:accept="accept"
			@change="handleFileSelect"
		/>

		<button
			type="button"
			class="cursor-pointer text-brand-accent"
			@click="openFileDialog"
		>
			Browse files
		</button>

		<!-- Ensure the field is submitted even when empty -->
		<input type="hidden" :name="name" value="" />

		<!-- Files Attached Section -->
		<div v-if="allFiles.length > 0" class="mt-8">
			<span class="text-14/18 tracking-2 font-semibold text-black"
				>Files attached</span
			>

			<div class="mt-15 flex flex-col gap-20">
				<div
					v-for="(file, index) in allFiles"
					:key="index"
					class="grid grid-cols-[auto_1fr_auto] items-center gap-10"
				>
					<input
						v-if="!file.isExisting"
						type="file"
						:ref="(el) => (file.inputRef = el)"
						:name="`${name}[]`"
						class="hidden"
					/>

					<div
						class="text-12/18 rounded-4 bg-brand-accent/10 px-10 py-2 font-bold text-brand-accent"
					>
						{{ getFileExtension(file.name).toUpperCase() }}
					</div>

					<span class="text-14/20 tracking-2 mr-auto">{{ file.name }}</span>

					<button
						type="button"
						class="cursor-pointer text-error"
						@click="removeFile(file)"
						aria-label="Remove file"
					>
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="size-20"
						>
							<polyline points="3 6 5 6 21 6" />
							<path
								d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
							/>
							<line x1="10" y1="11" x2="10" y2="17" />
							<line x1="14" y1="11" x2="14" y2="17" />
						</svg>
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from "vue";

// Props
const props = defineProps({
	name: {
		type: String,
	},
	label: {
		type: String,
		default: "Upload files",
	},
	// Comma-separated list of accepted file extensions/types, e.g. ".pdf,.png".
	// Leave null to accept any file.
	accept: {
		type: String,
		default: null,
	},
	multiple: {
		type: Boolean,
		default: true,
	},
	existingFiles: {
		type: Array,
		default: () => [],
	},
});

const uploadedFiles = ref([]);
const existingFiles = ref([]);
const isDragOver = ref(false);
const dragCounter = ref(0);
const dropZone = ref(null);
const fileInput = ref(null);

// Parse the accept prop into a list of lowercase extensions (without the dot).
const allowedExtensions = computed(() => {
	if (!props.accept) return null;
	return props.accept
		.split(",")
		.map((part) => part.trim().replace(/^\./, "").toLowerCase())
		.filter((part) => part.length > 0 && !part.includes("/"));
});

// Initialize existing files
onMounted(() => {
	existingFiles.value = props.existingFiles.map((file) => ({
		...file,
		isExisting: true,
	}));
});

// Computed properties
const allFiles = computed(() => {
	return [...existingFiles.value, ...uploadedFiles.value];
});

// Drag and drop handlers
const handleDragEnter = (e) => {
	e.preventDefault();
	dragCounter.value++;
	isDragOver.value = true;
};

const handleDragOver = (e) => {
	e.preventDefault();
};

const handleDragLeave = (e) => {
	e.preventDefault();
	dragCounter.value--;
	if (dragCounter.value === 0) {
		isDragOver.value = false;
	}
};

const handleDrop = (e) => {
	e.preventDefault();
	isDragOver.value = false;
	dragCounter.value = 0;

	const files = Array.from(e.dataTransfer.files);
	processFiles(files);
};

const openFileDialog = () => {
	fileInput.value.click();
};

const handleFileSelect = (e) => {
	const files = Array.from(e.target.files);
	processFiles(files);
	e.target.value = "";
};

const processFiles = (files) => {
	const validFiles = files.filter((file) => {
		if (!allowedExtensions.value) return true;
		return allowedExtensions.value.includes(getFileExtension(file.name));
	});

	validFiles.forEach((file) => {
		const fileObj = {
			file: file,
			id: Date.now() + Math.random(), // Generate temporary ID
			name: file.name,
			isExisting: false,
			inputRef: null,
		};
		uploadedFiles.value.push(fileObj);

		// Wait for next tick to assign the file to the hidden input
		nextTick(() => {
			if (fileObj.inputRef) {
				const dataTransfer = new DataTransfer();
				dataTransfer.items.add(file);
				fileObj.inputRef.files = dataTransfer.files;
			}
		});
	});
};

const getFileExtension = (filename) => {
	return filename.split(".").pop().toLowerCase();
};

const removeFile = (file) => {
	if (file.isExisting) {
		existingFiles.value = existingFiles.value.filter((f) => f.id !== file.id);
	} else {
		uploadedFiles.value = uploadedFiles.value.filter((f) => f.id !== file.id);
	}
};
</script>
