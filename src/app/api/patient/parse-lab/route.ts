import { NextRequest, NextResponse } from 'next/server';
import { parseSynlabPDF, type SynlabExtraction } from '@/lib/synlab-pdf-parser';
import { patientAuthFailed } from '@/lib/patient/http';
import { requirePatientUser } from '@/lib/patient/require-patient';
import type { BiomarkerMap } from '@/lib/patient/types';

const MANUAL_REQUIRED = {
  error: 'Impossible de lire ce PDF. Saisissez vos biomarqueurs manuellement.',
  manual_required: true as const,
};

export function extractionToBiomarkerMap(extraction: SynlabExtraction): BiomarkerMap {
  const map: BiomarkerMap = {};
  for (const bm of extraction.biomarkers) {
    if (bm.result === '' || bm.result === undefined) continue;
    map[bm.biomarker] = bm.result;
  }
  return map;
}

export async function POST(request: NextRequest) {
  const auth = await requirePatientUser();
  if (!auth.ok) return patientAuthFailed(auth);

  let file: File | null = null;
  try {
    const form = await request.formData();
    const raw = form.get('file');
    file = raw instanceof File ? raw : null;
  } catch {
    return NextResponse.json(MANUAL_REQUIRED, { status: 422 });
  }

  if (!file) {
    return NextResponse.json(MANUAL_REQUIRED, { status: 422 });
  }

  const looksLikePdf =
    file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  if (!looksLikePdf) {
    return NextResponse.json(MANUAL_REQUIRED, { status: 422 });
  }

  try {
    const buffer = await file.arrayBuffer();
    const extraction = await parseSynlabPDF(buffer);
    const biomarkers = extractionToBiomarkerMap(extraction);
    if (Object.keys(biomarkers).length === 0) {
      return NextResponse.json(MANUAL_REQUIRED, { status: 422 });
    }
    return NextResponse.json({ biomarkers });
  } catch {
    return NextResponse.json(MANUAL_REQUIRED, { status: 422 });
  }
}
