/**
 * POST /api/research-agent
 *
 * Draft curation pipeline:
 * problem + optional literature snippets → candidate bottleneck brief.
 *
 * The output is a knowledge draft for expert review, not a patient-specific
 * prescription and not a persisted consultation.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { runResearchAgent, ResearchAgentError } from '@/lib/research/research-agent';

export const maxDuration = 90;

const LiteratureSchema = z.object({
  title: z.string().min(3),
  authors: z.array(z.string()).optional(),
  journal: z.string().optional(),
  year: z.number().int().min(1800).max(2100).optional(),
  pmid: z.string().optional(),
  doi: z.string().optional(),
  url: z.string().url().optional(),
  abstract: z.string().optional(),
  key_findings: z.array(z.string()).optional(),
});

const RequestSchema = z.object({
  problem: z.string().min(10),
  target_bottleneck_name: z.string().optional(),
  context: z
    .object({
      population: z.string().optional(),
      daily_context: z.string().optional(),
      preferred_cuisine: z.string().optional(),
      meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'snack', 'full_day']).optional(),
      exclusions: z.array(z.string()).optional(),
      language: z.enum(['fr', 'en']).optional(),
    })
    .optional(),
  literature: z.array(LiteratureSchema).max(12).optional(),
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

  try {
    const result = await runResearchAgent(parsed.data);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ResearchAgentError) {
      return NextResponse.json(
        {
          error: 'Research agent failure',
          message: err.message,
          raw_response: err.raw_response,
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: 'Unexpected research agent error', message: String(err) },
      { status: 500 }
    );
  }
}
