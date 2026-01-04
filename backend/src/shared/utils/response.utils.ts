import { Response } from 'express';

interface SuccessResponseData<T = unknown> {
    message?: string;
    data?: T;
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
    };
}

interface ErrorResponseData {
    message: string;
    errors?: Record<string, unknown> | Array<{ field: string; message: string }>;
    stack?: string;
}

interface ErrorResponse {
    success: false;
    message: string;
    timestamp: string;
    errors?: Record<string, unknown> | Array<{ field: string; message: string }>;
    stack?: string;
}

export function successResponse<T = unknown>(
    res: Response,
    data: SuccessResponseData<T>,
    statusCode: number = 200
) {
    return res.status(statusCode).json({
        success: true,
        message: data.message || 'Success',
        data: data.data,
        meta: data.meta,
        timestamp: new Date().toISOString(),
    });
}

export function errorResponse(
    res: Response,
    data: ErrorResponseData,
    statusCode: number = 500
) {
    const response: ErrorResponse = {
        success: false,
        message: data.message || 'Internal server error',
        timestamp: new Date().toISOString(),
    };

    // Add errors if exists (validation errors)
    if (data.errors) {
        response.errors = data.errors;
    }

    // Add stack trace in development
    if (process.env.NODE_ENV === 'development' && data.stack) {
        response.stack = data.stack;
    }

    return res.status(statusCode).json(response);
}

// ============================================
// PAGINATED RESPONSE
// ============================================
export function paginatedResponse<T = unknown>(
    res: Response,
    data: {
        items: T[];
        page: number;
        limit: number;
        total: number;
        message?: string;
    }
) {
    const totalPages = Math.ceil(data.total / data.limit);

    return successResponse<T[]>(res, {
        message: data.message || 'Success',
        data: data.items,
        meta: {
            page: data.page,
            limit: data.limit,
            total: data.total,
            totalPages,
        },
    });
}