/**
 * GET /api/training/batches — liste des imports
 * POST /api/training/batches — alias création vide (optionnel)
 */

import { NextResponse } from 'next/server';
import { listBatches } from '@/lib/training/store';

export async function GET() {
  const batches = await listBatches();
  return NextResponse.json({ batches });
}
