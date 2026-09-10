import type { SupabaseClient } from '@supabase/supabase-js';
import { ENGINE_VERSION } from '@/lib/engine-version';

export type AuditAction =
  | 'consultation.create'
  | 'consultation.validate'
  | 'consultation.export'
  | 'classify.run'
  | 'compose.run'
  | 'consent.accept'
  | 'account.delete'
  | 'profile.update';

export interface AuditEntry {
  professional_id?: string | null;
  user_id?: string | null;
  action: string;
  entity_type?: string | null;
  entity_id?: string | null;
  metadata?: Record<string, unknown>;
  engine_version?: string;
}

/**
 * Best-effort audit insert. Callers that must fail closed should check `error`.
 * Never include PHI (names, biomarkers, free-text clinical notes) in metadata.
 */
export async function writeAuditLog(
  supabase: SupabaseClient,
  entry: AuditEntry
): Promise<{ error: { message: string } | null }> {
  const { error } = await supabase.from('audit_log').insert({
    professional_id: entry.professional_id ?? null,
    user_id: entry.user_id ?? null,
    action: entry.action,
    entity_type: entry.entity_type ?? null,
    entity_id: entry.entity_id ?? null,
    metadata: entry.metadata ?? {},
    engine_version: entry.engine_version ?? ENGINE_VERSION,
  });

  if (error) {
    console.error('[audit] insert failed:', error.message);
    return { error: { message: error.message } };
  }
  return { error: null };
}
