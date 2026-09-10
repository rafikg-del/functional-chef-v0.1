import { afterEach, describe, expect, it } from 'vitest';
import {
  canonicalConsultationPayload,
  hashConsultationContent,
  sha256Hex,
  stableStringify,
} from '../content-hash';
import { isExplicitMockDataEnabled } from '../mock-mode';
import { aggregateConsultationStats, emptyPractitionerStats } from '@/lib/dashboard/stats';
import {
  asDetectedBottlenecks,
  getDominantBottleneck,
  getEbmSummary,
  getLlmMeta,
} from '@/lib/dashboard/consultation-shape';

describe('sha256Hex', () => {
  it('matches the NIST SHA-256 vector for "abc"', async () => {
    expect(await sha256Hex('abc')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
    );
  });

  it('is stable for the same input', async () => {
    const a = await sha256Hex('functional-chef');
    const b = await sha256Hex('functional-chef');
    expect(a).toBe(b);
    expect(a).toHaveLength(64);
  });
});

describe('stableStringify', () => {
  it('sorts object keys recursively', () => {
    expect(stableStringify({ b: 1, a: { d: 2, c: 3 } })).toBe('{"a":{"c":3,"d":2},"b":1}');
  });
});

describe('hashConsultationContent', () => {
  it('ignores key order and hashes canonical payload', async () => {
    const a = await hashConsultationContent({
      intent: 'Déjeuner anti-IR',
      meal_type: 'lunch',
      warnings: [],
      detected_bottlenecks: { dominant: 'IR' },
    });
    const b = await hashConsultationContent({
      meal_type: 'lunch',
      intent: 'Déjeuner anti-IR',
      detected_bottlenecks: { dominant: 'IR' },
      warnings: [],
    });
    expect(a).toBe(b);
    expect(canonicalConsultationPayload({ intent: 'x' }).intent).toBe('x');
  });
});

describe('isExplicitMockDataEnabled', () => {
  const original = process.env.NEXT_PUBLIC_USE_MOCK_DATA;

  afterEach(() => {
    if (original === undefined) delete process.env.NEXT_PUBLIC_USE_MOCK_DATA;
    else process.env.NEXT_PUBLIC_USE_MOCK_DATA = original;
  });

  it('is false unless the env flag is exactly true', () => {
    delete process.env.NEXT_PUBLIC_USE_MOCK_DATA;
    expect(isExplicitMockDataEnabled()).toBe(false);
    process.env.NEXT_PUBLIC_USE_MOCK_DATA = 'false';
    expect(isExplicitMockDataEnabled()).toBe(false);
    process.env.NEXT_PUBLIC_USE_MOCK_DATA = 'true';
    expect(isExplicitMockDataEnabled()).toBe(true);
  });
});

describe('consultation-shape', () => {
  it('reads dominant from ClassificationResult objects and score arrays', () => {
    expect(getDominantBottleneck({ dominant: 'IR', scores: [] })).toBe('IR');
    expect(
      getDominantBottleneck([
        { bottleneck_id: 'INFLAM', is_dominant: true },
        { bottleneck_id: 'IR', is_dominant: false },
      ])
    ).toBe('INFLAM');
    expect(asDetectedBottlenecks(null)).toBeNull();
  });

  it('prefers row ebm_summary then dish summary', () => {
    expect(getEbmSummary({ ebm_summary: { T1_count: 4 } })?.T1_count).toBe(4);
    expect(getEbmSummary({ output_dish: { ebm_summary: { T1_count: 2 } } })?.T1_count).toBe(2);
  });

  it('reconstructs llm_meta from column layout', () => {
    expect(getLlmMeta({ llm_model: 'claude-sonnet-4-20250514', llm_input_tokens: 10 })?.model).toContain('sonnet');
  });
});

describe('aggregateConsultationStats', () => {
  it('returns zeros on empty input (never mock numbers)', () => {
    const empty = emptyPractitionerStats(new Date('2026-09-10T00:00:00Z'));
    expect(empty.total_consultations).toBe(0);
    expect(empty.avg_t1_per_dish).toBe(0);
    expect(aggregateConsultationStats([]).total_consultations).toBe(0);
  });

  it('aggregates synthetic consultations without PHI', () => {
    const now = new Date('2026-09-10T12:00:00Z');
    const stats = aggregateConsultationStats(
      [
        {
          id: 'c1',
          created_at: '2026-09-02T10:00:00Z',
          patient_profile_id: 'p1',
          detected_bottlenecks: { dominant: 'IR' },
          selected_levers: [
            { lever_id: 'L_EVOO_PRIMARY', name_fr: 'EVOO', ebm_tier: 'T1', tier_for_active_bottleneck: 'T1' },
          ],
          ebm_summary: { T1_count: 4, T2_count: 2, T3_count: 0 },
        },
        {
          id: 'c2',
          created_at: '2026-08-15T10:00:00Z',
          patient_profile_id: 'p2',
          detected_bottlenecks: { dominant: 'INFLAM' },
          selected_levers: [
            { lever_id: 'L_EVOO_PRIMARY', name_fr: 'EVOO', ebm_tier: 'T1', tier_for_active_bottleneck: 'T1' },
            { lever_id: 'L_FATTY_FISH_2X', name_fr: 'Poisson gras', ebm_tier: 'T1', tier_for_active_bottleneck: 'T1' },
          ],
          ebm_summary: { T1_count: 6, T2_count: 0, T3_count: 0 },
        },
      ],
      now
    );

    expect(stats.total_consultations).toBe(2);
    expect(stats.consultations_this_month).toBe(1);
    expect(stats.patients_count).toBe(2);
    expect(stats.unique_levers_used).toBe(2);
    expect(stats.avg_t1_per_dish).toBe(5);
    expect(stats.bottleneck_distribution.find((b) => b.bottleneck === 'IR')?.count).toBe(1);
    expect(stats.top_levers[0].lever).toBe('L_EVOO_PRIMARY');
    expect(stats.top_levers[0].count).toBe(2);
  });
});
