import { NextResponse } from 'next/server';
import type { PatientAuthResult } from './require-patient';

export function patientAuthFailed(result: Extract<PatientAuthResult, { ok: false }>) {
  const error =
    result.status === 401
      ? 'Authentification requise.'
      : 'Accès réservé à l’espace patient.';
  return NextResponse.json({ error }, { status: result.status });
}
