// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: false },
  css: ["~/assets/css/main.css"],
  routeRules: {
    "/dsgn-archive": { redirect: { to: "/archive", statusCode: 301 } },
  },
  app: {
    head: {
      htmlAttrs: { lang: "en" },
      title: "forestory furniture — designing furniture, connecting people",
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
