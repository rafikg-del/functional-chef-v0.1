/**
 * GET /api/training/batches/[id] — détail d'un batch
 */

import { NextRequest, NextResponse } from 'next/server';
import { getBatchDetail } from '@/lib/training/store';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const detail = await getBatchDetail(params.id);
  if (!detail) {
    return NextResponse.json({ error: 'Batch introuvable' }, { status: 404 });
  }
  return NextResponse.json(detail);
}
