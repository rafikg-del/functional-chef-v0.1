import { createClient } from '@/lib/supabase/server';
import type { User } from '@supabase/supabase-js';

export interface ProfessionalActor {
  id: string;
  full_name: string;
  user_id: string;
}

export interface SessionActor {
  user: User | null;
  professional: ProfessionalActor | null;
}

/**
 * Resolve the signed-in user + professional profile from cookies.
 * Returns empty actor (not thrown) when unauthenticated so demo APIs can stay open.
 */
export async function getSessionActor(): Promise<SessionActor> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { user: null, professional: null };

    const { data: professional } = await supabase
      .from('professional_profiles')
      .select('id, full_name, user_id')
      .eq('user_id', user.id)
      .maybeSingle();

    return {
      user,
      professional: professional
        ? {
            id: professional.id as string,
            full_name: professional.full_name as string,
            user_id: professional.user_id as string,
          }
        : null,
    };
  } catch (err) {
    console.error('[actor] session lookup failed:', err);
    return { user: null, professional: null };
  }
}

export async function requireSessionActor(): Promise<
  | { ok: true; user: User; professional: ProfessionalActor | null }
  | { ok: false; status: 401; error: string }
> {
  const { user, professional } = await getSessionActor();
  if (!user) {
    return { ok: false, status: 401, error: 'Authentication required' };
  }
  return { ok: true, user, professional };
}
