'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface ProtectedPageProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * Client-side protection for pages that require authentication
 * This is a fallback - the main protection is in middleware
 */
export function ProtectedPage({
  children,
  redirectTo = '/login',
}: ProtectedPageProps) {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push(redirectTo);
      }
    };

    checkAuth();
  }, [router, redirectTo]);

  return <>{children}</>;
}
