/**
 * Parse et valide les fichiers profile.json des dossiers patients.
 */

import { z } from 'zod';
import type { DossierFileInput } from './types';
import type { PatientProfile } from '../reasoning/types';

const DossierSchema = z.object({
  external_id: z.string().optional(),
  label: z.string().optional(),
  age: z.number().int().min(0).max(120).optional(),
  sex: z.enum(['F', 'M', 'O']).optional(),
  biomarker_values: z.record(z.string(), z.number()).default({}),
  clinical_signals: z.record(z.string(), z.union([z.number(), z.string()])).default({}),
  exclusions: z
    .object({
      allergies: z.array(z.string()).optional(),
      intolerances: z.array(z.string()).optional(),
      medical: z.array(z.string()).optional(),
      dietary_pattern: z.array(z.string()).optional(),
      dislikes: z.array(z.string()).optional(),
    })
    .default({}),
  context: z
    .object({
      cuisine_pref: z.enum(['mediterranean', 'french', 'maghrebi', 'asian', 'flexible']).optional(),
      time_per_meal: z.number().optional(),
      budget: z.enum(['low', 'medium', 'high']).optional(),
      equipment: z.array(z.string()).optional(),
      servings: z.number().optional(),
      language: z.enum(['fr', 'en']).optional(),
    })
    .default({}),
  intent: z.string().min(3).optional(),
  meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'snack', 'full_day']).optional(),
  expected_dominant: z.enum(['IR', 'INFLAM', 'DYSBIOSE']).optional(),
  notes: z.string().optional(),
});

/** Normalise les clés biomarqueurs (alias courants → IDs catalogue). */
const BIOMARKER_ALIASES: Record<string, string> = {
  HOMA_IR: 'HOMA_IR',
  'homa-ir': 'HOMA_IR',
  homa_ir: 'HOMA_IR',
  TG_HDL: 'TG_HDL_RATIO',
  TG_HDL_RATIO: 'TG_HDL_RATIO',
  'tg/hdl': 'TG_HDL_RATIO',
  CRP: 'CRP_US',
  CRP_US: 'CRP_US',
  'crp-us': 'CRP_US',
  OMEGA_INDEX: 'OMEGA_INDEX',
  BRISTOL: 'BRISTOL_SCORE',
  BRISTOL_SCORE: 'BRISTOL_SCORE',
  BLOATING: 'BLOATING_FREQ',
  BLOATING_FREQ: 'BLOATING_FREQ',
  FIBER: 'FIBER_INTAKE',
  FIBER_INTAKE: 'FIBER_INTAKE',
};

function normalizeKeys(map: Record<string, number | string>): Record<string, number | string> {
  const out: Record<string, number | string> = {};
  for (const [key, value] of Object.entries(map)) {
    const normalized = BIOMARKER_ALIASES[key] ?? BIOMARKER_ALIASES[key.toUpperCase()] ?? key.toUpperCase();
    out[normalized] = value;
  }
  return out;
}

export function parseDossierJson(
  raw: string,
  folderName: string,
  sourceFile: string
): { ok: true; data: DossierFileInput & { profile: PatientProfile } } | { ok: false; error: string } {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return { ok: false, error: `JSON invalide dans ${sourceFile}` };
  }

  const parsed = DossierSchema.safeParse(json);
  if (!parsed.success) {
    return {
      ok: false,
      error: `Validation échouée (${folderName}): ${parsed.error.issues.map((i) => i.message).join(', ')}`,
    };
  }

  const d = parsed.data;
  const profile: PatientProfile = {
    external_id: d.external_id ?? folderName,
    age: d.age,
    sex: d.sex,
    biomarker_values: normalizeKeys(d.biomarker_values) as Record<string, number>,
    clinical_signals: normalizeKeys(d.clinical_signals) as Record<string, number | string>,
    exclusions: d.exclusions,
    context: d.context,
  };

  const hasData =
    Object.keys(profile.biomarker_values).length > 0 ||
    Object.keys(profile.clinical_signals).length > 0;

  if (!hasData) {
    return {
      ok: false,
      error: `Dossier ${folderName} vide : biomarker_values ou clinical_signals requis`,
    };
  }

  return {
    ok: true,
    data: {
      ...d,
      profile,
    },
  };
}

/** Extrait le nom du dossier patient depuis un chemin relatif. */
export function extractFolderName(relativePath: string): string {
  const parts = relativePath.replace(/\\/g, '/').split('/').filter(Boolean);
  if (parts.length >= 2) {
    return parts[parts.length - 2];
  }
  const file = parts[parts.length - 1] ?? 'dossier';
  return file.replace(/\.json$/i, '');
}

/** Fichiers acceptés comme profil patient. */
export function isProfileFile(path: string): boolean {
  const name = path.replace(/\\/g, '/').split('/').pop()?.toLowerCase() ?? '';
  return (
    name === 'profile.json' ||
    name === 'patient.json' ||
    name.endsWith('.profile.json') ||
    (name.endsWith('.json') && !name.includes('manifest'))
  );
}
