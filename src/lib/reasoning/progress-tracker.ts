import type { BottleneckId, BottleneckScore } from './types';

export type Trend = 'improving' | 'stable' | 'worsening' | 'new';

export interface ProgressEntry {
  /** Consultation date ISO string */
  date: string;
  /** Dominant bottleneck at that time */
  dominant: BottleneckId | null;
  /** Scores keyed by bottleneck_id */
  scores: Record<BottleneckId, number>;
  /** Which levers were activated */
  levers_activated: string[];
  /** Practitioner-assessed adherence */
  adherence?: 'bonne' | 'partielle' | 'faible';
}

export interface BottleneckTrend {
  bottleneck_id: BottleneckId;
  current_score: number;
  previous_score: number | null;
  delta: number | null;
  trend: Trend;
  /** Number of consultations tracked */
  observations: number;
}

export interface ProgressReport {
  trends: BottleneckTrend[];
  /** Aggregate status */
  global_trend: 'amelioration' | 'stable' | 'aggravation' | 'premiere_consultation';
  /** Levers with best observed effect */
  best_levers: { lever_id: string; delta: number }[];
  /** Suggestions based on trends */
  suggestions: string[];
}

/**
 * Compute progress by comparing current scores against history.
 * The most recent entry in history is T-1 (previous consultation).
 */
export function computeProgress(
  current: BottleneckScore[],
  history: ProgressEntry[]
): ProgressReport {
  const bottlenecks: BottleneckId[] = ['IR', 'INFLAM', 'DYSBIOSE'];
  const previous = history.length > 0 ? history[history.length - 1] : null;

  const trends: BottleneckTrend[] = bottlenecks.map((id) => {
    const currentScore = current.find((s) => s.bottleneck_id === id)?.score ?? 0;
    const previousScore = previous?.scores[id] ?? null;
    const delta = previousScore !== null ? currentScore - previousScore : null;

    let trend: Trend = 'new';
    if (delta !== null) {
      if (delta <= -0.5) trend = 'improving';
      else if (delta >= 0.5) trend = 'worsening';
      else trend = 'stable';
    }

    return {
      bottleneck_id: id,
      current_score: currentScore,
      previous_score: previousScore,
      delta,
      trend,
      observations: history.length + 1,
    };
  });

  // Global trend
  const worsening = trends.filter((t) => t.trend === 'worsening').length;
  const improving = trends.filter((t) => t.trend === 'improving').length;
  let global_trend: ProgressReport['global_trend'] = 'premiere_consultation';
  if (history.length > 0) {
    if (worsening >= 2) global_trend = 'aggravation';
    else if (improving >= 2) global_trend = 'amelioration';
    else global_trend = 'stable';
  }

  // Best levers (simplified: based on which bottleneck improved most)
  const best_levers: { lever_id: string; delta: number }[] = [];
  // In a real implementation, we'd track which levers were active and correlate
  // with improvement. For now, return improving bottlenecks.
  for (const t of trends) {
    if (t.trend === 'improving' && t.delta !== null) {
      best_levers.push({ lever_id: `Levier ciblé ${t.bottleneck_id}`, delta: t.delta });
    }
  }

  // Suggestions
  const suggestions: string[] = [];
  for (const t of trends) {
    if (t.trend === 'worsening') {
      suggestions.push(
        `${t.bottleneck_id} s'aggrave (+${t.delta}) : réévaluer la stratégie, vérifier compliance, envisager leviers alternatifs.`
      );
    }
    if (t.trend === 'stable' && t.current_score > 0) {
      suggestions.push(
        `${t.bottleneck_id} stable (${t.current_score} pts). Maintenir les leviers actuels.`
      );
    }
    if (t.trend === 'improving') {
      const triggerTarget = ({
        IR: 'IR < 6 pts (HOMA-IR < 1.5)',
        INFLAM: 'INFLAM < 6 pts (CRP-us < 1)',
        DYSBIOSE: 'DYSBIOSE < 8 pts (Bristol 3-4 + fibres ≥ 25g)',
      } as Record<string, string>)[t.bottleneck_id] ?? `Score < seuil`;
      suggestions.push(
        `${t.bottleneck_id} en amélioration (${t.delta}) : continuer. Prochain objectif : ${triggerTarget} (actuel : ${t.current_score} pts).`
      );
    }
  }

  return { trends, global_trend, best_levers, suggestions };
}
