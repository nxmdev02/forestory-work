<script setup lang="ts">
import type { NuxtError } from "#app";
defineProps<{ error: NuxtError }>();
</script>
<template>
  <main class="error-page">
    <a class="brand" href="/"><strong>forestory</strong> furniture</a>
    <p>{{ error.statusCode }}</p>
    <h1>
      {{
        error.statusCode === 404
          ? "This space is still to be discovered."
          : "Something went wrong."
      }}
    </h1>
    <a class="text-toggle" href="/projects">Explore our projects</a>
  </main>
</template>
