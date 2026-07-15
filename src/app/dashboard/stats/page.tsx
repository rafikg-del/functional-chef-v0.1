'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

const MOCK_STATS = {
  total_consultations: 47,
  consultations_this_month: 12,
  patients_count: 18,
  unique_levers_used: 24,
  avg_t1_per_dish: 4.7,
  avg_t2_per_dish: 3.1,
  bottleneck_distribution: [
    { bottleneck: 'IR', count: 22, label: 'Insulinorésistance' },
    { bottleneck: 'INFLAM', count: 15, label: 'Inflammaging' },
    { bottleneck: 'DYSBIOSE', count: 10, label: 'Dysbiose' },
  ],
  top_levers: [
    { lever: 'L_EVOO_PRIMARY', name: 'Huile olive EVOO', count: 45, tier: 'T1' },
    { lever: 'L_LEGUMINOUSES_REGULAR', name: 'Légumineuses', count: 38, tier: 'T1' },
    { lever: 'L_NUTS_MIX_30G', name: 'Oléagineux', count: 32, tier: 'T1' },
    { lever: 'L_FIBER_30G', name: 'Fibres 30-40g/j', count: 29, tier: 'T1' },
    { lever: 'L_CRUCIFEROUS_STEAM', name: 'Crucifères vapeur', count: 27, tier: 'T1' },
    { lever: 'L_FATTY_FISH_2X', name: 'Poisson gras', count: 25, tier: 'T1' },
    { lever: 'L_COFFEE_FILTER', name: 'Café filtre', count: 22, tier: 'T2' },
    { lever: 'L_VINEGAR_PRE_PRANDIAL', name: 'Vinaigre pré-prandial', count: 20, tier: 'T1' },
  ],
  monthly_activity: [
    { month: 'Fév', consultations: 3 },
    { month: 'Mar', consultations: 7 },
    { month: 'Avr', consultations: 9 },
    { month: 'Mai', consultations: 6 },
    { month: 'Juin', consultations: 10 },
    { month: 'Juil', consultations: 12 },
  ],
};

const BOTTLENECK_COLORS: Record<string, string> = {
  IR: 'bg-tier-t1',
  INFLAM: 'bg-tier-t2',
  DYSBIOSE: 'bg-tier-t3',
};

export default function StatsPage() {
  const [stats, setStats] = useState(MOCK_STATS);
  const [usingMock, setUsingMock] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .limit(1);

      if (!error && data?.length) {
        setUsingMock(false);
        // In production, aggregate stats from real data
      }
    }
    load();
  }, []);

  const maxBottleneck = Math.max(...stats.bottleneck_distribution.map((b) => b.count));
  const maxLever = Math.max(...stats.top_levers.map((l) => l.count));
  const maxMonthly = Math.max(...stats.monthly_activity.map((m) => m.consultations));

  return (
    <div>
      <div className="mb-8">
        <p className="label">LIV-63</p>
        <h1 className="font-serif text-3xl text-ink-900 tracking-editorial">Statistiques</h1>
        <p className="text-sm text-ink-600 mt-1">
          {usingMock ? 'Aperçu (données de démonstration)' : 'Vue d\'ensemble de votre activité'}
        </p>
      </div>

      {/* KPI cards */}
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
        {/* Bottleneck distribution */}
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

        {/* Monthly activity */}
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

      {/* Top levers */}
      <div className="card !p-5 mb-8">
        <p className="label">Top leviers les plus prescrits</p>
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
      </div>

      {/* EBM summary */}
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
            Chaque plat mobilise en moyenne {stats.avg_t1_per_dish + stats.avg_t2_per_dish} leviers, 
            dont <strong className="text-tier-t1">{Math.round((stats.avg_t1_per_dish / (stats.avg_t1_per_dish + stats.avg_t2_per_dish)) * 100)}%</strong> de niveau de preuve T1.
          </div>
        </div>
      </div>

      {usingMock && (
        <div className="mt-6 p-4 bg-amber-50/50 border border-amber-200 rounded-sm">
          <p className="text-xs text-amber-800 font-medium mb-1">⚠️ Données de démonstration</p>
          <p className="text-[11px] text-amber-700">
            Les statistiques réelles apparaîtront une fois Supabase connecté et les consultations enregistrées.
          </p>
        </div>
      )}
    </div>
  );
}
