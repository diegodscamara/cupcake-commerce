import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users } from '@/lib/db/schema/users';
import { eq } from 'drizzle-orm';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  const supabase = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const client = postgres(env.databaseUrl);
  const db = drizzle(client, { schema: { users } });

  try {
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    if (existing.length === 0) {
      const fullName =
        user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';

      await db.insert(users).values({
        id: user.id,
        email: user.email || '',
        fullName,
        promotionsEnabled: true,
        orderUpdatesEnabled: true,
      });
    }

    await client.end();

    return NextResponse.json({ success: true, userId: user.id });
  } catch (error) {
    await client.end();
    logger.error('Failed to sync user', error);
    return NextResponse.json({ error: 'Failed to sync user' }, { status: 500 });
  }
}
