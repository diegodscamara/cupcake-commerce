/**
 * Environment variable validation and access
 * Ensures all required environment variables are present at runtime
 */

const isServer = typeof window === 'undefined';

function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getServerEnv(key: string, defaultValue?: string): string {
  if (!isServer) {
    if (defaultValue) return defaultValue;
    throw new Error(
      `Environment variable ${key} is only available on the server`
    );
  }
  return getEnv(key, defaultValue);
}

export const env = {
  // Supabase (available on both client and server via NEXT_PUBLIC_ prefix)
  // Next.js automatically injects NEXT_PUBLIC_* vars into the client bundle
  get supabaseUrl() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!url) {
      throw new Error(
        'Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL'
      );
    }
    return url;
  },
  get supabaseAnonKey() {
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!key) {
      throw new Error(
        'Missing required environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY'
      );
    }
    return key;
  },
  get supabaseServiceRoleKey() {
    return getServerEnv('SUPABASE_SERVICE_ROLE_KEY', '');
  },

  // Database (server-only)
  get databaseUrl() {
    return getServerEnv('DATABASE_URL');
  },

  // Node environment
  get nodeEnv() {
    return getEnv('NODE_ENV', 'development');
  },
} as const;
