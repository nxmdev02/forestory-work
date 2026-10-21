// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: false },
  modules: ["@vercel/analytics/nuxt"],
  css: ["~/assets/css/main.css"],
  routeRules: {
    "/images/optimized/**": {
      headers: { "cache-control": "public, max-age=31536000, immutable" },
    },
    "/dsgn-archive": { redirect: { to: "/archive", statusCode: 301 } },
  },
  app: {
    head: {
      htmlAttrs: { lang: "en" },
      title: "forestory furniture",
      meta: [{ name: "theme-color", content: "#005d49" }],
      link: [
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        {
          rel: "preload",
          href: "/fonts/cera-medium.woff2",
          as: "font",
          type: "font/woff2",
          crossorigin: "",
        },
      ],
    },
  },
});
