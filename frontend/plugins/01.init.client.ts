export default defineNuxtPlugin(async (nuxtApp) => {
  const themeStore = useThemeStore();
  const authStore = useAuthStore();
  const userStore = useUserStore();


  // Initialize auth state from localStorage
  if (import.meta.client) {
    try {
      // Initialize synchronously to avoid race condition with middleware
      themeStore.initTheme();
      authStore.initAuth();

      // If token exists but user payload is missing/stale, recover from profile API.
      if (authStore.isAuthenticated && !authStore.user) {
        await authStore.fetchProfile();
      }

      // Keep user store hydrated for UI components that read from userStore.
      if (authStore.isAuthenticated && !userStore.profile) {
        await userStore.fetchProfile();
      }

    } catch (error) {
      console.error('[Plugin] Error initializing app:', error);
    }
  }
});
