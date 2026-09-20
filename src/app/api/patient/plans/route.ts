import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { patientAuthFailed } from '@/lib/patient/http';
import { requirePatientUser } from '@/lib/patient/require-patient';
import { createPatientPlansDb } from '@/lib/patient/plans-db';
import { handleCreatePlan, handleListPlans } from '@/lib/patient/plans-handler';

export const maxDuration = 60;

export async function GET() {
  const auth = await requirePatientUser();
  if (!auth.ok) return patientAuthFailed(auth);

  const db = createPatientPlansDb(createClient(), auth.user.id);
  const result = await handleListPlans({
    userId: auth.user.id,
    listPlans: () => db.listPlans(),
  });
  return NextResponse.json(result.body, { status: result.status });
}

export async function POST(request: NextRequest) {
  const auth = await requirePatientUser();
  if (!auth.ok) return patientAuthFailed(auth);

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });
  }

  const db = createPatientPlansDb(createClient(), auth.user.id);
  try {
    const result = await handleCreatePlan({
      userId: auth.user.id,
      body: payload,
      insertLab: (row) => db.insertLab(row),
      insertIntake: (row) => db.insertIntake(row),
      insertPlan: (row) => db.insertPlan(row),
      loadLab: (labId) => db.loadLab(labId),
      loadDietaryExclusions: () => db.loadDietaryExclusions(),
    });
    return NextResponse.json(result.body, { status: result.status });
  } catch {
    return NextResponse.json(
      { error: 'Enregistrement du plan impossible.' },
      { status: 500 }
    );
  }
}
