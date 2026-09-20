import { afterEach, describe, expect, it } from 'vitest';
import { sanitizePlanForClient } from '../sanitize-plan';

const FORBIDDEN =
  /bottleneck|HOMA_IR threshold|T1\/T2|classification|scores|insulinorésistance|inflammaging|dysbiose/i;

describe('buildWeekPlan', () => {
  const originalKey = process.env.ANTHROPIC_API_KEY;

  afterEach(() => {
    if (originalKey === undefined) delete process.env.ANTHROPIC_API_KEY;
    else process.env.ANTHROPIC_API_KEY = originalKey;
  });

  it('without API key, returns 7 days and a grocery list that sanitizes cleanly', async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const { buildWeekPlan } = await import('../build-week-plan');

    const raw = await buildWeekPlan({
      biomarkers: { homa_ir: 2.4, crp_us: 1.2 },
      problemText: 'Coups de fatigue après le déjeuner',
      goalsText: 'Manger plus de légumes, menus simples',
      dietaryExclusions: ['gluten'],
    });

    expect(raw.days).toHaveLength(7);
    expect(raw.grocery_list.length).toBeGreaterThan(0);
    expect(raw.grocery_list.some((aisle) => aisle.items.length > 0)).toBe(true);
    expect(raw.generation_meta.source).toBe('fixture');

    for (const day of raw.days) {
      expect(day.meals.length).toBeGreaterThan(0);
      for (const meal of day.meals) {
        expect(meal.title).not.toMatch(/bottleneck|\bIR\b|INFLAM|DYSBIOSE|T1|T2|T3/i);
      }
    }

    const client = sanitizePlanForClient({ id: 'plan-test', ...raw });
    expect(client.days).toHaveLength(7);
    expect(JSON.stringify(client)).not.toMatch(FORBIDDEN);
  });

  it('falls back to the catalog week when the live composer fails', async () => {
    process.env.ANTHROPIC_API_KEY = 'sk-test-not-used';
    const { buildWeekPlan } = await import('../build-week-plan');

    const raw = await buildWeekPlan(
      {
        biomarkers: { homa_ir: 1.8 },
        problemText: 'Digestion lourde',
        goalsText: 'Menus de saison',
        dietaryExclusions: [],
      },
      {
        composeLiveWeek: async () => {
          throw new Error('anthropic down');
        },
      }
    );

    expect(raw.days).toHaveLength(7);
    expect(raw.generation_meta.source).toBe('fixture');
    expect(raw.grocery_list.length).toBeGreaterThan(0);
    expect(JSON.stringify(sanitizePlanForClient({ id: 'p2', ...raw }))).not.toMatch(FORBIDDEN);
  });
});
