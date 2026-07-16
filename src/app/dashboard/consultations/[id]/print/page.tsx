'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const MOCK = {
  id: 'demo-001',
  intent: 'Dîner anti-IR ciblé — patiente 34 ans, fatigue, ballonnements',
  meal_type: 'dinner',
  patient_name: 'Marie D.',
  patient_dob: '15/03/1992',
  consultation_date: '14/07/2026',
  detected_bottlenecks: {
    scores: [
      { bottleneck_id: 'IR', score: 11, major_hits: 3, moderate_hits: 1, triggered: true, is_dominant: true },
      { bottleneck_id: 'INFLAM', score: 6, major_hits: 2, moderate_hits: 0, triggered: true, is_co_dominant: true },
      { bottleneck_id: 'DYSBIOSE', score: 13, major_hits: 3, moderate_hits: 2, triggered: true },
    ],
    dominant: 'IR', co_dominant: 'INFLAM',
    rationale: 'Triple co-dominance : cascade causale appliquée (IR > INFLAM > DYSBIOSE). Le bottleneck dominant est l\'insulinorésistance fonctionnelle. L\'inflammation bas grade est co-dominante. La dysbiose sera réévaluée après 4 semaines de stabilisation métabolique.',
  },
  selected_levers: [
    { lever_id: 'L_EVOO_PRIMARY', name_fr: 'Huile d\'olive EVOO', tier_for_active_bottleneck: 'T1', role: 'universal_star', expected_effect: '↑ sensibilité insulinique', dose_or_protocol: '≥40 ml/j, dont 1/3 à cru' },
    { lever_id: 'L_VINEGAR_PRE_PRANDIAL', name_fr: 'Vinaigre pré-prandial', tier_for_active_bottleneck: 'T1', role: 'targeted', expected_effect: '-20% AUC glucose 2h', dose_or_protocol: '15 ml dilué, 10 min avant repas' },
    { lever_id: 'L_FOOD_SEQUENCE', name_fr: 'Séquence légumes→protéines→glucides', tier_for_active_bottleneck: 'T1', role: 'targeted', expected_effect: '-29% pic glucose', dose_or_protocol: '10 min entre chaque phase' },
    { lever_id: 'L_NUTS_MIX_30G', name_fr: 'Oléagineux mix 30 g/j', tier_for_active_bottleneck: 'T1', role: 'universal_star', expected_effect: '↓ LDL, ↓ HbA1c', dose_or_protocol: '30g/j (noix, amandes, noisettes)' },
    { lever_id: 'L_LEGUMINOUSES_REGULAR', name_fr: 'Légumineuses 3-4x/sem', tier_for_active_bottleneck: 'T1', role: 'universal_star', expected_effect: '↓ HbA1c -0.48%', dose_or_protocol: '3-4 portions de 100-150g/sem' },
    { lever_id: 'L_FATTY_FISH_2X', name_fr: 'Poisson gras 2-3x/sem', tier_for_active_bottleneck: 'T2', role: 'universal_star', expected_effect: '↓ CRP, ↑ Omega-3 Index', dose_or_protocol: '2-3 portions de 100-150g/sem' },
    { lever_id: 'L_MEAL_TIMING_12H', name_fr: 'Fenêtre alimentaire ≤12h/j', tier_for_active_bottleneck: 'T1', role: 'universal_star', expected_effect: '↓ insuline à jeun', dose_or_protocol: 'Dîner avant 20h, petit-déjeuner après 8h' },
  ],
  dish: {
    title: 'Bol méditerranéen anti-IR aux lentilles, vinaigrette au cidre et oléagineux',
    description: 'Dîner ciblant l\'insulinorésistance avec couverture inflammatoire. 6 leviers T1, architecture 50/25/25. Temps de préparation : 40 minutes.',
    architecture: '50% végétaux · 25% protéines · 25% lipides',
    total_time: 40,
    servings: 2,
    ebm_summary: { T1: 6, T2: 1, T3: 0 },
    expected_effects: {
      postprandial: '↓ pic glycémique -29% (séquence alimentaire). ↓ AUC glucose 2h -20% (vinaigre pré-prandial). ↑ GLP-1 et satiété (légumineuses + séquence).',
      short_term: '↓ HOMA-IR -0.5 attendu en 4 sem. ↓ triglycérides postprandiaux. Amélioration de la satiété et réduction des fringales.',
      long_term: '↓ HbA1c -0.3 à -0.5% si cohérence 3 mois. ↓ CRP-us parallèlement à l\'amélioration de l\'IR. Amélioration du rapport TG/HDL.',
    },
    ingredients: [
      ['Lentilles vertes cuites refroidies 24h', '200g', 'Amidon résistant + fibres solubles'],
      ['Poivron rouge grillé', '1 pièce', 'Vit C + polyphénols'],
      ['Concombre en dés', '½ pièce', 'Hydratation + fibres'],
      ['Tomates cerises', '150g', 'Lycopène + vit C'],
      ['Mesclun (roquette, mâche)', '100g', 'Diversité végétale ≥5 espèces'],
      ['Huile d\'olive EVOO', '2 c.s.', '1 c.s. à cru en finition'],
      ['Vinaigre de cidre', '15 ml', 'Dilué dans 100 ml eau'],
      ['Noix + amandes concassées', '30g', 'Mix oléagineux'],
      ['Herbes fraîches (persil, menthe, coriandre)', '1 poignée', 'Polyphénols'],
    ],
    steps: [
      'Boire 15 ml de vinaigre de cidre dilué dans 100 ml d\'eau. Attendre 10 minutes.',
      'Commencer par le mesclun et les légumes crus (concombre, tomates, herbes). Manger pendant 5 minutes.',
      'Ajouter les lentilles refroidies et le poivron grillé. Arroser d\'1 c.s. d\'EVOO.',
      'Parsemer de noix et amandes concassées.',
      'Ajouter 1 c.s. d\'EVOO cru en finition (préserve les polyphénols).',
      'Marche légère 10-15 min après le repas (active GLUT-4 indépendant de l\'insuline).',
    ],
    shopping_list: [
      ['Lentilles vertes', '200g'],
      ['Poivron rouge', '1'],
      ['Concombre', '1'],
      ['Tomates cerises', '250g'],
      ['Mesclun', '100g'],
      ['Huile d\'olive EVOO', '1 bouteille'],
      ['Vinaigre de cidre', '1 bouteille'],
      ['Noix', '100g'],
      ['Amandes', '100g'],
      ['Herbes fraîches', '1 botte'],
    ],
  },
  warnings: ['Vinaigre : à modérer en cas de reflux actif. Rincer la bouche après (émail dentaire).', 'Introduire les légumineuses progressivement si selles molles ou ballonnements.'],
  doctor: 'Dr Rafik Gounane',
  validated_at: null,
};

const BOTTLENECK_COLORS: Record<string, string> = {
  IR: '#b54016', INFLAM: '#bc6c25', DYSBIOSE: '#a4161a',
};
const BOTTLENECK_LABELS: Record<string, string> = {
  IR: 'Insulinorésistance', INFLAM: 'Inflammaging', DYSBIOSE: 'Dysbiose',
};

export default function PrescriptionPrintPage() {
  const params = useParams();
  const [data, setData] = useState(MOCK);
  const [loading, setLoading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = params.id as string;
    if (id && id !== 'demo') {
      setLoading(true);
      // In production, fetch from Supabase
      setLoading(false);
    }
  }, [params.id]);

  const c = data;
  const bn = c.detected_bottlenecks;

  return (
    <div className="bg-neutral-50 min-h-screen">
      {/* Print toolbar */}
      <div className="print:hidden sticky top-0 z-50 bg-white border-b border-neutral-200 px-6 py-3 flex items-center justify-between">
        <div className="text-sm text-neutral-600">
          <Link href={`/dashboard/consultations/${params.id}`} className="hover:text-neutral-900">← Retour</Link>
          <span className="mx-3">|</span>
          <span className="font-medium">Aperçu avant impression</span>
        </div>
        <button
          onClick={() => window.print()}
          className="btn-primary text-sm !py-2 !px-6"
        >
          🖨️ Imprimer / Exporter PDF
        </button>
      </div>

      {/* Print area */}
      <div ref={printRef} className="max-w-[210mm] mx-auto bg-white shadow-sm my-8 print:my-0 print:shadow-none">
        <div className="p-8 md:p-12 print:p-8">

          {/* ─── HEADER ─────────────────────────────── */}
          <div className="flex justify-between items-start border-b-2 border-neutral-800 pb-6 mb-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 font-serif">
                Functional Chef
              </h1>
              <p className="text-xs text-neutral-500 mt-0.5">Prescription nutritionnelle personnalisée</p>
            </div>
            <div className="text-right text-xs text-neutral-600 space-y-0.5">
              <p className="font-medium">{c.doctor}</p>
              <p>{c.consultation_date}</p>
              <p className="font-mono text-neutral-400 text-[10px]">ID: {c.id?.slice(0, 12)}</p>
            </div>
          </div>

          {/* ─── PATIENT ────────────────────────────── */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 mb-8 flex justify-between items-center">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-medium">Patiente</p>
              <p className="text-base font-medium text-neutral-900">{c.patient_name}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-medium">Née le</p>
              <p className="text-sm text-neutral-700">{c.patient_dob}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-medium">Repas</p>
              <p className="text-sm text-neutral-700">Dîner</p>
            </div>
          </div>

          {/* ─── INTENT ─────────────────────────────── */}
          <div className="mb-8">
            <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-medium mb-1">Objectif clinique</p>
            <p className="text-lg text-neutral-900 font-medium leading-snug">{c.intent}</p>
          </div>

          {/* ─── CLASSIFICATION ─────────────────────── */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm font-bold text-neutral-900 tracking-wide uppercase">Classification</span>
              <div className="h-px flex-1 bg-neutral-200" />
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              {bn.scores.map((s: any) => {
                const dom = s.is_dominant ? 'ring-2 ring-offset-2 ring-neutral-800' : s.is_co_dominant ? 'ring-2 ring-offset-2 ring-amber-600/40' : '';
                return (
                  <div key={s.bottleneck_id} className={`rounded-lg border p-3 ${dom} ${s.triggered ? 'bg-white' : 'bg-neutral-50 opacity-60'}`}
                    style={{ borderColor: s.triggered ? BOTTLENECK_COLORS[s.bottleneck_id] : '#e5e5e5' }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: BOTTLENECK_COLORS[s.bottleneck_id] }}>
                        {s.bottleneck_id}
                      </span>
                      <span className={`text-xs font-mono font-bold ${s.triggered ? 'text-neutral-900' : 'text-neutral-400'}`}>
                        {s.score} pts
                      </span>
                    </div>
                    <p className="text-sm font-medium text-neutral-800">{BOTTLENECK_LABELS[s.bottleneck_id]}</p>
                    <p className="text-[11px] text-neutral-500 mt-1">
                      {s.major_hits} Majeurs · {s.moderate_hits} Modérés · {s.minor_hits} Mineurs
                    </p>
                    {s.is_dominant && <p className="text-xs font-bold text-neutral-800 mt-1.5">⬅ DOMINANT</p>}
                    {s.is_co_dominant && <p className="text-xs font-bold text-amber-700 mt-1.5">⬅ CO-DOMINANT</p>}
                  </div>
                );
              })}
            </div>
            <p className="text-sm text-neutral-600 leading-relaxed italic">{bn.rationale}</p>
          </div>

          {/* ─── LEVIERS ────────────────────────────── */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm font-bold text-neutral-900 tracking-wide uppercase">Leviers mobilisés</span>
              <span className="text-xs text-neutral-500">7 interventions</span>
              <div className="h-px flex-1 bg-neutral-200" />
            </div>

            <div className="space-y-2">
              {c.selected_levers.map((l: any) => (
                <div key={l.lever_id} className="flex items-start gap-3 py-2 border-b border-neutral-100 last:border-0">
                  <span className={`shrink-0 text-[10px] font-bold font-mono px-1.5 py-0.5 rounded ${
                    l.tier_for_active_bottleneck === 'T1' ? 'bg-emerald-100 text-emerald-800' :
                    l.tier_for_active_bottleneck === 'T2' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {l.tier_for_active_bottleneck}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900">{l.name_fr}</p>
                    <p className="text-xs text-neutral-500">{l.expected_effect}</p>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-mono">{l.dose_or_protocol || ''}</span>
                  <span className={`text-[10px] font-medium ${
                    l.role === 'universal_star' ? 'text-emerald-700' : 'text-neutral-500'
                  }`}>
                    {l.role === 'universal_star' ? '★' : '○'}
                  </span>
                </div>
              ))}
            </div>

            {/* EBM Summary */}
            <div className="flex items-center gap-3 mt-4 pt-3 border-t border-neutral-200">
              <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-medium">Niveau de preuve</span>
              {c.dish.ebm_summary.T1 > 0 && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  T1 × {c.dish.ebm_summary.T1}
                </span>
              )}
              {c.dish.ebm_summary.T2 > 0 && (
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                  T2 × {c.dish.ebm_summary.T2}
                </span>
              )}
              {c.dish.ebm_summary.T3 > 0 && (
                <span className="text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded">
                  T3 × {c.dish.ebm_summary.T3}
                </span>
              )}
              <span className="text-[10px] text-neutral-400 ml-auto">T1 = Méta-analyse RCT · T2 = RCT modeste · T3 = Mécanistique</span>
            </div>
          </div>

          {/* ─── DISH ───────────────────────────────── */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm font-bold text-neutral-900 tracking-wide uppercase">Prescription culinaire</span>
              <div className="h-px flex-1 bg-neutral-200" />
            </div>

            {/* Title + meta */}
            <h2 className="text-xl font-bold text-neutral-900 font-serif mb-2">{c.dish.title}</h2>
            <p className="text-sm text-neutral-600 mb-4">{c.dish.description}</p>

            <div className="flex flex-wrap gap-4 text-xs text-neutral-600 mb-6">
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-neutral-800 text-white text-[8px] flex items-center justify-center font-bold">i</span>
                {c.dish.architecture}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-neutral-800 text-white text-[8px] flex items-center justify-center font-bold">⏱</span>
                {c.dish.total_time} min
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-neutral-800 text-white text-[8px] flex items-center justify-center font-bold">×</span>
                {c.dish.servings} portions
              </span>
            </div>

            {/* Ingredients */}
            <div className="mb-6">
              <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-medium mb-2">Ingrédients</p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 text-[10px] text-neutral-500 uppercase tracking-wider">
                    <th className="text-left font-medium pb-1.5 w-1/2">Ingrédient</th>
                    <th className="text-left font-medium pb-1.5 w-16">Qté</th>
                    <th className="text-left font-medium pb-1.5">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {c.dish.ingredients.map((ing: string[], i: number) => (
                    <tr key={i} className="border-b border-neutral-100">
                      <td className="py-1.5 text-neutral-900">{ing[0]}</td>
                      <td className="py-1.5 text-neutral-700 font-mono text-xs">{ing[1]}</td>
                      <td className="py-1.5 text-neutral-500 text-xs italic">{ing[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Protocol */}
            <div className="mb-6">
              <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-medium mb-2">Protocole de préparation</p>
              <ol className="space-y-2">
                {c.dish.steps.map((step: string, i: number) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-neutral-800 text-white text-[10px] font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="text-neutral-800 leading-snug pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Expected effects */}
            <div className="mb-6">
              <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-medium mb-3">Effets biologiques attendus</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  <p className="text-[10px] uppercase tracking-wider text-emerald-700 font-bold mb-1">Postprandial · 2-4h</p>
                  <p className="text-xs text-neutral-700 leading-relaxed">{c.dish.expected_effects.postprandial}</p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-[10px] uppercase tracking-wider text-amber-700 font-bold mb-1">Court terme · 4 sem</p>
                  <p className="text-xs text-neutral-700 leading-relaxed">{c.dish.expected_effects.short_term}</p>
                </div>
                <div className="bg-neutral-800 text-white rounded-lg p-3">
                  <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold mb-1">Long terme · 12 sem</p>
                  <p className="text-xs text-neutral-300 leading-relaxed">{c.dish.expected_effects.long_term}</p>
                </div>
              </div>
            </div>

            {/* Shopping list */}
            <div>
              <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-medium mb-2">Liste de courses</p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                {c.dish.shopping_list.map((item: string[], i: number) => (
                  <div key={i} className="flex items-center gap-2 py-0.5 border-b border-neutral-100">
                    <input type="checkbox" className="rounded border-neutral-300 accent-neutral-800" />
                    <span className="text-neutral-800">{item[0]}</span>
                    <span className="ml-auto text-neutral-500 text-xs font-mono">{item[1]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ─── WARNINGS ───────────────────────────── */}
          {c.warnings.length > 0 && (
            <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs font-bold text-amber-800 mb-2">⚠️ Précautions</p>
              <ul className="space-y-1">
                {c.warnings.map((w: string, i: number) => (
                  <li key={i} className="text-xs text-amber-900 flex gap-2">
                    <span className="text-amber-600 shrink-0">·</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ─── VALIDATION ─────────────────────────── */}
          <div className="mt-10 pt-6 border-t-2 border-neutral-800">
            <div className="grid grid-cols-2 gap-8 text-sm">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-medium mb-1">Prescripteur</p>
                <p className="font-medium text-neutral-900">{c.doctor}</p>
                <p className="text-xs text-neutral-500">Cachet et signature</p>
                <div className="mt-4 h-12 border-b border-neutral-300" />
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-medium mb-1">Date</p>
                <p className="font-medium text-neutral-900">{c.consultation_date}</p>
                <p className="text-[10px] text-neutral-400 mt-6 font-mono">
                  Empreinte : FC-{Math.abs(c.id.split('').reduce((a: number, c: string) => ((a << 5) - a) + c.charCodeAt(0), 0)).toString(16).slice(0, 8)}
                </p>
              </div>
            </div>
          </div>

          {/* ─── FOOTER ─────────────────────────────── */}
          <div className="mt-6 pt-4 border-t border-neutral-200 text-[8px] text-neutral-400 leading-relaxed">
            <p>Document généré par Functional Chef v0.2 — Moteur de prescription nutritionnelle EBM-driven.</p>
            <p>Ce document n'est pas un dispositif médical. Il nécessite validation médicale avant transmission au patient.</p>
            <p>Les tiers EBM (T1/T2/T3) reflètent le niveau de preuve de chaque intervention selon la littérature scientifique disponible.</p>
          </div>

        </div>
      </div>
    </div>
  );
}
