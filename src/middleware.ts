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
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
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

  // Refresh session if expired - required for Server Components
  const { data: { user } } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // 1. Profile route protection
  if (path.startsWith('/profile') && !user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', '/profile');
    return NextResponse.redirect(loginUrl);
  }

  // 2. Admin route protection
  if (path.startsWith('/admin')) {
    // Skip protection for admin login page
    if (path === '/admin/login') {
      if (user) {
        const isAdmin = await checkAdmin(supabase, user.email || '', user.id);
        if (isAdmin) {
          return NextResponse.redirect(new URL('/admin', request.url));
        }
      }
      return supabaseResponse;
    }

    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    const isAdmin = await checkAdmin(supabase, user.email || '', user.id);
    if (!isAdmin) {
      // Redirect to homepage if logged in but not admin
      return NextResponse.redirect(new URL('/?error=unauthorized', request.url));
    }
  }

  return supabaseResponse;
}

async function checkAdmin(supabase: any, email: string, userId: string): Promise<boolean> {
  const whitelistString = process.env.ADMIN_EMAIL_WHITELIST || '';
  const whitelist = whitelistString.split(',').map(e => e.trim().toLowerCase());
  
  if (!whitelist.includes(email.toLowerCase())) {
    return false;
  }

  // Check database role in public.users table
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();

  if (error || !data || data.role !== 'admin') {
    return false;
  }

  return true;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
