import type {
  PatientGroceryAisle,
  PatientPlanClient,
  PatientPlanDay,
  PatientPlanMeal,
} from './types';

/** Forced on every client plan. Culinary help — not a medical device. */
export const PATIENT_PLAN_DISCLAIMER =
  'Aide culinaire personnalisée. Ceci n\u2019est pas un avis médical ni un dispositif médical.';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function sanitizeMeal(raw: unknown): PatientPlanMeal | null {
  if (!isRecord(raw)) return null;
  const slot = raw.slot;
  if (slot !== 'breakfast' && slot !== 'lunch' && slot !== 'dinner') return null;
  return {
    slot,
    title: asString(raw.title),
    summary: asString(raw.summary),
  };
}

function sanitizeDay(raw: unknown, index: number): PatientPlanDay {
  const rec = isRecord(raw) ? raw : {};
  const dayNum = typeof rec.day === 'number' && Number.isFinite(rec.day) ? rec.day : index;
  const mealsRaw = Array.isArray(rec.meals) ? rec.meals : [];
  const meals: PatientPlanMeal[] = [];
  for (const meal of mealsRaw) {
    const sanitized = sanitizeMeal(meal);
    if (sanitized) meals.push(sanitized);
    if (meals.length >= 3) break;
  }
  return {
    day: dayNum,
    label: asString(rec.label, `J${index}`),
    meals,
  };
}

function placeholderDay(index: number): PatientPlanDay {
  return { day: index, label: `J${index}`, meals: [] };
}

function sanitizeAisle(raw: unknown): PatientGroceryAisle {
  const rec = isRecord(raw) ? raw : {};
  const itemsRaw = Array.isArray(rec.items) ? rec.items : [];
  return {
    aisle: asString(rec.aisle),
    items: itemsRaw.filter((item): item is string => typeof item === 'string'),
  };
}

/**
 * Allowlist-only client plan. Drops method internals (bottlenecks, scores,
 * thresholds, EBM tiers, classification traces) and always attaches the FR disclaimer.
 */
export function sanitizePlanForClient(raw: unknown): PatientPlanClient {
  const rec = isRecord(raw) ? raw : {};
  const daysRaw = rec.days;
  if (!Array.isArray(daysRaw) || daysRaw.length < 1) {
    throw new Error('Patient plan must include at least one day');
  }

  const days = daysRaw.slice(0, 7).map((day, i) => sanitizeDay(day, i + 1));
  while (days.length < 7) {
    days.push(placeholderDay(days.length + 1));
  }

  const groceryRaw = Array.isArray(rec.grocery_list) ? rec.grocery_list : [];
  const grocery_list = groceryRaw.map(sanitizeAisle);

  return {
    id: asString(rec.id),
    days,
    grocery_list,
    disclaimer: PATIENT_PLAN_DISCLAIMER,
  };
}
