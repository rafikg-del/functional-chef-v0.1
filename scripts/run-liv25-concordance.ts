/**
 * LIV-26 draft — concordance classifier vs clinicien (pack LIV-25).
 *
 * Offline: real `classifyBottlenecks` + thresholds parsed from
 * `supabase/seed/03_biomarker_thresholds.sql`.
 * Classifier aliases pack keys (OMEGA3_INDEX ↔ OMEGA_INDEX, etc.).
 * `--alias-omega` remains a no-op sensitivity check (engine already aliases).
 *
 * Run: npx tsx scripts/run-liv25-concordance.ts
 *      npm run liv25:concordance
 *      npx tsx scripts/run-liv25-concordance.ts --json
 *      npx tsx scripts/run-liv25-concordance.ts --alias-omega
 */

import { execSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { classifyBottlenecks } from '../src/lib/reasoning/bottleneck-classifier';
import type {
  BiomarkerThreshold,
  Bottleneck,
  BottleneckId,
  ClassificationResult,
  PatientProfile,
  ThresholdWeight,
} from '../src/lib/reasoning/types';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CASES_DIR = join(ROOT, 'docs/validation/liv25/cases');
const SEED_PATH = join(ROOT, 'supabase/seed/03_biomarker_thresholds.sql');

const BOTTLENECKS: Bottleneck[] = [
  { id: 'IR', name: 'insulin_resistance', display_name_fr: 'IR', priority_rank: 1 },
  { id: 'INFLAM', name: 'inflammaging', display_name_fr: 'INFLAM', priority_rank: 2 },
  { id: 'DYSBIOSE', name: 'dysbiosis', display_name_fr: 'DYSBIOSE', priority_rank: 3 },
];

const WEIGHTS = new Set<ThresholdWeight>(['major', 'moderate', 'minor', 'discriminant']);

const KEY_ALIASES: Record<string, string> = {
  // Pack / LIV-24 protocol key → seed biomarker_id
  OMEGA3_INDEX: 'OMEGA_INDEX',
};

/** Clinical / digestive keys the DYSBIOSE rule actually consumes. */
const DYSBIOSE_INPUT_KEYS = [
  'BRISTOL_SCORE',
  'BLOATING_FREQ',
  'CALPROTECTIN',
  'SIBO_BREATH',
  'ABX_LIFETIME',
  'PPI_CHRONIC',
  'FIBER_INTAKE',
  'PLANT_DIVERSITY',
  'SHANNON_DIVERSITY',
  'ZONULIN',
  'I_FABP',
  'LBP',
];

type ClinicianLabel = BottleneckId | 'none';

interface Liv25CaseFile {
  case_id: string;
  sex?: 'F' | 'M' | 'O';
  age_band?: string;
  biomarker_values?: Record<string, number>;
  clinical_signals?: Record<string, number | string>;
  soft_signals?: PatientProfile['soft_signals'];
  exclusions?: PatientProfile['exclusions'];
  context?: PatientProfile['context'];
  clinician_dominant?: string | null;
  clinician_co_dominant?: string | null;
  clinician_judgment?: {
    dominant?: string | null;
    co_dominant?: string | null;
    phenotypes?: string[];
    confidence?: string | null;
    rationale_codes?: string[];
    safety_conditions_expected?: string[];
  };
  data_completeness?: { IR?: boolean; INFLAM?: boolean; DYSBIOSE?: boolean };
  safety_challenge?: boolean | string;
}

interface CaseNotes {
  missing_biomarkers: string[];
  unused_pack_keys: string[];
  unit_flags: string[];
  alias_applied: string[];
  data_completeness: Liv25CaseFile['data_completeness'];
}

interface CaseRow {
  case_id: string;
  clinician_dominant: ClinicianLabel;
  clinician_co_dominant: ClinicianLabel | null;
  engine_dominant: ClinicianLabel;
  engine_co_dominant: ClinicianLabel | null;
  dominant_match: boolean;
  co_dominant_match: boolean;
  triggered: Record<BottleneckId, boolean>;
  scores: Record<BottleneckId, { score: number; major_hits: number; moderate_hits: number }>;
  phenotypes: string[];
  inflam_phenotypes: string[];
  rationale: string;
  notes: CaseNotes;
  evidence_ids: Record<BottleneckId, string[]>;
}

function gitSha(): string {
  try {
    return execSync('git rev-parse HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}

function parseSqlScalar(raw: string): string | number | null {
  const t = raw.trim();
  if (t.toUpperCase() === 'NULL') return null;
  if (t.startsWith("'")) {
    return t.slice(1, -1).replace(/\\'/g, "'").replace(/''/g, "'");
  }
  const n = Number(t);
  if (Number.isNaN(n)) return t;
  return n;
}

function splitSqlArgs(inner: string): string[] {
  const args: string[] = [];
  let buf = '';
  let inStr = false;
  for (let i = 0; i < inner.length; i++) {
    const c = inner[i];
    if (inStr) {
      buf += c;
      if (c === '\\' && (inner[i + 1] === "'" || inner[i + 1] === '\\')) {
        buf += inner[i + 1];
        i++;
        continue;
      }
      if (c === "'") {
        const next = inner[i + 1];
        if (next === "'") {
          buf += next;
          i++;
        } else {
          inStr = false;
        }
      }
      continue;
    }
    if (c === "'") {
      inStr = true;
      buf += c;
      continue;
    }
    if (c === ',') {
      args.push(buf.trim());
      buf = '';
      continue;
    }
    buf += c;
  }
  if (buf.trim()) args.push(buf.trim());
  return args;
}

/** Scan SQL with string awareness (notes contain ';' and nested parentheses). */
function extractInsertValueTuples(sql: string): { columns: string[]; inners: string[] }[] {
  const inserts: { columns: string[]; inners: string[] }[] = [];
  const needle = 'INSERT INTO biomarker_thresholds';
  let searchFrom = 0;
  const lower = sql; // table name is lowercase in seed

  while (searchFrom < sql.length) {
    const start = lower.indexOf(needle, searchFrom);
    if (start < 0) break;

    let i = start + needle.length;
    while (i < sql.length && /\s/.test(sql[i])) i++;
    if (sql[i] !== '(') {
      searchFrom = start + needle.length;
      continue;
    }

    const colStart = i + 1;
    let depth = 1;
    let inStr = false;
    i++;
    for (; i < sql.length; i++) {
      const c = sql[i];
      if (inStr) {
        if (c === "'" && sql[i + 1] === "'") {
          i++;
          continue;
        }
        if (c === "'") inStr = false;
        continue;
      }
      if (c === "'") {
        inStr = true;
        continue;
      }
      if (c === '(') depth++;
      else if (c === ')') {
        depth--;
        if (depth === 0) break;
      }
    }
    const columns = sql
      .slice(colStart, i)
      .split(',')
      .map((c) => c.trim());
    i++;
    const valuesKw = sql.slice(i).search(/VALUES/i);
    if (valuesKw < 0) break;
    i += valuesKw + 'VALUES'.length;

    const inners: string[] = [];
    inStr = false;
    depth = 0;
    let tupleStart = -1;
    for (; i < sql.length; i++) {
      const c = sql[i];
      if (inStr) {
        if (c === '\\' && (sql[i + 1] === "'" || sql[i + 1] === '\\')) {
          i++;
          continue;
        }
        if (c === "'" && sql[i + 1] === "'") {
          i++;
          continue;
        }
        if (c === "'") inStr = false;
        continue;
      }
      if (c === "'") {
        inStr = true;
        continue;
      }
      if (c === '-' && sql[i + 1] === '-') {
        while (i < sql.length && sql[i] !== '\n') i++;
        continue;
      }
      if (c === '(') {
        if (depth === 0) tupleStart = i + 1;
        depth++;
      } else if (c === ')') {
        depth--;
        if (depth === 0 && tupleStart >= 0) {
          inners.push(sql.slice(tupleStart, i));
          tupleStart = -1;
        }
      } else if (c === ';' && depth === 0) {
        break;
      }
    }

    inserts.push({ columns, inners });
    searchFrom = i + 1;
  }
  return inserts;
}

function mapSeedRow(
  args: Array<string | number | null>,
  columns: string[]
): Record<string, string | number | null> | null {
  let mapped: Record<string, string | number | null> = {};

  if (args.length === columns.length) {
    columns.forEach((col, i) => {
      mapped[col] = args[i];
    });
    const cat = mapped.alert_categorical_value;
    if (typeof cat === 'string' && WEIGHTS.has(cat as ThresholdWeight) && args.length === 9) {
      mapped.alert_categorical_value = null;
      mapped.weight = cat;
      mapped.notes = args[7] as string | null;
    }
    return mapped;
  }

  if (args.length === 8) {
    mapped = {
      bottleneck_id: args[0],
      biomarker_id: args[1],
      functional_target_min: args[2],
      functional_target_max: args[3],
      alert_threshold_low: args[4],
      alert_threshold_high: args[5],
      alert_categorical_value: null,
      weight: args[6],
      notes: args[7],
    };
    return mapped;
  }

  return null;
}

/**
 * Parse seed INSERT rows. Later blocks mix 8-tuples into a 9-column INSERT
 * (missing `alert_categorical_value`). Realign when the 7th token is a weight.
 */
export function parseSeedThresholds(sql: string): BiomarkerThreshold[] {
  const thresholds: BiomarkerThreshold[] = [];
  let rowIndex = 0;

  for (const { columns, inners } of extractInsertValueTuples(sql)) {
    for (const inner of inners) {
      const args = splitSqlArgs(inner).map(parseSqlScalar);
      const mapped = mapSeedRow(args, columns);
      if (!mapped) {
        console.warn(
          `Skipping seed row with ${args.length} values (expected ${columns.length}): ${String(args[1])}`
        );
        continue;
      }

      const weight = mapped.weight;
      if (typeof weight !== 'string' || !WEIGHTS.has(weight as ThresholdWeight)) {
        console.warn(`Skipping seed row with invalid weight: ${JSON.stringify(mapped)}`);
        continue;
      }
      const bottleneck_id = mapped.bottleneck_id;
      const biomarker_id = mapped.biomarker_id;
      if (bottleneck_id !== 'IR' && bottleneck_id !== 'INFLAM' && bottleneck_id !== 'DYSBIOSE') {
        continue;
      }
      if (typeof biomarker_id !== 'string') continue;

      rowIndex += 1;
      thresholds.push({
        id: `seed-${rowIndex}`,
        bottleneck_id,
        biomarker_id,
        functional_target_min: asNum(mapped.functional_target_min),
        functional_target_max: asNum(mapped.functional_target_max),
        alert_threshold_low: asNum(mapped.alert_threshold_low),
        alert_threshold_high: asNum(mapped.alert_threshold_high),
        alert_categorical_value:
          typeof mapped.alert_categorical_value === 'string' ? mapped.alert_categorical_value : null,
        weight: weight as ThresholdWeight,
        notes: typeof mapped.notes === 'string' ? mapped.notes : undefined,
      });
    }
  }
  return thresholds;
}

function asNum(v: string | number | null | undefined): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === 'number') return v;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

function normalizeLabel(raw: string | null | undefined): ClinicianLabel | null {
  if (raw === undefined) return null;
  if (raw === null || raw === 'none' || raw === '') return 'none';
  if (raw === 'IR' || raw === 'INFLAM' || raw === 'DYSBIOSE') return raw;
  throw new Error(`Unexpected clinician label: ${JSON.stringify(raw)}`);
}

function engineLabel(id: BottleneckId | null): ClinicianLabel {
  return id ?? 'none';
}

function homaFromInsulinGlucose(insulinUu: number, glucoseGL: number): number {
  // HOMA-IR = (insulin µU/mL × glucose mg/dL) / 405 ; glucose g/L × 100 = mg/dL
  return (insulinUu * glucoseGL * 100) / 405;
}

function collectNotes(
  file: Liv25CaseFile,
  thresholdIds: Set<string>,
  aliasApplied: string[]
): CaseNotes {
  const values = file.biomarker_values ?? {};
  const signals = file.clinical_signals ?? {};
  const unused_pack_keys: string[] = [];
  const unit_flags: string[] = [];

  for (const key of Object.keys(values)) {
    if (thresholdIds.has(key)) continue;
    const alias = KEY_ALIASES[key];
    if (alias && thresholdIds.has(alias)) {
      // Classifier aliases pack keys natively (OMEGA3_INDEX ↔ OMEGA_INDEX, …).
      continue;
    }
    unused_pack_keys.push(key);
  }
  for (const key of Object.keys(signals)) {
    if (!thresholdIds.has(key)) unused_pack_keys.push(`clinical:${key}`);
  }

  const insulin = values.FASTING_INSULIN;
  const glucose = values.FASTING_GLUCOSE;
  const homa = values.HOMA_IR;
  if (insulin !== undefined && glucose !== undefined && homa !== undefined) {
    const expected = homaFromInsulinGlucose(insulin, glucose);
    const rel = expected === 0 ? 0 : Math.abs(homa - expected) / expected;
    if (rel > 0.08) {
      unit_flags.push(
        `HOMA/insuline discordants (HOMA saisi=${homa}, HOMA attendu depuis FASTING_INSULIN µU/mL × glucose g/L ≈ ${expected.toFixed(2)}; conversion pmol/L÷6 vs facteur 6.945 probable)`
      );
    }
  } else if (insulin !== undefined && homa === undefined) {
    unit_flags.push('FASTING_INSULIN présent sans HOMA_IR');
  }

  const missing_biomarkers: string[] = [];
  const completeness = file.data_completeness;
  if (completeness?.DYSBIOSE === false || completeness?.DYSBIOSE === undefined) {
    const present = DYSBIOSE_INPUT_KEYS.filter((k) => values[k] !== undefined || signals[k] !== undefined);
    if (present.length === 0) {
      missing_biomarkers.push('socle DYSBIOSE absent (Bristol / ballonnements / calprotectine / SIBO / ABX / fibres)');
    }
  } else {
    const present = DYSBIOSE_INPUT_KEYS.filter((k) => values[k] !== undefined || signals[k] !== undefined);
    if (present.length < 2) {
      missing_biomarkers.push(`socle DYSBIOSE incomplet (clés présentes: ${present.join(', ') || 'aucune'})`);
    }
  }

  if (values.CRP_US === undefined && (file.clinician_dominant === 'INFLAM' || file.clinician_co_dominant === 'INFLAM')) {
    missing_biomarkers.push('CRP_US absent alors que le clinicien code INFLAM');
  }
  if (values.HOMA_IR === undefined && values.FASTING_INSULIN === undefined && file.clinician_dominant === 'IR') {
    missing_biomarkers.push('HOMA_IR et FASTING_INSULIN absents alors que le clinicien code IR');
  }

  return {
    missing_biomarkers,
    unused_pack_keys,
    unit_flags,
    alias_applied: aliasApplied,
    data_completeness: completeness,
  };
}

function toProfile(file: Liv25CaseFile, applyAlias: boolean): { profile: PatientProfile; aliasApplied: string[] } {
  const biomarker_values = { ...(file.biomarker_values ?? {}) };
  const aliasApplied: string[] = [];
  if (applyAlias) {
    for (const [from, to] of Object.entries(KEY_ALIASES)) {
      if (biomarker_values[from] !== undefined && biomarker_values[to] === undefined) {
        biomarker_values[to] = biomarker_values[from];
        aliasApplied.push(`${from}→${to}`);
      }
    }
  }
  return {
    profile: {
      sex: file.sex,
      biomarker_values,
      clinical_signals: { ...(file.clinical_signals ?? {}) },
      soft_signals: file.soft_signals,
      exclusions: file.exclusions ?? {},
      context: file.context ?? {},
    },
    aliasApplied,
  };
}

function summarizeResult(result: ClassificationResult): Pick<
  CaseRow,
  'engine_dominant' | 'engine_co_dominant' | 'triggered' | 'scores' | 'phenotypes' | 'inflam_phenotypes' | 'rationale' | 'evidence_ids'
> {
  const triggered = { IR: false, INFLAM: false, DYSBIOSE: false } as Record<BottleneckId, boolean>;
  const scores = {} as CaseRow['scores'];
  const evidence_ids = {} as CaseRow['evidence_ids'];
  for (const s of result.scores) {
    triggered[s.bottleneck_id] = s.triggered;
    scores[s.bottleneck_id] = {
      score: s.score,
      major_hits: s.major_hits,
      moderate_hits: s.moderate_hits,
    };
    evidence_ids[s.bottleneck_id] = s.evidence.map((e) => e.biomarker_id);
  }
  return {
    engine_dominant: engineLabel(result.dominant),
    engine_co_dominant: result.co_dominant,
    triggered,
    scores,
    phenotypes: result.phenotypes ?? [],
    inflam_phenotypes: result.inflam_phenotypes ?? [],
    rationale: result.rationale,
    evidence_ids,
  };
}

function coDominantMatch(clinician: ClinicianLabel | null, engine: ClinicianLabel | null): boolean {
  const c = clinician ?? 'none';
  const e = engine ?? 'none';
  return c === e;
}

function loadCases(): Liv25CaseFile[] {
  const files = readdirSync(CASES_DIR)
    .filter((f) => f.endsWith('.json'))
    .sort();
  return files.map((f) => JSON.parse(readFileSync(join(CASES_DIR, f), 'utf8')) as Liv25CaseFile);
}

function classifyCase(
  file: Liv25CaseFile,
  thresholds: BiomarkerThreshold[],
  applyAlias: boolean
): CaseRow {
  const thresholdIds = new Set(thresholds.map((t) => t.biomarker_id));
  const { profile, aliasApplied } = toProfile(file, applyAlias);
  const result = classifyBottlenecks(profile, BOTTLENECKS, thresholds);
  const summary = summarizeResult(result);
  const clinician_dominant = normalizeLabel(file.clinician_dominant ?? file.clinician_judgment?.dominant) ?? 'none';
  const clinician_co_dominant = normalizeLabel(
    file.clinician_co_dominant === undefined
      ? file.clinician_judgment?.co_dominant
      : file.clinician_co_dominant
  );
  const notes = collectNotes(file, thresholdIds, aliasApplied);
  return {
    case_id: file.case_id,
    clinician_dominant,
    clinician_co_dominant: clinician_co_dominant === 'none' ? null : clinician_co_dominant,
    ...summary,
    dominant_match: summary.engine_dominant === clinician_dominant,
    co_dominant_match: coDominantMatch(
      clinician_co_dominant === 'none' ? null : clinician_co_dominant,
      summary.engine_co_dominant
    ),
    notes,
  };
}

function yn(v: boolean): 'Y' | 'N' {
  return v ? 'Y' : 'N';
}

function notesCell(row: CaseRow): string {
  const bits: string[] = [];
  if (row.notes.alias_applied.length) bits.push(`alias ${row.notes.alias_applied.join(', ')}`);
  if (row.notes.unused_pack_keys.length) bits.push(`clés hors seed: ${row.notes.unused_pack_keys.join(', ')}`);
  if (row.notes.missing_biomarkers.length) bits.push(row.notes.missing_biomarkers.join('; '));
  if (row.notes.unit_flags.length) bits.push(row.notes.unit_flags.join('; '));
  const trig = (Object.entries(row.triggered) as [BottleneckId, boolean][])
    .filter(([, t]) => t)
    .map(([id]) => id);
  bits.push(
    `déclenchés=${trig.join('+') || 'aucun'}; scores IR ${row.scores.IR.score}/INFLAM ${row.scores.INFLAM.score}/DYSBIOSE ${row.scores.DYSBIOSE.score}`
  );
  if (row.phenotypes.length) bits.push(`phénotypes=${row.phenotypes.join(',')}`);
  if (row.inflam_phenotypes.length) bits.push(`inflam_pheno=${row.inflam_phenotypes.join(',')}`);
  return bits.join(' · ');
}

function printTable(rows: CaseRow[]): void {
  console.log('| case_id | clinicien dominant | moteur dominant | match | clinicien co-dom. | moteur co-dom. | notes |');
  console.log('|---------|--------------------|-----------------|-------|-------------------|----------------|-------|');
  for (const r of rows) {
    console.log(
      `| ${r.case_id} | ${r.clinician_dominant} | ${r.engine_dominant} | ${yn(r.dominant_match)} | ${r.clinician_co_dominant ?? 'null'} | ${r.engine_co_dominant ?? 'null'} | ${notesCell(r)} |`
    );
  }
}

function concordance(rows: CaseRow[]): { matches: number; n: number; pct: number } {
  const matches = rows.filter((r) => r.dominant_match).length;
  const n = rows.length;
  return { matches, n, pct: n === 0 ? 0 : Math.round((matches / n) * 1000) / 10 };
}

function confusion(rows: CaseRow[]): Record<string, Record<string, number>> {
  const labels: ClinicianLabel[] = ['IR', 'INFLAM', 'DYSBIOSE', 'none'];
  const matrix: Record<string, Record<string, number>> = {};
  for (const c of labels) {
    matrix[c] = {};
    for (const e of labels) matrix[c][e] = 0;
  }
  for (const r of rows) {
    matrix[r.clinician_dominant][r.engine_dominant] += 1;
  }
  return matrix;
}

function main(): void {
  const applyAlias = process.argv.includes('--alias-omega');
  const asJson = process.argv.includes('--json');
  const sql = readFileSync(SEED_PATH, 'utf8');
  const thresholds = parseSeedThresholds(sql);
  if (thresholds.length < 60) {
    throw new Error(`Failed to parse seed thresholds (got ${thresholds.length})`);
  }
  const cases = loadCases();
  if (cases.length !== 10) {
    throw new Error(`Expected 10 LIV-25 cases, found ${cases.length}`);
  }

  const rows = cases.map((c) => classifyCase(c, thresholds, applyAlias));
  const agg = concordance(rows);
  const payload = {
    deliverable: 'LIV-26',
    status: 'brouillon',
    protocol: 'LIV-24 v0.1',
    pack: 'docs/validation/liv25',
    engine_git_sha: gitSha(),
    run_at_utc: new Date().toISOString(),
    thresholds_source: 'supabase/seed/03_biomarker_thresholds.sql',
    thresholds_count: thresholds.length,
    classifier: 'src/lib/reasoning/bottleneck-classifier.ts',
    omega_alias: applyAlias,
    primary_endpoint: 'exact dominant match (engine vs clinician)',
    concordance_dominant: agg,
    concordance_co_dominant: {
      matches: rows.filter((r) => r.co_dominant_match).length,
      n: rows.length,
    },
    confusion_clinician_rows_engine_cols: confusion(rows),
    cases: rows,
  };

  if (asJson) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  console.log('# LIV-26 concordance (stdout)');
  console.log(`engine_git_sha=${payload.engine_git_sha}`);
  console.log(`thresholds=${thresholds.length} from seed; alias_omega=${applyAlias}`);
  console.log('');
  printTable(rows);
  console.log('');
  console.log(
    `Concordance dominante exacte: ${agg.matches}/${agg.n} = ${agg.pct}%`
  );
  console.log(
    `Concordance co-dominant (présence+identité, null=none): ${payload.concordance_co_dominant.matches}/${payload.concordance_co_dominant.n}`
  );
}

const isDirectRun =
  process.argv[1] !== undefined &&
  (process.argv[1].endsWith('run-liv25-concordance.ts') ||
    process.argv[1].includes('run-liv25-concordance'));

if (isDirectRun) {
  main();
}
