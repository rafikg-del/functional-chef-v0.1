'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

// Mock data for development when Supabase isn't connected
const MOCK_CONSULTATIONS = [
  {
    id: 'mock-001',
    patient_id: 'pat-001',
    intent: 'Dîner anti-IR ciblé, post-charge glucidique du matin',
    meal_type: 'dinner',
    detected_bottlenecks: { dominant: 'IR', co_dominant: null },
    llm_model: 'claude-sonnet-4-20250514',
    created_at: '2026-07-14T14:30:00Z',
    validated_at: null,
    ebm_summary: { T1_count: 5, T2_count: 3, T3_count: 0 },
  },
  {
    id: 'mock-002',
    patient_id: 'pat-002',
    intent: 'Déjeuner anti-inflammatoire, CRP-us à 2.4',
    meal_type: 'lunch',
    detected_bottlenecks: { dominant: 'INFLAM', co_dominant: null },
    llm_model: 'claude-sonnet-4-20250514',
    created_at: '2026-07-13T09:15:00Z',
    validated_at: '2026-07-13T18:00:00Z',
    ebm_summary: { T1_count: 4, T2_count: 4, T3_count: 1 },
  },
  {
    id: 'mock-003',
    patient_id: 'pat-003',
    intent: 'Petit-déjeuner pro-microbiote post-antibiothérapie',
    meal_type: 'breakfast',
    detected_bottlenecks: { dominant: 'DYSBIOSE', co_dominant: 'INFLAM' },
    llm_model: 'claude-sonnet-4-20250514',
    created_at: '2026-07-12T07:45:00Z',
    validated_at: null,
    ebm_summary: { T1_count: 4, T2_count: 2, T3_count: 2 },
  },
  {
    id: 'mock-004',
    patient_id: 'pat-004',
    intent: 'Déjeuner anti-stéatose hépatique',
    meal_type: 'lunch',
    detected_bottlenecks: { dominant: 'IR', co_dominant: null, phenotypes: ['hepatic_masld'] },
    llm_model: 'claude-opus-4-7',
    created_at: '2026-07-10T12:00:00Z',
    validated_at: '2026-07-10T17:30:00Z',
    ebm_summary: { T1_count: 6, T2_count: 3, T3_count: 0 },
  },
];

const BOTTLENECK_LABEL: Record<string, string> = {
  IR: 'Insulinorésistance',
  INFLAM: 'Inflammaging',
  DYSBIOSE: 'Dysbiose',
};

const MEAL_LABEL: Record<string, string> = {
  breakfast: 'Petit-déj',
  lunch: 'Déjeuner',
  dinner: 'Dîner',
  snack: 'Collation',
  full_day: 'Journée',
};

export default function ConsultationsPage() {
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'validated'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error || !data?.length) {
        setConsultations(MOCK_CONSULTATIONS);
        setUsingMock(true);
      } else {
        setConsultations(data);
      }
      setLoading(false);
    }
    load();
  }, []);

  const filtered = consultations.filter((c) => {
    if (filter === 'pending' && c.validated_at) return false;
    if (filter === 'validated' && !c.validated_at) return false;
    if (search && !c.intent.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="label">LIV-60</p>
          <h1 className="font-serif text-3xl text-ink-900 tracking-editorial">Consultations</h1>
          <p className="text-sm text-ink-600 mt-1">
            {usingMock ? 'Aperçu (données de démonstration)' : `${consultations.length} consultations`}
          </p>
        </div>
        <Link href="/consultation" className="btn-primary text-sm !py-2.5 !px-5">
          + Nouvelle consultation
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex border border-ink-200 rounded-sm overflow-hidden">
          {(['all', 'pending', 'validated'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 text-xs font-medium transition-colors ${
                filter === f ? 'bg-ink-800 text-ink-50' : 'bg-white text-ink-600 hover:bg-ink-100'
              }`}
            >
              {f === 'all' ? 'Toutes' : f === 'pending' ? 'En attente' : 'Validées'}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher dans l'intent..."
          className="input-field text-sm flex-1 max-w-xs"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-20">
          <p className="text-sm text-ink-500">Chargement...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-sm text-ink-500">Aucune consultation trouvée.</p>
          <Link href="/consultation" className="text-xs text-saffron-700 hover:underline mt-2 inline-block">
            Créer la première consultation →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => {
            const bn = c.detected_bottlenecks?.dominant;
            const validated = !!c.validated_at;
            return (
              <Link
                key={c.id}
                href={`/dashboard/consultations/${c.id}`}
                className="card !p-4 flex items-center gap-4 hover:border-saffron-500 transition-colors group"
              >
                {/* Status dot */}
                <div className={`w-2 h-2 rounded-full shrink-0 ${
                  validated ? 'bg-tier-t1' : 'bg-tier-t2'
                }`} />

                {/* Main info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink-900 font-medium truncate group-hover:text-saffron-700 transition-colors">
                    {c.intent}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-ink-500">
                    <span>{MEAL_LABEL[c.meal_type] || c.meal_type}</span>
                    <span>·</span>
                    {bn && <span className="font-mono font-bold text-ink-700">{bn}</span>}
                    {c.detected_bottlenecks?.co_dominant && (
                      <span className="text-ink-400">+ {c.detected_bottlenecks.co_dominant}</span>
                    )}
                    <span>·</span>
                    <span>{new Date(c.created_at).toLocaleDateString('fr-FR')}</span>
                    {c.llm_model && (
                      <>
                        <span>·</span>
                        <span className="font-mono text-[10px]">{c.llm_model.includes('opus') ? 'Opus' : 'Sonnet'}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* EBM summary */}
                {c.ebm_summary && (
                  <div className="flex gap-2 text-[10px] font-mono shrink-0">
                    {c.ebm_summary.T1_count > 0 && (
                      <span className="text-tier-t1">T1×{c.ebm_summary.T1_count}</span>
                    )}
                    {c.ebm_summary.T2_count > 0 && (
                      <span className="text-tier-t2">T2×{c.ebm_summary.T2_count}</span>
                    )}
                  </div>
                )}

                {/* Validation badge */}
                <div className={`text-[10px] font-medium px-2 py-1 rounded-sm shrink-0 ${
                  validated
                    ? 'bg-tier-t1/10 text-tier-t1'
                    : 'bg-tier-t2/10 text-tier-t2'
                }`}>
                  {validated ? 'Validée' : 'En attente'}
                </div>

                <span className="text-ink-300 group-hover:text-ink-500 transition-colors text-sm">→</span>
              </Link>
            );
          })}
        </div>
      )}

      {usingMock && (
        <div className="mt-6 p-4 bg-amber-50/50 border border-amber-200 rounded-sm">
          <p className="text-xs text-amber-800 font-medium mb-1">⚠️ Données de démonstration</p>
          <p className="text-[11px] text-amber-700">
            Connectez Supabase et exécutez la migration 002 pour voir vos vraies consultations.
          </p>
        </div>
      )}
    </div>
  );
}
