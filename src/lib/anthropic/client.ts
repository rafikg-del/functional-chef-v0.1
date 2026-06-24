/**
 * Anthropic SDK client — lazy singleton.
 *
 * Initialized on first API call, not at module load, so `next build`
 * succeeds without ANTHROPIC_API_KEY (required only at runtime).
 *
 * Model selection :
 *   - PRIMARY (Sonnet 4)  : default for dish composition
 *   - COMPLEX (Opus 4.7)  : triple co-dominance or unusual patterns
 */

import Anthropic from '@anthropic-ai/sdk';

let _client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!_client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY missing in environment');
    }
    _client = new Anthropic({ apiKey });
  }
  return _client;
}

export const MODELS = {
  PRIMARY: process.env.ANTHROPIC_MODEL_PRIMARY ?? 'claude-sonnet-4-20250514',
  COMPLEX: process.env.ANTHROPIC_MODEL_COMPLEX ?? 'claude-opus-4-7',
} as const;

export function selectModel(opts: { complex: boolean }): string {
  return opts.complex ? MODELS.COMPLEX : MODELS.PRIMARY;
}
