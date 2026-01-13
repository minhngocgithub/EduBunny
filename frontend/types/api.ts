export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    error: string;
    statusCode?: number;
}
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiError {
  success: false
  message: string
  error?: string
  statusCode: number
  errors?: ValidationError[]
}

export interface ValidationError {
  field: string
  message: string
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
export interface RequestConfig {
  method?: HttpMethod
  body?: unknown
  headers?: Record<string, string>
  params?: Record<string, string | number | boolean>
  auth?: boolean // Require authentication
}

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
    REFRESH: '/auth/refresh-token',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
    VERIFY_EMAIL: '/auth/verify-email',
    GOOGLE: '/auth/google',
  },
  // User
  USER: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    DELETE_ACCOUNT: '/users/account',
    STUDENT: {
      PROFILE: '/users/student/profile',
      UPDATE: '/users/student/profile',
      STATISTICS: '/users/student/statistics',
      LEVEL_PROGRESS: '/users/student/level-progress',
      ADD_XP: '/users/student/xp',
    },
    PARENT: {
      PROFILE: '/users/parent/profile',
      UPDATE: '/users/parent/profile',
      LINK_CHILD: '/users/parent/link-child',
      UNLINK_CHILD: '/users/parent/unlink-child',
      CHILDREN_PROGRESS: '/users/parent/children-progress',
    },
    LEADERBOARD: '/users/leaderboard',
  },
} as const