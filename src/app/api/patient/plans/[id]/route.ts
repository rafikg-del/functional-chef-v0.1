import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { patientAuthFailed } from '@/lib/patient/http';
import { requirePatientUser } from '@/lib/patient/require-patient';
import { createPatientPlansDb } from '@/lib/patient/plans-db';
import { handleGetPlan } from '@/lib/patient/plans-handler';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requirePatientUser();
  if (!auth.ok) return patientAuthFailed(auth);

  const db = createPatientPlansDb(createClient(), auth.user.id);
  const result = await handleGetPlan({
    userId: auth.user.id,
    planId: params.id,
    loadPlan: (userId, planId) => db.loadPlan(userId, planId),
  });
  return NextResponse.json(result.body, { status: result.status });
}
