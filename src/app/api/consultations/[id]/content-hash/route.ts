import { NextResponse } from 'next/server';
import { requireSessionActor } from '@/lib/security/actor';
import { writeAuditLog } from '@/lib/security/audit';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const actor = await requireSessionActor();
  if (!actor.ok) {
    return NextResponse.json({ error: actor.error }, { status: actor.status });
  }

  let contentHash: string | null = null;
  try {
    const body = await req.json();
    if (typeof body?.content_hash === 'string' && /^[a-f0-9]{64}$/i.test(body.content_hash)) {
      contentHash = body.content_hash.toLowerCase();
    }
  } catch {
    contentHash = null;
  }

  if (!contentHash) {
    return NextResponse.json({ error: 'content_hash (SHA-256 hex) is required' }, { status: 400 });
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('consultations')
    .update({ content_hash: contentHash })
    .eq('id', params.id)
    .select('id, content_hash')
    .maybeSingle();

  if (error) {
    if (/content_hash/.test(error.message)) {
      return NextResponse.json(
        { error: 'content_hash column missing — apply migration 003' },
        { status: 501 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: 'Consultation not found' }, { status: 404 });
  }

  if (actor.professional) {
    await writeAuditLog(supabase, {
      professional_id: actor.professional.id,
      user_id: actor.user.id,
      action: 'consultation.export',
      entity_type: 'consultation',
      entity_id: params.id,
      metadata: { content_hash_prefix: contentHash.slice(0, 12) },
    });
  }

  return NextResponse.json({ id: data.id, content_hash: data.content_hash });
}
