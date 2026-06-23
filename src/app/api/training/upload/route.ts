/**
 * POST /api/training/upload
 * Importe plusieurs dossiers patients (fichiers JSON ou archive ZIP).
 */

import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';
import { extractFolderName, isProfileFile, parseDossierJson } from '@/lib/training/dossier-parser';
import { dossierFromParsed } from '@/lib/training/batch-processor';
import { addDossiers, createBatch } from '@/lib/training/store';
import type { TrainingDossier, UploadSummary } from '@/lib/training/types';

export const maxDuration = 60;

interface FileEntry {
  path: string;
  content: string;
}

async function extractFromZip(buffer: ArrayBuffer): Promise<FileEntry[]> {
  const zip = await JSZip.loadAsync(buffer);
  const entries: FileEntry[] = [];

  for (const [relativePath, file] of Object.entries(zip.files)) {
    if (file.dir) continue;
    if (!isProfileFile(relativePath)) continue;
    const content = await file.async('string');
    entries.push({ path: relativePath, content });
  }

  return entries;
}

function extractFromFormFiles(files: File[]): Promise<FileEntry[]> {
  return Promise.all(
    files.map(async (file) => ({
      path: (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name,
      content: await file.text(),
    }))
  );
}

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const batchName = (form.get('name') as string | null)?.trim() || `Import ${new Date().toLocaleDateString('fr-FR')}`;
  const zipFile = form.get('zip') as File | null;
  const fileList = form.getAll('files') as File[];

  let entries: FileEntry[] = [];
  const uploadErrors: { file: string; message: string }[] = [];

  if (zipFile && zipFile.size > 0) {
    const buffer = await zipFile.arrayBuffer();
    entries = await extractFromZip(buffer);
    if (entries.length === 0) {
      return NextResponse.json(
        { error: 'ZIP vide ou sans fichiers profile.json / patient.json' },
        { status: 400 }
      );
    }
  } else if (fileList.length > 0) {
    const all = await extractFromFormFiles(fileList);
    entries = all.filter((e) => isProfileFile(e.path));
    if (entries.length === 0) {
      // Accepter tout fichier .json si sélection directe
      entries = all.filter((e) => e.path.toLowerCase().endsWith('.json'));
    }
  } else {
    return NextResponse.json(
      { error: 'Aucun fichier fourni. Envoyez files[] (dossiers) ou zip.' },
      { status: 400 }
    );
  }

  const batch = await createBatch(batchName);
  const dossiers: TrainingDossier[] = [];
  let skipped = 0;

  for (const entry of entries) {
    const folderName = extractFolderName(entry.path);
    const parsed = parseDossierJson(entry.content, folderName, entry.path);

    if (!parsed.ok) {
      uploadErrors.push({ file: entry.path, message: parsed.error });
      skipped++;
      continue;
    }

    dossiers.push(dossierFromParsed(batch.id, folderName, entry.path, parsed.data));
  }

  if (dossiers.length === 0) {
    return NextResponse.json(
      {
        error: 'Aucun dossier patient valide importé',
        details: uploadErrors,
      },
      { status: 400 }
    );
  }

  const detail = await addDossiers(batch.id, dossiers);

  const summary: UploadSummary = {
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
    imported: dossiers.length,
    skipped,
    errors: uploadErrors,
  };

  return NextResponse.json(summary, { status: 201 });
}
