'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

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
    description: 'Dîner ciblant l\'insulinorésistance avec couverture inflammatoire. 6 leviers T1, architecture 50/25/25.',
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
};

export default function PrescriptionPage() {
  const params = useParams();
  const [data, setData] = useState(MOCK);

  const c = data;
  const bn = c.detected_bottlenecks;

  return (
    <div className="bg-neutral-50 min-h-screen">
      <div className="print:hidden sticky top-0 z-50 bg-white border-b border-neutral-200 px-6 py-2 flex items-center justify-between text-sm text-neutral-600">
        <span>Aperçu — prescription patient</span>
        <button onClick={() => window.print()} className="bg-neutral-900 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-neutral-800">
          🖨️ Imprimer / PDF
        </button>
      </div>

      <div className="max-w-[210mm] mx-auto bg-white shadow-sm my-6 print:my-0 print:shadow-none">
        <div className="p-8 md:p-10 print:p-8">

          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-neutral-800 pb-5 mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 font-serif">Functional Chef</h1>
              <p className="text-[10px] text-neutral-500 mt-0.5">Prescription nutritionnelle personnalisée</p>
            </div>
            <div className="text-right text-[11px] text-neutral-600 space-y-0.5">
              <p className="font-medium">{c.doctor}</p>
              <p>{c.consultation_date}</p>
            </div>
          </div>

          {/* Patient */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 mb-6 flex gap-6 text-sm">
            <div><span className="text-[10px] uppercase tracking-wider text-neutral-500 font-medium block">Patiente</span>{c.patient_name}</div>
            <div><span className="text-[10px] uppercase tracking-wider text-neutral-500 font-medium block">Née le</span>{c.patient_dob}</div>
            <div><span className="text-[10px] uppercase tracking-wider text-neutral-500 font-medium block">Repas</span>Dîner</div>
          </div>

          {/* Intent */}
          <p className="text-sm text-neutral-600 mb-6 italic">{c.intent}</p>

          {/* Classification */}
          <div className="mb-6">
            <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-3">Classification</p>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {bn.scores.map((s: any) => (
                <div key={s.bottleneck_id} className={`rounded-lg border p-2.5 ${s.is_dominant ? 'ring-2 ring-offset-2 ring-neutral-800' : ''}`}
                  style={{ borderColor: s.triggered ? ({ IR: '#b54016', INFLAM: '#bc6c25', DYSBIOSE: '#a4161a' } as any)[s.bottleneck_id] : '#e5e5e5' }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: ({ IR: '#b54016', INFLAM: '#bc6c25', DYSBIOSE: '#a4161a' } as any)[s.bottleneck_id] }}>{s.bottleneck_id}</span>
                    <span className="text-[11px] font-mono font-bold">{s.score} pts</span>
                  </div>
                  <p className="text-xs font-medium">{({ IR: 'Insulinorésistance', INFLAM: 'Inflammaging', DYSBIOSE: 'Dysbiose' } as any)[s.bottleneck_id]}</p>
                  <p className="text-[10px] text-neutral-500">{s.major_hits} M · {s.moderate_hits} m</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed italic">{bn.rationale}</p>
          </div>

          {/* Levers */}
          <div className="mb-6">
            <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-3">Leviers · {c.selected_levers.length} interventions</p>
            <div className="space-y-1">
              {c.selected_levers.map((l: any) => (
                <div key={l.lever_id} className="flex items-center gap-2 py-1.5 border-b border-neutral-100 last:border-0 text-sm">
                  <span className={`shrink-0 text-[10px] font-bold font-mono px-1 py-0.5 rounded ${l.tier_for_active_bottleneck === 'T1' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{l.tier_for_active_bottleneck}</span>
                  <span className="flex-1">{l.name_fr}</span>
                  <span className="text-[11px] text-neutral-500">{l.expected_effect}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dish */}
          <div className="mb-6">
            <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-3">Prescription culinaire</p>
            <h2 className="text-lg font-bold text-neutral-900 font-serif mb-2">{c.dish.title}</h2>
            <p className="text-sm text-neutral-600 mb-3">{c.dish.description}</p>
            <div className="flex gap-3 text-[11px] text-neutral-500 mb-4">
              <span>🍽️ {c.dish.architecture}</span>
              <span>⏱ {c.dish.total_time} min</span>
              <span>× {c.dish.servings} portions</span>
            </div>

            {/* Ingredients table */}
            <table className="w-full text-sm mb-4">
              <thead><tr className="border-b border-neutral-300 text-[10px] text-neutral-500 uppercase tracking-wider"><th className="text-left font-medium pb-1 w-1/2">Ingrédient</th><th className="text-left font-medium pb-1 w-14">Qté</th><th className="text-left font-medium pb-1">Note</th></tr></thead>
              <tbody>{c.dish.ingredients.map((ing: string[], i: number) => (
                <tr key={i} className="border-b border-neutral-100"><td className="py-1 text-sm">{ing[0]}</td><td className="py-1 text-neutral-600 font-mono text-xs">{ing[1]}</td><td className="py-1 text-neutral-500 text-xs italic">{ing[2]}</td></tr>
              ))}</tbody>
            </table>

            {/* Protocol */}
            <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-2">Protocole</p>
            <ol className="space-y-1.5 mb-4">
              {c.dish.steps.map((step: string, i: number) => (
                <li key={i} className="flex gap-2 text-sm"><span className="shrink-0 w-4 h-4 rounded-full bg-neutral-800 text-white text-[8px] font-bold flex items-center justify-center mt-0.5">{i+1}</span><span>{step}</span></li>
              ))}
            </ol>

            {/* Expected effects */}
            <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-2">Effets attendus</p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5"><p className="text-[9px] uppercase tracking-wider text-emerald-700 font-bold mb-1">2-4h postprandial</p><p className="text-[11px] text-neutral-700">{c.dish.expected_effects.postprandial}</p></div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5"><p className="text-[9px] uppercase tracking-wider text-amber-700 font-bold mb-1">4 semaines</p><p className="text-[11px] text-neutral-700">{c.dish.expected_effects.short_term}</p></div>
              <div className="bg-neutral-800 text-white rounded-lg p-2.5"><p className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold mb-1">12 semaines</p><p className="text-[11px] text-neutral-300">{c.dish.expected_effects.long_term}</p></div>
            </div>

            {/* Shopping list */}
            <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-2">Liste de courses</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              {c.dish.shopping_list.map((item: string[], i: number) => (
                <div key={i} className="flex items-center gap-2 py-0.5 border-b border-neutral-100">
                  <input type="checkbox" className="rounded accent-neutral-800 w-3.5 h-3.5" />
                  <span>{item[0]}</span>
                  <span className="ml-auto text-neutral-500 text-xs font-mono">{item[1]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Warnings */}
          {c.warnings.length > 0 && (
            <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-[10px] font-bold text-amber-800 mb-1">⚠️ Précautions</p>
              {c.warnings.map((w: string, i: number) => <p key={i} className="text-xs text-amber-900">· {w}</p>)}
            </div>
          )}

          {/* Signature */}
          <div className="mt-8 pt-4 border-t-2 border-neutral-800 grid grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-medium mb-0.5">Prescripteur</p>
              <p className="font-medium">{c.doctor}</p>
              <p className="text-xs text-neutral-500">Cachet et signature</p>
              <div className="mt-3 h-10 border-b border-neutral-300" />
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-medium mb-0.5">Date</p>
              <p className="font-medium">{c.consultation_date}</p>
              <span className="text-[9px] text-neutral-400 font-mono mt-4 block">FC-{Math.abs(c.id.split('').reduce((a: number, c: string) => ((a << 5) - a) + c.charCodeAt(0), 0)).toString(16).slice(0, 8)}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-neutral-200 text-[7px] text-neutral-400 leading-relaxed">
            <p>Généré par Functional Chef v0.2 · Moteur de prescription nutritionnelle EBM-driven · Ce document n'est pas un dispositif médical · Nécessite validation médicale</p>
          </div>
        </div>
      </div>
    </div>
  );
}
