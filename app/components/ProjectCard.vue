<script setup lang="ts">
import type { Project } from "~/data/site";
withDefaults(defineProps<{ project: Project; eager?: boolean; sizes?: string }>(), {
  sizes: "(max-width: 640px) calc(100vw - 32px), (max-width: 1000px) calc((100vw - 65px) / 2), (min-width: 1600px) calc((100vw - 98px) / 3), calc((100vw - 82px) / 3)",
});
</script>
<template>
  <NuxtLink
    :to="{ path: `/projects/${project.detailSlug}`, query: { project: project.slug } }"
    class="project-card"
  >
    <div class="toned-image">
      <ResponsiveImage
        :src="project.thumbnail"
        :sizes="sizes"
        :style="{ objectPosition: project.objectPosition }"
        alt=""
        width="900"
        height="1200"
        :loading="eager ? 'eager' : 'lazy'"
        :fetchpriority="eager ? 'high' : 'auto'"
      />
    </div>
    <h2>{{ project.title }}</h2>
  </NuxtLink>
</template>
