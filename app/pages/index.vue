<script setup lang="ts">
import { scenes } from "~/data/site";
useSeoMeta({
  title: "forestory furniture — designing furniture, connecting people",
  description:
    "Considered interior architecture. Explore spaces designed to bring people, culture and function together.",
});
const current = ref(0);
let observer: IntersectionObserver | undefined;
onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries)
        if (entry.isIntersecting)
          current.value = scenes.findIndex(
            (scene) => scene.id === entry.target.id,
          );
    },
    { threshold: 0.5 },
  );
  document
    .querySelectorAll(".home-scene")
    .forEach((el) => observer?.observe(el));
});
onBeforeUnmount(() => observer?.disconnect());
function explore() {
  const scene = scenes[current.value + 1];
  const section = scene ? document.getElementById(scene.id) : null;
  if (section)
    window.scrollTo({
      top: section.offsetTop,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
}
</script>
<template>
  <div class="home-page">
    <SiteHeader transparent />
    <main id="main">
      <HomeScene
        v-for="(scene, index) in scenes"
        :key="scene.id"
        :scene="scene"
        :first="index === 0"
      />
    </main>
    <div class="home-overlay">
      <ContactDetails /><button
        v-if="current < scenes.length - 1"
        class="scroll-hint"
        @click="explore"
      >
        <span class="mouse-icon" aria-hidden="true" />Scroll to explore
      </button>
    </div>
  </div>
</template>
