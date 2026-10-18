<script setup lang="ts">
import { office, services } from "~/data/site";
useSeoMeta({
  title: "Office — forestory furniture",
  description:
    "Meet the studio. Interior architecture, furniture, lighting and a considered process from the first conversation to the final detail.",
});
const sections = ["Presentation", "Team", "Services", "Process"];
const presentationCopy = office.paragraphs.map((paragraph) => {
  const [heading, ...body] = paragraph.split("\n");
  return { heading, body: body.join("\n").trim() };
});
const activeStep = ref(0);
const labelPositions = ref([76, 650, 710, 770]);
const footerVisible = ref(false);
const labelsVisible = ref(true);
let frame = 0;
function updateScroll() {
  frame = 0;
  const footer =
    document.getElementById("contact")?.getBoundingClientRect().top ?? Infinity;
  footerVisible.value = footer < window.innerHeight;
  labelsVisible.value = footer > 310;
  labelPositions.value = sections.map((name, i) => {
    if (i === 0) return 60;
    const top =
      document.getElementById(name.toLowerCase())?.getBoundingClientRect()
        .top ?? 0;
    return Math.max(
      60 + i * 60,
      Math.min(top, window.innerHeight - 52 - (4 - i) * 60),
    );
  });
  let nearest = 0;
  let distance = Infinity;
  document.querySelectorAll<HTMLElement>(".process-step").forEach((el, i) => {
    const rect = el.getBoundingClientRect();
    const d = Math.abs(
      rect.top + Math.min(rect.height, 180) / 2 - window.innerHeight * 0.48,
    );
    if (d < distance) {
      distance = d;
      nearest = i;
    }
  });
  activeStep.value = nearest;
}
function scheduleUpdate() {
  if (!frame) frame = requestAnimationFrame(updateScroll);
}
onMounted(() => {
  updateScroll();
  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", scheduleUpdate);
});
onBeforeUnmount(() => {
  window.removeEventListener("scroll", scheduleUpdate);
  window.removeEventListener("resize", scheduleUpdate);
  cancelAnimationFrame(frame);
});
</script>
<template>
  <div class="office-page">
    <SiteHeader />
    <nav
      class="office-navigation"
      :class="{ hidden: !labelsVisible }"
      aria-label="Office sections"
    >
      <a
        v-for="(label, i) in sections"
        :key="label"
        :href="`#${label.toLowerCase()}`"
        :style="{ top: `${labelPositions[i]}px` }"
        >{{ label }}</a
      >
    </nav>
    <main id="main" class="office-content page-content">
      <section id="presentation" class="office-section">
        <h2 class="office-section-label">Presentation</h2>
        <h1>{{ office.title }}</h1>
        <img
          class="office-banner"
          :src="office.image"
          alt="포레스토리 목공방 기계실의 작업대와 목공 설비"
          fetchpriority="high"
          width="1195"
          height="894"
        />
        <div class="office-copy">
          <div v-for="column in presentationCopy" :key="column.heading" class="office-copy-column">
            <h3>{{ column.heading }}</h3>
            <p>{{ column.body }}</p>
          </div>
        </div>
      </section>
      <section id="team" class="office-section">
        <h2 class="office-section-label">Team</h2>
        <div class="team-grid">
          <article v-for="person in office.team" :key="person.name">
            <div class="toned-image team-photo" :class="{ 'is-empty': !person.image }">
              <img
                v-if="person.image"
                :src="person.image"
                :alt="person.name"
                width="600"
                height="600"
                loading="lazy"
              />
            </div>
            <h3>{{ person.name }}</h3>
            <p>{{ person.role }}</p>
          </article>
        </div>
      </section>
      <section id="services" class="office-section">
        <h2 class="office-section-label">Services</h2>
        <div class="services-grid">
          <article v-for="service in services" :key="service.title" class="service-row">
            <h3>{{ service.title }}</h3>
            <div class="service-copy">
              <p class="service-headline">“{{ service.headline }}”</p>
              <p class="service-description">{{ service.description }}</p>
            </div>
          </article>
        </div>
      </section>
      <section id="process" class="office-section">
        <h2 class="office-section-label">Process</h2>
        <div class="process-layout">
          <div class="process-image">
            <img
              v-for="(step, i) in office.process"
              :key="step.image"
              :src="step.image"
              :alt="step.title"
              :class="{ active: activeStep === i }"
              :aria-hidden="activeStep !== i"
              loading="lazy"
              width="900"
              height="1200"
            />
          </div>
          <ol class="process-steps">
            <li
              v-for="(step, i) in office.process"
              :key="step.title"
              class="process-step"
              :class="{ active: activeStep === i }"
            >
              <span class="process-number" aria-hidden="true">{{ i + 1 }}</span>
              <div>
                <h3>{{ step.title }}</h3>
                <p>{{ step.description }}</p>
                <img
                  class="mobile-process-image"
                  :src="step.image"
                  :alt="step.title"
                  loading="lazy"
                  width="900"
                  height="1200"
                />
              </div>
            </li>
          </ol>
        </div>
      </section>
    </main>
    <SiteFooter contact /><a
      v-if="!footerVisible"
      class="contact-bar"
      href="#contact"
      >Contact</a
    >
  </div>
</template>
