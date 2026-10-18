<script setup lang="ts">
import type { scenes } from "~/data/site";
const props = defineProps<{
  scene: (typeof scenes)[number];
  first?: boolean;
}>();
const video = ref<HTMLVideoElement>();
let preference: MediaQueryList | undefined;
function syncMotion() {
  if (!video.value || !preference) return;
  if (preference.matches) video.value.pause();
  else
    video.value.play().catch(() => {
      /* Poster remains visible when autoplay is blocked. */
    });
}
onMounted(() => {
  if (!props.scene.video) return;
  preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  preference.addEventListener("change", syncMotion);
  syncMotion();
});
onBeforeUnmount(() => preference?.removeEventListener("change", syncMotion));
</script>
<template>
  <section
    :id="scene.id"
    class="home-scene"
    :style="{
      '--image-position': scene.objectPosition,
      '--mobile-image-position': scene.mobileObjectPosition,
      '--shade': scene.overlayOpacity,
    }"
  >
    <img
      class="scene-image"
      :src="scene.imageSrc"
      alt=""
      :loading="first ? 'eager' : 'lazy'"
      :fetchpriority="first ? 'high' : 'auto'"
    />
    <video
      v-if="scene.video"
      ref="video"
      class="scene-video"
      :poster="scene.imageSrc"
      muted
      loop
      playsinline
      preload="metadata"
      aria-hidden="true"
      tabindex="-1"
    >
      <source :src="`${scene.video}#t=${scene.videoStart}`" type="video/mp4" />
    </video>
    <div class="scene-shade" />
    <h1 v-if="scene.kind === 'intro'" class="scene-title">
      <span v-for="line in scene.title" :key="line">{{ line }}</span>
    </h1>
    <h2 v-else class="scene-title">
      <span v-for="line in scene.title" :key="line">{{ line }}</span>
    </h2>
  </section>
</template>
