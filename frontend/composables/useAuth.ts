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
            // Redirect based on user role
            const role = authStore.userRole;

            if (role === 'STUDENT' || role === 'PARENT') {
                await router.push('/dashboard');
            } else if (role === 'ADMIN') {
                await router.push('/admin');
            } else {
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
