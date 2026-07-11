/**
 * Anthropic SDK client — single instance across the app.
 *
 * Model selection :
 *   - PRIMARY (Sonnet 4)  : default for dish composition (cost-efficient, high quality)
 *   - COMPLEX (Opus 4.7)  : invoked when classification has triple co-dominance
 *                           or unusual combinations requiring deeper reasoning
 */

import Anthropic from '@anthropic-ai/sdk';

let cachedClient: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY missing in environment');
  }

  if (!cachedClient) {
    cachedClient = new Anthropic({ apiKey });
  }

  return cachedClient;
}

export const MODELS = {
  PRIMARY: process.env.ANTHROPIC_MODEL_PRIMARY ?? 'claude-sonnet-4-20250514',
  COMPLEX: process.env.ANTHROPIC_MODEL_COMPLEX ?? 'claude-opus-4-7',
} as const;

export function selectModel(opts: { complex: boolean }): string {
  return opts.complex ? MODELS.COMPLEX : MODELS.PRIMARY;
}
