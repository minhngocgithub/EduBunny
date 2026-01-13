export default defineNuxtRouteMiddleware((to, from) => {
    const authStore = useAuthStore();

    // On client side, check localStorage directly to avoid race condition with plugin initialization
    if (process.client && !authStore.isLoggedIn) {
        const hasToken = localStorage.getItem('accessToken');
        const hasUser = localStorage.getItem('user');

        // If tokens exist in localStorage but not in store, initialize auth state
        if (hasToken && hasUser && hasToken !== 'undefined' && hasUser !== 'undefined') {
            authStore.initAuth();
            // Allow navigation to proceed since we have valid auth data
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
            // You can redirect to verify-email page if needed
            // return navigateTo('/verify-email');
        }
    }

    // Optional: Role-based access control
    // You can add more specific checks here based on the route
});
