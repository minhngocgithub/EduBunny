export default defineNuxtRouteMiddleware((to, from) => {
    // CRITICAL: Skip middleware entirely for callback route
    if (to.path === '/auth/callback' || to.path.startsWith('/auth/callback')) {
        return;
    }

    const authStore = useAuthStore();

    // Only run on client side to avoid SSR issues
    if (!process.client) {
        return;
    }

    // Initialize auth if not already done
    if (!authStore.isAuthenticated) {
        authStore.initAuth();
    }

    // If user is authenticated and trying to access guest-only pages, redirect to dashboard
    // But don't redirect if already on dashboard or authenticated pages
    const guestOnlyPages = ['/auth', '/login', '/register'];
    const isGuestPage = guestOnlyPages.some(path => to.path === path || to.path.startsWith(path + '/'));

    // Don't redirect if already on dashboard or authenticated pages
    const authenticatedPages = ['/dashboard', '/courses', '/profile', '/games', '/chatbot', '/admin'];
    const isAuthenticatedPage = authenticatedPages.some(path => to.path === path || to.path.startsWith(path + '/'));

    // Only redirect authenticated users away from guest pages, not when they're already on authenticated pages
    if (authStore.isAuthenticated && isGuestPage && !isAuthenticatedPage) {
        return navigateTo('/dashboard');
    }
});