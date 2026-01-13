export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore();

  // Check if user is authenticated
  if (!authStore.isLoggedIn) {
    return navigateTo('/auth');
  }

  // Check if user is admin
  if (!authStore.isAdmin) {
    return navigateTo('/dashboard');
  }
});
