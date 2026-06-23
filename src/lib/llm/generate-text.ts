/**
 * ============================================================
 * LLM text generation adapter
 * ============================================================
 *
 * Supports Anthropic and xAI/Grok behind a small common contract.
 * Request-scoped Grok keys are accepted for the research agent and are
 * never persisted by the application.
 */

import { getAnthropicClient, MODELS, selectModel } from '../anthropic/client';

export type LLMProvider = 'anthropic' | 'grok';

export interface GenerateTextInput {
  system: string;
  user: string;
  max_tokens: number;
  temperature?: number;
  complex?: boolean;
  provider?: LLMProvider;
  model?: string;
  grok_api_key?: string;
}

export interface GenerateTextResult {
  text: string;
  provider: LLMProvider;
  model: string;
  input_tokens?: number;
  output_tokens?: number;
}

interface GrokChatResponse {
  choices?: {
    message?: {
      content?: string;
    };
  }[];
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
  };
}

function configuredProvider(requested?: LLMProvider, grokApiKey?: string): LLMProvider {
  if (requested) return requested;

  const envProvider = process.env.LLM_PROVIDER;
  if (envProvider === 'anthropic' || envProvider === 'grok') return envProvider;

  if (process.env.ANTHROPIC_API_KEY) return 'anthropic';
  if (grokApiKey || process.env.GROK_API_KEY || process.env.XAI_API_KEY) return 'grok';

  return 'anthropic';
}

async function generateWithAnthropic(input: GenerateTextInput): Promise<GenerateTextResult> {
  const model = input.model ?? selectModel({ complex: Boolean(input.complex) });
  const anthropic = getAnthropicClient();
  const response = await anthropic.messages.create({
    model,
    max_tokens: input.max_tokens,
    temperature: input.temperature,
    system: input.system,
    messages: [{ role: 'user', content: input.user }],
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error(`No text block in Anthropic response: ${JSON.stringify(response.content)}`);
  }

  return {
    text: textBlock.text,
    provider: 'anthropic',
    model,
    input_tokens: response.usage?.input_tokens,
    output_tokens: response.usage?.output_tokens,
  };
}

async function generateWithGrok(input: GenerateTextInput): Promise<GenerateTextResult> {
  const apiKey = input.grok_api_key ?? process.env.GROK_API_KEY ?? process.env.XAI_API_KEY;
  if (!apiKey) {
    throw new Error('GROK_API_KEY missing in environment or request');
  }

  const model = input.model ?? process.env.GROK_MODEL ?? process.env.XAI_MODEL ?? 'grok-4.3';
  const endpoint = process.env.GROK_API_URL ?? process.env.XAI_API_URL ?? 'https://api.x.ai/v1/chat/completions';
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      stream: false,
      max_tokens: input.max_tokens,
      temperature: input.temperature,
      messages: [
        { role: 'system', content: input.system },
        { role: 'user', content: input.user },
      ],
    }),
  });

  const bodyText = await response.text();
  if (!response.ok) {
    throw new Error(`Grok API error (${response.status}): ${bodyText.slice(0, 800)}`);
  }

  let body: GrokChatResponse;
  try {
    body = JSON.parse(bodyText) as GrokChatResponse;
  } catch {
    throw new Error(`Invalid JSON from Grok API: ${bodyText.slice(0, 800)}`);
  }

  const text = body.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error(`No text content in Grok response: ${bodyText.slice(0, 800)}`);
  }

  return {
    text,
    provider: 'grok',
    model,
    input_tokens: body.usage?.prompt_tokens,
    output_tokens: body.usage?.completion_tokens,
  };
}

export async function generateText(input: GenerateTextInput): Promise<GenerateTextResult> {
  const provider = configuredProvider(input.provider, input.grok_api_key);
  if (provider === 'grok') {
    return generateWithGrok(input);
  }

  return generateWithAnthropic(input);
}

export const DEFAULT_LLM_MODELS = {
  ANTHROPIC_PRIMARY: MODELS.PRIMARY,
  ANTHROPIC_COMPLEX: MODELS.COMPLEX,
  GROK: process.env.GROK_MODEL ?? process.env.XAI_MODEL ?? 'grok-4.3',
} as const;
