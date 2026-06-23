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
import { searchPubMedLiterature } from '@/lib/research/pubmed';
import type { LiteratureEvidenceInput } from '@/lib/research/types';

export const maxDuration = 120;

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
  llm: z
    .object({
      provider: z.enum(['anthropic', 'grok']).optional(),
      model: z.string().optional(),
      grok_api_key: z.string().min(10).optional(),
    })
    .optional(),
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
  literature_search: z
    .object({
      enabled: z.boolean().default(false),
      query: z.string().optional(),
      max_results: z.number().int().min(1).max(12).default(6),
    })
    .optional(),
});

function mergeLiterature(
  manual: LiteratureEvidenceInput[] = [],
  fetched: LiteratureEvidenceInput[] = []
): LiteratureEvidenceInput[] {
  const byKey = new Map<string, LiteratureEvidenceInput>();

  for (const paper of [...manual, ...fetched]) {
    const key =
      paper.pmid?.toLowerCase() ??
      paper.doi?.toLowerCase() ??
      paper.url?.toLowerCase() ??
      paper.title.toLowerCase();
    if (!byKey.has(key)) {
      byKey.set(key, paper);
    }
  }

  return Array.from(byKey.values()).slice(0, 12);
}

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
    const { literature_search, ...agentInput } = parsed.data;
    let fetchedLiterature;

    if (literature_search?.enabled) {
      try {
        fetchedLiterature = await searchPubMedLiterature({
          problem: parsed.data.problem,
          target_bottleneck_name: parsed.data.target_bottleneck_name,
          query: literature_search.query,
          max_results: literature_search.max_results,
        });
      } catch (err) {
        fetchedLiterature = {
          query: literature_search.query ?? parsed.data.problem,
          pmids: [],
          papers: [],
          warnings: [
            `Recherche PubMed indisponible: ${err instanceof Error ? err.message : 'erreur inconnue'}`,
          ],
        };
      }
    }

    const result = await runResearchAgent({
      ...agentInput,
      literature: mergeLiterature(agentInput.literature, fetchedLiterature?.papers),
    });

    if (fetchedLiterature) {
      result.literature_search = fetchedLiterature;
    }

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ResearchAgentError) {
      const isConfigurationError =
        err.message.includes('ANTHROPIC_API_KEY missing') ||
        err.message.includes('GROK_API_KEY missing');
      const isInvalidGrokKey = err.message.includes('Grok API key invalid');
      return NextResponse.json(
        {
          error: isConfigurationError
            ? 'Research agent not configured'
            : isInvalidGrokKey
            ? 'Invalid Grok API key'
            : 'Research agent failure',
          message: err.message,
          raw_response: err.raw_response,
        },
        { status: isConfigurationError ? 503 : isInvalidGrokKey ? 401 : 502 }
      );
    }

    return NextResponse.json(
      { error: 'Unexpected research agent error', message: String(err) },
      { status: 500 }
    );
  }
}
