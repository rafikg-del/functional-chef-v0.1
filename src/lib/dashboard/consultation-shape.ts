/**
 * Normalize consultation JSONB shapes produced by compose (full ClassificationResult)
 * vs older list mocks ({ dominant, co_dominant }).
 */

export interface BottleneckScoreLike {
  bottleneck_id?: string;
  score?: number;
  major_hits?: number;
  moderate_hits?: number;
  discriminant_hits?: number;
  minor_hits?: number;
  triggered?: boolean;
  is_dominant?: boolean;
  is_co_dominant?: boolean;
}

export interface DetectedBottlenecksLike {
  dominant?: string | null;
  co_dominant?: string | null;
  scores?: BottleneckScoreLike[];
  rationale?: string;
  phenotypes?: string[];
}

export function asDetectedBottlenecks(raw: unknown): DetectedBottlenecksLike | null {
  if (!raw) return null;
  if (Array.isArray(raw)) {
    const scores = raw as BottleneckScoreLike[];
    const dominant = scores.find((s) => s.is_dominant)?.bottleneck_id ?? null;
    const co_dominant = scores.find((s) => s.is_co_dominant)?.bottleneck_id ?? null;
    return { scores, dominant, co_dominant };
  }
  if (typeof raw === 'object') {
    const obj = raw as DetectedBottlenecksLike;
    if (obj.scores || obj.dominant) return obj;
  }
  return null;
}

export function getDominantBottleneck(raw: unknown): string | null {
  return asDetectedBottlenecks(raw)?.dominant ?? null;
}

export function getCoDominantBottleneck(raw: unknown): string | null {
  return asDetectedBottlenecks(raw)?.co_dominant ?? null;
}

export interface EbmSummaryLike {
  T1_count?: number;
  T2_count?: number;
  T3_count?: number;
}

export function getEbmSummary(row: {
  ebm_summary?: EbmSummaryLike | null;
  output_dish?: { ebm_summary?: EbmSummaryLike } | null;
}): EbmSummaryLike | null {
  return row.ebm_summary ?? row.output_dish?.ebm_summary ?? null;
}

export function getLlmMeta(row: {
  llm_meta?: { model?: string; input_tokens?: number; output_tokens?: number; latency_ms?: number } | null;
  llm_model?: string | null;
  llm_input_tokens?: number | null;
  llm_output_tokens?: number | null;
  llm_latency_ms?: number | null;
}): { model: string; input_tokens?: number; output_tokens?: number; latency_ms?: number } | null {
  if (row.llm_meta?.model) {
    return {
      model: row.llm_meta.model,
      input_tokens: row.llm_meta.input_tokens,
      output_tokens: row.llm_meta.output_tokens,
      latency_ms: row.llm_meta.latency_ms,
    };
  }
  if (row.llm_model) {
    return {
      model: row.llm_model,
      input_tokens: row.llm_input_tokens ?? undefined,
      output_tokens: row.llm_output_tokens ?? undefined,
      latency_ms: row.llm_latency_ms ?? undefined,
    };
  }
  return null;
}
