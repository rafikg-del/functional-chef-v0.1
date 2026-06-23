#!/usr/bin/env tsx
/**
 * Test CLI import + entraînement sur les exemples fournis.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { parseDossierJson } from '../src/lib/training/dossier-parser';
import { dossierFromParsed, processBatch } from '../src/lib/training/batch-processor';
import { createBatch, addDossiers } from '../src/lib/training/store';

const EXAMPLES = path.join(process.cwd(), 'examples', 'training-dossiers');

async function main() {
  const batch = await createBatch('Test exemples CLI');
  const entries: { folder: string; file: string; content: string }[] = [];

  for (const folder of await fs.readdir(EXAMPLES)) {
    const profilePath = path.join(EXAMPLES, folder, 'profile.json');
    try {
      const content = await fs.readFile(profilePath, 'utf-8');
      entries.push({ folder, file: `${folder}/profile.json`, content });
    } catch {
      // skip non-dossier entries (README.md)
    }
  }

  const dossiers = [];
  for (const e of entries) {
    const parsed = parseDossierJson(e.content, e.folder, e.file);
    if (!parsed.ok) {
      console.error('✗', parsed.error);
      process.exit(1);
    }
    dossiers.push(dossierFromParsed(batch.id, e.folder, e.file, parsed.data));
  }

  await addDossiers(batch.id, dossiers);
  console.log(`Importé ${dossiers.length} dossiers dans batch ${batch.id}`);

  const summary = await processBatch(batch.id);
  console.log(`Traité: ${summary.processed}, match labels: ${summary.matched}, erreurs: ${summary.errors}`);

  if (summary.matched < dossiers.length) {
    console.error('❌ Tous les cas-pivot ne matchent pas');
    process.exit(1);
  }

  console.log('✅ TOUT EST OK — Import et entraînement exemples fonctionnels');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
