import { buildWeekPlan, type RawWeekPlan } from './build-week-plan';
import { mergeBiomarkers } from './merge-biomarkers';
import { sanitizePlanForClient } from './sanitize-plan';
import type { BiomarkerMap, PatientPlanClient } from './types';

export interface HandlerResult {
  status: number;
  body: unknown;
}

export interface StoredPlanRow {
  id: string;
  user_id: string;
  intake_id: string;
  status: string;
  menu_7d: unknown;
  grocery_list: unknown;
  generation_meta: unknown;
  created_at?: string;
}

export interface StoredIntakeRow {
  id: string;
  user_id: string;
  lab_id: string | null;
  problem_text: string;
  goals_text: string;
  goal_tags: string[] | null;
}

export interface StoredLabRow {
  parsed_biomarkers?: BiomarkerMap;
  edited_biomarkers?: BiomarkerMap;
}

export interface PlanListItem {
  id: string;
  created_at: string | null;
  status: string;
}

const EMPTY_BIOMARKERS =
  'Indiquez au moins un biomarqueur pour générer un menu.';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asBiomarkerMap(value: unknown): BiomarkerMap {
  if (!isRecord(value)) return {};
  const map: BiomarkerMap = {};
  for (const [key, raw] of Object.entries(value)) {
    if (typeof raw === 'number' || typeof raw === 'string' || raw === null) {
      map[key] = raw;
    }
  }
  return map;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

function generationMetaOnly(raw: RawWeekPlan): RawWeekPlan['generation_meta'] {
  return {
    source: raw.generation_meta.source,
    ...(raw.generation_meta.model ? { model: raw.generation_meta.model } : {}),
  };
}

export function toClientPlan(
  id: string,
  days: unknown,
  grocery_list: unknown
): PatientPlanClient {
  return sanitizePlanForClient({ id, days, grocery_list });
}

function clientBody(id: string, raw: RawWeekPlan): PatientPlanClient {
  return toClientPlan(id, raw.days, raw.grocery_list);
}

export async function handleCreatePlan(opts: {
  userId: string;
  body: unknown;
  insertIntake: (row: {
    user_id: string;
    lab_id: string | null;
    problem_text: string;
    goals_text: string;
    goal_tags: string[] | null;
  }) => Promise<{ id: string }>;
  insertPlan: (row: {
    user_id: string;
    intake_id: string;
    status: 'ready';
    menu_7d: unknown;
    grocery_list: unknown;
    generation_meta: unknown;
  }) => Promise<{ id: string }>;
  loadLab?: (labId: string) => Promise<StoredLabRow | null>;
  loadDietaryExclusions?: () => Promise<string[]>;
  buildWeekPlan?: typeof buildWeekPlan;
}): Promise<HandlerResult> {
  const body = isRecord(opts.body) ? opts.body : {};
  const problem_text = asString(body.problem_text);
  const goals_text = asString(body.goals_text);
  const goal_tags = asStringArray(body.goal_tags);
  const lab_id = asString(body.lab_id) || null;

  let parsed = asBiomarkerMap(body.parsed_biomarkers);
  let editedOverlay = asBiomarkerMap(body.edited_biomarkers);
  if (body.biomarkers !== undefined) {
    editedOverlay = { ...editedOverlay, ...asBiomarkerMap(body.biomarkers) };
  }

  if (lab_id) {
    if (!opts.loadLab) {
      return { status: 400, body: { error: 'Laboratoire introuvable.' } };
    }
    const lab = await opts.loadLab(lab_id);
    if (!lab) {
      return { status: 404, body: { error: 'Laboratoire introuvable.' } };
    }
    parsed = { ...asBiomarkerMap(lab.parsed_biomarkers), ...parsed };
    editedOverlay = {
      ...asBiomarkerMap(lab.edited_biomarkers),
      ...editedOverlay,
    };
  }

  const biomarkers = mergeBiomarkers(parsed, editedOverlay);
  if (Object.keys(biomarkers).length === 0) {
    return { status: 400, body: { error: EMPTY_BIOMARKERS } };
  }

  const fromBody = asStringArray(body.dietary_exclusions);
  const dietaryExclusions =
    fromBody.length > 0
      ? fromBody
      : (await opts.loadDietaryExclusions?.()) ?? [];

  const compose = opts.buildWeekPlan ?? buildWeekPlan;
  const raw = await compose({
    biomarkers,
    problemText: problem_text,
    goalsText: goals_text,
    dietaryExclusions,
  });

  const intake = await opts.insertIntake({
    user_id: opts.userId,
    lab_id,
    problem_text,
    goals_text,
    goal_tags: goal_tags.length > 0 ? goal_tags : null,
  });

  const plan = await opts.insertPlan({
    user_id: opts.userId,
    intake_id: intake.id,
    status: 'ready',
    menu_7d: raw.days,
    grocery_list: raw.grocery_list,
    generation_meta: generationMetaOnly(raw),
  });

  return { status: 200, body: clientBody(plan.id, raw) };
}

export async function handleListPlans(opts: {
  userId: string;
  listPlans: (userId: string) => Promise<PlanListItem[]>;
}): Promise<HandlerResult> {
  const plans = await opts.listPlans(opts.userId);
  return {
    status: 200,
    body: {
      plans: plans.map((plan) => ({
        id: plan.id,
        created_at: plan.created_at,
        status: plan.status,
      })),
    },
  };
}

export async function handleGetPlan(opts: {
  userId: string;
  planId: string;
  loadPlan: (userId: string, planId: string) => Promise<StoredPlanRow | null>;
}): Promise<HandlerResult> {
  const row = await opts.loadPlan(opts.userId, opts.planId);
  if (!row || row.user_id !== opts.userId) {
    return { status: 404, body: { error: 'Plan introuvable.' } };
  }
  return { status: 200, body: toClientPlan(row.id, row.menu_7d, row.grocery_list) };
}

export async function handleRegeneratePlan(opts: {
  userId: string;
  planId: string;
  loadPlan: (userId: string, planId: string) => Promise<StoredPlanRow | null>;
  loadIntake: (intakeId: string) => Promise<StoredIntakeRow | null>;
  loadLab?: (labId: string) => Promise<StoredLabRow | null>;
  loadDietaryExclusions?: () => Promise<string[]>;
  updatePlan: (row: {
    id: string;
    user_id: string;
    status: 'ready';
    menu_7d: unknown;
    grocery_list: unknown;
    generation_meta: unknown;
  }) => Promise<{ id: string } | null>;
  buildWeekPlan?: typeof buildWeekPlan;
}): Promise<HandlerResult> {
  const existing = await opts.loadPlan(opts.userId, opts.planId);
  if (!existing || existing.user_id !== opts.userId) {
    return { status: 404, body: { error: 'Plan introuvable.' } };
  }

  const intake = await opts.loadIntake(existing.intake_id);
  if (!intake || intake.user_id !== opts.userId) {
    return { status: 404, body: { error: 'Plan introuvable.' } };
  }

  let parsed: BiomarkerMap = {};
  let edited: BiomarkerMap = {};
  if (intake.lab_id && opts.loadLab) {
    const lab = await opts.loadLab(intake.lab_id);
    if (lab) {
      parsed = asBiomarkerMap(lab.parsed_biomarkers);
      edited = asBiomarkerMap(lab.edited_biomarkers);
    }
  }
  const biomarkers = mergeBiomarkers(parsed, edited);
  if (Object.keys(biomarkers).length === 0) {
    return { status: 400, body: { error: EMPTY_BIOMARKERS } };
  }

  const dietaryExclusions = (await opts.loadDietaryExclusions?.()) ?? [];
  const compose = opts.buildWeekPlan ?? buildWeekPlan;
  const raw = await compose({
    biomarkers,
    problemText: intake.problem_text,
    goalsText: intake.goals_text,
    dietaryExclusions,
  });

  const updated = await opts.updatePlan({
    id: existing.id,
    user_id: opts.userId,
    status: 'ready',
    menu_7d: raw.days,
    grocery_list: raw.grocery_list,
    generation_meta: generationMetaOnly(raw),
  });
  if (!updated) {
    return { status: 500, body: { error: 'Enregistrement du plan impossible.' } };
  }

  return { status: 200, body: clientBody(updated.id, raw) };
}
