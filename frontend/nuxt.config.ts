
export default defineNuxtConfig({
  devtools: { enabled: true },
  
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt',
  ],

  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api',
    },
  },

  app: {
    head: {
      title: 'Learning Platform - Học tập cho trẻ em',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Nền tảng học tập trực tuyến cho học sinh tiểu học' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
  },

  css: ['~/assets/css/main.css'],

  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    configPath: 'tailwind.config.js',
    exposeConfig: true, 
    viewer: true,
  },

  typescript: {
    strict: true,
    typeCheck: false,
  },

  nitro: {
    preset: 'vercel',
  },

  compatibilityDate: '2024-01-01',
});
