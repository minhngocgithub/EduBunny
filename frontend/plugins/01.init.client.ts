export default defineNuxtPlugin(async () => {
  const themeStore = useThemeStore();
  const authStore = useAuthStore();

  // Initialize auth state from localStorage
  if (import.meta.client) {
    try {
      // Initialize synchronously to avoid race condition with middleware
      authStore.initAuth();
      themeStore.initTheme();

      // If we have tokens but no user data, fetch profile immediately
      if (authStore.accessToken && !authStore.user) {
        await authStore.fetchProfile();
      }
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  }
});
