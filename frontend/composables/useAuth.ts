import type { LoginRequest, RegisterRequest } from '~/types/auth';

export const useAuth = () => {
    const authStore = useAuthStore();
    const router = useRouter();

    // Initialize auth on mount
    onMounted(() => {
        authStore.initAuth();
    });

    const login = async (credentials: LoginRequest) => {
        const result = await authStore.login(credentials);

        if (result.success) {
            // Wait a tick to ensure store is fully updated
            await nextTick();
            
            // Redirect based on user role
            const role = authStore.userRole;
            console.log('[useAuth] Login successful, user role:', role);

            if (role === 'ADMIN') {
                console.log('[useAuth] Redirecting ADMIN to /admin');
                await router.push('/admin');
            } else if (role === 'STUDENT' || role === 'PARENT') {
                console.log('[useAuth] Redirecting STUDENT/PARENT to /dashboard');
                await router.push('/dashboard');
            } else if (role === 'TEACHER') {
                console.log('[useAuth] Redirecting TEACHER to /dashboard');
                await router.push('/dashboard');
            } else {
                console.log('[useAuth] Unknown role, redirecting to /');
                await router.push('/');
            }
        }

        return result;
    };

    const register = async (data: RegisterRequest) => {
        const result = await authStore.register(data);

        if (result.success) {
            await router.push('/dashboard');
        }

        return result;
    };

    const logout = async () => {
        await authStore.logout();
    };

    const forgotPassword = async (email: string) => {
        return await authStore.forgotPassword(email);
    };

    const resetPassword = async (token: string, newPassword: string) => {
        const result = await authStore.resetPassword(token, newPassword);

        if (result.success) {
            await router.push('/auth');
        }

        return result;
    };

    const changePassword = async (currentPassword: string, newPassword: string) => {
        return await authStore.changePassword(currentPassword, newPassword);
    };

    return {
        // State
        user: computed(() => authStore.user),
        isLoggedIn: computed(() => authStore.isLoggedIn),
        isAuthenticated: computed(() => authStore.isAuthenticated),
        loading: computed(() => authStore.loading),
        userRole: computed(() => authStore.userRole),
        isAdmin: computed(() => authStore.isAdmin),
        isTeacher: computed(() => authStore.isTeacher),
        isStudent: computed(() => authStore.isStudent),
        isParent: computed(() => authStore.isParent),

        // Actions
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        changePassword,
        fetchProfile: authStore.fetchProfile,
    };
};
