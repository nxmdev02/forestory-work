<script setup lang="ts">
import { site } from "~/data/site";
const props = defineProps<{ contact?: boolean; mobileContact?: boolean }>();
const footer = ref<HTMLElement>();
const footerVisible = ref(true);
let observer: IntersectionObserver | undefined;
onMounted(() => {
  if (!props.mobileContact || !footer.value) return;
  footerVisible.value = footer.value.getBoundingClientRect().top < window.innerHeight;
  observer = new IntersectionObserver(([entry]) => {
    footerVisible.value = entry?.isIntersecting ?? true;
  });
  observer.observe(footer.value);
});
onBeforeUnmount(() => observer?.disconnect());
</script>
<template>
  <footer id="contact" ref="footer" class="site-footer">
    <h2 v-if="contact || mobileContact" class="footer-contact" :class="{ 'mobile-contact-heading': !contact }">Contact</h2>
    <NuxtLink to="/" class="footer-brand" aria-label="forestory furniture home"
      ><span>forestory</span><small>furniture</small></NuxtLink
    >
    <div class="footer-bottom">
      <ContactDetails />
      <div class="footer-links">
        <template v-for="link in site.socials" :key="link.label">
          <a
            v-if="link.href"
            :href="link.href"
            target="_blank"
            rel="noopener noreferrer"
            >{{ link.label }}</a
          >
          <span v-else aria-disabled="true">{{ link.label }}</span>
        </template>
      </div>
      <div class="footer-credits">
        <p>{{ site.copyright }}</p>
        <p>Website by {{ site.credit }}</p>
      </div>
    </div>
  </footer>
  <a v-if="mobileContact && !footerVisible" class="contact-bar contact-bar-mobile" href="#contact">Contact</a>
</template>
