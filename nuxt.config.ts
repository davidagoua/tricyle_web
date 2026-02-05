// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: ['@nuxt/ui', '@nuxt/eslint', '@nuxt/icon'],

  css: ['~/assets/css/main.css'],

  compatibilityDate: '2025-07-16',
  runtimeConfig: {
    public: {
      pocketbaseUrl: 'https://pb.songon.space', // ou ton URL distante
    },
  },
})