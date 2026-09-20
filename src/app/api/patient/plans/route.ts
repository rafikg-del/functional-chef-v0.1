import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requirePatientUser } from '@/lib/patient/require-patient';
import { createPatientPlansDb } from '@/lib/patient/plans-db';
import { handleCreatePlan, handleListPlans } from '@/lib/patient/plans-handler';

function authFailed(result: { ok: false; status: 401 | 403; error: string }) {
  return NextResponse.json({ error: result.error }, { status: result.status });
}

export async function GET() {
  const auth = await requirePatientUser();
  if (!auth.ok) return authFailed(auth);

  const db = createPatientPlansDb(createClient(), auth.user.id);
  const result = await handleListPlans({
    userId: auth.user.id,
    listPlans: () => db.listPlans(),
  });
  return NextResponse.json(result.body, { status: result.status });
}

export async function POST(request: NextRequest) {
  const auth = await requirePatientUser();
  if (!auth.ok) return authFailed(auth);

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
