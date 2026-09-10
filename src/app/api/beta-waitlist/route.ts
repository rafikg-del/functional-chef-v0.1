/**
 * POST /api/beta-waitlist
 *
 * Practitioner pre-registration. Writes to beta_waitlist via the anon key
 * so RLS INSERT policies are actually exercised. No patient PHI.
 *
 * Failures are honest: never fake success. When the table/migration/env
 * is missing, return a FR message + operator checklist.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  explainWaitlistInsertFailure,
  explainWaitlistUnconfigured,
  isSupabasePublicConfigured,
  parseWaitlistPayload,
} from '@/lib/beta-waitlist';

function createAnonClient() {
  if (!isSupabasePublicConfigured()) return null;
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    }
  );
}

function failureJson(failure: ReturnType<typeof explainWaitlistUnconfigured>) {
  return NextResponse.json(
    {
      error: failure.error,
      code: failure.code,
      operator_checklist: failure.operator_checklist,
    },
    { status: failure.status }
  );
}

export async function POST(req: NextRequest) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON invalide' }, { status: 400 });
  }

  const parsed = parseWaitlistPayload(payload);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const supabase = createAnonClient();
  if (!supabase) {
    return failureJson(explainWaitlistUnconfigured());
  }

  const { error } = await supabase.from('beta_waitlist').insert({
    full_name: parsed.data.full_name,
    email: parsed.data.email,
    specialty: parsed.data.specialty,
    patients_per_week: parsed.data.patients_per_week,
    source: parsed.data.source,
  });

  if (error) {
    const failure = explainWaitlistInsertFailure({
      code: error.code,
      message: error.message,
    });
    console.error('[beta-waitlist] insert failed:', error.code, error.message);
    return failureJson(failure);
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
