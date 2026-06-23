/**
 * Traitement batch des dossiers patients — classification + export dataset.
 */

import { randomUUID } from 'node:crypto';
import { classifyBottlenecks } from '../reasoning/bottleneck-classifier';
import { loadReferenceData } from '../reasoning/reference-data';
import type { DossierFileInput } from './types';
import type { ProcessSummary, TrainingDossier, TrainingExampleLine } from './types';
import {
  getBatchDetail,
  readExport,
  saveBatchDetail,
  updateBatchStatus,
  writeExport,
} from './store';

export async function processBatch(batchId: string): Promise<ProcessSummary> {
  const detail = await getBatchDetail(batchId);
  if (!detail) {
    throw new Error(`Batch ${batchId} introuvable`);
  }

  await updateBatchStatus(batchId, { status: 'processing' });

  const ref = await loadReferenceData();
  let processed = 0;
  let matched = 0;
  let errors = 0;

  for (const dossier of detail.dossiers) {
    try {
      const classification = classifyBottlenecks(
        dossier.profile,
        ref.bottlenecks,
        ref.thresholds
      );

      const predicted = classification.dominant;
      const matchExpected =
        dossier.expected_dominant !== undefined
          ? predicted === dossier.expected_dominant
          : undefined;

      dossier.status = 'processed';
      dossier.predicted_dominant = predicted;
      dossier.classification_rationale = classification.rationale;
      dossier.match_expected = matchExpected;
      dossier.processed_at = new Date().toISOString();
      dossier.error_message = undefined;

      processed++;
      if (matchExpected === true) matched++;
      if (!predicted) errors++;
    } catch (err) {
      dossier.status = 'error';
      dossier.error_message = err instanceof Error ? err.message : String(err);
      errors++;
    }
  }

  const withLabels = detail.dossiers.filter((d) => d.expected_dominant !== undefined);
  const labelMatches = withLabels.filter((d) => d.match_expected === true).length;

  detail.processed_count = processed;
  detail.matched_count = labelMatches;
  detail.error_count = errors;
  detail.status = errors === detail.dossiers.length ? 'error' : 'ready';
  detail.updated_at = new Date().toISOString();

  await saveBatchDetail(detail);
  await exportBatchJsonl(batchId);

  return {
    batch: {
      id: detail.id,
      name: detail.name,
      status: detail.status,
      dossier_count: detail.dossier_count,
      processed_count: detail.processed_count,
      matched_count: detail.matched_count,
      error_count: detail.error_count,
      created_at: detail.created_at,
      updated_at: detail.updated_at,
    },
    processed,
    matched: labelMatches,
    errors,
  };
}

export function dossierFromParsed(
  batchId: string,
  folderName: string,
  sourceFile: string,
  data: DossierFileInput & { profile: import('../reasoning/types').PatientProfile }
): TrainingDossier {
  return {
    id: randomUUID(),
    batch_id: batchId,
    folder_name: folderName,
    source_file: sourceFile,
    status: 'parsed',
    profile: data.profile,
    intent: data.intent,
    meal_type: data.meal_type,
    expected_dominant: data.expected_dominant,
    notes: data.notes ?? data.label,
  };
}

export async function exportBatchJsonl(batchId: string): Promise<string> {
  const detail = await getBatchDetail(batchId);
  if (!detail) {
    throw new Error(`Batch ${batchId} introuvable`);
  }

  const lines: TrainingExampleLine[] = detail.dossiers
    .filter((d) => d.status === 'processed')
    .map((d) => ({
      dossier_id: d.id,
      external_id: d.profile.external_id,
      input: {
        patient: d.profile,
        intent: d.intent,
        meal_type: d.meal_type,
      },
      output: {
        dominant: d.predicted_dominant ?? null,
        rationale: d.classification_rationale ?? '',
        expected_dominant: d.expected_dominant,
        match: d.match_expected,
      },
      metadata: {
        batch_id: batchId,
        folder_name: d.folder_name,
        processed_at: d.processed_at ?? new Date().toISOString(),
      },
    }));

  const content = lines.map((l) => JSON.stringify(l)).join('\n');
  await writeExport(batchId, content);
  return content;
}

export async function getBatchExport(batchId: string): Promise<string> {
  const existing = await readExport(batchId);
  if (existing) return existing;
  return exportBatchJsonl(batchId);
}
