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
      title: 'EduFun - Học tập là cuộc phiêu lưu',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Nền tảng học tập trực tuyến cho học sinh tiểu học' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Poppins:wght@400;500;600;700;800;900&display=swap' },
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

  // QUAN TRỌNG: Thêm phần này
  ssr: true,

  routeRules: {
    // Force client-side rendering for auth pages to avoid hydration mismatch
    '/auth/**': { ssr: false },
    '/auth/callback': { ssr: false },
    // Disable SSR for pages with layout: false to avoid hydration issues
    '/auth': { ssr: false },
  },

  compatibilityDate: '2024-01-01',
});