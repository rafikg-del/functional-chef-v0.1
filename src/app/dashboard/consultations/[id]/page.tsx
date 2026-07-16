'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { EBMBadge } from '@/components/EBMBadge';
import { generateConsultationPdf } from '@/lib/pdf/generate-consultation-pdf';

const MOCK_DETAIL: Record<string, any> = {
  'mock-001': {
    id: 'mock-001',
    intent: 'Dîner anti-IR ciblé, post-charge glucidique du matin',
    meal_type: 'dinner',
    detected_bottlenecks: {
      scores: [
        { bottleneck_id: 'IR', score: 9, major_hits: 3, moderate_hits: 1, triggered: true, is_dominant: true },
        { bottleneck_id: 'INFLAM', score: 2, major_hits: 0, moderate_hits: 1, triggered: false },
        { bottleneck_id: 'DYSBIOSE', score: 0, major_hits: 0, moderate_hits: 0, triggered: false },
      ],
      dominant: 'IR',
      co_dominant: null,
      rationale: 'Bottleneck dominant unique: IR (score 9, 3 majeurs).',
    },
    selected_levers: [
      { lever_id: 'L_EVOO_PRIMARY', name_fr: 'Huile olive EVOO', ebm_tier: 'T1', tier_for_active_bottleneck: 'T1', role: 'universal_star', expected_effect: 'Anti-inflammatory', rationale: 'PREDIMED secondary analysis' },
      { lever_id: 'L_VINEGAR_PRE_PRANDIAL', name_fr: 'Vinaigre pré-prandial', ebm_tier: 'T1', tier_for_active_bottleneck: 'T1', role: 'targeted', expected_effect: '-20% AUC glucose', rationale: 'Levier T1 ciblé IR' },
      { lever_id: 'L_FOOD_SEQUENCE', name_fr: 'Séquence alimentaire', ebm_tier: 'T1', tier_for_active_bottleneck: 'T1', role: 'targeted', expected_effect: '-29% pic glucose', rationale: 'Levier T1 ciblé IR' },
      { lever_id: 'L_POSTPRANDIAL_WALK', name_fr: 'Marche postprandiale', ebm_tier: 'T1', tier_for_active_bottleneck: 'T1', role: 'targeted', expected_effect: '-20% pic glucose', rationale: 'Levier T1 ciblé IR' },
      { lever_id: 'L_LEGUMINOUSES_REGULAR', name_fr: 'Légumineuses', ebm_tier: 'T1', tier_for_active_bottleneck: 'T1', role: 'universal_star', expected_effect: 'HbA1c -0.48%', rationale: 'Sievenpiper méta' },
      { lever_id: 'L_RESISTANT_STARCH', name_fr: 'Amidon résistant', ebm_tier: 'T1', tier_for_active_bottleneck: 'T1', role: 'universal_star', expected_effect: '↓ AUC glucose', rationale: 'Sonia 2015' },
      { lever_id: 'L_NUTS_MIX_30G', name_fr: 'Oléagineux', ebm_tier: 'T1', tier_for_active_bottleneck: 'T1', role: 'universal_star', expected_effect: '↓ LDL', rationale: 'Afshin 2014' },
    ],
    output_dish: {
      title: 'Bol méditerranéen anti-IR aux légumineuses, vinaigrette au vinaigre de cidre',
      description: 'Dîner ciblant l\'insulinorésistance fonctionnelle. Architecture 50/25/25 avec séquence alimentaire intégrée. 6 leviers T1 mobilisés.',
      architecture: { vegetables_pct: 50, protein_pct: 25, lipid_pct: 25 },
      servings: 2, total_time_min: 35,
      ebm_summary: { T1_count: 6, T2_count: 1, T3_count: 0 },
      expected_effects: {
        postprandial_2_4h: '↓ pic glycémique -29% (séquence). ↓ AUC glucose 2h -20% (vinaigre pré-prandial). ↑ GLP-1 (légumineuses et séquence).',
        short_term_4_weeks: '↓ HOMA-IR -0.5 attendu. ↓ triglycérides postprandiaux. Stabilisation glycémique inter-repas.',
        long_term_12_weeks: '↓ HbA1c -0.3 à -0.5% si cohérence 3 mois. ↓ TG/HDL ratio. Amélioration sensibilité insulinique.',
      },
      ingredients: [
        { name: 'Lentilles vertes cuites', quantity: '200g', notes: 'Cuites la veille, refroidies 24h' },
        { name: 'Poivron rouge grillé', quantity: '1 pièce' },
        { name: 'Concombre', quantity: '½ pièce' },
        { name: 'Tomates cerises', quantity: '150g' },
        { name: 'Feta de brebis', quantity: '60g', notes: 'Optionnel. Remplacer par avocat si vegan' },
        { name: 'Huile d\'olive EVOO', quantity: '2 c.s.', notes: 'Dont 1 c.s. à cru en finition' },
        { name: 'Vinaigre de cidre', quantity: '1 c.s.', notes: 'Dilué dans eau, 10 min avant repas' },
        { name: 'Mélange d\'herbes fraîches', quantity: '1 poignée' },
      ],
      warnings: [],
    },
    warnings: [],
    excluded_levers: [],
    llm_meta: { model: 'claude-sonnet-4-20250514', input_tokens: 2850, output_tokens: 1240, latency_ms: 12400 },
    created_at: '2026-07-14T14:30:00Z',
    validated_at: null,
  },
};

export default function ConsultationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [consultation, setConsultation] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [validationNote, setValidationNote] = useState('');
  const [usingMock, setUsingMock] = useState(false);

  useEffect(() => {
    async function load() {
      const id = params.id as string;
      const supabase = createClient();
      const { data: profData } = await supabase
        .from('professional_profiles')
        .select('*')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .maybeSingle();
      setProfile(profData);

      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        const mock = MOCK_DETAIL[id];
        if (mock) {
          setConsultation(mock);
          setUsingMock(true);
        }
      } else {
        setConsultation(data);
      }
      setLoading(false);
    }
    load();
  }, [params.id]);

  async function handleValidate() {
    setValidating(true);
    const supabase = createClient();
    const { error } = await supabase
      .from('consultations')
      .update({
        validated_at: new Date().toISOString(),
        validated_by: profile?.full_name || 'Dr confirmé',
        validation_notes: validationNote || null,
      })
      .eq('id', params.id);

    if (error) {
      // Mock mode — just update locally
      setConsultation({ ...consultation, validated_at: new Date().toISOString(), validated_by: profile?.full_name || 'Dr Test' });
    } else {
      setConsultation({ ...consultation, validated_at: new Date().toISOString(), validated_by: profile?.full_name || 'Dr Test' });
    }
    setValidating(false);
  }

  function handleDownloadPdf() {
    const doc = generateConsultationPdf(consultation, profile?.full_name);
    doc.save(`functional-chef-${consultation.id?.slice(0, 8) || 'consultation'}.pdf`);
  }

  if (loading) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-ink-500">Chargement...</p>
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
  const bn = c.detected_bottlenecks;
  const validated = !!c.validated_at;

  return (
    <div>
      {/* Back */}
      <Link href="/dashboard/consultations" className="text-xs text-ink-500 hover:text-ink-700 transition-colors flex items-center gap-1 mb-6">
        ← Retour aux consultations
      </Link>

      {/* Header */}
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
            <span>{new Date(c.created_at).toLocaleDateString('fr-FR', { dateStyle: 'long' })}</span>
            <span>·</span>
            <span>{c.meal_type === 'breakfast' ? 'Petit-déjeuner' : c.meal_type === 'lunch' ? 'Déjeuner' : c.meal_type === 'dinner' ? 'Dîner' : c.meal_type}</span>
            {c.llm_meta?.model && <><span>·</span><span className="font-mono">{c.llm_meta.model}</span></>}
          </div>
        </div>

        {/* Validation + Export buttons */}
        {!validated && (
          <div className="shrink-0 ml-6 space-y-2">
            <div className="flex gap-2">
              <button onClick={handleDownloadPdf} className="btn-ghost !py-2.5 !px-4 text-sm">
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
            <button onClick={handleDownloadPdf} className="btn-ghost !py-2 !px-4 text-sm w-full">
              📄 Télécharger le PDF
            </button>
            <p className="text-xs text-tier-t1 font-medium">Validée le</p>
            <p className="text-xs text-ink-600">{new Date(c.validated_at).toLocaleDateString('fr-FR', { dateStyle: 'long' })}</p>
            {c.validated_by && <p className="text-xs text-ink-500">par {c.validated_by}</p>}
            {c.validation_notes && <p className="text-xs text-ink-500 mt-1 italic">{c.validation_notes}</p>}
          </div>
        )}
      </div>

      {/* Classification */}
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

      {/* Levers selected */}
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
            <span className="text-[10px] bg-tier-t1/10 text-tier-t1 font-bold px-2 py-0.5 rounded-sm">T1×{c.output_dish?.ebm_summary?.T1_count || '?'}</span>
            <span className="text-[10px] bg-tier-t2/10 text-tier-t2 font-bold px-2 py-0.5 rounded-sm">T2×{c.output_dish?.ebm_summary?.T2_count || '?'}</span>
            {(c.output_dish?.ebm_summary?.T3_count || 0) > 0 && (
              <span className="text-[10px] bg-tier-t3/10 text-tier-t3 font-bold px-2 py-0.5 rounded-sm">T3×{c.output_dish?.ebm_summary?.T3_count}</span>
            )}
          </div>
        </section>
      )}

      {/* Dish */}
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

            {/* Expected effects */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              {['postprandial_2_4h', 'short_term_4_weeks', 'long_term_12_weeks'].map((period) => (
                <div key={period} className="bg-ink-50/50 p-3 rounded-sm">
                  <p className="text-[10px] uppercase tracking-wider text-saffron-700 mb-1 font-medium">
                    {period === 'postprandial_2_4h' ? '2-4h' : period === 'short_term_4_weeks' ? '4 sem' : '12 sem'}
                  </p>
                  <p className="text-xs text-ink-700 leading-relaxed">{c.output_dish.expected_effects[period]}</p>
                </div>
              ))}
            </div>

            {/* Ingredients */}
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

      {/* Warnings */}
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

      {/* LLM meta */}
      {c.llm_meta && (
        <div className="text-[10px] text-ink-400 font-mono mt-8 pt-4 border-t border-ink-200">
          <span>{c.llm_meta.model} · in: {c.llm_meta.input_tokens}t · out: {c.llm_meta.output_tokens}t · {c.llm_meta.latency_ms}ms</span>
          <span className="ml-4">id: {c.id?.slice(0, 12)}…</span>
          {c.engine_version && <span className="ml-4">engine: {c.engine_version}</span>}
        </div>
      )}

      {usingMock && (
        <div className="mt-6 p-4 bg-amber-50/50 border border-amber-200 rounded-sm">
          <p className="text-xs text-amber-800 font-medium mb-1">⚠️ Données de démonstration</p>
          <p className="text-[11px] text-amber-700">
            Connectez Supabase pour voir les vraies consultations et pouvoir les valider avec signature tracée.
          </p>
        </div>
      )}
    </div>
  );
}
