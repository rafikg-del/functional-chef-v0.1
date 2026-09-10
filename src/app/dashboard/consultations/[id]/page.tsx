'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { EBMBadge } from '@/components/EBMBadge';
import { generateConsultationPdf } from '@/lib/pdf/generate-consultation-pdf';
import { isExplicitMockDataEnabled } from '@/lib/security/mock-mode';
import { MOCK_DETAIL } from '@/lib/dashboard/mock-data';
import {
  asDetectedBottlenecks,
  getEbmSummary,
  getLlmMeta,
} from '@/lib/dashboard/consultation-shape';
import { DataErrorBanner, MockDataBanner } from '@/components/DataStatusBanners';
import { canonicalConsultationPayload } from '@/lib/security/content-hash';

export default function ConsultationDetailPage() {
  const params = useParams();
  const [consultation, setConsultation] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [validationNote, setValidationNote] = useState('');
  const [usingMock, setUsingMock] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const id = params.id as string;

      if (isExplicitMockDataEnabled()) {
        const mock = MOCK_DETAIL[id];
        if (mock) {
          setConsultation(mock);
          setUsingMock(true);
        } else {
          setLoadError('Consultation de démonstration introuvable.');
        }
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profData } = await supabase
          .from('professional_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        setProfile(profData);
      }

      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        setLoadError(error.message);
      } else if (!data) {
        setLoadError(null);
        setConsultation(null);
      } else {
        setConsultation(data);
      }
      setLoading(false);
    }
    load();
  }, [params.id]);

  async function handleValidate() {
    setValidating(true);
    setActionError(null);

    if (usingMock) {
      setConsultation({
        ...consultation,
        validated_at: new Date().toISOString(),
        validated_by: profile?.full_name || 'Dr démo',
        validation_notes: validationNote || null,
      });
      setValidating(false);
      return;
    }

    const res = await fetch(`/api/consultations/${params.id}/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: validationNote || null }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setActionError(body.error || 'La validation a échoué — aucun tampon local n’a été appliqué.');
      setValidating(false);
      return;
    }
    setConsultation(body.consultation);
    setValidating(false);
  }

  async function persistExportHash(contentHash: string) {
    if (usingMock) return;
    await fetch(`/api/consultations/${params.id}/content-hash`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content_hash: contentHash }),
    });
  }

  async function handleDownloadPdf() {
    setExporting(true);
    setActionError(null);
    try {
      const { doc, contentHash } = await generateConsultationPdf(consultation, profile?.full_name);
      doc.save(`functional-chef-${consultation.id?.slice(0, 8) || 'consultation'}.pdf`);
      await persistExportHash(contentHash);
      setConsultation({ ...consultation, content_hash: contentHash });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Export PDF impossible');
    } finally {
      setExporting(false);
    }
  }

  async function handleDownloadJson() {
    setExporting(true);
    setActionError(null);
    try {
      const { hashConsultationContent } = await import('@/lib/security/content-hash');
      const payload = canonicalConsultationPayload(consultation);
      const contentHash = await hashConsultationContent(consultation);
      const blob = new Blob(
        [JSON.stringify({ ...payload, content_hash: contentHash }, null, 2)],
        { type: 'application/json' }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `functional-chef-${consultation.id?.slice(0, 8) || 'consultation'}.json`;
      a.click();
      URL.revokeObjectURL(url);
      await persistExportHash(contentHash);
      setConsultation({ ...consultation, content_hash: contentHash });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Export JSON impossible');
    } finally {
      setExporting(false);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-ink-500">Chargement...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div>
        <Link href="/dashboard/consultations" className="text-xs text-ink-500 hover:text-ink-700 transition-colors flex items-center gap-1 mb-6">
          ← Retour aux consultations
        </Link>
        <DataErrorBanner title="Consultation inaccessible" message={loadError} />
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-ink-500">Consultation introuvable.</p>
        <Link href="/dashboard/consultations" className="text-xs text-saffron-700 hover:underline mt-2 inline-block">
          ← Retour à la liste
        </Link>
      </div>
    );
  }

  const c = consultation;
  const bn = asDetectedBottlenecks(c.detected_bottlenecks);
  const validated = !!c.validated_at;
  const llmMeta = getLlmMeta(c);
  const ebm = getEbmSummary(c);

  return (
    <div>
      <Link href="/dashboard/consultations" className="text-xs text-ink-500 hover:text-ink-700 transition-colors flex items-center gap-1 mb-6">
        ← Retour aux consultations
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <p className="label mb-0">Consultation</p>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-sm ${
              validated ? 'bg-tier-t1/10 text-tier-t1' : 'bg-tier-t2/10 text-tier-t2'
            }`}>
              {validated ? 'Validée' : 'En attente de validation'}
            </span>
          </div>
          <h1 className="font-serif text-2xl text-ink-900 tracking-editorial">{c.intent}</h1>
          <div className="flex items-center gap-4 mt-2 text-xs text-ink-500">
            <span>{c.created_at ? new Date(c.created_at).toLocaleDateString('fr-FR', { dateStyle: 'long' }) : '—'}</span>
            <span>·</span>
            <span>{c.meal_type === 'breakfast' ? 'Petit-déjeuner' : c.meal_type === 'lunch' ? 'Déjeuner' : c.meal_type === 'dinner' ? 'Dîner' : c.meal_type}</span>
            {llmMeta?.model && <><span>·</span><span className="font-mono">{llmMeta.model}</span></>}
          </div>
        </div>

        {!validated && (
          <div className="shrink-0 ml-6 space-y-2">
            <div className="flex gap-2">
              <button onClick={handleDownloadJson} disabled={exporting} className="btn-ghost !py-2.5 !px-4 text-sm">
                JSON
              </button>
              <button onClick={handleDownloadPdf} disabled={exporting} className="btn-ghost !py-2.5 !px-4 text-sm">
                📄 Export PDF
              </button>
              <button
                onClick={handleValidate}
                disabled={validating}
                className="btn-primary !py-2.5 !px-5 text-sm"
              >
                {validating ? 'Validation...' : '✅ Valider'}
              </button>
            </div>
            <textarea
              value={validationNote}
              onChange={(e) => setValidationNote(e.target.value)}
              placeholder="Note de validation (optionnelle)"
              className="input-field text-xs"
              rows={2}
            />
          </div>
        )}
        {validated && (
          <div className="shrink-0 ml-6 text-right space-y-2">
            <div className="flex gap-2">
              <button onClick={handleDownloadJson} disabled={exporting} className="btn-ghost !py-2 !px-4 text-sm">
                JSON
              </button>
              <button onClick={handleDownloadPdf} disabled={exporting} className="btn-ghost !py-2 !px-4 text-sm">
                📄 Export PDF
              </button>
              <Link href={`/prescription/${params.id}`} className="btn-primary !py-2 !px-5 text-sm">
                🖨️ Prescription
              </Link>
            </div>
            <p className="text-xs text-tier-t1 font-medium">Validée le</p>
            <p className="text-xs text-ink-600">{new Date(c.validated_at).toLocaleDateString('fr-FR', { dateStyle: 'long' })}</p>
            {c.validated_by && <p className="text-xs text-ink-500">par {c.validated_by}</p>}
            {c.validation_notes && <p className="text-xs text-ink-500 mt-1 italic">{c.validation_notes}</p>}
            {c.content_hash && (
              <p className="text-[10px] font-mono text-ink-400 break-all max-w-xs ml-auto">
                SHA-256 {c.content_hash.slice(0, 16)}…
              </p>
            )}
          </div>
        )}
      </div>

      {actionError && (
        <div className="mb-6">
          <DataErrorBanner title="Action refusée" message={actionError} />
        </div>
      )}

      {bn && (
        <section className="mb-8">
          <p className="label">Classification</p>
          <div className="grid grid-cols-3 gap-3 mt-2">
            {(bn.scores || []).map((s: any) => (
              <div key={s.bottleneck_id} className={`card !p-3 border-l-4 ${
                s.is_dominant ? 'border-saffron-700 bg-saffron-50/30' :
                s.is_co_dominant ? 'border-tier-t2 bg-amber-50/20' : 'border-ink-200'
              }`}>
                <div className="flex justify-between items-baseline">
                  <span className="font-mono text-xs font-bold text-ink-600">{s.bottleneck_id}</span>
                  <span className={`text-xs font-mono font-bold ${s.triggered ? 'text-tier-t1' : 'text-ink-400'}`}>
                    {s.score} pts
                  </span>
                </div>
                <p className="text-[11px] text-ink-600 mt-1">
                  Majeurs: {s.major_hits} · Modérés: {s.moderate_hits}
                  {s.discriminant_hits > 0 && ` · Discriminants: ${s.discriminant_hits}`}
                </p>
                {s.is_dominant && <p className="text-[10px] text-saffron-700 font-bold mt-1">← Dominant</p>}
                {s.is_co_dominant && <p className="text-[10px] text-tier-t2 font-bold mt-1">← Co-dominant</p>}
              </div>
            ))}
          </div>
          {bn.rationale && (
            <p className="text-xs text-ink-600 mt-3 italic">{bn.rationale}</p>
          )}
        </section>
      )}

      {c.selected_levers?.length > 0 && (
        <section className="mb-8">
          <p className="label">Leviers sélectionnés</p>
          <div className="space-y-2 mt-2">
            {c.selected_levers.map((l: any) => (
              <div key={l.lever_id} className="card !p-3 flex items-start gap-3">
                <EBMBadge tier={l.tier_for_active_bottleneck} className="shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-baseline justify-between">
                    <p className="text-sm text-ink-900 font-medium">{l.name_fr}</p>
                    <span className={`text-[10px] font-mono ${
                      l.role === 'universal_star' ? 'text-tier-t1' : 'text-ink-500'
                    }`}>
                      {l.role === 'universal_star' ? '★' : l.role}
                    </span>
                  </div>
                  <p className="text-xs text-ink-600 mt-0.5">{l.expected_effect}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <span className="text-[10px] bg-tier-t1/10 text-tier-t1 font-bold px-2 py-0.5 rounded-sm">T1×{ebm?.T1_count ?? '?'}</span>
            <span className="text-[10px] bg-tier-t2/10 text-tier-t2 font-bold px-2 py-0.5 rounded-sm">T2×{ebm?.T2_count ?? '?'}</span>
            {(ebm?.T3_count || 0) > 0 && (
              <span className="text-[10px] bg-tier-t3/10 text-tier-t3 font-bold px-2 py-0.5 rounded-sm">T3×{ebm?.T3_count}</span>
            )}
          </div>
        </section>
      )}

      {c.output_dish && (
        <section className="mb-8">
          <p className="label">Plat composé</p>
          <div className="card !p-5">
            <h2 className="font-serif text-2xl text-ink-900 tracking-editorial">{c.output_dish.title}</h2>
            <p className="text-sm text-ink-600 mt-2">{c.output_dish.description}</p>
            <div className="flex gap-4 mt-3 text-xs text-ink-500">
              <span>{c.output_dish.servings} portions</span>
              <span>·</span>
              <span>{c.output_dish.total_time_min} min</span>
              {c.output_dish.architecture && (
                <><span>·</span><span className="font-mono">{c.output_dish.architecture.vegetables_pct}/{c.output_dish.architecture.protein_pct}/{c.output_dish.architecture.lipid_pct}</span></>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6">
              {['postprandial_2_4h', 'short_term_4_weeks', 'long_term_12_weeks'].map((period) => (
                <div key={period} className="bg-ink-50/50 p-3 rounded-sm">
                  <p className="text-[10px] uppercase tracking-wider text-saffron-700 mb-1 font-medium">
                    {period === 'postprandial_2_4h' ? '2-4h' : period === 'short_term_4_weeks' ? '4 sem' : '12 sem'}
                  </p>
                  <p className="text-xs text-ink-700 leading-relaxed">{c.output_dish.expected_effects?.[period]}</p>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <p className="text-[10px] uppercase tracking-wider text-ink-500 mb-2 font-medium">Ingrédients</p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
                {c.output_dish.ingredients?.map((ing: any, i: number) => (
                  <div key={i} className="flex justify-between border-b border-ink-100 pb-1">
                    <span className="text-ink-800">{ing.name}</span>
                    <span className="biomarker-value text-ink-600 text-xs">{ing.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {c.warnings?.length > 0 && (
        <section className="mb-8 p-4 bg-tier-t3/5 border border-tier-t3/20 rounded-sm">
          <p className="text-xs text-tier-t3 font-medium mb-2">⚠️ Avertissements</p>
          <ul className="space-y-1">
            {c.warnings.map((w: string, i: number) => (
              <li key={i} className="text-xs text-ink-700 flex gap-2"><span className="text-tier-t3 shrink-0">·</span>{w}</li>
            ))}
          </ul>
        </section>
      )}

      {llmMeta && (
        <div className="text-[10px] text-ink-400 font-mono mt-8 pt-4 border-t border-ink-200">
          <span>{llmMeta.model} · in: {llmMeta.input_tokens}t · out: {llmMeta.output_tokens}t · {llmMeta.latency_ms}ms</span>
          <span className="ml-4">id: {c.id?.slice(0, 12)}…</span>
          {c.engine_version && <span className="ml-4">engine: {c.engine_version}</span>}
          {c.content_hash && <span className="ml-4">sha256: {c.content_hash.slice(0, 12)}…</span>}
        </div>
      )}

      {usingMock && <MockDataBanner />}
    </div>
  );
}
