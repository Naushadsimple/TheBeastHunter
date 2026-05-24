import { createClient } from '@/lib/supabase/server';

export type AdminSession =
  | {
      ok: true;
      userId: string;
      email: string;
      supabase: Awaited<ReturnType<typeof createClient>>;
    }
  | { ok: false; error: string };

function getWhitelist(): string[] {
  return (process.env.ADMIN_EMAIL_WHITELIST || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** Verify admin via session cookies + whitelist + role (no service role required). */
export async function getAdminSession(): Promise<AdminSession> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user?.email) {
      return { ok: false, error: 'Not authenticated' };
    }

    const email = user.email.toLowerCase();
    const whitelist = getWhitelist();

    if (whitelist.length > 0 && !whitelist.includes(email)) {
      return { ok: false, error: 'Email not on admin whitelist' };
    }

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      return { ok: false, error: 'Not an admin account' };
    }

    return { ok: true, userId: user.id, email, supabase };
  } catch {
    return { ok: false, error: 'Auth check failed' };
  }
}

/** @deprecated Use getAdminSession */
export async function verifyAdminSession(): Promise<{
  ok: boolean;
  userId?: string;
  email?: string;
  error?: string;
}> {
  const session = await getAdminSession();
  if (!session.ok) {
    return { ok: false, error: session.error };
  }
  return { ok: true, userId: session.userId, email: session.email };
}
