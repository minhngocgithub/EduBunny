export default defineNuxtPlugin(async (nuxtApp) => {
  const themeStore = useThemeStore();
  const authStore = useAuthStore();
  const userStore = useUserStore();


  // Initialize auth state from localStorage
  if (import.meta.client) {
    try {
      // Initialize synchronously to avoid race condition with middleware

      themeStore.initTheme();

    } catch (error) {
      console.error('[Plugin] Error initializing app:', error);
    }
  }
});
