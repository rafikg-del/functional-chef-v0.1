/**
 * GET /api/training/export/[id] — télécharge le dataset JSONL
 */

import { NextRequest, NextResponse } from 'next/server';
import { getBatchExport } from '@/lib/training/batch-processor';
import { getBatchDetail } from '@/lib/training/store';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const detail = await getBatchDetail(params.id);
  if (!detail) {
    return NextResponse.json({ error: 'Batch introuvable' }, { status: 404 });
  }

  if (detail.processed_count === 0) {
    return NextResponse.json(
      { error: 'Batch non traité. Lancez POST /api/training/process d\'abord.' },
      { status: 422 }
    );
  }

  const content = await getBatchExport(params.id);
  const filename = `functional-chef-training-${detail.name.replace(/\s+/g, '-')}-${params.id.slice(0, 8)}.jsonl`;

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'application/x-ndjson',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
