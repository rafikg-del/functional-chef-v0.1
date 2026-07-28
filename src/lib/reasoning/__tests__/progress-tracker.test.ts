import { describe, it, expect } from 'vitest';
import { computeProgress } from '../progress-tracker';
import type { BottleneckScore, ProgressEntry } from '../types';

function makeScore(id: string, score: number): BottleneckScore {
  return {
    bottleneck_id: id as any,
    score,
    major_hits: 0,
    moderate_hits: 0,
    minor_hits: 0,
    discriminant_hits: 0,
    triggered: score >= 6,
    suspicion_score: 0,
    suspicion_signals: [],
    is_dominant: false,
    is_co_dominant: false,
    evidence: [],
  };
}

function makeHistory(scores: Record<string, number>, date = '2026-07-01'): ProgressEntry {
  return {
    date,
    dominant: scores.IR ? 'IR' : null,
    scores: { IR: scores.IR ?? 0, INFLAM: scores.INFLAM ?? 0, DYSBIOSE: scores.DYSBIOSE ?? 0 },
    levers_activated: [],
  };
}

describe('Progress Tracker', () => {
  it('Première consultation — pas d\'historique', () => {
    const current = [makeScore('IR', 10), makeScore('INFLAM', 6), makeScore('DYSBIOSE', 8)];
    const report = computeProgress(current, []);
    expect(report.global_trend).toBe('premiere_consultation');
    for (const t of report.trends) {
      expect(t.trend).toBe('new');
      expect(t.previous_score).toBeNull();
    }
  });

  it('IR en amélioration, autres stables', () => {
    const prev = makeHistory({ IR: 12, INFLAM: 6, DYSBIOSE: 8 });
    const current = [makeScore('IR', 8), makeScore('INFLAM', 6), makeScore('DYSBIOSE', 8)];
    const report = computeProgress(current, [prev]);

    const ir = report.trends.find((t) => t.bottleneck_id === 'IR')!;
    expect(ir.trend).toBe('improving');
    expect(ir.delta).toBe(-4);

    const inflam = report.trends.find((t) => t.bottleneck_id === 'INFLAM')!;
    expect(inflam.trend).toBe('stable');
    expect(inflam.delta).toBe(0);

    expect(report.global_trend).toBe('stable'); // 1 seul amélioré sur 3
  });

  it('Aggravation généralisée', () => {
    const prev = makeHistory({ IR: 8, INFLAM: 5, DYSBIOSE: 6 });
    const current = [makeScore('IR', 11), makeScore('INFLAM', 8), makeScore('DYSBIOSE', 9)];
    const report = computeProgress(current, [prev]);

    expect(report.trends.every((t) => t.trend === 'worsening')).toBe(true);
    expect(report.global_trend).toBe('aggravation');
    expect(report.suggestions.length).toBeGreaterThanOrEqual(3);
  });

  it('Scores avec delta sous le seuil — stable', () => {
    const prev = makeHistory({ IR: 10, INFLAM: 5, DYSBIOSE: 7 });
    const current = [makeScore('IR', 10.3), makeScore('INFLAM', 5.2), makeScore('DYSBIOSE', 6.8)];
    const report = computeProgress(current, [prev]);

    for (const t of report.trends) {
      expect(t.trend).toBe('stable');
    }
    expect(report.global_trend).toBe('stable');
  });

  it('Amélioration IR + suggestions présentes', () => {
    const prev = makeHistory({ IR: 15, INFLAM: 7, DYSBIOSE: 5 });
    const current = [makeScore('IR', 9), makeScore('INFLAM', 7), makeScore('DYSBIOSE', 9)];
    const report = computeProgress(current, [prev]);

    expect(report.suggestions.length).toBeGreaterThanOrEqual(2);
    expect(report.suggestions.some((s) => s.includes('amélioration'))).toBe(true);
    expect(report.suggestions.some((s) => s.includes('aggrave'))).toBe(true);
  });
});
