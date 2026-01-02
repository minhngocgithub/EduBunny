import { UserRole } from "@prisma/client";

export interface RegisterInput {
    email: string;
    password: string;
    role: UserRole;
    firstName?: string;
    lastName?: string;
    dateOfBirth?: Date;
    grade?: string;
}
export interface LoginInput {
    email: string;
    password: string;
}
export interface RefreshTokenInput {
    refreshToken: string;
}
export interface ResetPasswordInput {
    token: string;
    newPassword: string;
}
export interface ChangePasswordInput {
    currentPassword: string;
    newPassword: string;
}
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}
export interface AuthResponse {
    user: UserResponse;
    tokens: AuthTokens;
}
export interface UserResponse {
    id: string;
    email: string;
    role: UserRole;
    isActive: boolean;
    emailVerified: boolean;
    createdAt: Date;
    student?: StudentInfo;
    parent?: ParentInfo;
}
export interface StudentInfo {
    id: string;
    firstName: string;
    lastName: string;
    grade: string;
    avatar?: string;
    level: number;
    xp: number;
}
export interface ParentInfo {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
}
export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface JwtRefreshPayload {
  userId: string;
  tokenId: string;
}
export interface AuthServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}