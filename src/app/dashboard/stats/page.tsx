'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { isExplicitMockDataEnabled } from '@/lib/security/mock-mode';
import { MOCK_STATS } from '@/lib/dashboard/mock-data';
import { aggregateConsultationStats, emptyPractitionerStats, type PractitionerStats } from '@/lib/dashboard/stats';
import { DataErrorBanner, MockDataBanner } from '@/components/DataStatusBanners';

const BOTTLENECK_COLORS: Record<string, string> = {
  IR: 'bg-tier-t1',
  INFLAM: 'bg-tier-t2',
  DYSBIOSE: 'bg-tier-t3',
};

export default function StatsPage() {
  const [stats, setStats] = useState<PractitionerStats>(emptyPractitionerStats());
  const [usingMock, setUsingMock] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    async function load() {
      if (isExplicitMockDataEnabled()) {
        setStats(MOCK_STATS);
        setUsingMock(true);
        setHasData(true);
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const { data, error } = await supabase
        .from('consultations')
        .select('id, created_at, patient_profile_id, detected_bottlenecks, selected_levers, ebm_summary, output_dish')
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) {
        setLoadError(error.message);
        setStats(emptyPractitionerStats());
        setHasData(false);
      } else {
        const rows = data ?? [];
        setStats(aggregateConsultationStats(rows));
        setHasData(rows.length > 0);
      }
      setLoading(false);
    }
    load();
  }, []);

  const maxBottleneck = Math.max(1, ...stats.bottleneck_distribution.map((b) => b.count));
  const maxLever = Math.max(1, ...stats.top_levers.map((l) => l.count));
  const maxMonthly = Math.max(1, ...stats.monthly_activity.map((m) => m.consultations));
  const ebmTotal = stats.avg_t1_per_dish + stats.avg_t2_per_dish;

  return (
    <div>
      <div className="mb-8">
        <p className="label">LIV-63</p>
        <h1 className="font-serif text-3xl text-ink-900 tracking-editorial">Statistiques</h1>
        <p className="text-sm text-ink-600 mt-1">
          {usingMock
            ? 'Aperçu (données de démonstration opt-in)'
            : hasData
            ? 'Vue d\'ensemble de votre activité'
            : 'Aucune consultation agrégée pour le moment'}
        </p>
      </div>

      {loadError && (
        <div className="mb-6">
          <DataErrorBanner message={loadError} />
        </div>
      )}

      {loading ? (
        <p className="text-sm text-ink-500">Chargement...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              { label: 'Consultations totales', value: stats.total_consultations, icon: '📋' },
              { label: 'Ce mois-ci', value: stats.consultations_this_month, icon: '📈' },
              { label: 'Patients', value: stats.patients_count, icon: '👤' },
              { label: 'Leviers différents', value: stats.unique_levers_used, icon: '🔧' },
            ].map((kpi) => (
              <div key={kpi.label} className="card !p-4">
                <p className="text-2xl mb-1">{kpi.icon}</p>
                <p className="font-mono text-2xl font-bold text-ink-900">{kpi.value}</p>
                <p className="text-xs text-ink-600 mt-1">{kpi.label}</p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-10">
            <div className="card !p-5">
              <p className="label">Répartition des bottlenecks</p>
              <div className="space-y-3 mt-4">
                {stats.bottleneck_distribution.map((b) => (
                  <div key={b.bottleneck}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-ink-800">{b.label}</span>
                      <span className="font-mono text-ink-600">{b.count}</span>
                    </div>
                    <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${BOTTLENECK_COLORS[b.bottleneck]}`}
                        style={{ width: `${(b.count / maxBottleneck) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-4 text-xs text-ink-500">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-tier-t1" /> IR</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-tier-t2" /> INFLAM</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-tier-t3" /> DYSBIOSE</span>
              </div>
            </div>

            <div className="card !p-5">
              <p className="label">Activité mensuelle</p>
              <div className="flex items-end gap-3 mt-4 h-32">
                {stats.monthly_activity.map((m) => (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] font-mono text-ink-600">{m.consultations}</span>
                    <div
                      className="w-full bg-saffron-700 rounded-sm transition-all"
                      style={{ height: `${(m.consultations / maxMonthly) * 100}%` }}
                    />
                    <span className="text-[10px] text-ink-500">{m.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card !p-5 mb-8">
            <p className="label">Top leviers les plus prescrits</p>
            {stats.top_levers.length === 0 ? (
              <p className="text-sm text-ink-500 mt-4">Pas encore de leviers agrégés.</p>
            ) : (
              <div className="mt-4 space-y-2">
                {stats.top_levers.map((l) => (
                  <div key={l.lever} className="flex items-center gap-3">
                    <span className="text-[10px] font-mono font-bold text-ink-400 w-6">{l.count}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-0.5">
                        <span className="text-ink-800">{l.name}</span>
                        <span className={`text-[10px] font-mono font-bold ${
                          l.tier === 'T1' ? 'text-tier-t1' : l.tier === 'T2' ? 'text-tier-t2' : 'text-tier-t3'
                        }`}>{l.tier}</span>
                      </div>
                      <div className="h-1.5 bg-ink-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            l.tier === 'T1' ? 'bg-tier-t1' : l.tier === 'T2' ? 'bg-tier-t2' : 'bg-tier-t3'
                          }`}
                          style={{ width: `${(l.count / maxLever) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card !p-5 bg-tier-t1/5 border-tier-t1/20">
            <p className="label">Qualité EBM moyenne</p>
            <div className="flex items-center gap-6 mt-3">
              <div className="text-center">
                <p className="font-mono text-3xl font-bold text-tier-t1">{stats.avg_t1_per_dish}</p>
                <p className="text-xs text-ink-600">T1 moyen/plat</p>
              </div>
              <div className="text-center">
                <p className="font-mono text-3xl font-bold text-tier-t2">{stats.avg_t2_per_dish}</p>
                <p className="text-xs text-ink-600">T2 moyen/plat</p>
              </div>
              <div className="text-xs text-ink-500 leading-relaxed ml-4 border-l border-ink-200 pl-4">
                {ebmTotal > 0 ? (
                  <>
                    Chaque plat mobilise en moyenne {ebmTotal} leviers,
                    dont <strong className="text-tier-t1">{Math.round((stats.avg_t1_per_dish / ebmTotal) * 100)}%</strong> de niveau de preuve T1.
                  </>
                ) : (
                  <>Les moyennes T1/T2 apparaîtront dès la première consultation persistée.</>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {usingMock && <MockDataBanner />}
    </div>
  );
}
