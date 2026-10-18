<script setup lang="ts">
import type { scenes } from "~/data/site";
import manifest from "~/data/image-manifest.json";
const props = defineProps<{
  scene: (typeof scenes)[number];
  first?: boolean;
}>();
const video = ref<HTMLVideoElement>();
const section = ref<HTMLElement>();
const playing = ref(false);
const images: Record<string, { width: number; height: number }> = manifest;
const imageSizes = computed(() => {
  const image = images[props.scene.imageSrc];
  return image ? `max(100vw, ${image.width / image.height * 100}svh)` : "100vw";
});
let imageReady = false;
let visible = true;
let observer: IntersectionObserver | undefined;
let preference: MediaQueryList | undefined;
function syncMotion() {
  if (!video.value || !preference) return;
  if (preference.matches || !visible || !imageReady) video.value.pause();
  else {
    // Keep the video from competing with the first image on a cold visit.
    if (!video.value.getAttribute("src"))
      video.value.src = `${props.scene.video}#t=${props.scene.videoStart}`;
    video.value.play().catch(() => {
      /* The responsive image stays visible when autoplay is blocked. */
    });
  }
}
function onImageLoad() {
  imageReady = true;
  syncMotion();
}
onMounted(() => {
  if (!props.scene.video) return;
  preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  preference.addEventListener("change", syncMotion);
  observer = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? false;
    syncMotion();
  });
  if (section.value) observer.observe(section.value);
  syncMotion();
});
onBeforeUnmount(() => {
  preference?.removeEventListener("change", syncMotion);
  observer?.disconnect();
});
</script>
<template>
  <section
    ref="section"
    :id="scene.id"
    class="home-scene"
    :style="{
      '--image-position': scene.objectPosition,
      '--mobile-image-position': scene.mobileObjectPosition,
      '--shade': scene.overlayOpacity,
    }"
  >
    <ResponsiveImage
      class="scene-image"
      :src="scene.imageSrc"
      :sizes="imageSizes"
      alt=""
      :loading="first ? 'eager' : 'lazy'"
      :fetchpriority="first ? 'high' : 'auto'"
      @load="onImageLoad"
    />
    <video
      v-if="scene.video"
      ref="video"
      class="scene-video"
      :class="{ 'is-playing': playing }"
      muted
      loop
      playsinline
      preload="none"
      aria-hidden="true"
      tabindex="-1"
      @playing="playing = true"
      @error="playing = false"
    />
    <div class="scene-shade" />
    <h1 v-if="scene.kind === 'intro'" class="scene-title">
      <span v-for="line in scene.title" :key="line">{{ line }}</span>
    </h1>
    <h2 v-else class="scene-title">
      <span v-for="line in scene.title" :key="line">{{ line }}</span>
    </h2>
  </section>
</template>
