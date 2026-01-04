import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { errorResponse } from "../utils/response.utils";

export function validateRequest(schema: ZodSchema) {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            const validated = schema.parse(req.body);
            req.body = validated;
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errors = error.errors.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));
                errorResponse(
                    res,
                    {
                        message: 'Validation error',
                        errors
                    },
                    400
                );
                return;
            }
            errorResponse(
                res,
                { message: 'Validation error' },
                400
            );
        }
    }
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse(req.query);
      req.query = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        errorResponse(
          res,
          { 
            message: 'Invalid query parameters',
            errors 
          },
          400
        );
        return;
      }

      errorResponse(res, { message: 'Validation error' }, 400);
    }
  };
}

export function validateParams(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse(req.params);
      req.params = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        errorResponse(
          res,
          { 
            message: 'Invalid parameters',
            errors 
          },
          400
        );
        return;
      }

      errorResponse(res, { message: 'Validation error' }, 400);
    }
  };
}