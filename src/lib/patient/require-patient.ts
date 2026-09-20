import type { User } from '@supabase/supabase-js';

/**
 * Patient B2C auth gate.
 *
 * Signup / Auth hook MUST set `app_metadata.role = 'patient'`
 * (Supabase Auth Hook or a post-auth API route). Practitioner
 * sessions (`professional` / missing role) must not pass this gate.
 */

export type PatientSessionUser = Pick<User, 'id'> & {
  app_metadata?: User['app_metadata'];
};

export type GetPatientSession = () => Promise<PatientSessionUser | null>;

export type PatientAuthResult =
  | { ok: true; user: PatientSessionUser }
  | { ok: false; status: 401 | 403; error: string };

function roleOf(user: PatientSessionUser): unknown {
  return user.app_metadata?.role;
}

async function readSessionUser(): Promise<PatientSessionUser | null> {
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function requirePatientUser(
  getUser: GetPatientSession = readSessionUser
): Promise<PatientAuthResult> {
  const user = await getUser();
  if (!user) {
    return { ok: false, status: 401, error: 'Authentication required' };
  }
  if (roleOf(user) !== 'patient') {
    return { ok: false, status: 403, error: 'Patient role required' };
  }
  return { ok: true, user };
}
