// Role-based middleware
type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';

export default defineNuxtRouteMiddleware((to, from) => {
    const authStore = useAuthStore();

    // Get required roles from route meta
    const requiredRoles = to.meta.roles as UserRole[] | undefined;

    if (!requiredRoles || requiredRoles.length === 0) {
        return; // No role restriction
    }

    // Check if user has required role
    if (authStore.user && !requiredRoles.includes(authStore.user.role)) {
        // Redirect based on user's actual role
        const role = authStore.user.role;

        if (role === 'ADMIN') {
            return navigateTo('/admin');
        } else if (role === 'TEACHER') {
            return navigateTo('/teacher');
        } else {
            return navigateTo('/dashboard');
        }
    }
});
