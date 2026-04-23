import { defineStore } from 'pinia';
import type { AuthUser, LoginRequest, RegisterRequest, LoginResponse, RegisterResponse } from '~/types/auth';
import { API_ENDPOINTS } from '~/types/api';

interface AuthState {
    user: AuthUser | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    loading: boolean;
}

export const useAuthStore = defineStore('auth', {
    state: (): AuthState => ({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        loading: false,
    }),

    getters: {
        // Consider users logged in when auth is initialized and a valid token exists.
        // User profile can be fetched lazily and should not flip navbar to guest state.
        isLoggedIn: (state) => state.isAuthenticated && !!state.accessToken,
        currentUser: (state) => state.user,
        userRole: (state) => state.user?.role,
        isAdmin: (state) => state.user?.role === 'ADMIN',
        isTeacher: (state) => state.user?.role === 'TEACHER',
        isStudent: (state) => state.user?.role === 'STUDENT',
        isParent: (state) => state.user?.role === 'PARENT',
    },

    actions: {
        // Initialize auth state from localStorage
        initAuth() {
            if (process.client) {
                const accessToken = localStorage.getItem('accessToken');
                const refreshToken = localStorage.getItem('refreshToken');
                const userStr = localStorage.getItem('user');

                // Token is the source of truth for login state.
                if (accessToken && accessToken !== 'undefined') {
                    this.accessToken = accessToken;
                    this.refreshToken = refreshToken && refreshToken !== 'undefined' ? refreshToken : null;
                    this.isAuthenticated = true;

                    if (userStr && userStr !== 'undefined') {
                        try {
                            this.user = JSON.parse(userStr);
                        } catch (error) {
                            console.error('Error parsing user data from localStorage:', error);
                            this.user = null;
                            localStorage.removeItem('user');
                        }
                    }
                }
            }
        },

        // Login
        async login(credentials: LoginRequest) {
            this.loading = true;
            try {
                const { apiClient } = useApiClient();
                console.log('Attempting login with:', { email: credentials.email });

                const response = await apiClient.post<LoginResponse>(
                    API_ENDPOINTS.AUTH.LOGIN,
                    credentials,
                    false // No auth required for login
                );

                console.log('Login response:', response);

                if (response.success && response.data) {
                    this.setAuthData(response.data);
                    return { success: true };
                }

                return { success: false, message: response.message || 'Đăng nhập thất bại' };
            } catch (error: any) {
                console.error('Login error:', error);
                return {
                    success: false,
                    message: error.message || 'Đăng nhập thất bại',
                };
            } finally {
                this.loading = false;
            }
        },

        // Register
        async register(data: RegisterRequest) {
            this.loading = true;
            try {
                const { apiClient } = useApiClient();
                console.log('Attempting register with:', { email: data.email, role: data.role });

                const response = await apiClient.post<RegisterResponse>(
                    API_ENDPOINTS.AUTH.REGISTER,
                    data,
                    false
                );

                console.log('Register response:', response);

                if (response.success && response.data) {
                    this.setAuthData(response.data);
                    return { success: true };
                }

                return { success: false, message: response.message || 'Đăng ký thất bại' };
            } catch (error: any) {
                console.error('Register error:', error);
                return {
                    success: false,
                    message: error.message || 'Đăng ký thất bại',
                };
            } finally {
                this.loading = false;
            }
        },

        // Logout
        async logout() {
            try {
                const { apiClient } = useApiClient();
                await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, {});
            } catch (error) {
                console.error('Logout error:', error);
            } finally {
                this.clearAuthData();
                if (process.client) {
                    navigateTo('/auth');
                }
            }
        },

        // Refresh token
        async refreshAccessToken() {
            if (!this.refreshToken) return false;

            try {
                const { apiClient } = useApiClient();
                const response = await apiClient.post<LoginResponse>(
                    API_ENDPOINTS.AUTH.REFRESH,
                    { refreshToken: this.refreshToken },
                    false
                );

                if (response.success && response.data) {
                    this.accessToken = response.data.accessToken;
                    this.refreshToken = response.data.refreshToken;

                    if (process.client) {
                        localStorage.setItem('accessToken', response.data.accessToken);
                        localStorage.setItem('refreshToken', response.data.refreshToken);
                    }

                    return true;
                }

                return false;
            } catch (error) {
                this.clearAuthData();
                return false;
            }
        },

        // Get current user profile
        async fetchProfile() {
            try {
                const { apiClient } = useApiClient();
                // For Google OAuth, cookies are httpOnly, so we don't need Authorization header
                // But if user has token in localStorage, it will be sent as well
                // The backend should accept either cookies OR Authorization header
                const response = await apiClient.get<AuthUser>(
                    API_ENDPOINTS.AUTH.PROFILE,
                    undefined, // No params
                    true // auth = true (will try to use token if available, but cookies will be sent via credentials: 'include')
                );

                if (response.success && response.data) {
                    this.user = response.data;
                    this.isAuthenticated = true; // Set authenticated for OAuth
                    if (process.client) {
                        localStorage.setItem('user', JSON.stringify(response.data));
                    }
                    return { success: true, data: response.data };
                }

                return { success: false, message: 'Failed to fetch profile' };
            } catch (error: any) {
                console.error('Fetch profile error:', error);
                return { success: false, message: error.message || 'Failed to fetch profile' };
            }
        },

        // Forgot password
        async forgotPassword(email: string) {
            this.loading = true;
            try {
                const { apiClient } = useApiClient();
                const response = await apiClient.post(
                    API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
                    { email },
                    false
                );

                return {
                    success: response.success,
                    message: response.message || 'Email đặt lại mật khẩu đã được gửi',
                };
            } catch (error: any) {
                return {
                    success: false,
                    message: error.message || 'Gửi email thất bại',
                };
            } finally {
                this.loading = false;
            }
        },

        // Reset password
        async resetPassword(token: string, newPassword: string) {
            this.loading = true;
            try {
                const { apiClient } = useApiClient();
                const response = await apiClient.post(
                    API_ENDPOINTS.AUTH.RESET_PASSWORD,
                    { token, newPassword },
                    false
                );

                return {
                    success: response.success,
                    message: response.message || 'Đặt lại mật khẩu thành công',
                };
            } catch (error: any) {
                return {
                    success: false,
                    message: error.message || 'Đặt lại mật khẩu thất bại',
                };
            } finally {
                this.loading = false;
            }
        },

        // Change password
        async changePassword(currentPassword: string, newPassword: string) {
            this.loading = true;
            try {
                const { apiClient } = useApiClient();
                const response = await apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
                    currentPassword,
                    newPassword,
                });

                return {
                    success: response.success,
                    message: response.message || 'Đổi mật khẩu thành công',
                };
            } catch (error: any) {
                return {
                    success: false,
                    message: error.message || 'Đổi mật khẩu thất bại',
                };
            } finally {
                this.loading = false;
            }
        },

        // Set auth data
        setAuthData(data: LoginResponse | RegisterResponse) {
            this.user = data.user;
            this.accessToken = data.accessToken;
            this.refreshToken = data.refreshToken;
            this.isAuthenticated = true;

            if (process.client) {
                // Ensure values are not undefined before storing
                if (data.accessToken) {
                    localStorage.setItem('accessToken', data.accessToken);
                }
                if (data.refreshToken) {
                    localStorage.setItem('refreshToken', data.refreshToken);
                }
                if (data.user) {
                    localStorage.setItem('user', JSON.stringify(data.user));
                }
            }
        },

        // Set tokens (for Google OAuth)
        setTokens(accessToken: string, refreshToken: string) {
            console.log('setTokens called with:', {
                hasAccessToken: !!accessToken,
                hasRefreshToken: !!refreshToken
            });

            this.accessToken = accessToken;
            this.refreshToken = refreshToken;
            this.isAuthenticated = true; 
            if (process.client) {
                if (accessToken) {
                    localStorage.setItem('accessToken', accessToken);
                }
                if (refreshToken) {
                    localStorage.setItem('refreshToken', refreshToken);
                }
            }

            console.log('Tokens set. New state:', {
                hasAccessToken: !!this.accessToken,
                hasRefreshToken: !!this.refreshToken,
                isAuthenticated: this.isAuthenticated
            });
        },

        clearAuthData() {
            this.user = null;
            this.accessToken = null;
            this.refreshToken = null;
            this.isAuthenticated = false;

            if (process.client) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
            }
        },
    },
});
