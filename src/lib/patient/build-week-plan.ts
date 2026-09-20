import { getAnthropicClient, MODELS } from '@/lib/anthropic/client';
import type { BiomarkerMap, PatientGroceryAisle, PatientPlanDay, PatientPlanMeal } from './types';

export interface BuildWeekPlanInput {
  biomarkers: BiomarkerMap;
  problemText: string;
  goalsText: string;
  dietaryExclusions?: string[];
}

export interface WeekPlanGenerationMeta {
  source: 'live' | 'fixture';
  model?: string;
}

export interface RawWeekPlan {
  days: PatientPlanDay[];
  grocery_list: PatientGroceryAisle[];
  generation_meta: WeekPlanGenerationMeta;
}

export type ComposeLiveWeek = (input: BuildWeekPlanInput) => Promise<RawWeekPlan>;

export interface BuildWeekPlanOptions {
  composeLiveWeek?: ComposeLiveWeek;
  hasAnthropicKey?: boolean;
}

const DAY_LABELS = [
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
  'Dimanche',
] as const;

const TITLE_LEAK =
  /bottleneck|\bIR\b|INFLAM|DYSBIOSE|T1|T2|T3|classification|seuil|threshold|HOMA/i;

interface CatalogMeal {
  slot: PatientPlanMeal['slot'];
  title: string;
  summary: string;
  tags: string[];
  groceries: Array<{ aisle: string; item: string }>;
}

const BREAKFASTS: CatalogMeal[] = [
  {
    slot: 'breakfast',
    title: 'Bol d’avoine, kéfir et myrtilles',
    summary: 'Flocons d’avoine, kéfir, myrtilles et graines, prêt en quelques minutes.',
    tags: ['lactose', 'lait'],
    groceries: [
      { aisle: 'Épicerie', item: 'Flocons d’avoine' },
      { aisle: 'Frais', item: 'Kéfir' },
      { aisle: 'Fruits', item: 'Myrtilles' },
      { aisle: 'Épicerie', item: 'Graines de lin' },
    ],
  },
  {
    slot: 'breakfast',
    title: 'Œufs brouillés, pain complet et tomates',
    summary: 'Œufs à la poêle douce, pain complet, tomates et huile d’olive.',
    tags: ['œuf', 'oeuf', 'gluten'],
    groceries: [
      { aisle: 'Frais', item: 'Œufs' },
      { aisle: 'Boulangerie', item: 'Pain complet' },
      { aisle: 'Légumes', item: 'Tomates' },
      { aisle: 'Épicerie', item: 'Huile d’olive extra vierge' },
    ],
  },
  {
    slot: 'breakfast',
    title: 'Yaourt nature, granola et fruits de saison',
    summary: 'Yaourt nature, granola maison et pomme ou fruits rouges.',
    tags: ['lactose', 'lait', 'gluten'],
    groceries: [
      { aisle: 'Frais', item: 'Yaourt nature' },
      { aisle: 'Épicerie', item: 'Granola' },
      { aisle: 'Fruits', item: 'Pommes' },
    ],
  },
];

const LUNCHES: CatalogMeal[] = [
  {
    slot: 'lunch',
    title: 'Bol méditerranéen lentilles et sardines',
    summary: 'Lentilles, sardines, riz complet refroidi, salade et citron.',
    tags: ['poisson', 'sardine', 'poisson gras'],
    groceries: [
      { aisle: 'Épicerie', item: 'Lentilles vertes' },
      { aisle: 'Épicerie', item: 'Sardines à l’huile d’olive' },
      { aisle: 'Épicerie', item: 'Riz complet' },
      { aisle: 'Légumes', item: 'Roquette' },
      { aisle: 'Fruits', item: 'Citron' },
    ],
  },
  {
    slot: 'lunch',
    title: 'Bowl pois chiches, kimchi et légumes',
    summary: 'Pois chiches, kimchi cru, riz complet, herbes et huile d’olive.',
    tags: [],
    groceries: [
      { aisle: 'Épicerie', item: 'Pois chiches' },
      { aisle: 'Frais', item: 'Kimchi' },
      { aisle: 'Légumes', item: 'Poireau' },
      { aisle: 'Épicerie', item: 'Riz complet' },
    ],
  },
  {
    slot: 'lunch',
    title: 'Salade tiède de quinoa, œuf et légumes rôtis',
    summary: 'Quinoa, œuf mollet, courgette, poivron et vinaigrette citron.',
    tags: ['œuf', 'oeuf'],
    groceries: [
      { aisle: 'Épicerie', item: 'Quinoa' },
      { aisle: 'Frais', item: 'Œufs' },
      { aisle: 'Légumes', item: 'Courgette' },
      { aisle: 'Légumes', item: 'Poivron' },
    ],
  },
];

const DINNERS: CatalogMeal[] = [
  {
    slot: 'dinner',
    title: 'Papillote de maquereau, brocoli et baies',
    summary: 'Maquereau en papillote, brocoli vapeur, myrtilles et huile d’olive.',
    tags: ['poisson', 'maquereau', 'poisson gras'],
    groceries: [
      { aisle: 'Poissonnerie', item: 'Filets de maquereau' },
      { aisle: 'Légumes', item: 'Brocoli' },
      { aisle: 'Fruits', item: 'Myrtilles' },
      { aisle: 'Épicerie', item: 'Huile d’olive extra vierge' },
    ],
  },
  {
    slot: 'dinner',
    title: 'Dahl de lentilles corail et légumes vapeur',
    summary: 'Lentilles corail, épinards, carottes, cumin et huile d’olive.',
    tags: [],
    groceries: [
      { aisle: 'Épicerie', item: 'Lentilles corail' },
      { aisle: 'Légumes', item: 'Épinards' },
      { aisle: 'Légumes', item: 'Carottes' },
      { aisle: 'Épicerie', item: 'Cumin' },
    ],
  },
  {
    slot: 'dinner',
    title: 'Poulet au four, poireaux et sarrasin',
    summary: 'Poulet cuit doucement, poireaux, sarrasin et persil.',
    tags: ['viande', 'poulet'],
    groceries: [
      { aisle: 'Boucherie', item: 'Poulet' },
      { aisle: 'Légumes', item: 'Poireau' },
      { aisle: 'Épicerie', item: 'Sarrasin' },
      { aisle: 'Légumes', item: 'Persil' },
    ],
  },
];

const VEG_FALLBACK: Record<CatalogMeal['slot'], CatalogMeal> = {
  breakfast: {
    slot: 'breakfast',
    title: 'Compote de pomme, graines et pain de sarrasin',
    summary: 'Pomme, graines, pain de sarrasin et un filet d’huile d’olive.',
    tags: [],
    groceries: [
      { aisle: 'Fruits', item: 'Pommes' },
      { aisle: 'Épicerie', item: 'Pain de sarrasin' },
      { aisle: 'Épicerie', item: 'Graines de lin' },
    ],
  },
  lunch: {
    slot: 'lunch',
    title: 'Bol de haricots blancs, légumes et herbes',
    summary: 'Haricots blancs, légumes de saison, herbes et huile d’olive.',
    tags: [],
    groceries: [
      { aisle: 'Épicerie', item: 'Haricots blancs' },
      { aisle: 'Légumes', item: 'Légumes de saison' },
      { aisle: 'Légumes', item: 'Persil' },
    ],
  },
  dinner: {
    slot: 'dinner',
    title: 'Légumes vapeur, tofu et riz complet',
    summary: 'Légumes vapeur, tofu, riz complet et sésame.',
    tags: ['soja', 'tofu'],
    groceries: [
      { aisle: 'Légumes', item: 'Légumes vapeur' },
      { aisle: 'Frais', item: 'Tofu' },
      { aisle: 'Épicerie', item: 'Riz complet' },
    ],
  },
};

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim();
}

function excluded(meal: CatalogMeal, exclusions: string[]): boolean {
  if (exclusions.length === 0) return false;
  const haystack = normalize([meal.title, meal.summary, ...meal.tags].join(' '));
  return exclusions.some((raw) => {
    const needle = normalize(raw);
    return needle.length > 0 && haystack.includes(needle);
  });
}

function pickMeal(pool: CatalogMeal[], dayIndex: number, exclusions: string[]): CatalogMeal {
  const rotated = pool[dayIndex % pool.length];
  if (!excluded(rotated, exclusions)) return rotated;
  const alternative = pool.find((meal) => !excluded(meal, exclusions));
  if (alternative) return alternative;
  const fallback = VEG_FALLBACK[rotated.slot];
  if (!excluded(fallback, exclusions)) return fallback;
  return {
    ...fallback,
    title: `Plat du jour (${rotated.slot === 'breakfast' ? 'matin' : rotated.slot === 'lunch' ? 'midi' : 'soir'})`,
    summary: 'Légumes de saison, céréale complète et huile d’olive.',
    tags: [],
    groceries: [
      { aisle: 'Légumes', item: 'Légumes de saison' },
      { aisle: 'Épicerie', item: 'Céréale complète' },
      { aisle: 'Épicerie', item: 'Huile d’olive extra vierge' },
    ],
  };
}

function toClientMeal(meal: CatalogMeal): PatientPlanMeal {
  return {
    slot: meal.slot,
    title: scrubTitle(meal.title),
    summary: meal.summary,
  };
}

export function scrubTitle(title: string): string {
  if (!TITLE_LEAK.test(title)) return title;
  return 'Proposition culinaire de saison';
}

function buildGroceryList(meals: CatalogMeal[]): PatientGroceryAisle[] {
  const byAisle = new Map<string, Set<string>>();
  for (const meal of meals) {
    for (const { aisle, item } of meal.groceries) {
      const set = byAisle.get(aisle) ?? new Set<string>();
      set.add(item);
      byAisle.set(aisle, set);
    }
  }
  return [...byAisle.entries()].map(([aisle, items]) => ({
    aisle,
    items: [...items],
  }));
}

function buildFixtureWeek(exclusions: string[]): RawWeekPlan {
  const used: CatalogMeal[] = [];
  const days: PatientPlanDay[] = DAY_LABELS.map((label, index) => {
    const breakfast = pickMeal(BREAKFASTS, index, exclusions);
    const lunch = pickMeal(LUNCHES, index, exclusions);
    const dinner = pickMeal(DINNERS, index, exclusions);
    used.push(breakfast, lunch, dinner);
    return {
      day: index + 1,
      label,
      meals: [toClientMeal(breakfast), toClientMeal(lunch), toClientMeal(dinner)],
    };
  });

  return {
    days,
    grocery_list: buildGroceryList(used),
    generation_meta: { source: 'fixture' },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function parseLivePlan(raw: unknown, model: string): RawWeekPlan {
  if (!isRecord(raw) || !Array.isArray(raw.days) || raw.days.length < 1) {
    throw new Error('live week plan missing days');
  }
  const days = raw.days.slice(0, 7).map((day, index): PatientPlanDay => {
    const rec = isRecord(day) ? day : {};
    const mealsRaw = Array.isArray(rec.meals) ? rec.meals : [];
    const meals: PatientPlanMeal[] = [];
    for (const meal of mealsRaw) {
      if (!isRecord(meal)) continue;
      const slot = meal.slot;
      if (slot !== 'breakfast' && slot !== 'lunch' && slot !== 'dinner') continue;
      meals.push({
        slot,
        title: scrubTitle(asString(meal.title, 'Plat du jour')),
        summary: asString(meal.summary),
      });
      if (meals.length >= 3) break;
    }
    return {
      day: typeof rec.day === 'number' ? rec.day : index + 1,
      label: asString(rec.label, DAY_LABELS[index] ?? `J${index + 1}`),
      meals,
    };
  });
  while (days.length < 7) {
    const n = days.length + 1;
    days.push({ day: n, label: DAY_LABELS[n - 1] ?? `J${n}`, meals: [] });
  }

  const groceryRaw = Array.isArray(raw.grocery_list) ? raw.grocery_list : [];
  const grocery_list: PatientGroceryAisle[] = groceryRaw.map((aisle) => {
    const rec = isRecord(aisle) ? aisle : {};
    const items = Array.isArray(rec.items) ? rec.items.filter((i): i is string => typeof i === 'string') : [];
    return { aisle: asString(rec.aisle), items };
  });

  if (grocery_list.every((aisle) => aisle.items.length === 0)) {
    throw new Error('live week plan missing grocery list');
  }

  return {
    days,
    grocery_list,
    generation_meta: { source: 'live', model },
  };
}

function stripFences(text: string): string {
  const trimmed = text.trim();
  const fence = /^```(?:json)?\s*([\s\S]*?)\s*```$/;
  const m = trimmed.match(fence);
  return m ? m[1].trim() : trimmed;
}

async function defaultComposeLiveWeek(input: BuildWeekPlanInput): Promise<RawWeekPlan> {
  const model = MODELS.PRIMARY;
  const exclusions = input.dietaryExclusions?.filter(Boolean).join(', ') || 'aucune';
  const biomarkerSummary = JSON.stringify(input.biomarkers);
  const response = await getAnthropicClient().messages.create({
    model,
    max_tokens: 4096,
    system:
      'Tu es un assistant culinaire. Tu proposes un menu de 7 jours (petit-déjeuner, déjeuner, dîner) et une liste de courses groupée par rayon. ' +
      'Aide culinaire uniquement : pas de diagnostic, pas de dispositif médical. ' +
      'Interdit dans les titres et résumés : bottleneck, IR, INFLAM, DYSBIOSE, T1, T2, T3, classification, seuils, HOMA. ' +
      'Réponds uniquement en JSON valide, sans markdown.',
    messages: [
      {
        role: 'user',
        content:
          `Problème: ${input.problemText}\nObjectifs: ${input.goalsText}\nExclusions: ${exclusions}\nBiomarqueurs (usage interne, ne pas citer dans les titres): ${biomarkerSummary}\n` +
          `JSON attendu: {"days":[{"day":1,"label":"Lundi","meals":[{"slot":"breakfast","title":"...","summary":"..."},{"slot":"lunch","title":"...","summary":"..."},{"slot":"dinner","title":"...","summary":"..."}]}],"grocery_list":[{"aisle":"Légumes","items":["..."]}]} ` +
          '7 jours, labels Lundi à Dimanche.',
      },
    ],
  });
  const block = response.content.find((part) => part.type === 'text');
  if (!block || block.type !== 'text') {
    throw new Error('live week plan empty');
  }
  const parsed: unknown = JSON.parse(stripFences(block.text));
  return parseLivePlan(parsed, model);
}

/**
 * Biomarkers + intake → 7-day culinary menu + grocery list.
 * Anthropic is optional: missing key or composer errors fall back to a
 * deterministic catalog week. Titles never carry bottleneck labels.
 */
export async function buildWeekPlan(
  input: BuildWeekPlanInput,
  options: BuildWeekPlanOptions = {}
): Promise<RawWeekPlan> {
  const exclusions = (input.dietaryExclusions ?? []).filter((item) => item.trim().length > 0);
  const fixture = buildFixtureWeek(exclusions);
  const hasKey = options.hasAnthropicKey ?? Boolean(process.env.ANTHROPIC_API_KEY);
  if (!hasKey) return fixture;

  try {
    const compose = options.composeLiveWeek ?? defaultComposeLiveWeek;
    return await compose(input);
  } catch {
    return fixture;
  }
}
