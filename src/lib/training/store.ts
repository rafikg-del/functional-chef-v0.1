/**
 * Persistance fichier des batches et dossiers d'entraînement.
 * data/training/ — fonctionne sans Supabase.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import type { TrainingBatch, TrainingBatchDetail, TrainingDossier } from './types';

const DATA_ROOT = path.join(process.cwd(), 'data', 'training');
const BATCHES_DIR = path.join(DATA_ROOT, 'batches');

async function ensureDirs() {
  await fs.mkdir(BATCHES_DIR, { recursive: true });
}

function batchPath(id: string) {
  return path.join(BATCHES_DIR, `${id}.json`);
}

export async function createBatch(name: string): Promise<TrainingBatch> {
  await ensureDirs();
  const now = new Date().toISOString();
  const batch: TrainingBatch = {
    id: randomUUID(),
    name,
    status: 'uploaded',
    dossier_count: 0,
    processed_count: 0,
    matched_count: 0,
    error_count: 0,
    created_at: now,
    updated_at: now,
  };
  await saveBatchDetail({ ...batch, dossiers: [] });
  return batch;
}

export async function saveBatchDetail(detail: TrainingBatchDetail): Promise<void> {
  await ensureDirs();
  const { dossiers, ...batch } = detail;
  const payload: TrainingBatchDetail = {
    ...batch,
    dossier_count: dossiers.length,
    updated_at: new Date().toISOString(),
    dossiers,
  };
  await fs.writeFile(batchPath(batch.id), JSON.stringify(payload, null, 2), 'utf-8');
}

export async function getBatchDetail(id: string): Promise<TrainingBatchDetail | null> {
  try {
    const raw = await fs.readFile(batchPath(id), 'utf-8');
    return JSON.parse(raw) as TrainingBatchDetail;
  } catch {
    return null;
  }
}

export async function listBatches(): Promise<TrainingBatch[]> {
  await ensureDirs();
  const files = await fs.readdir(BATCHES_DIR);
  const batches: TrainingBatch[] = [];

  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    try {
      const raw = await fs.readFile(path.join(BATCHES_DIR, file), 'utf-8');
      const detail = JSON.parse(raw) as TrainingBatchDetail;
      const { dossiers: _d, ...batch } = detail;
      batches.push(batch);
    } catch {
      // ignore corrupt files
    }
  }

  return batches.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function addDossiers(
  batchId: string,
  dossiers: TrainingDossier[]
): Promise<TrainingBatchDetail> {
  const detail = await getBatchDetail(batchId);
  if (!detail) {
    throw new Error(`Batch ${batchId} introuvable`);
  }
  detail.dossiers.push(...dossiers);
  detail.dossier_count = detail.dossiers.length;
  detail.updated_at = new Date().toISOString();
  await saveBatchDetail(detail);
  return detail;
}

export async function updateBatchStatus(
  batchId: string,
  patch: Partial<TrainingBatch>
): Promise<TrainingBatchDetail> {
  const detail = await getBatchDetail(batchId);
  if (!detail) {
    throw new Error(`Batch ${batchId} introuvable`);
  }
  Object.assign(detail, patch);
  detail.updated_at = new Date().toISOString();
  await saveBatchDetail(detail);
  return detail;
}

export async function updateDossier(
  batchId: string,
  dossierId: string,
  patch: Partial<TrainingDossier>
): Promise<void> {
  const detail = await getBatchDetail(batchId);
  if (!detail) return;
  const idx = detail.dossiers.findIndex((d) => d.id === dossierId);
  if (idx === -1) return;
  detail.dossiers[idx] = { ...detail.dossiers[idx], ...patch };
  await saveBatchDetail(detail);
}

export function getExportPath(batchId: string): string {
  return path.join(DATA_ROOT, 'exports', `${batchId}.jsonl`);
}

export async function writeExport(batchId: string, content: string): Promise<string> {
  const exportDir = path.join(DATA_ROOT, 'exports');
  await fs.mkdir(exportDir, { recursive: true });
  const filePath = getExportPath(batchId);
  await fs.writeFile(filePath, content, 'utf-8');
  return filePath;
}

export async function readExport(batchId: string): Promise<string | null> {
  try {
    return await fs.readFile(getExportPath(batchId), 'utf-8');
  } catch {
    return null;
  }
}
