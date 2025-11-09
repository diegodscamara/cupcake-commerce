/**
 * Custom error classes for better error handling
 */

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    public fields?: Record<string, string[]>
  ) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id
      ? `${resource} with id ${id} not found`
      : `${resource} not found`;
    super(message, 404, 'NOT_FOUND');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}

/**
 * Sanitize error message for production
 */
export function sanitizeErrorMessage(
  error: unknown,
  isProduction: boolean
): string {
  if (error instanceof AppError) {
    // Operational errors can be shown to users
    if (error.isOperational) {
      return error.message;
    }
  }

  if (error instanceof Error) {
    // In production, don't expose internal error details
    if (isProduction) {
      return 'An unexpected error occurred. Please try again later.';
    }
    return error.message;
  }

  return 'An unexpected error occurred. Please try again later.';
}

/**
 * Get appropriate HTTP status code from error
 */
export function getErrorStatusCode(error: unknown): number {
  if (error instanceof AppError) {
    return error.statusCode;
  }
  return 500;
}
