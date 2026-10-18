<script setup lang="ts">
import { projects, projectCategories } from "~/data/site";
const years = ["All", "2026", "2025", "2024"] as const;
const route = useRoute();
const router = useRouter();
const selectedCategory = computed(() => projectCategories.find(category => category.id === route.query.category));
const selectedYear = computed(() => years.find(year => year === route.query.year) ?? "All");
const ready = ref(false);
onMounted(() => { ready.value = true; });
watch(selectedCategory, () => {
  if (import.meta.client) window.scrollTo({ top: 0, behavior: "instant" });
});
function selectYear(year: (typeof years)[number]) {
  router.replace({ query: { ...route.query, year: year === "All" ? undefined : year } });
}
const filteredProjects = computed(() =>
  projects.filter((project) =>
    (selectedYear.value === "All" || project.specs.Year === selectedYear.value) &&
    (!selectedCategory.value || project.category === selectedCategory.value.id),
  ),
);
useSeoMeta({
  title: () => `${selectedCategory.value?.label ?? 'Projects'} — forestory furniture`,
  description:
    "포레스토리의 맞춤 원목가구와 우드슬랩 테이블 제작 사례를 소개합니다.",
});
</script>
<template>
  <div>
    <SiteHeader />
    <main id="main" class="projects-page page-content">
      <h1 class="sr-only">{{ selectedCategory?.label ?? 'Projects' }}</h1>
      <div class="project-filter-bar" role="group" aria-label="Filter projects by year">
        <button
          v-for="year in years"
          :key="year"
          type="button"
          class="year-chip"
          :disabled="!ready"
          :aria-pressed="selectedYear === year"
          aria-controls="project-results"
          @click="selectYear(year)"
        >{{ year }}</button>
      </div>
      <div id="project-results">
        <p class="sr-only" role="status">{{ filteredProjects.length }} projects</p>
        <div class="project-grid">
          <ProjectCard
            v-for="(project, i) in filteredProjects"
            :key="project.slug"
            :project="project"
            :eager="i < 3"
          />
        </div>
        <p v-if="!filteredProjects.length" class="projects-empty">
          조건에 해당하는 프로젝트는 준비 중입니다.
        </p>
      </div>
    </main>
    <SiteFooter mobile-contact />
  </div>
</template>
