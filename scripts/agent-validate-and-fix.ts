#!/usr/bin/env tsx
/**
 * Agent de validation auto-correctif — boucle test jusqu'à succès.
 *
 * Usage:
 *   npm run agent:validate          # une passe de validation
 *   npm run agent:validate -- --loop 5   # jusqu'à 5 tentatives (pour agent Cursor)
 *
 * L'agent Cursor doit:
 *   1. Lancer ce script
 *   2. Si échec → lire fix_hint, corriger le code, relancer
 *   3. Quand exit 0 → annoncer "Tout est OK"
 */

import { execSync } from 'node:child_process';
import {
  formatValidationReport,
  runAllValidationChecks,
  type ValidationReport,
} from '../src/lib/testing/validation-runner';

const MAX_LOOPS = parseInt(process.argv.find((a) => a.startsWith('--loop='))?.split('=')[1] ?? '1', 10);
const RUN_TYPECHECK = !process.argv.includes('--skip-typecheck');

function runTypeCheck(): { ok: boolean; output: string } {
  try {
    execSync('npm run type-check', { stdio: 'pipe', encoding: 'utf-8' });
    return { ok: true, output: 'TypeScript: OK' };
  } catch (err) {
    const output =
      err instanceof Error && 'stdout' in err
        ? String((err as { stdout?: string }).stdout ?? '') +
          String((err as { stderr?: string }).stderr ?? '')
        : String(err);
    return { ok: false, output };
  }
}

function printAgentInstructions(report: ValidationReport, typeOk: boolean, typeOutput: string) {
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('  AGENT — Instructions de correction');
  console.log('═══════════════════════════════════════════════════════');

  if (!typeOk) {
    console.log('');
    console.log('✗ TypeScript (npm run type-check)');
    console.log(typeOutput.slice(0, 2000));
    console.log('→ Corriger les erreurs de typage avant de relancer.');
  }

  const failures = report.checks.filter((c) => c.status === 'fail');
  for (const f of failures) {
    console.log('');
    console.log(`✗ ${f.id}: ${f.name}`);
    console.log(`  ${f.message}`);
    if (f.fix_hint) console.log(`  → ${f.fix_hint}`);
  }

  if (report.ok && typeOk) {
    console.log('');
    console.log('✅ TOUT EST OK — Aucune correction nécessaire.');
    console.log('   Le moteur Functional Chef passe tous les contrôles de validation.');
  } else {
    console.log('');
    console.log('Relancer après correction: npm run agent:validate');
  }
}

async function main() {
  let lastReport: ValidationReport | null = null;
  let allOk = false;

  for (let attempt = 1; attempt <= MAX_LOOPS; attempt++) {
    if (MAX_LOOPS > 1) {
      console.log(`\n─── Tentative ${attempt}/${MAX_LOOPS} ───\n`);
    }

    const typeResult = RUN_TYPECHECK ? runTypeCheck() : { ok: true, output: 'skipped' };
    const report = runAllValidationChecks();
    lastReport = report;

    console.log(formatValidationReport(report));

    if (typeResult.ok) {
      console.log('✓ TypeScript: compilation OK');
    } else {
      console.log('✗ TypeScript: erreurs de compilation');
      console.log(typeResult.output.slice(0, 1500));
    }

    allOk = report.ok && typeResult.ok;

    if (allOk) break;

    if (attempt < MAX_LOOPS) {
      console.log('\n⏳ Échec — en mode --loop, un agent humain/IA doit corriger puis relancer.');
      break; // Le script ne corrige pas le code seul ; l'agent Cursor boucle au niveau conversation
    }
  }

  if (lastReport) {
    printAgentInstructions(
      lastReport,
      RUN_TYPECHECK ? runTypeCheck().ok : true,
      ''
    );
  }

  process.exit(allOk ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
