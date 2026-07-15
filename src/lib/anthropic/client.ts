/**
 * Anthropic SDK client — single instance across the app.
 *
 * Lazy initialization — does not throw at import time if env var is missing.
 * This allows the build to succeed without ANTHROPIC_API_KEY configured.
 */

import Anthropic from '@anthropic-ai/sdk';

function createClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY missing in environment');
  }
  return new Anthropic({ apiKey });
}

let _client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!_client) {
    _client = createClient();
  }
  return _client;
}

// Re-export for convenient access
export const anthropic = new Proxy({} as Anthropic, {
  get(_, prop) {
    const client = getAnthropicClient();
    return (client as any)[prop];
  },
});

export const MODELS = {
  PRIMARY: process.env.ANTHROPIC_MODEL_PRIMARY ?? 'claude-sonnet-4-20250514',
  COMPLEX: process.env.ANTHROPIC_MODEL_COMPLEX ?? 'claude-opus-4-7',
} as const;

export function selectModel(opts: { complex: boolean }): string {
  return opts.complex ? MODELS.COMPLEX : MODELS.PRIMARY;
}
