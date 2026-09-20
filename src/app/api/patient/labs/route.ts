import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { mergeBiomarkers } from '@/lib/patient/merge-biomarkers';
import { requirePatientUser } from '@/lib/patient/require-patient';
import type { BiomarkerMap, PatientLabSource } from '@/lib/patient/types';

function authFailed(result: { ok: false; status: 401 | 403; error: string }) {
  return NextResponse.json({ error: result.error }, { status: result.status });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asBiomarkerMap(value: unknown): BiomarkerMap {
  if (!isRecord(value)) return {};
  const map: BiomarkerMap = {};
  for (const [key, raw] of Object.entries(value)) {
    if (typeof raw === 'number' || typeof raw === 'string' || raw === null) {
      map[key] = raw;
    }
  }
  return map;
}

export function inferLabSource(parsed: BiomarkerMap, editedSubmitted: BiomarkerMap): PatientLabSource {
  const hasParsed = Object.keys(parsed).length > 0;
  const hasEditedOverlay = Object.keys(editedSubmitted).some((key) => editedSubmitted[key] !== '');
  if (hasParsed && hasEditedOverlay) return 'pdf_edited';
  if (hasParsed) return 'pdf';
  return 'manual';
}

export async function POST(request: NextRequest) {
  const auth = await requirePatientUser();
  if (!auth.ok) return authFailed(auth);

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Données de laboratoire incomplètes.' },
      { status: 400 }
    );
  }

  if (!isRecord(payload)) {
    return NextResponse.json(
      { error: 'Données de laboratoire incomplètes.' },
      { status: 400 }
    );
  }

  const parsed = asBiomarkerMap(payload.parsed_biomarkers);
  const editedOverlay = asBiomarkerMap(payload.edited_biomarkers);
  const edited = mergeBiomarkers(parsed, editedOverlay);
  const storage_path =
    typeof payload.storage_path === 'string' && payload.storage_path.length > 0
      ? payload.storage_path
      : null;

  const supabase = createClient();
  const { data, error } = await supabase
    .from('patient_labs')
    .insert({
      user_id: auth.user.id,
      source: inferLabSource(parsed, editedOverlay),
      storage_path,
      parsed_biomarkers: parsed,
      edited_biomarkers: edited,
    })
    .select('id')
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: 'Enregistrement du laboratoire impossible.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ id: data.id });
}
