<script setup lang="ts">
import { archiveItems, site } from "~/data/site";
useSeoMeta({
  title: "포레스토리 아카이브 — forestory furniture",
  description:
    "포레스토리가 직접 디자인하고 제작한 가구와 오브제를 소개합니다. 나무 본연의 아름다움을 일상의 공간에 담습니다.",
});
</script>
<template>
  <div>
    <SiteHeader />
    <main id="main" class="archive-page page-content">
      <header class="archive-intro">
        <h1>
          포레스토리 아카이브는 직접 디자인하고 제작한 가구와 오브제를 소개합니다.
          나무 본연의 아름다움을 일상의 공간에 담습니다.
        </h1>
        <p>
          제작 문의는
          <a :href="`mailto:${site.email}`">{{ site.email }}</a
          >으로 연락해 주세요.
        </p>
      </header>
      <div class="archive-grid">
        <article
          v-for="(item, index) in archiveItems"
          :key="item.archiveNumber"
          class="archive-item"
        >
          <a
            :href="`mailto:${site.email}?subject=${encodeURIComponent(`제품 문의: 아카이브 #${item.archiveNumber}`)}`"
            :aria-label="`아카이브 #${item.archiveNumber} ${item.object} 제품 문의`"
            ><div class="toned-image archive-photo" :class="{ 'is-empty': !item.image }">
              <ResponsiveImage
                v-if="item.image"
                :src="item.image"
                sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 1000px) 50vw, 33vw"
                :loading="index < 2 ? 'eager' : 'lazy'"
                :alt="item.object"
                width="900"
                height="1200"
              /></div
          ></a>
          <h2>아카이브 #{{ item.archiveNumber }}</h2>
          <dl class="specs">
            <div>
              <dt>제품명</dt>
              <dd>{{ item.object }}</dd>
            </div>
            <div>
              <dt>수종</dt>
              <dd>{{ item.wood || "—" }}</dd>
            </div>
            <div>
              <dt>가격</dt>
              <dd>{{ item.price || "—" }}</dd>
            </div>
          </dl>
        </article>
      </div>
    </main>
    <SiteFooter mobile-contact />
  </div>
</template>
