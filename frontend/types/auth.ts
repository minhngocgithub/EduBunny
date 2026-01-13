export interface AuthUser {
    id: number;
    email: string;
    name: string;
    role: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';
    avatar?: string;
    emailVerified: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: 'STUDENT' | 'PARENT';
}

export interface RegisterResponse {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    token: string;
    newPassword: string;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

export interface RefreshTokenResponse {
    accessToken: string;
    refreshToken: string;
}

export interface GoogleAuthResponse {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
}
