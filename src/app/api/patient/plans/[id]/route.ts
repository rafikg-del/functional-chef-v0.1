import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requirePatientUser } from '@/lib/patient/require-patient';
import { createPatientPlansDb } from '@/lib/patient/plans-db';
import { handleGetPlan } from '@/lib/patient/plans-handler';

function authFailed(result: { ok: false; status: 401 | 403; error: string }) {
  return NextResponse.json({ error: result.error }, { status: result.status });
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requirePatientUser();
  if (!auth.ok) return authFailed(auth);

  const db = createPatientPlansDb(createClient(), auth.user.id);
  const result = await handleGetPlan({
    userId: auth.user.id,
    planId: params.id,
    loadPlan: (userId, planId) => db.loadPlan(userId, planId),
  });
  return NextResponse.json(result.body, { status: result.status });
}
