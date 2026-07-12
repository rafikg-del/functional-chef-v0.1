#!/usr/bin/env tsx
/**
 * Run Supabase seed SQL files without requiring psql.
 *
 * Usage:
 *   DATABASE_URL=postgresql://... npm run db:seed
 *
 * Requires migrations applied first (001_init_schema.sql via Supabase dashboard or psql).
 */

import fs from 'fs';
import path from 'path';
import pg from 'pg';

const SEED_FILES = [
  '01_bottlenecks.sql',
  '02_biomarkers.sql',
  '03_biomarker_thresholds.sql',
  '04_culinary_levers.sql',
  '05_lever_bottleneck_map.sql',
  '06_bioavailability_synergies.sql',
];

async function main(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error(`Error: DATABASE_URL is not set.

Copy .env.example to .env and set DATABASE_URL from Supabase:
  Project Settings → Database → Connection string (URI)

Then run:
  npm run db:seed
`);
    process.exit(1);
  }

  const seedDir = path.join(process.cwd(), 'supabase', 'seed');
  const useSsl =
    !databaseUrl.includes('localhost') && !databaseUrl.includes('127.0.0.1');
  const client = new pg.Client({
    connectionString: databaseUrl,
    ...(useSsl ? { ssl: { rejectUnauthorized: false } } : {}),
  });

  try {
    await client.connect();
    console.log('Connected to database.\n');

    for (const file of SEED_FILES) {
      const filePath = path.join(seedDir, file);
      if (!fs.existsSync(filePath)) {
        throw new Error(`Seed file not found: ${filePath}`);
      }
      const sql = fs.readFileSync(filePath, 'utf-8');
      process.stdout.write(`→ ${file} ... `);
      await client.query(sql);
      console.log('ok');
    }

    console.log('\n✓ All seed files applied.');
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`\nError: ${message}`);
    if (message.includes('duplicate key') || message.includes('already exists')) {
      console.error(`
Hint: seeds use plain INSERT. On a non-empty DB, truncate tables first
or reset via Supabase SQL editor, then re-run db:seed.`);
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
