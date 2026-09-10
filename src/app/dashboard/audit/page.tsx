'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { isExplicitMockDataEnabled } from '@/lib/security/mock-mode';
import { DataErrorBanner, MockDataBanner } from '@/components/DataStatusBanners';

interface AuditRow {
  id: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  engine_version: string | null;
  created_at: string;
}

export default function AuditPage() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState('');
  const [search, setSearch] = useState('');
  const usingMock = isExplicitMockDataEnabled();

  useEffect(() => {
    async function load() {
      if (usingMock) {
        setLoading(false);
        return;
      }
      const supabase = createClient();
      const { data, error } = await supabase
        .from('audit_log')
        .select('id, action, entity_type, entity_id, metadata, engine_version, created_at')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) setLoadError(error.message);
      else setRows((data as AuditRow[]) ?? []);
      setLoading(false);
    }
    load();
  }, [usingMock]);

  const actions = Array.from(new Set(rows.map((r) => r.action))).sort();
  const filtered = rows.filter((r) => {
    if (actionFilter && r.action !== actionFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        r.action.toLowerCase().includes(q) ||
        (r.entity_id || '').toLowerCase().includes(q) ||
        (r.entity_type || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div>
      <p className="label">LIV-37</p>
      <h1 className="font-serif text-3xl text-ink-900 tracking-editorial mb-2">Journal d’audit</h1>
      <p className="text-sm text-ink-600 mb-8">
        Vos actions seulement (RLS). Pas de biomarqueurs ni de notes cliniques dans les métadonnées.
      </p>

      {usingMock && (
        <div className="mb-6">
          <MockDataBanner />
          <p className="text-xs text-ink-500 mt-3">Le journal d’audit n’existe pas en mode mock.</p>
        </div>
      )}

      {loadError && (
        <div className="mb-6">
          <DataErrorBanner message={loadError} />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="input-field text-sm max-w-xs"
        >
          <option value="">Toutes les actions</option>
          {actions.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filtrer par id / type…"
          className="input-field text-sm flex-1 max-w-xs"
        />
      </div>

      {loading ? (
        <p className="text-sm text-ink-500">Chargement...</p>
      ) : filtered.length === 0 && !usingMock && !loadError ? (
        <p className="text-sm text-ink-500">Aucune entrée d’audit pour le moment.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => (
            <div key={r.id} className="card !p-4">
              <div className="flex items-baseline justify-between gap-4">
                <p className="font-mono text-xs font-bold text-ink-800">{r.action}</p>
                <p className="text-[11px] text-ink-500">
                  {new Date(r.created_at).toLocaleString('fr-FR')}
                </p>
              </div>
              <p className="text-[11px] text-ink-500 mt-1">
                {r.entity_type || '—'} {r.entity_id ? `· ${r.entity_id.slice(0, 12)}…` : ''}
                {r.engine_version ? ` · engine ${r.engine_version}` : ''}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
