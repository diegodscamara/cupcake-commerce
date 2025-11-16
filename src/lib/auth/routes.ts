/**
 * Route protection configuration
 * Defines which routes are public, protected, or auth-only
 */

/**
 * Public routes - accessible without authentication
 */
export const publicRoutes = [
  '/',
  '/products',
  '/products/',
  '/cart',
  '/support',
] as const;

/**
 * Auth routes - accessible only when NOT authenticated
 * (redirects authenticated users away)
 */
export const authRoutes = ['/login', '/signup', '/forgot-password'] as const;

/**
 * Protected routes - require authentication
 */
export const protectedRoutes = ['/checkout', '/orders', '/profile'] as const;

/**
 * API routes that require authentication
 */
export const protectedApiRoutes = [
  '/api/cart',
  '/api/orders',
  '/api/checkout',
  '/api/profile',
  '/api/addresses',
  '/api/reviews',
  '/api/payment',
] as const;

/**
 * Check if a path is a public route
 */
export function isPublicRoute(pathname: string): boolean {
  // Check exact matches
  if ((publicRoutes as readonly string[]).includes(pathname)) {
    return true;
  }

  // Check if it's a product detail page
  if (pathname.startsWith('/products/') && pathname !== '/products/') {
    return true;
  }

  // Check if it's an auth route
  if (authRoutes.some((route) => pathname.startsWith(route))) {
    return true;
  }

  // Check if it's a Supabase auth callback
  if (pathname.startsWith('/auth/')) {
    return true;
  }

  return false;
}

/**
 * Check if a path is a protected route
 */
export function isProtectedRoute(pathname: string): boolean {
  // Check exact matches
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    return true;
  }

  // Check order detail pages
  if (pathname.match(/^\/orders\/[^/]+$/)) {
    return true;
  }

  return false;
}

/**
 * Check if a path is an auth-only route (should redirect authenticated users)
 */
export function isAuthRoute(pathname: string): boolean {
  return authRoutes.some((route) => pathname.startsWith(route));
}

/**
 * Check if an API route requires authentication
 */
export function isProtectedApiRoute(pathname: string): boolean {
  return protectedApiRoutes.some((route) => pathname.startsWith(route));
}
