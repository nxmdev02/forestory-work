<script setup lang="ts">
import { site } from "~/data/site";
</script>
<template>
  <div class="contact-details">
    <div>
      <a :href="`mailto:${site.email}`">{{ site.email }}</a
      ><a :href="`tel:${site.phoneHref}`">{{ site.phone }}</a>
    </div>
    <address>
      <span v-for="line in site.address" :key="line">{{ line }}</span>
    </address>
  </div>
</template>
