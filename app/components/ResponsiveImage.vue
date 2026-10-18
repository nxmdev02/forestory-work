<script setup lang="ts">
import manifest from "~/data/image-manifest.json";

const props = withDefaults(defineProps<{
  src: string;
  alt: string;
  sizes?: string;
  loading?: "eager" | "lazy";
  width?: string | number;
  height?: string | number;
  fetchpriority?: "high" | "low" | "auto";
}>(), { sizes: "100vw", loading: "lazy" });

const emit = defineEmits<{ load: [event?: Event]; error: [event?: Event] }>();
const images: Record<string, { width: number; height: number; srcset: string }> = manifest;
const image = computed(() => images[props.src]);
const imageWidth = computed(() => props.width ?? image.value?.width);
const imageHeight = computed(() => props.height ?? image.value?.height);
const element = ref<HTMLImageElement>();
const state = ref<"loading" | "ready" | "error">("loading");
let generation = 0;

async function reveal(event?: Event) {
  const target = element.value;
  const current = generation;
  if (!target || !target.complete || !target.naturalWidth) return;
  try {
    await target.decode();
  } catch {
    // A new responsive source may interrupt decoding; its load event will retry.
    if (current === generation && target === element.value && target.complete && !target.naturalWidth)
      fail(event);
    return;
  }
  if (current !== generation || target !== element.value || state.value === "ready") return;
  state.value = "ready";
  emit("load", event);
}

function fail(event?: Event) {
  generation++;
  state.value = "error";
  emit("error", event);
}

function checkCachedImage() {
  if (!element.value?.complete) return;
  if (element.value.naturalWidth) void reveal();
  else fail();
}

watch(() => [props.src, props.sizes], async () => {
  generation++;
  state.value = "loading";
  await nextTick();
  checkCachedImage();
}, { flush: "sync" });
onMounted(checkCachedImage);
onBeforeUnmount(() => { generation++; });
</script>

<template>
  <span
    class="responsive-image"
    :data-image-state="state"
    :aria-busy="state === 'loading'"
    :style="{ '--image-aspect-ratio': imageWidth && imageHeight ? `${imageWidth} / ${imageHeight}` : '4 / 3' }"
  >
    <img
      :key="src"
      ref="element"
      :src="src"
      :srcset="image?.srcset"
      :sizes="image ? sizes : undefined"
      :width="imageWidth"
      :height="imageHeight"
      :alt="alt"
      :loading="loading"
      :fetchpriority="fetchpriority"
      decoding="async"
      @load="reveal"
      @error="fail"
    />
  </span>
</template>
