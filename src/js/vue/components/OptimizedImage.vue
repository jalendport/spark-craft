<template>
	<picture>
		<source v-if="avif" :srcset="avif" type="image/avif" />
		<source v-if="webp" :srcset="webp" type="image/webp" />
		<img :src="jpg" :alt="alt" v-bind="$attrs" />
	</picture>
</template>

<script setup>
defineOptions({ inheritAttrs: false });

defineProps({
	avif: { type: String, default: null },
	webp: { type: String, default: null },
	jpg: { type: String, required: true },
	alt: { type: String, default: "" },
});
</script>
