/**
 * Helper functions for API route handlers
 * Provides consistent error handling and response formatting
 */

import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import {
  AppError,
  ValidationError,
  UnauthorizedError,
  sanitizeErrorMessage,
  getErrorStatusCode,
} from '@/lib/errors';
import { logger } from '@/lib/logger';
import { env } from '@/lib/env';

const isProduction = env.nodeEnv === 'production';

/**
 * Handle API errors consistently
 */
export function handleApiError(error: unknown): NextResponse {
  logger.error('API error occurred', error);

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const fields: Record<string, string[]> = {};
    error.issues.forEach((err) => {
      const path = err.path.join('.');
      if (!fields[path]) {
        fields[path] = [];
      }
      fields[path].push(err.message);
    });

    const validationError = new ValidationError('Validation failed', fields);
    return NextResponse.json(
      {
        error: validationError.message,
        code: validationError.code,
        fields: validationError.fields,
      },
      { status: validationError.statusCode }
    );
  }

  // Handle custom AppErrors
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: sanitizeErrorMessage(error, isProduction),
        code: error.code,
      },
      { status: error.statusCode }
    );
  }

  // Handle unknown errors
  const statusCode = getErrorStatusCode(error);
  return NextResponse.json(
    {
      error: sanitizeErrorMessage(error, isProduction),
      code: 'INTERNAL_ERROR',
    },
    { status: statusCode }
  );
}

/**
 * Require authentication for API routes
 */
export async function requireAuth(
  _request: NextRequest
): Promise<{ id: string; email?: string }> {
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new UnauthorizedError('Authentication required');
  }

  return { id: user.id, email: user.email };
}

/**
 * Get optional authentication for API routes that support anonymous users
 * Returns user if authenticated, null otherwise
 */
export async function getOptionalAuth(): Promise<{
  id: string;
  email?: string;
} | null> {
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return { id: user.id, email: user.email };
}

/**
 * Parse and validate query parameters with Zod schema
 */
export async function parseQueryParams<T>(
  request: NextRequest,
  schema: { parse: (data: unknown) => T }
): Promise<T> {
  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());

  try {
    return schema.parse(params);
  } catch (error) {
    if (error instanceof ZodError) {
      throw error;
    }
    throw new ValidationError('Invalid query parameters');
  }
}

/**
 * Parse and validate request body with Zod schema
 */
export async function parseBody<T>(
  request: NextRequest,
  schema: { parse: (data: unknown) => T }
): Promise<T> {
  try {
    const body = await request.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      throw error;
    }
    throw new ValidationError('Invalid request body');
  }
}
