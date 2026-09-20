import { describe, expect, it } from 'vitest';
import { sanitizePlanForClient } from '../sanitize-plan';

describe('sanitizePlanForClient', () => {
  it('keeps 7 days and grocery list', () => {
    const client = sanitizePlanForClient({
      id: 'p1',
      days: Array.from({ length: 7 }, (_, i) => ({
        day: i + 1,
        label: `J${i + 1}`,
        meals: [{ slot: 'lunch', title: 'Bol', summary: 'légumes' }],
      })),
      grocery_list: [{ aisle: 'Légumes', items: ['Courgette'] }],
      bottleneck_id: 'IR',
      scores: { IR: 9 },
      tiers: ['T1'],
      classification: { dominant: 'IR' },
    });
    expect(client.days).toHaveLength(7);
    expect(client.grocery_list[0].items).toContain('Courgette');
    expect(JSON.stringify(client)).not.toMatch(/bottleneck|HOMA_IR threshold|T1\/T2|classification|scores/i);
    expect(client.disclaimer.length).toBeGreaterThan(10);
    expect(client.disclaimer).toBe(
      'Aide culinaire personnalisée. Ceci n\u2019est pas un avis médical ni un dispositif médical.'
    );
    expect(client).not.toHaveProperty('bottleneck_id');
    expect(client).not.toHaveProperty('scores');
    expect(client).not.toHaveProperty('tiers');
    expect(client).not.toHaveProperty('classification');
  });

  it('throws when there is no day to show', () => {
    expect(() => sanitizePlanForClient({ id: 'p1', days: [] })).toThrow(/at least one day/i);
    expect(() => sanitizePlanForClient({})).toThrow(/at least one day/i);
  });

  it('pads short weeks and truncates extra days', () => {
    const padded = sanitizePlanForClient({
      id: 'p2',
      days: [{ day: 1, label: 'Lundi', meals: [] }],
      grocery_list: [],
    });
    expect(padded.days).toHaveLength(7);
    expect(padded.days[0].label).toBe('Lundi');
    expect(padded.days[6].label).toBe('J7');

    const truncated = sanitizePlanForClient({
      id: 'p3',
      days: Array.from({ length: 9 }, (_, i) => ({
        day: i + 1,
        label: `J${i + 1}`,
        meals: [],
      })),
    });
    expect(truncated.days).toHaveLength(7);
    expect(truncated.days.map((d) => d.day)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });
});
