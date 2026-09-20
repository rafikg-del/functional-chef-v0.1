import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { patientAuthFailed } from '@/lib/patient/http';
import { requirePatientUser } from '@/lib/patient/require-patient';
import { createPatientPlansDb } from '@/lib/patient/plans-db';
import { handleRegeneratePlan } from '@/lib/patient/plans-handler';

export const maxDuration = 60;

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requirePatientUser();
  if (!auth.ok) return patientAuthFailed(auth);

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
