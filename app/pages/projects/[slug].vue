<script setup lang="ts">
import { projects, projectDetails, site } from "~/data/site";
const route = useRoute();
const project = projectDetails.find((project) => project.slug === route.params.slug);
if (!project)
  throw createError({
    statusCode: 404,
    statusMessage: "Project not found",
    fatal: true,
  });
useSeoMeta({
  title: `${project.title} — forestory furniture`,
  description: project.summary,
});
const selectedProject = computed(() =>
  projects.find((item) => item.detailSlug === project.slug && item.slug === route.query.project)
  ?? projects.find((item) => item.detailSlug === project.slug),
);
const displayedSpecs = computed(() => ({
  ...project.specs,
  Year: selectedProject.value?.specs.Year ?? project.specs.Year.split(",")[0]!.trim(),
}));
const expanded = ref(false);
const ready = ref(false);
const hero = ref<HTMLElement>();
const transparent = ref(true);
let observer: IntersectionObserver | undefined;
onMounted(() => {
  ready.value = true;
  observer = new IntersectionObserver(
    (entries) => {
      transparent.value = entries[0]?.isIntersecting ?? true;
    },
    { rootMargin: "-60px 0px 0px 0px" },
  );
  if (hero.value) observer.observe(hero.value);
});
onBeforeUnmount(() => observer?.disconnect());
const related = projects
  .filter((item) => item.detailSlug !== project.slug)
  .slice(0, 4);
</script>
<template>
  <div>
    <SiteHeader :transparent="transparent" hero-shade />
    <main id="main" class="project-detail">
      <header ref="hero" class="project-hero">
        <img
          :src="site.projectHero.image"
          :alt="site.projectHero.alt"
          fetchpriority="high"
          :style="{ objectPosition: site.projectHero.objectPosition }"
        />
        <h1>{{ project.title }}</h1>
      </header>
      <section class="project-information" aria-label="Project information">
        <dl class="specs project-specs">
          <div v-for="(value, label) in displayedSpecs" :key="label">
            <dt>{{ label }}</dt>
            <dd>{{ value }}</dd>
          </div>
        </dl>
        <div class="project-description">
          <div id="project-description" :class="{ collapsed: !expanded }">
            <p>{{ project.summary }}</p>
            <div v-if="expanded" class="expanded-copy">
              <p v-for="paragraph in project.paragraphs" :key="paragraph">
                {{ paragraph }}
              </p>
            </div>
          </div>
          <button
            v-if="project.summary || project.paragraphs.length"
            class="text-toggle"
            :disabled="!ready"
            :aria-expanded="expanded"
            aria-controls="project-description"
            @click="expanded = !expanded"
          >
            {{ expanded ? "접기" : "더 보기" }}
          </button>
        </div>
      </section>
      <div class="project-gallery">
        <div
          v-for="(photo, index) in project.gallery"
          :key="index"
          class="project-gallery-slot"
          :class="{ 'is-empty': !photo.src }"
          :aria-hidden="!photo.src ? true : undefined"
        >
          <img
            v-if="photo.src"
            :src="photo.src"
            :alt="photo.alt"
            :width="photo.width"
            :height="photo.height"
            :style="{ objectPosition: photo.objectPosition }"
            loading="lazy"
          />
        </div>
      </div>
      <section v-if="related.length" class="related-projects">
        <h2>Discover more works</h2>
        <div class="related-grid">
          <ProjectCard
            v-for="item in related"
            :key="item.slug"
            :project="item"
          />
        </div>
      </section>
    </main>
    <SiteFooter mobile-contact />
  </div>
</template>
