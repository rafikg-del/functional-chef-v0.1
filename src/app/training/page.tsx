'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { DossierUpload } from '@/components/DossierUpload';
import type {
  ProcessSummary,
  TrainingBatch,
  TrainingBatchDetail,
  UploadSummary,
} from '@/lib/training/types';

export default function TrainingPage() {
  const [batches, setBatches] = useState<TrainingBatch[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<TrainingBatchDetail | null>(null);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadBatches = useCallback(async () => {
    try {
      const res = await fetch('/api/training/batches');
      const data = await res.json();
      setBatches(data.batches ?? []);
    } catch {
      setError('Impossible de charger les lots');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDetail = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/training/batches/${id}`);
      if (!res.ok) throw new Error('Batch introuvable');
      const data = (await res.json()) as TrainingBatchDetail;
      setDetail(data);
      setSelectedId(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur chargement');
    }
  }, []);

  useEffect(() => {
    loadBatches();
  }, [loadBatches]);

  function handleUploaded(summary: UploadSummary) {
    setBatches((prev) => [summary.batch, ...prev]);
    loadDetail(summary.batch.id);
    if (summary.errors.length > 0) {
      setError(
        `${summary.imported} importé(s), ${summary.skipped} ignoré(s). Voir détails ci-dessous.`
      );
    }
  }

  async function handleProcess() {
    if (!selectedId) return;
    setProcessing(true);
    setError('');
    try {
      const res = await fetch('/api/training/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batch_id: selectedId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      const summary = data as ProcessSummary;
      await loadDetail(selectedId);
      await loadBatches();
      if (summary.matched > 0 || summary.processed > 0) {
        setError('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur traitement');
    } finally {
      setProcessing(false);
    }
  }

  function handleExport() {
    if (!selectedId) return;
    window.open(`/api/training/export/${selectedId}`, '_blank');
  }

  const accuracy =
    detail && detail.dossiers.filter((d) => d.expected_dominant).length > 0
      ? Math.round(
          (detail.matched_count /
            detail.dossiers.filter((d) => d.expected_dominant).length) *
            100
        )
      : null;

  return (
    <main className="min-h-screen">
      <header className="border-b border-ink-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-baseline justify-between">
          <div className="flex items-baseline gap-3">
            <Link href="/" className="font-serif text-xl tracking-tight text-ink-900 hover:text-saffron-700">
              Functional Chef
            </Link>
            <span className="text-xs uppercase tracking-widest text-saffron-700 font-medium">
              Entraînement
            </span>
          </div>
          <nav className="text-sm text-ink-600 flex gap-6">
            <Link href="/consultation" className="hover:text-ink-900 transition-colors">
              Consultation
            </Link>
            <Link href="/training" className="text-ink-900 font-medium">
              Entraînement
            </Link>
          </nav>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        <section>
          <p className="text-xs uppercase tracking-widest text-saffron-700 mb-3">
            Dataset patient
          </p>
          <h1 className="font-serif text-3xl text-ink-900 mb-3">
            Entraîner le modèle sur vos dossiers
          </h1>
          <p className="text-ink-600 max-w-2xl">
            Importez plusieurs dossiers patients, lancez la classification batch et exportez un
            dataset JSONL pour affiner ou évaluer le moteur.
          </p>
        </section>

        {error && (
          <div className="rounded-sm border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {error}
          </div>
        )}

        <DossierUpload onUploaded={handleUploaded} onError={setError} disabled={processing} />

        <div className="grid lg:grid-cols-3 gap-8">
          <aside className="lg:col-span-1 space-y-3">
            <h3 className="label">Lots importés</h3>
            {loading ? (
              <p className="text-sm text-ink-500 italic">Chargement…</p>
            ) : batches.length === 0 ? (
              <p className="text-sm text-ink-500 italic">Aucun lot. Importez des dossiers ci-dessus.</p>
            ) : (
              <ul className="space-y-2">
                {batches.map((b) => (
                  <li key={b.id}>
                    <button
                      type="button"
                      onClick={() => loadDetail(b.id)}
                      className={`w-full text-left px-3 py-2 rounded-sm border text-sm transition-colors ${
                        selectedId === b.id
                          ? 'bg-saffron-50 border-saffron-500 text-saffron-900'
                          : 'bg-white border-ink-200 hover:border-ink-400'
                      }`}
                    >
                      <span className="font-medium block truncate">{b.name}</span>
                      <span className="text-xs text-ink-500">
                        {b.dossier_count} dossier(s) · {b.status}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </aside>

          <section className="lg:col-span-2 space-y-4">
            {!detail ? (
              <div className="card p-8 text-center text-ink-500 text-sm">
                Sélectionnez un lot ou importez des dossiers pour commencer.
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleProcess}
                    disabled={processing || detail.dossier_count === 0}
                    className="btn-primary"
                  >
                    {processing ? 'Traitement…' : 'Lancer l\'entraînement (classifier)'}
                  </button>
                  <button
                    type="button"
                    onClick={handleExport}
                    disabled={detail.processed_count === 0}
                    className="btn-ghost border border-ink-200"
                  >
                    Exporter JSONL
                  </button>
                  {accuracy !== null && detail.processed_count > 0 && (
                    <span className="text-sm text-ink-600 ml-auto">
                      Précision labels :{' '}
                      <span className="biomarker-value font-medium">{accuracy}%</span> (
                      {detail.matched_count}/
                      {detail.dossiers.filter((d) => d.expected_dominant).length})
                    </span>
                  )}
                </div>

                <div className="card overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-ink-50 border-b border-ink-200">
                      <tr>
                        <th className="text-left px-4 py-2 label">Dossier</th>
                        <th className="text-left px-4 py-2 label">Prédit</th>
                        <th className="text-left px-4 py-2 label">Attendu</th>
                        <th className="text-left px-4 py-2 label">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.dossiers.map((d) => (
                        <tr key={d.id} className="border-b border-ink-100 last:border-0">
                          <td className="px-4 py-2">
                            <span className="font-medium">{d.folder_name}</span>
                            {d.profile.external_id && (
                              <span className="block text-xs text-ink-500 biomarker-value">
                                {d.profile.external_id}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2 biomarker-value">
                            {d.predicted_dominant ?? '—'}
                          </td>
                          <td className="px-4 py-2 biomarker-value">
                            {d.expected_dominant ?? '—'}
                          </td>
                          <td className="px-4 py-2">
                            {d.status === 'processed' && d.match_expected === true && (
                              <span className="text-green-700 text-xs">✓ match</span>
                            )}
                            {d.status === 'processed' && d.match_expected === false && (
                              <span className="text-red-700 text-xs">✗ écart</span>
                            )}
                            {d.status === 'processed' && d.match_expected === undefined && (
                              <span className="text-ink-500 text-xs">traité</span>
                            )}
                            {d.status === 'parsed' && (
                              <span className="text-ink-400 text-xs">en attente</span>
                            )}
                            {d.status === 'error' && (
                              <span className="text-red-600 text-xs" title={d.error_message}>
                                erreur
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {detail.dossiers.some((d) => d.error_message) && (
                  <div className="text-xs text-ink-500 space-y-1">
                    {detail.dossiers
                      .filter((d) => d.error_message)
                      .map((d) => (
                        <p key={d.id}>
                          {d.folder_name}: {d.error_message}
                        </p>
                      ))}
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
