import type { ApiResponse, ApiError, RequestConfig } from "~/types/api";

export class ApiClient {
    private baseURL: string;
    private defaultHeaders: Record<string, string>;

    constructor(baseURL?: string) {
        this.baseURL = baseURL || 'http://localhost:3001/api'
        this.defaultHeaders = {
            'Content-Type': 'application/json',
        }
    }

    private buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
        // Normalize baseURL (remove trailing slash)
        const base = this.baseURL.endsWith('/') ? this.baseURL.slice(0, -1) : this.baseURL;
        
        // Normalize endpoint (ensure leading slash)
        const end = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        
        // Build URL
        let urlString = `${base}${end}`;
        
        // Add query params if provided
        if (params && Object.keys(params).length > 0) {
            const searchParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    searchParams.append(key, String(value));
                }
            });
            const queryString = searchParams.toString();
            if (queryString) {
                urlString += `?${queryString}`;
            }
        }
        return urlString;
    }
    // GET authenticated request
    private getAuthToken(): string | null {
        if (process.client) {
            return localStorage.getItem('accessToken')
        }
        return null
    }
    private buildHeaders(config?: RequestConfig, isFormData = false): Record<string, string> {
        const headers = { ...this.defaultHeaders, ...config?.headers }

        if (isFormData) {
            delete headers['Content-Type']
        }

        // Add auth token if required
        if (config?.auth !== false) {
            const token = this.getAuthToken()
            if (token) {
                headers['Authorization'] = `Bearer ${token}`
            }
        }

        return headers
    }
    // Handle API response
    private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
        const contentType = response.headers.get('content-type')
        const isJson = contentType?.includes('application/json')

        // Parse response body
        let data: any;
        try {
            if (isJson) {
                const text = await response.text();
                // Check if text is valid JSON and not "undefined"
                if (text && text !== 'undefined' && text.trim() !== '') {
                    data = JSON.parse(text);
                } else {
                    console.error('Invalid JSON response:', text);
                    data = { success: false, message: 'Invalid response from server' };
                }
            } else {
                data = await response.text();
            }
        } catch (error) {
            console.error('Error parsing response:', error);
            throw {
                success: false,
                message: 'Failed to parse server response',
                statusCode: response.status,
            } as ApiError;
        }

        // Handle error responses
        if (!response.ok) {
            const error: ApiError = {
                success: false,
                message: data.message || 'An error occurred',
                error: data.error,
                statusCode: response.status,
                errors: data.errors,
            }

            // Handle 401 Unauthorized - redirect to login
            if (response.status === 401) {
                this.handleUnauthorized()
            }

            throw error
        }

        return data as ApiResponse<T>
    }
    // Handle unauthorized access
    private handleUnauthorized(): void {
        if (process.client) {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')

            // Redirect to login
            const router = useRouter()
            router.push('/auth')
        }
    }
    // Make HTTP request
    async request<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
        const url = this.buildUrl(endpoint, config?.params)
        const isFormData = config?.body instanceof FormData
        const headers = this.buildHeaders(config, isFormData)

        const options: RequestInit = {
            method: config?.method || 'GET',
            headers,
            credentials: 'include',
        }

        // Add body for POST/PUT/PATCH requests
        if (config?.body && config.method !== 'GET') {
            options.body = isFormData ? (config.body as FormData) : JSON.stringify(config.body)
        }

        try {
            const response = await fetch(url, options)
            return await this.handleResponse<T>(response)
        } catch (error) {
            // Network error or other issues
            if (error instanceof Error) {
                throw {
                    success: false,
                    message: error.message,
                    statusCode: 0,
                } as ApiError
            }
            throw error
        }
    }
    async get<T>(endpoint: string, params?: Record<string, string | number | boolean>, auth = true): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'GET', params, auth })
    }
    async post<T>(endpoint: string, body?: unknown, auth = true): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'POST', body, auth })
    }
    async put<T>(endpoint: string, body?: unknown, auth = true): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'PUT', body, auth })
    }
    async patch<T>(endpoint: string, body?: unknown, auth = true): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'PATCH', body, auth })
    }
    async delete<T>(endpoint: string, auth = true): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'DELETE', auth })
    }
}

// Singleton instance - will be initialized in composable
let apiClientInstance: ApiClient | null = null;

export const getApiClient = (baseURL?: string): ApiClient => {
    if (!apiClientInstance) {
        apiClientInstance = new ApiClient(baseURL);
    }
    return apiClientInstance;
};