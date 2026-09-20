import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requirePatientUser } from '@/lib/patient/require-patient';
import { createPatientPlansDb } from '@/lib/patient/plans-db';
import { handleRegeneratePlan } from '@/lib/patient/plans-handler';

function authFailed(result: { ok: false; status: 401 | 403; error: string }) {
  return NextResponse.json({ error: result.error }, { status: result.status });
}

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requirePatientUser();
  if (!auth.ok) return authFailed(auth);

  const db = createPatientPlansDb(createClient(), auth.user.id);
  try {
    const result = await handleRegeneratePlan({
      userId: auth.user.id,
      planId: params.id,
      loadPlan: (userId, planId) => db.loadPlan(userId, planId),
      loadIntake: (intakeId) => db.loadIntake(intakeId),
      loadLab: (labId) => db.loadLab(labId),
      loadDietaryExclusions: () => db.loadDietaryExclusions(),
      updatePlan: (row) => db.updatePlan(row),
    });
    return NextResponse.json(result.body, { status: result.status });
  } catch {
    return NextResponse.json(
      { error: 'Enregistrement du plan impossible.' },
      { status: 500 }
    );
  }
}
