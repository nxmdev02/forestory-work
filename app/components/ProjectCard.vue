<script setup lang="ts">
import type { Project } from "~/data/site";
defineProps<{ project: Project; eager?: boolean }>();
</script>
<template>
  <NuxtLink
    :to="{ path: `/projects/${project.detailSlug}`, query: { project: project.slug } }"
    class="project-card"
  >
    <div class="toned-image">
      <img
        :src="project.thumbnail"
        :style="{ objectPosition: project.objectPosition }"
        alt=""
        width="900"
        height="1200"
        :loading="eager ? 'eager' : 'lazy'"
      />
    </div>
    <h2>{{ project.title }}</h2>
  </NuxtLink>
</template>
