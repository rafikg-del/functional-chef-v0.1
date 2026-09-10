/**
 * POST /api/demo-compose
 *
 * Public, no auth. Runs the same deterministic demo pipeline as the client.
 * If ANTHROPIC_API_KEY is present, attempts a live Claude compose and
 * upgrades the dish. Missing key or composer errors never 500 — fixture
 * / deterministic preview is returned instead.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { composeDish, ComposerError } from '@/lib/reasoning/dish-composer';
import { runPublicDemo } from '@/lib/demo/run-public-demo';
import type { DemoCaseKey } from '@/lib/demo/cases';
import type { PatientProfile } from '@/lib/reasoning/types';

export const maxDuration = 60;

const RequestSchema = z.object({
  case_key: z.enum(['A', 'B', 'C', 'custom']).optional().default('custom'),
  intent: z.string().min(3).optional(),
  meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'snack', 'full_day']).optional(),
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
        cuisine_pref: z.enum(['mediterranean', 'french', 'maghrebi', 'asian', 'flexible']).optional(),
        time_per_meal: z.number().optional(),
        budget: z.enum(['low', 'medium', 'high']).optional(),
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
    return NextResponse.json({ error: 'JSON invalide' }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const case_key = parsed.data.case_key as DemoCaseKey;
  const patient = parsed.data.patient as PatientProfile;
  const preview = runPublicDemo({
    patient,
    case_key,
  });

  const anthropicReady = Boolean(process.env.ANTHROPIC_API_KEY);
  if (
    anthropicReady &&
    preview.classification.dominant &&
    preview.lever_selection.selected.length > 0
  ) {
    try {
      const live = await composeDish({
        intent:
          parsed.data.intent ??
          `Déjeuner ciblé ${preview.classification.dominant} — démo publique, à valider par un praticien`,
        meal_type: parsed.data.meal_type ?? 'lunch',
        patient,
        classification: preview.classification,
        selected_levers: preview.lever_selection.selected,
      });
      return NextResponse.json({
        ...preview,
        dish: live.dish,
        dish_source: 'live',
        llm_meta: live.meta,
      });
    } catch (err) {
      const message =
        err instanceof ComposerError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'composer_error';
      console.error('[demo-compose] live compose failed, returning fixture:', message);
    }
  }

  return NextResponse.json({
    ...preview,
    anthropic_configured: anthropicReady,
  });
}
