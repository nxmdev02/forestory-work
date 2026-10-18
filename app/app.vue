<script setup lang="ts">
import { site } from "~/data/site";

useSeoMeta({
  ogSiteName: site.name,
  ogType: "website",
  ogImage: site.shareImage.url,
  ogImageAlt: site.shareImage.alt,
  ogImageWidth: site.shareImage.width,
  ogImageHeight: site.shareImage.height,
  ogImageType: "image/jpeg",
  twitterCard: "summary_large_image",
  twitterImage: site.shareImage.url,
  twitterImageAlt: site.shareImage.alt,
});
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </div>
</template>
