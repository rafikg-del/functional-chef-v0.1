/**
 * POST /api/beta-waitlist
 *
 * Practitioner pre-registration. Writes to beta_waitlist via the anon key
 * so RLS INSERT policies are actually exercised. No patient PHI.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { parseWaitlistPayload } from '@/lib/beta-waitlist';

function createAnonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes('YOUR_PROJECT')) {
    return null;
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
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
    return NextResponse.json(
      {
        error:
          'Pré-inscription indisponible : Supabase n’est pas configuré sur cet environnement.',
      },
      { status: 503 }
    );
  }

  const { error } = await supabase.from('beta_waitlist').insert({
    full_name: parsed.data.full_name,
    email: parsed.data.email,
    specialty: parsed.data.specialty,
    patients_per_week: parsed.data.patients_per_week,
    source: parsed.data.source,
  });

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Cet email est déjà pré-inscrit. Nous vous recontacterons.' },
        { status: 409 }
      );
    }
    console.error('[beta-waitlist] insert failed:', error.message);
    return NextResponse.json(
      { error: 'Impossible d’enregistrer l’inscription. Réessayez dans un instant.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
