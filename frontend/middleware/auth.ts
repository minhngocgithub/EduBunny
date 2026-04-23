export default defineNuxtRouteMiddleware((to, from) => {
    const authStore = useAuthStore();

    // On client side, check localStorage directly to avoid race condition with plugin initialization.
    if (process.client && !authStore.isLoggedIn) {
        const hasToken = localStorage.getItem('accessToken');

        // If token exists in localStorage but not in store, initialize auth state.
        if (hasToken && hasToken !== 'undefined') {
            authStore.initAuth();
            // Allow navigation to proceed since we have valid auth token.
            return;
        }
    }

    // Check if user is authenticated
    if (!authStore.isLoggedIn) {
        // Redirect to auth page with return URL
        return navigateTo({
            path: '/auth',
            query: { redirect: to.fullPath },
        });
    }

    // Optional: Check email verification for certain routes
    const requiresVerification = ['/dashboard', '/courses', '/profile'];

    if (requiresVerification.some((path) => to.path.startsWith(path))) {
        if (!authStore.user?.emailVerified) {

        }
    }
});
