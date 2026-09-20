import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import {
  isProtectedPatientPath,
  isPublicPatientPath,
  patientAuthRedirectPath,
  safeInternalPath,
} from '@/lib/patient/patient-paths';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip auth for public pages
  if (pathname.startsWith('/prescription') ||
      pathname.startsWith('/test-parser') ||
      pathname.startsWith('/api/beta-waitlist') ||
      pathname.startsWith('/api/demo-compose')) {
    return NextResponse.next({ request: { headers: request.headers } });
  }
  if (pathname.endsWith('/print')) {
    return NextResponse.next({ request: { headers: request.headers } });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseReady =
    Boolean(supabaseUrl && supabaseAnon) && !supabaseUrl!.includes('YOUR_PROJECT');

  const protectedPaths = ['/dashboard', '/consultation'];
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));
  // Public patient routes: /patient and /patient/auth. All other /patient/* require a session.
  const patientProtected = isProtectedPatientPath(pathname);

  // Marketing + demo must stay up even if Auth is not configured yet.
  if (!supabaseReady) {
    if (patientProtected) {
      return NextResponse.redirect(new URL(patientAuthRedirectPath(pathname), request.url));
    }
    if (isProtected) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }
    return NextResponse.next({ request: { headers: request.headers } });
  }

  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (patientProtected && !user) {
    return NextResponse.redirect(new URL(patientAuthRedirectPath(pathname), request.url));
  }

  if (isPublicPatientPath(pathname) && pathname.includes('/auth') && user) {
    const next = safeInternalPath(request.nextUrl.searchParams.get('next'), '/patient/plans');
    const dest = next.startsWith('/patient') ? next : '/patient/plans';
    return NextResponse.redirect(new URL(dest, request.url));
  }

  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  // Auth page redirect if already logged in
  if (pathname.startsWith('/auth') && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|demo|beta|privacy|api/classify|api/compose|api/demo-compose|api/beta-waitlist|auth).*)',
  ],
};
