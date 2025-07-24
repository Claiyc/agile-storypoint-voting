// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    // Nuxt UI removed
  ],
  runtimeConfig: {
    public: {
      wsUrl: process.env.NUXT_PUBLIC_WS_URL || 'ws://localhost:3001',
      gotoBaseUrl: process.env.NUXT_PUBLIC_GOTO_BASE_URL || 'https://www.google.com/search?q=',
    },
  },
  nitro: {
    prerender: {
      ignore: ['/join', '/create'],
    },
  },
});
