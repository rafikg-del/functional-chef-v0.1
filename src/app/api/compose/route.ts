/**
 * POST /api/compose
 *
 * Full pipeline (spec §6 ÉTAPES 1-5) :
 *   1. Classify bottlenecks
 *   2. Apply safety filters
 *   3. Select levers
 *   4. Compose dish via Claude API
 *   5. Persist consultation in DB (audit trail)
 *
 * Body : { patient: PatientProfile, intent: string, meal_type?: MealType }
 * Returns : ConsultationResult
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/server';
import { classifyBottlenecks } from '@/lib/reasoning/bottleneck-classifier';
import { applySafetyFilters } from '@/lib/reasoning/safety-filters';
import { selectLevers } from '@/lib/reasoning/lever-selector';
import { composeDish, ComposerError } from '@/lib/reasoning/dish-composer';
import {
  LOCAL_BOTTLENECKS,
  LOCAL_LEVER_MAP,
  LOCAL_LEVERS,
  LOCAL_THRESHOLDS,
} from '@/lib/reasoning/local-reference-data';
import type {
  Bottleneck,
  BiomarkerThreshold,
  CulinaryLever,
  LeverBottleneckMap,
  PatientProfile,
  ConsultationResult,
} from '@/lib/reasoning/types';

export const maxDuration = 60; // Vercel — Claude API can take up to 30-45s for Opus

const RequestSchema = z.object({
  intent: z.string().min(3),
  meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'snack', 'full_day']).default('lunch'),
  llm: z
    .object({
      provider: z.enum(['anthropic', 'grok']).optional(),
      model: z.string().optional(),
      grok_api_key: z.string().min(10).optional(),
    })
    .optional(),
  patient: z.object({
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
  }),
});

export async function POST(req: NextRequest) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { intent, meal_type, patient, llm } = parsed.data;
  const hasSupabaseConfig = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // ───────────────────────────────────────────────────────
  // Load reference data
  // ───────────────────────────────────────────────────────
  let bottlenecks: Bottleneck[] = LOCAL_BOTTLENECKS;
  let thresholds: BiomarkerThreshold[] = LOCAL_THRESHOLDS;
  let levers: CulinaryLever[] = LOCAL_LEVERS;
  let leverMap: LeverBottleneckMap[] = LOCAL_LEVER_MAP;
  let supabase: ReturnType<typeof createServiceClient> | null = null;

  if (hasSupabaseConfig) {
    supabase = createServiceClient();
    const [
      { data: dbBottlenecks, error: bErr },
      { data: dbThresholds, error: tErr },
      { data: dbLevers, error: lErr },
      { data: dbLeverMap, error: mErr },
    ] = await Promise.all([
      supabase.from('bottlenecks').select('*'),
      supabase.from('biomarker_thresholds').select('*'),
      supabase.from('culinary_levers').select('*').eq('active', true),
      supabase.from('lever_bottleneck_map').select('*'),
    ]);

    if (bErr || tErr || lErr || mErr) {
      return NextResponse.json(
        {
          error: 'Database error',
          details: bErr?.message ?? tErr?.message ?? lErr?.message ?? mErr?.message,
        },
        { status: 500 }
      );
    }
    if (!dbBottlenecks || !dbThresholds || !dbLevers || !dbLeverMap) {
      return NextResponse.json({ error: 'Database returned empty data' }, { status: 500 });
    }

    bottlenecks = dbBottlenecks as Bottleneck[];
    thresholds = dbThresholds as BiomarkerThreshold[];
    levers = dbLevers as CulinaryLever[];
    leverMap = dbLeverMap as LeverBottleneckMap[];
  }

  // ───────────────────────────────────────────────────────
  // Pipeline
  // ───────────────────────────────────────────────────────

  // 1. Classify
  const classification = classifyBottlenecks(
    patient as PatientProfile,
    bottlenecks as Bottleneck[],
    thresholds as BiomarkerThreshold[]
  );

  if (!classification.dominant) {
    return NextResponse.json(
      {
        error: 'No bottleneck triggered',
        classification,
        hint: 'Enrich biomarker profile or refine intent. Functional Chef requires a physiopathological target.',
      },
      { status: 422 }
    );
  }

  // 2. Safety filters
  const safety = applySafetyFilters(levers as CulinaryLever[], patient as PatientProfile);

  // 3. Lever selection
  const selection = selectLevers({
    classification,
    available_levers: safety.filtered_levers,
    lever_bottleneck_map: leverMap as LeverBottleneckMap[],
  });

  if (selection.selected.length === 0) {
    return NextResponse.json(
      {
        error: 'No selectable levers after safety filtering',
        classification,
        excluded: safety.excluded,
        warnings: [...safety.warnings, ...selection.warnings],
      },
      { status: 422 }
    );
  }

  // 4. Compose dish via Claude
  let composerOutput;
  try {
    composerOutput = await composeDish({
      intent,
      meal_type,
      patient: patient as PatientProfile,
      classification,
      selected_levers: selection.selected,
      excluded_levers: safety.excluded,
      llm,
    });
  } catch (err) {
    if (err instanceof ComposerError) {
      const isConfigurationError =
        err.message.includes('ANTHROPIC_API_KEY missing') ||
        err.message.includes('GROK_API_KEY missing');
      const isInvalidGrokKey = err.message.includes('Grok API key invalid');
      return NextResponse.json(
        {
          error: isConfigurationError
            ? 'Composer not configured'
            : isInvalidGrokKey
            ? 'Invalid Grok API key'
            : 'Composer failure',
          message: err.message,
          raw_response: err.raw_response,
        },
        { status: isConfigurationError ? 503 : isInvalidGrokKey ? 401 : 502 }
      );
    }
    return NextResponse.json(
      { error: 'Unexpected composer error', message: String(err) },
      { status: 500 }
    );
  }

  // 5. Persist consultation
  const allWarnings = [
    ...safety.warnings,
    ...selection.warnings,
    ...composerOutput.dish.warnings,
  ];

  let persisted: { id: string } | null = null;
  if (supabase) {
    const { data, error: persistErr } = await supabase
      .from('consultations')
      .insert({
        intent,
        meal_type,
        detected_bottlenecks: classification.scores,
        selected_levers: selection.selected,
        output_dish: composerOutput.dish,
        ebm_summary: composerOutput.dish.ebm_summary,
        expected_effects: composerOutput.dish.expected_effects,
        warnings: allWarnings,
        excluded_levers: safety.excluded,
        llm_model: composerOutput.meta.model,
        llm_input_tokens: composerOutput.meta.input_tokens,
        llm_output_tokens: composerOutput.meta.output_tokens,
        llm_latency_ms: composerOutput.meta.latency_ms,
      })
      .select('id')
      .single();

    persisted = data;
    if (persistErr) {
      // Persist failure is logged but doesn't block response
      console.error('[compose] persist error:', persistErr);
    }
  } else {
    allWarnings.push('Mode démo local : Supabase non configuré, consultation non persistée.');
  }

  const result: ConsultationResult = {
    consultation_id: persisted?.id,
    intent,
    meal_type,
    classification,
    lever_selection: selection,
    dish: composerOutput.dish,
    warnings: allWarnings,
    llm_meta: composerOutput.meta,
  };

  return NextResponse.json(result);
}
