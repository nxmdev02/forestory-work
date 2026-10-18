<script setup lang="ts">
import { site, projectCategories, projects } from "~/data/site";
defineProps<{ transparent?: boolean; heroShade?: boolean }>();
const route = useRoute();
const opened = ref(false);
const projectsOpened = ref(false);
const ready = ref(false);
const menuButton = ref<HTMLButtonElement>();
const navigation = ref<HTMLElement>();
const projectsMenu = ref<HTMLElement>();
const projectsButton = ref<HTMLButtonElement>();
const currentCategory = computed(() => route.path === "/projects"
  ? route.query.category
  : projects.find((item) => item.detailSlug === route.params.slug)?.category);
let desktopQuery: MediaQueryList | undefined;
function onDesktop(event: MediaQueryListEvent) {
  if (event.matches) opened.value = false;
  projectsOpened.value = false;
}
const active = (href: string) =>
  route.path === href || route.path.startsWith(`${href}/`);
async function toggle(event: MouseEvent) {
  opened.value = !opened.value;
  projectsOpened.value = opened.value;
  // Only move focus into the menu when it was opened with the keyboard.
  if (event.detail !== 0) return;
  if (opened.value) {
    await nextTick();
    projectsButton.value?.focus();
  } else menuButton.value?.focus();
}
function close() {
  opened.value = false;
  projectsOpened.value = false;
  menuButton.value?.focus();
}
function closeNavigation() {
  opened.value = false;
  projectsOpened.value = false;
}
async function openProjectsWithKeyboard() {
  projectsOpened.value = true;
  await nextTick();
  projectsMenu.value?.querySelector<HTMLAnchorElement>(".projects-dropdown a")?.focus();
}
function onOutsideClick(event: PointerEvent) {
  if (!opened.value && !projectsMenu.value?.contains(event.target as Node)) projectsOpened.value = false;
}
function onProjectsFocusOut(event: FocusEvent) {
  if (!opened.value && !projectsMenu.value?.contains(event.relatedTarget as Node)) projectsOpened.value = false;
}
function onKey(event: KeyboardEvent) {
  if (event.key === "Escape" && projectsOpened.value && !opened.value) {
    event.preventDefault();
    projectsOpened.value = false;
    projectsButton.value?.focus();
    return;
  }
  if (!opened.value) return;
  if (event.key === "Escape") {
    event.preventDefault();
    close();
  }
  if (event.key === "Tab") {
    const targets = [
      menuButton.value!,
      ...Array.from(
        navigation.value?.querySelectorAll<HTMLElement>("a, button") || [],
      ).filter((element) => element.getClientRects().length > 0),
    ];
    const current = targets.indexOf(
      document.activeElement as HTMLButtonElement,
    );
    if (event.shiftKey && current === 0) {
      event.preventDefault();
      targets.at(-1)?.focus();
    }
    if (!event.shiftKey && current === targets.length - 1) {
      event.preventDefault();
      targets[0]?.focus();
    }
  }
}
watch(opened, (value) => {
  document.body.style.overflow = value ? "hidden" : "";
  if (!value) projectsOpened.value = false;
});
watch(
  () => route.fullPath,
  closeNavigation,
);
onMounted(() => {
  ready.value = true;
  document.addEventListener("keydown", onKey);
  document.addEventListener("pointerdown", onOutsideClick);
  desktopQuery = window.matchMedia("(min-width: 641px)");
  desktopQuery.addEventListener("change", onDesktop);
});
onBeforeUnmount(() => {
  document.removeEventListener("keydown", onKey);
  document.removeEventListener("pointerdown", onOutsideClick);
  desktopQuery?.removeEventListener("change", onDesktop);
  document.body.style.overflow = "";
});
</script>

<template>
  <a class="skip-link" href="#main">Skip to content</a>
  <header
    class="site-header"
    :class="{ 'is-transparent': transparent && !opened, 'menu-open': opened, 'has-hero-shade': heroShade }"
  >
    <NuxtLink to="/" class="brand" aria-label="forestory furniture home"
      ><strong>forestory</strong><span>furniture</span></NuxtLink
    >
    <button
      ref="menuButton"
      class="menu-toggle"
      :disabled="!ready"
      :aria-expanded="opened"
      :aria-label="opened ? 'Close' : 'Menu'"
      aria-controls="site-navigation"
      @click="toggle"
    >
      <svg class="menu-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path v-if="opened" d="M5 5 19 19M19 5 5 19" />
        <path v-else d="M3 6h18M3 12h18M3 18h18" />
      </svg>
    </button>
    <nav
      id="site-navigation"
      ref="navigation"
      aria-label="Main navigation"
      :class="{ opened }"
    >
      <div ref="projectsMenu" class="projects-navigation" @focusout="onProjectsFocusOut">
        <button
          ref="projectsButton"
          type="button"
          class="projects-menu-toggle"
          :class="{ active: active('/projects') }"
          :disabled="!ready"
          :aria-expanded="projectsOpened"
          aria-controls="projects-dropdown"
          @click="projectsOpened = !projectsOpened"
          @keydown.down.prevent="openProjectsWithKeyboard"
        >
          projects
          <svg viewBox="0 0 16 16" aria-hidden="true" :class="{ rotated: projectsOpened }"><path d="m4 6 4 4 4-4" /></svg>
        </button>
        <div v-if="projectsOpened" id="projects-dropdown" class="projects-dropdown">
          <NuxtLink to="/projects" :class="{ active: route.path === '/projects' && !currentCategory }" @click="closeNavigation">all</NuxtLink>
          <NuxtLink
            v-for="category in projectCategories"
            :key="category.id"
            :to="{ path: '/projects', query: { category: category.id } }"
            :class="{ active: currentCategory === category.id }"
            :aria-current="currentCategory === category.id ? 'page' : undefined"
            @click="closeNavigation"
          >{{ category.label.toLowerCase() }}</NuxtLink>
        </div>
      </div>
      <NuxtLink
        v-for="link in site.navigation.filter(link => link.href !== '/projects')"
        :key="link.href"
        :to="link.href"
        :aria-current="active(link.href) ? 'page' : undefined"
        :class="{ active: active(link.href) }"
        @click="closeNavigation"
        >{{ link.label }}</NuxtLink
      >
    </nav>
  </header>
</template>
