<script setup lang="ts">
import manifest from "~/data/image-manifest.json";

const props = withDefaults(defineProps<{
  src: string;
  alt: string;
  sizes?: string;
  loading?: "eager" | "lazy";
}>(), { sizes: "100vw", loading: "lazy" });

const images: Record<string, { width: number; height: number; srcset: string }> = manifest;
const image = computed(() => images[props.src]);
</script>

<template>
  <img
    :src="src"
    :srcset="image?.srcset"
    :sizes="image ? sizes : undefined"
    :width="image?.width"
    :height="image?.height"
    :alt="alt"
    :loading="loading"
    decoding="async"
  />
</template>
