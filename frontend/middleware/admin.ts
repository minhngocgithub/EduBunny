export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore();

  
  if (!authStore.isLoggedIn) {

    return navigateTo('/auth');
  }

  if (!authStore.isAdmin) {
    
    return navigateTo('/dashboard');
  }

  
});
