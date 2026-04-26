/**
 * ============================================================
 * Dish Composer — Orchestrator
 * ============================================================
 *
 * Final stage of the engine pipeline (spec §6 ÉTAPE 4).
 *
 *   Input  : ComposerInput (intent + classification + selected levers + patient)
 *   Output : ComposedDish (validated JSON)
 *
 * Responsibilities :
 *   1. Build structured user message via prompts.buildUserMessage
 *   2. Invoke Claude API (Sonnet 4 by default, Opus 4.7 if complex)
 *   3. Parse JSON, strip any accidental markdown fences
 *   4. Validate shape via prompts.validateComposedDish
 *   5. Return ComposedDish + LLM metadata
 *
 * Error handling :
 *   - Invalid JSON → throw ComposerError with raw response for debugging
 *   - Schema mismatch → throw ComposerError with offending object
 *   - API error → propagate (caller decides retry policy)
 */

import { anthropic, selectModel } from '../anthropic/client';
import {
  SYSTEM_PROMPT,
  buildUserMessage,
  validateComposedDish,
} from '../anthropic/prompts';
import type { ComposerInput, ComposedDish } from './types';

export class ComposerError extends Error {
  constructor(
    message: string,
    public readonly raw_response?: string,
    public readonly cause_data?: unknown
  ) {
    super(message);
    this.name = 'ComposerError';
  }
}

export interface ComposerOutput {
  dish: ComposedDish;
  meta: {
    model: string;
    input_tokens?: number;
    output_tokens?: number;
    latency_ms: number;
  };
}

/**
 * Strip accidental markdown code fences. The system prompt forbids them, but
 * defensive in case the model slips.
 */
function stripFences(text: string): string {
  const trimmed = text.trim();
  // Match ```json ... ``` or ``` ... ```
  const fence = /^```(?:json)?\s*([\s\S]*?)\s*```$/;
  const m = trimmed.match(fence);
  return m ? m[1].trim() : trimmed;
}

export async function composeDish(input: ComposerInput): Promise<ComposerOutput> {
  // Triple co-dominance or unusual patterns → use Opus
  const triggeredCount = input.classification.scores.filter((s) => s.triggered).length;
  const useComplex = triggeredCount >= 3;
  const model = selectModel({ complex: useComplex });

  const userMessage = buildUserMessage(input);
  const t0 = Date.now();

  let response;
  try {
    response = await anthropic.messages.create({
      model,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });
  } catch (err) {
    throw new ComposerError(
      `Anthropic API error: ${err instanceof Error ? err.message : 'unknown'}`,
      undefined,
      err
    );
  }

  const latency_ms = Date.now() - t0;

  // Extract text from response content blocks
  const textBlock = response.content.find((b) => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new ComposerError('No text block in Anthropic response', JSON.stringify(response.content));
  }

  const rawText = textBlock.text;
  const cleaned = stripFences(rawText);

  // Parse JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new ComposerError(
      `Invalid JSON from composer (parse error: ${err instanceof Error ? err.message : 'unknown'})`,
      cleaned
    );
  }

  // Validate shape
  if (!validateComposedDish(parsed)) {
    throw new ComposerError(
      'Composer output does not match ComposedDish schema',
      cleaned,
      parsed
    );
  }

  return {
    dish: parsed,
    meta: {
      model,
      input_tokens: response.usage?.input_tokens,
      output_tokens: response.usage?.output_tokens,
      latency_ms,
    },
  };
}
