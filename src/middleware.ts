import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  if (path.startsWith('/profile')) {
    return NextResponse.redirect(new URL('/events#events-section', request.url));
  }

  if (path.startsWith('/login')) {
    return NextResponse.redirect(new URL('/events#events-section', request.url));
  }

  // Logged-in but not whitelisted / not admin → block dashboard API abuse
  if (path.startsWith('/thebeasthunteradmin') && user) {
    const isAdmin = await checkAdmin(supabase, user.email || '', user.id);
    if (!isAdmin) {
      const signOutResponse = NextResponse.redirect(
        new URL('/thebeasthunteradmin?error=not-admin', request.url)
      );
      return signOutResponse;
    }
  }

  return supabaseResponse;
}

async function checkAdmin(supabase: ReturnType<typeof createServerClient>, email: string, userId: string): Promise<boolean> {
  const normalizedEmail = email.toLowerCase();
  const whitelistString = process.env.ADMIN_EMAIL_WHITELIST || '';
  const whitelist = whitelistString.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);

  if (whitelist.length > 0 && !whitelist.includes(normalizedEmail)) {
    return false;
  }

  const { data } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();

  return data?.role === 'admin';
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
