import { describe, expect, it } from 'vitest';
import { formatPlanCreatedAt, mealSlotLabel } from '../plan-view';

describe('plan view helpers', () => {
  it('labels meal slots in French', () => {
    expect(mealSlotLabel('breakfast')).toBe('Petit-déjeuner');
    expect(mealSlotLabel('lunch')).toBe('Déjeuner');
    expect(mealSlotLabel('dinner')).toBe('Dîner');
  });

  it('formats a stored timestamp for the history list', () => {
    expect(formatPlanCreatedAt(null)).toMatch(/date inconnue/i);
    expect(formatPlanCreatedAt('2026-09-20T10:00:00.000Z')).toMatch(/2026/);
  });
});
