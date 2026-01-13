import { defineStore } from 'pinia';
import type { User, StudentProfile, UpdateProfileRequest, UpdateStudentProfileRequest, UserStats } from '~/types/user';
import { API_ENDPOINTS } from '~/types/api';

interface UserState {
    profile: User | null;
    studentProfile: StudentProfile | null;
    stats: UserStats | null;
    loading: boolean;
}

export const useUserStore = defineStore('user', {
    state: (): UserState => ({
        profile: null,
        studentProfile: null,
        stats: null,
        loading: false,
    }),

    getters: {
        isStudent: (state) => state.profile?.role === 'STUDENT',
        isParent: (state) => state.profile?.role === 'PARENT',
        hasStudentProfile: (state) => !!state.studentProfile,
        userLevel: (state) => state.studentProfile?.level || 1,
        userXP: (state) => state.studentProfile?.xp || 0,
        userStars: (state) => state.studentProfile?.stars || 0,
    },

    actions: {
        // Get user profile
        async fetchProfile() {
            this.loading = true;
            try {
                const { apiClient } = useApiClient();
                const response = await apiClient.get<User>(API_ENDPOINTS.USER.PROFILE);

                if (response.success && response.data) {
                    this.profile = response.data;

                    // If user is student, fetch student profile
                    if (response.data.role === 'STUDENT' && response.data.student) {
                        this.studentProfile = response.data.student;
                    }

                    return { success: true, data: response.data };
                }

                return { success: false };
            } catch (error: any) {
                return { success: false, message: error.message };
            } finally {
                this.loading = false;
            }
        },

        // Update user profile
        async updateProfile(data: UpdateProfileRequest) {
            this.loading = true;
            try {
                const { apiClient } = useApiClient();
                const response = await apiClient.patch<User>(
                    API_ENDPOINTS.USER.UPDATE_PROFILE,
                    data
                );

                if (response.success && response.data) {
                    this.profile = response.data;

                    // Update auth store as well
                    const authStore = useAuthStore();
                    if (authStore.user) {
                        authStore.user.name = response.data.name;
                        authStore.user.avatar = response.data.avatar;
                        if (process.client) {
                            localStorage.setItem('user', JSON.stringify(authStore.user));
                        }
                    }

                    return { success: true, message: 'Cập nhật thông tin thành công' };
                }

                return { success: false, message: 'Cập nhật thất bại' };
            } catch (error: any) {
                return { success: false, message: error.message };
            } finally {
                this.loading = false;
            }
        },

        // Get student profile
        async fetchStudentProfile() {
            this.loading = true;
            try {
                const { apiClient } = useApiClient();
                const response = await apiClient.get<StudentProfile>(
                    API_ENDPOINTS.USER.STUDENT.PROFILE
                );

                if (response.success && response.data) {
                    this.studentProfile = response.data;
                    return { success: true, data: response.data };
                }

                return { success: false };
            } catch (error: any) {
                return { success: false, message: error.message };
            } finally {
                this.loading = false;
            }
        },

        // Update student profile
        async updateStudentProfile(data: UpdateStudentProfileRequest) {
            this.loading = true;
            try {
                const { apiClient } = useApiClient();
                const response = await apiClient.patch<StudentProfile>(
                    API_ENDPOINTS.USER.STUDENT.UPDATE,
                    data
                );

                if (response.success && response.data) {
                    this.studentProfile = response.data;
                    return { success: true, message: 'Cập nhật hồ sơ học sinh thành công' };
                }

                return { success: false, message: 'Cập nhật thất bại' };
            } catch (error: any) {
                return { success: false, message: error.message };
            } finally {
                this.loading = false;
            }
        },

        // Get student statistics
        async fetchStudentStats() {
            this.loading = true;
            try {
                const { apiClient } = useApiClient();
                const response = await apiClient.get<UserStats>(
                    API_ENDPOINTS.USER.STUDENT.STATISTICS
                );

                if (response.success && response.data) {
                    this.stats = response.data;
                    return { success: true, data: response.data };
                }

                return { success: false };
            } catch (error: any) {
                return { success: false, message: error.message };
            } finally {
                this.loading = false;
            }
        },

        // Delete account
        async deleteAccount() {
            this.loading = true;
            try {
                const { apiClient } = useApiClient();
                const response = await apiClient.delete(API_ENDPOINTS.USER.DELETE_ACCOUNT);

                if (response.success) {
                    // Clear all data and logout
                    const authStore = useAuthStore();
                    authStore.clearAuthData();

                    this.profile = null;
                    this.studentProfile = null;
                    this.stats = null;

                    return { success: true, message: 'Xóa tài khoản thành công' };
                }

                return { success: false, message: 'Xóa tài khoản thất bại' };
            } catch (error: any) {
                return { success: false, message: error.message };
            } finally {
                this.loading = false;
            }
        },

        // Clear user data
        clearUserData() {
            this.profile = null;
            this.studentProfile = null;
            this.stats = null;
        },
    },
});
