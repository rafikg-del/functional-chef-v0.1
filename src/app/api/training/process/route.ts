/**
 * POST /api/training/process
 * Lance la classification sur tous les dossiers d'un batch.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { processBatch } from '@/lib/training/batch-processor';

const BodySchema = z.object({
  batch_id: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON invalide' }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'batch_id requis (UUID)', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const summary = await processBatch(parsed.data.batch_id);
    return NextResponse.json(summary);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erreur traitement batch' },
      { status: 500 }
    );
  }
}
