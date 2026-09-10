/**
 * Canonical SHA-256 helpers for consultation export / physician seal (LIV-65).
 * Uses Web Crypto (available in browsers and Node 20+). Do not import `node:crypto`
 * from this module — it is loaded by client dashboard pages.
 */

export function stableStringify(value: unknown): string {
  return JSON.stringify(sortValue(value));
}

function sortValue(value: unknown): unknown {
  if (value === null || value === undefined) return null;
  if (Array.isArray(value)) return value.map(sortValue);
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(obj).sort()) {
      sorted[key] = sortValue(obj[key]);
    }
    return sorted;
  }
  return value;
}

function bufferToHex(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function sha256Hex(input: string): Promise<string> {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new Error('Web Crypto SHA-256 is unavailable in this runtime');
  }
  const encoded = new TextEncoder().encode(input);
  const digest = await subtle.digest('SHA-256', encoded);
  return bufferToHex(digest);
}

/** Fields hashed for medico-legal traceability. Excludes volatile export timestamps. */
export interface CanonicalConsultation {
  id?: string | null;
  intent?: string | null;
  meal_type?: string | null;
  detected_bottlenecks?: unknown;
  selected_levers?: unknown;
  output_dish?: unknown;
  warnings?: unknown;
  ebm_summary?: unknown;
  engine_version?: string | null;
  validated_at?: string | null;
  validated_by?: string | null;
  validation_notes?: string | null;
}

export function canonicalConsultationPayload(c: CanonicalConsultation): Record<string, unknown> {
  return {
    id: c.id ?? null,
    intent: c.intent ?? '',
    meal_type: c.meal_type ?? null,
    detected_bottlenecks: c.detected_bottlenecks ?? null,
    selected_levers: c.selected_levers ?? null,
    output_dish: c.output_dish ?? null,
    warnings: c.warnings ?? [],
    ebm_summary: c.ebm_summary ?? null,
    engine_version: c.engine_version ?? null,
    validated_at: c.validated_at ?? null,
    validated_by: c.validated_by ?? null,
    validation_notes: c.validation_notes ?? null,
  };
}

export async function hashConsultationContent(c: CanonicalConsultation): Promise<string> {
  return sha256Hex(stableStringify(canonicalConsultationPayload(c)));
}
