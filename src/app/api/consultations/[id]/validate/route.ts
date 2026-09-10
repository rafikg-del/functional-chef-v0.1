import { NextResponse } from 'next/server';
import { requireSessionActor } from '@/lib/security/actor';
import { writeAuditLog } from '@/lib/security/audit';
import { hashConsultationContent } from '@/lib/security/content-hash';
import { ENGINE_VERSION } from '@/lib/engine-version';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const actor = await requireSessionActor();
  if (!actor.ok) {
    return NextResponse.json({ error: actor.error }, { status: actor.status });
  }
  if (!actor.professional) {
    return NextResponse.json(
      { error: 'Professional profile required before validating consultations' },
      { status: 403 }
    );
  }

  let note: string | null = null;
  try {
    const body = await req.json().catch(() => ({}));
    if (body && typeof body.note === 'string' && body.note.trim()) {
      note = body.note.trim().slice(0, 2000);
    }
  } catch {
    note = null;
  }

  const supabase = createClient();
  const consultationId = params.id;

  const { data: existing, error: loadErr } = await supabase
    .from('consultations')
    .select('*')
    .eq('id', consultationId)
    .maybeSingle();

  if (loadErr) {
    return NextResponse.json({ error: loadErr.message }, { status: 500 });
  }
  if (!existing) {
    return NextResponse.json({ error: 'Consultation not found' }, { status: 404 });
  }

  const validatedAt = existing.validated_at ?? new Date().toISOString();
  const validatedBy = existing.validated_by ?? actor.professional.full_name;
  const contentHash = await hashConsultationContent({
    ...existing,
    validated_at: validatedAt,
    validated_by: validatedBy,
    validation_notes: note ?? existing.validation_notes,
    engine_version: existing.engine_version ?? ENGINE_VERSION,
  });

  const { data: rpcResult, error: rpcErr } = await supabase.rpc('validate_consultation', {
    target_consultation_id: consultationId,
    note,
    payload_hash: contentHash,
  });

  if (!rpcErr && rpcResult) {
    return NextResponse.json({
      consultation: rpcResult,
      content_hash: (rpcResult as { content_hash?: string }).content_hash ?? contentHash,
    });
  }

  // Fallback when RPC is not yet applied: UPDATE + audit_log under RLS
  const updatePayload: Record<string, unknown> = {
    validated_at: validatedAt,
    validated_by: validatedBy,
    validation_notes: note,
    content_hash: contentHash,
  };

  let { data: updated, error: updateErr } = await supabase
    .from('consultations')
    .update(updatePayload)
    .eq('id', consultationId)
    .select('*')
    .maybeSingle();

  if (updateErr && /content_hash/.test(updateErr.message)) {
    delete updatePayload.content_hash;
    ({ data: updated, error: updateErr } = await supabase
      .from('consultations')
      .update(updatePayload)
      .eq('id', consultationId)
      .select('*')
      .maybeSingle());
  }

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }
  if (!updated) {
    return NextResponse.json({ error: 'Consultation not found' }, { status: 404 });
  }

  const { error: auditErr } = await writeAuditLog(supabase, {
    professional_id: actor.professional.id,
    user_id: actor.user.id,
    action: 'consultation.validate',
    entity_type: 'consultation',
    entity_id: consultationId,
    metadata: {
      validated_by: validatedBy,
      has_note: Boolean(note),
      content_hash_prefix: contentHash.slice(0, 12),
    },
  });

  if (auditErr) {
    return NextResponse.json(
      {
        error: 'Consultation updated but audit log write failed',
        details: auditErr.message,
        consultation: updated,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ consultation: updated, content_hash: contentHash });
}
