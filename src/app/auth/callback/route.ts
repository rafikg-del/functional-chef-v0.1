import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { safeInternalPath } from '@/lib/patient/patient-paths';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = safeInternalPath(searchParams.get('next'), '/dashboard');
  const failedAuth = next.startsWith('/patient')
    ? '/patient/auth?error=auth_callback_failed'
    : '/auth?error=auth_callback_failed';

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}${failedAuth}`);
}
