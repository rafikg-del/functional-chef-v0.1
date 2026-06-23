/**
 * Moteur de validation — exécute tous les contrôles déterministes du pipeline.
 * Utilisé par les scripts CLI et l'agent auto-correctif.
 */

import { classifyBottlenecks } from '../reasoning/bottleneck-classifier';
import { applySafetyFilters } from '../reasoning/safety-filters';
import { selectLevers } from '../reasoning/lever-selector';
import { validateComposedDish } from '../anthropic/prompts';
import type { ComposedDish } from '../reasoning/types';
import {
  BIOMARKER_THRESHOLDS,
  BOTTLENECKS,
  MINIMAL_LEVER_MAP,
  MINIMAL_LEVERS,
  VALIDATION_CASES,
} from './fixtures';

export type ValidationStatus = 'pass' | 'fail' | 'skip';

export interface ValidationCheck {
  id: string;
  name: string;
  status: ValidationStatus;
  message: string;
  fix_hint?: string;
}

export interface ValidationReport {
  ok: boolean;
  checks: ValidationCheck[];
  passed: number;
  failed: number;
  skipped: number;
  timestamp: string;
}

const MOCK_DISH: ComposedDish = {
  title: 'Plat test validation',
  meal_type: 'lunch',
  servings: 2,
  total_time_min: 30,
  description: 'Fixture de validation schéma ComposedDish.',
  architecture: { vegetables_pct: 50, protein_pct: 25, lipid_pct: 25 },
  ingredients: [{ name: 'EVOO', quantity: '30 ml', lever_activated: 'L_EVOO_PRIMARY' }],
  steps: [{ order: 1, instruction: 'Assembler et servir.' }],
  levers_activated: [
    { lever_id: 'L_EVOO_PRIMARY', name_fr: 'EVOO', tier: 'T1', rationale_one_line: 'Test' },
  ],
  ebm_summary: { T1_count: 1, T2_count: 0, T3_count: 0 },
  expected_effects: {
    postprandial_2_4h: 'Test',
    short_term_4_weeks: 'Test',
    long_term_12_weeks: 'Test',
  },
  shopping_list: [{ item: 'EVOO', quantity: '30 ml' }],
  warnings: [],
};

function pass(id: string, name: string, message: string): ValidationCheck {
  return { id, name, status: 'pass', message };
}

function fail(id: string, name: string, message: string, fix_hint?: string): ValidationCheck {
  return { id, name, status: 'fail', message, fix_hint };
}

function skip(id: string, name: string, message: string): ValidationCheck {
  return { id, name, status: 'skip', message };
}

/** Cas-pivot : bottleneck dominant attendu (classifier déterministe). */
export function runClassifierChecks(): ValidationCheck[] {
  const checks: ValidationCheck[] = [];

  for (const testCase of VALIDATION_CASES) {
    const result = classifyBottlenecks(
      testCase.patient,
      BOTTLENECKS,
      BIOMARKER_THRESHOLDS
    );

    if (result.dominant === testCase.expected_dominant) {
      checks.push(
        pass(
          `classifier.${testCase.id}`,
          testCase.label,
          `Bottleneck dominant = ${result.dominant} (attendu ${testCase.expected_dominant})`
        )
      );
      continue;
    }

    const triggered = result.scores
      .filter((s) => s.triggered)
      .map((s) => `${s.bottleneck_id}(maj=${s.major_hits},mod=${s.moderate_hits})`)
      .join(', ');

    checks.push(
      fail(
        `classifier.${testCase.id}`,
        testCase.label,
        `Attendu ${testCase.expected_dominant}, obtenu ${result.dominant ?? 'null'}. Déclenchés: [${triggered || 'aucun'}]`,
        `Vérifier src/lib/reasoning/bottleneck-classifier.ts (règles CLASSIFICATION_RULES) et les seuils dans src/lib/testing/fixtures.ts (seed 03).`
      )
    );
  }

  return checks;
}

/** Filtre MICI : exclusion levier légumineuses. */
export function runSafetyChecks(): ValidationCheck[] {
  const miciPatient = {
    biomarker_values: {},
    clinical_signals: {},
    exclusions: { medical: ['MICI_active'] },
    context: {},
  };

  const { filtered_levers, excluded } = applySafetyFilters(MINIMAL_LEVERS, miciPatient);
  const legumesExcluded = excluded.some((e) => e.lever_id === 'L_LEGUMINOUSES_REGULAR');

  if (legumesExcluded && filtered_levers.length < MINIMAL_LEVERS.length) {
    return [
      pass(
        'safety.MICI',
        'Filtre sécurité MICI',
        `L_LEGUMINOUSES_REGULAR exclu (${excluded.length} exclusion(s))`
      ),
    ];
  }

  return [
    fail(
      'safety.MICI',
      'Filtre sécurité MICI',
      'Le levier légumineuses devrait être exclu pour MICI_active',
      'Vérifier HARD_RULES et contraindications dans src/lib/reasoning/safety-filters.ts'
    ),
  ];
}

/** Sélecteur : ≥4 étoiles universelles quand bottleneck dominant présent. */
export function runLeverSelectorChecks(): ValidationCheck[] {
  const caseA = VALIDATION_CASES[0];
  const classification = classifyBottlenecks(
    caseA.patient,
    BOTTLENECKS,
    BIOMARKER_THRESHOLDS
  );

  if (!classification.dominant) {
    return [
      fail(
        'levers.stars',
        'Sélection leviers étoile',
        'Cas A ne produit pas de bottleneck dominant — impossible de tester le sélecteur',
        'Corriger d\'abord les tests classifier (runClassifierChecks)'
      ),
    ];
  }

  const { selected, warnings } = selectLevers({
    classification,
    available_levers: MINIMAL_LEVERS,
    lever_bottleneck_map: MINIMAL_LEVER_MAP,
  });

  const stars = selected.filter((s) => s.role === 'universal_star');

  if (stars.length >= 4) {
    return [
      pass(
        'levers.stars',
        'Sélection leviers étoile',
        `${stars.length} leviers étoile sélectionnés (cible ≥4)`
      ),
    ];
  }

  return [
    fail(
      'levers.stars',
      'Sélection leviers étoile',
      `Seulement ${stars.length} étoile(s). Warnings: ${warnings.join('; ') || 'aucun'}`,
      'Vérifier src/lib/reasoning/lever-selector.ts et MINIMAL_LEVERS dans fixtures.ts'
    ),
  ];
}

/** Validation schéma JSON plat (sans appel LLM). */
export function runComposerSchemaChecks(): ValidationCheck[] {
  if (validateComposedDish(MOCK_DISH)) {
    return [
      pass(
        'composer.schema',
        'Schéma ComposedDish',
        'validateComposedDish accepte un plat conforme'
      ),
    ];
  }

  return [
    fail(
      'composer.schema',
      'Schéma ComposedDish',
      'La fixture MOCK_DISH ne passe pas validateComposedDish',
      'Vérifier validateComposedDish dans src/lib/anthropic/prompts.ts'
    ),
  ];
}

/** Exécute l'ensemble des contrôles déterministes. */
export function runAllValidationChecks(): ValidationReport {
  const checks = [
    ...runClassifierChecks(),
    ...runSafetyChecks(),
    ...runLeverSelectorChecks(),
    ...runComposerSchemaChecks(),
  ];

  const passed = checks.filter((c) => c.status === 'pass').length;
  const failed = checks.filter((c) => c.status === 'fail').length;
  const skipped = checks.filter((c) => c.status === 'skip').length;

  return {
    ok: failed === 0,
    checks,
    passed,
    failed,
    skipped,
    timestamp: new Date().toISOString(),
  };
}

/** Format texte lisible (français) pour CLI / agent. */
export function formatValidationReport(report: ValidationReport): string {
  const lines: string[] = [
    '═══════════════════════════════════════════════════════',
    '  Functional Chef — Rapport de validation',
    `  ${report.timestamp}`,
    '═══════════════════════════════════════════════════════',
    '',
  ];

  for (const check of report.checks) {
    const icon = check.status === 'pass' ? '✓' : check.status === 'fail' ? '✗' : '○';
    lines.push(`${icon} [${check.id}] ${check.name}`);
    lines.push(`    ${check.message}`);
    if (check.fix_hint) {
      lines.push(`    → Correction: ${check.fix_hint}`);
    }
    lines.push('');
  }

  lines.push('───────────────────────────────────────────────────────');
  lines.push(
    `Résultat: ${report.passed} réussi(s), ${report.failed} échoué(s), ${report.skipped} ignoré(s)`
  );

  if (report.ok) {
    lines.push('');
    lines.push('✅ TOUT EST OK — Le moteur de validation est fonctionnel.');
  } else {
    lines.push('');
    lines.push('❌ ÉCHECS DÉTECTÉS — Corriger les points ci-dessus puis relancer npm run validate');
  }

  return lines.join('\n');
}
