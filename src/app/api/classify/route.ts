/**
 * POST /api/classify
 *
 * Body  : PatientProfile (zod-validated)
 * Returns : ClassificationResult
 *
 * No LLM call — pure deterministic scoring against DB-stored thresholds.
 * Useful for :
 *   - Preview before composition (UI shows detected bottleneck before generating dish)
 *   - Standalone bottleneck detection in other ZOI workflows
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/server';
import { classifyBottlenecks } from '@/lib/reasoning/bottleneck-classifier';
import { LOCAL_BOTTLENECKS, LOCAL_THRESHOLDS } from '@/lib/reasoning/local-reference-data';
import type { Bottleneck, BiomarkerThreshold, PatientProfile } from '@/lib/reasoning/types';

const PatientSchema = z.object({
  age: z.number().int().min(0).max(120).optional(),
  sex: z.enum(['F', 'M', 'O']).optional(),
  biomarker_values: z.record(z.string(), z.number()).default({}),
  clinical_signals: z.record(z.string(), z.union([z.number(), z.string()])).default({}),
  exclusions: z
    .object({
      allergies: z.array(z.string()).optional(),
      intolerances: z.array(z.string()).optional(),
      medical: z.array(z.string()).optional(),
      dietary_pattern: z.array(z.string()).optional(),
      dislikes: z.array(z.string()).optional(),
    })
    .default({}),
  context: z
    .object({
      cuisine_pref: z.string().optional(),
      time_per_meal: z.number().optional(),
      budget: z.string().optional(),
      equipment: z.array(z.string()).optional(),
      servings: z.number().optional(),
      language: z.enum(['fr', 'en']).optional(),
    })
    .default({}),
});

export async function POST(req: NextRequest) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = PatientSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const patient = parsed.data as PatientProfile;
  const hasSupabaseConfig = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  if (!hasSupabaseConfig) {
    const result = classifyBottlenecks(patient, LOCAL_BOTTLENECKS, LOCAL_THRESHOLDS);
    return NextResponse.json({
      ...result,
      warnings: ['Mode démo local : Supabase non configuré, référentiel embarqué utilisé.'],
    });
  }

  const supabase = createServiceClient();

  const { data: bottlenecks, error: bErr } = await supabase
    .from('bottlenecks')
    .select('*');
  const { data: thresholds, error: tErr } = await supabase
    .from('biomarker_thresholds')
    .select('*');

  if (bErr || tErr || !bottlenecks || !thresholds) {
    return NextResponse.json(
      { error: 'Database error', details: bErr?.message ?? tErr?.message },
      { status: 500 }
    );
  }

  const result = classifyBottlenecks(
    patient,
    bottlenecks as Bottleneck[],
    thresholds as BiomarkerThreshold[]
  );

  return NextResponse.json(result);
}
