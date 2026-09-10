import {
  asDetectedBottlenecks,
  getEbmSummary,
  type EbmSummaryLike,
} from '@/lib/dashboard/consultation-shape';

const BOTTLENECK_LABEL: Record<string, string> = {
  IR: 'Insulinorésistance',
  INFLAM: 'Inflammaging',
  DYSBIOSE: 'Dysbiose',
};

const FR_MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

export interface ConsultationStatsRow {
  id?: string;
  created_at?: string | null;
  patient_profile_id?: string | null;
  detected_bottlenecks?: unknown;
  selected_levers?: unknown;
  ebm_summary?: EbmSummaryLike | null;
  output_dish?: { ebm_summary?: EbmSummaryLike } | null;
}

export interface PractitionerStats {
  total_consultations: number;
  consultations_this_month: number;
  patients_count: number;
  unique_levers_used: number;
  avg_t1_per_dish: number;
  avg_t2_per_dish: number;
  bottleneck_distribution: { bottleneck: string; count: number; label: string }[];
  top_levers: { lever: string; name: string; count: number; tier: string }[];
  monthly_activity: { month: string; consultations: number }[];
}

export function emptyPractitionerStats(now = new Date()): PractitionerStats {
  return {
    total_consultations: 0,
    consultations_this_month: 0,
    patients_count: 0,
    unique_levers_used: 0,
    avg_t1_per_dish: 0,
    avg_t2_per_dish: 0,
    bottleneck_distribution: [
      { bottleneck: 'IR', count: 0, label: BOTTLENECK_LABEL.IR },
      { bottleneck: 'INFLAM', count: 0, label: BOTTLENECK_LABEL.INFLAM },
      { bottleneck: 'DYSBIOSE', count: 0, label: BOTTLENECK_LABEL.DYSBIOSE },
    ],
    top_levers: [],
    monthly_activity: lastSixMonths(now).map((month) => ({ month, consultations: 0 })),
  };
}

function lastSixMonths(now: Date): string[] {
  const labels: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push(FR_MONTHS[d.getMonth()]);
  }
  return labels;
}

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function aggregateConsultationStats(
  rows: ConsultationStatsRow[],
  now = new Date()
): PractitionerStats {
  const stats = emptyPractitionerStats(now);
  if (!rows.length) return stats;

  stats.total_consultations = rows.length;

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const patientIds = new Set<string>();
  const bottleneckCounts: Record<string, number> = { IR: 0, INFLAM: 0, DYSBIOSE: 0 };
  const leverCounts = new Map<string, { name: string; count: number; tier: string }>();
  let t1Sum = 0;
  let t2Sum = 0;

  const monthBuckets = new Map<string, number>();
  const windowKeys: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = monthKey(d);
    windowKeys.push(key);
    monthBuckets.set(key, 0);
  }

  for (const row of rows) {
    const created = row.created_at ? new Date(row.created_at) : null;
    if (created && created >= monthStart) stats.consultations_this_month += 1;
    if (row.patient_profile_id) patientIds.add(row.patient_profile_id);

    const bn = asDetectedBottlenecks(row.detected_bottlenecks);
    const dominant = bn?.dominant;
    if (dominant && bottleneckCounts[dominant] !== undefined) {
      bottleneckCounts[dominant] += 1;
    }

    const ebm = getEbmSummary(row);
    t1Sum += ebm?.T1_count ?? 0;
    t2Sum += ebm?.T2_count ?? 0;

    const levers = Array.isArray(row.selected_levers) ? row.selected_levers : [];
    for (const lever of levers as Array<Record<string, unknown>>) {
      const id = String(lever.lever_id ?? '');
      if (!id) continue;
      const prev = leverCounts.get(id);
      const name = String(lever.name_fr ?? id);
      const tier = String(lever.tier_for_active_bottleneck ?? lever.ebm_tier ?? 'T2');
      leverCounts.set(id, {
        name,
        tier,
        count: (prev?.count ?? 0) + 1,
      });
    }

    if (created) {
      const key = monthKey(created);
      if (monthBuckets.has(key)) {
        monthBuckets.set(key, (monthBuckets.get(key) ?? 0) + 1);
      }
    }
  }

  stats.patients_count = patientIds.size;
  stats.unique_levers_used = leverCounts.size;
  stats.avg_t1_per_dish = round1(t1Sum / rows.length);
  stats.avg_t2_per_dish = round1(t2Sum / rows.length);
  stats.bottleneck_distribution = (['IR', 'INFLAM', 'DYSBIOSE'] as const).map((id) => ({
    bottleneck: id,
    count: bottleneckCounts[id],
    label: BOTTLENECK_LABEL[id],
  }));
  stats.top_levers = [...leverCounts.entries()]
    .map(([lever, v]) => ({ lever, ...v }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
  stats.monthly_activity = windowKeys.map((key, i) => ({
    month: stats.monthly_activity[i].month,
    consultations: monthBuckets.get(key) ?? 0,
  }));

  return stats;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
