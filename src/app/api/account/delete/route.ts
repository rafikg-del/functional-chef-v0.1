import { NextResponse } from 'next/server';
import { requireSessionActor } from '@/lib/security/actor';
import { createClient, createServiceClient } from '@/lib/supabase/server';

/**
 * POST /api/account/delete
 * GDPR Article 17 — right to be forgotten.
 * Calls delete_professional_account(auth.uid()) then best-effort auth.users delete.
 */
export async function POST() {
  const actor = await requireSessionActor();
  if (!actor.ok) {
    return NextResponse.json({ error: actor.error }, { status: actor.status });
  }

  const supabase = createClient();
  const { data, error } = await supabase.rpc('delete_professional_account', {
    target_user_id: actor.user.id,
  });

  if (error) {
    const missingFn = /does not exist|schema cache/i.test(error.message);
    return NextResponse.json(
      {
        error: missingFn
          ? 'delete_professional_account is not installed — apply migrations 002 and 003'
          : error.message,
      },
      { status: missingFn ? 501 : 500 }
    );
  }

  let authUserDeleted = false;
  try {
    const admin = createServiceClient();
    const { error: adminErr } = await admin.auth.admin.deleteUser(actor.user.id);
    if (!adminErr) authUserDeleted = true;
    else console.error('[account.delete] auth user delete failed:', adminErr.message);
  } catch (err) {
    console.error('[account.delete] admin API unavailable:', err);
  }

  return NextResponse.json({
    ok: true,
    data_layer_deleted: data === true,
    auth_user_deleted: authUserDeleted,
  });
}
