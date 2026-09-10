'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { isExplicitMockDataEnabled } from '@/lib/security/mock-mode';
import { MOCK_CONSULTATIONS } from '@/lib/dashboard/mock-data';
import {
  getCoDominantBottleneck,
  getDominantBottleneck,
  getEbmSummary,
} from '@/lib/dashboard/consultation-shape';
import { DataErrorBanner, MockDataBanner } from '@/components/DataStatusBanners';

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
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'validated'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      if (isExplicitMockDataEnabled()) {
        setConsultations(MOCK_CONSULTATIONS);
        setUsingMock(true);
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        setLoadError(error.message);
        setConsultations([]);
      } else {
        setConsultations(data ?? []);
      }
      setLoading(false);
    }
    load();
  }, []);

  const filtered = consultations.filter((c) => {
    if (filter === 'pending' && c.validated_at) return false;
    if (filter === 'validated' && !c.validated_at) return false;
    if (search && !String(c.intent || '').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="label">LIV-60</p>
          <h1 className="font-serif text-3xl text-ink-900 tracking-editorial">Consultations</h1>
          <p className="text-sm text-ink-600 mt-1">
            {usingMock
              ? 'Aperçu (données de démonstration opt-in)'
              : loadError
              ? 'Chargement interrompu'
              : `${consultations.length} consultation${consultations.length === 1 ? '' : 's'}`}
          </p>
        </div>
        <Link href="/consultation" className="btn-primary text-sm !py-2.5 !px-5">
          + Nouvelle consultation
        </Link>
      </div>

      {loadError && (
        <div className="mb-6">
          <DataErrorBanner message={loadError} />
        </div>
      )}

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

      {loading ? (
        <div className="text-center py-20">
          <p className="text-sm text-ink-500">Chargement...</p>
        </div>
      ) : loadError ? null : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-sm text-ink-500">Aucune consultation trouvée.</p>
          <Link href="/consultation" className="text-xs text-saffron-700 hover:underline mt-2 inline-block">
            Créer la première consultation →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => {
            const bn = getDominantBottleneck(c.detected_bottlenecks);
            const co = getCoDominantBottleneck(c.detected_bottlenecks);
            const ebm = getEbmSummary(c);
            const validated = !!c.validated_at;
            return (
              <Link
                key={c.id}
                href={`/dashboard/consultations/${c.id}`}
                className="card !p-4 flex items-center gap-4 hover:border-saffron-500 transition-colors group"
              >
                <div className={`w-2 h-2 rounded-full shrink-0 ${
                  validated ? 'bg-tier-t1' : 'bg-tier-t2'
                }`} />

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink-900 font-medium truncate group-hover:text-saffron-700 transition-colors">
                    {c.intent}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-ink-500">
                    <span>{MEAL_LABEL[c.meal_type] || c.meal_type}</span>
                    <span>·</span>
                    {bn && (
                      <span className="font-mono font-bold text-ink-700" title={BOTTLENECK_LABEL[bn] || bn}>
                        {bn}
                      </span>
                    )}
                    {co && <span className="text-ink-400">+ {co}</span>}
                    <span>·</span>
                    <span>{c.created_at ? new Date(c.created_at).toLocaleDateString('fr-FR') : '—'}</span>
                    {c.llm_model && (
                      <>
                        <span>·</span>
                        <span className="font-mono text-[10px]">{c.llm_model.includes('opus') ? 'Opus' : 'Sonnet'}</span>
                      </>
                    )}
                  </div>
                </div>

                {ebm && (
                  <div className="flex gap-2 text-[10px] font-mono shrink-0">
                    {(ebm.T1_count ?? 0) > 0 && (
                      <span className="text-tier-t1">T1×{ebm.T1_count}</span>
                    )}
                    {(ebm.T2_count ?? 0) > 0 && (
                      <span className="text-tier-t2">T2×{ebm.T2_count}</span>
                    )}
                  </div>
                )}

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

      {usingMock && <MockDataBanner />}
    </div>
  );
}
