'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';

/** ══════════════════════════════════════════════════════
 *  MOCK DATA — remplacée par Supabase en prod
 *  ══════════════════════════════════════════════════════ */

const MOCK = {
  // ── Administration ─────────────────────────────
  document_id: 'FC-PRX-20260714-001',
  engine_version: 'v0.2.1+build378',
  issued_at: '2026-07-14T14:30:00Z',
  valid_until: '2026-10-14',

  // ── Patient ────────────────────────────────────
  patient: {
    id: 'PT-2026-0428',
    name: 'Marie D.',
    dob: '15/03/1992',
    sex: 'F',
    record_number: 'D-2026-0047',
  },

  // ── Prescripteur ───────────────────────────────
  prescriber: {
    name: 'Dr Rafik Gounane',
    specialty: 'Médecine fonctionnelle',
    rpps: 'RPPS à renseigner',
    email: 'rafik@functional-chef.app',
  },

  // ── Indication ─────────────────────────────────
  indication: {
    clinical_context: 'Femme 34 ans, fatigue chronique, prise de poids progressive (4 kg/6 mois), ballonnements postprandiaux quotidiens, fringales glucidiques en fin d\'après-midi.',
    therapeutic_goal: '↓ HOMA-IR < 1.5 · ↓ CRP-us < 1 mg/L · normalisation du transit (Bristol 3-4) · stabilisation pondérale sans restriction calorique.',
    meal_type: 'dîner',
  },

  // ── Biomarqueurs initiaux ──────────────────────
  baseline_biomarkers: [
    { code: 'HOMA_IR',           value: 2.3, unit: '',         target: '< 1.5',     flag: 'MAJOR' },
    { code: 'TG_HDL_RATIO',      value: 1.9, unit: '',         target: '< 1.0',     flag: 'MAJOR' },
    { code: 'FASTING_INSULIN',   value: 10,  unit: 'µU/mL',    target: '< 8',       flag: 'MAJOR' },
    { code: 'CRP_US',            value: 1.8, unit: 'mg/L',     target: '< 1',       flag: 'MAJOR' },
    { code: 'OMEGA3_INDEX',      value: 5.2, unit: '%',        target: '> 8',       flag: 'MAJOR' },
    { code: 'SHBG',              value: 24,  unit: 'nmol/L',    target: '> 50',      flag: 'MODERATE' },
    { code: 'CALPROTECTIN',      value: 55,  unit: 'µg/g',     target: '< 50',      flag: 'MAJOR' },
    { code: 'BRISTOL_SCORE',     value: 6,   unit: '',         target: '3-4',       flag: 'MAJOR' },
    { code: 'BLOATING_FREQ',     value: 4,   unit: '/sem',     target: '< 1',       flag: 'MAJOR' },
  ],

  // ── Classification des bottlenecks ──────────────
  classification: {
    scores: [
      { bottleneck_id: 'IR',      label: 'Insulinorésistance',  score: 11, major: 3, moderate: 1, triggered: true,  role: 'dominant' },
      { bottleneck_id: 'INFLAM',  label: 'Inflammaging',        score: 6,  major: 2, moderate: 0, triggered: true,  role: 'co_dominant' },
      { bottleneck_id: 'DYSBIOSE', label: 'Dysbiose intestinale', score: 13, major: 3, moderate: 2, triggered: true, role: 'secondaire' },
    ],
    rationale: 'Triple co-dominance : cascade causale appliquée (IR > INFLAM > DYSBIOSE). L\'insulinorésistance fonctionnelle est le driver amont. L\'inflammation bas grade (CRP-us 1.8, Omega-3 Index 5.2 %) est co-dominante. La dysbiose (score 13, plus élevé) sera réévaluée après 4 semaines de stabilisation métabolique.',
    confidence_score: 'confirmé', // suspicionnel | probable | confirmé
  },

  // ── Leviers prescrits ──────────────────────────
  levers: [
    {
      id: 'L_VINEGAR_PRE_PRANDIAL',
      name_fr: 'Vinaigre pré-prandial',
      tier: 'T1',
      dose: '15 ml dilué dans 100 ml d\'eau, 10 min avant le repas',
      rationale: '↓ AUC glucose 2h de 20 % par inhibition de l\'α-amylase salivaire',
      effect: '-20 % AUC glucose postprandial',
      references: [
        { type: 'meta-analysis', citation: 'Shishehbor 2017, J Funct Foods, n=11 RCT', pmid: '28287520' },
      ],
    },
    {
      id: 'L_FOOD_SEQUENCE',
      name_fr: 'Séquence alimentaire : légumes → protéines → glucides',
      tier: 'T1',
      dose: '10 min entre chaque phase',
      rationale: '↓ pic glycémique 29 % via ralentissement vidange gastrique + ↑ GLP-1',
      effect: '-29 % pic glucose postprandial',
      references: [
        { type: 'RCT crossover', citation: 'Shukla 2015, Diabetes Care', pmid: '26370069' },
        { type: 'RCT crossover', citation: 'Tricò 2024, Am J Clin Nutr', pmid: '38522468' },
      ],
    },
    {
      id: 'L_EVOO_PRIMARY',
      name_fr: 'Huile d\'olive extra vierge (EVOO)',
      tier: 'T1',
      dose: '≥ 40 ml/j, dont 1/3 à cru en finition',
      rationale: '↑ sensibilité insulinique via MUFA + oléocanthal (anti-inflammatoire COX-1/COX-2)',
      effect: '↑ adiponectine, ↓ HOMA-IR',
      references: [
        { type: 'meta-analysis', citation: 'Schwingshackl 2017, Lipids Health Dis, n=31 RCT', pmid: '28335762' },
        { type: 'RCT PREDIMED', citation: 'Estruch 2013, N Engl J Med', pmid: '23432189' },
      ],
    },
    {
      id: 'L_NUTS_MIX_30G',
      name_fr: 'Oléagineux mix (noix, amandes, noisettes)',
      tier: 'T1',
      dose: '30 g/j, non salés',
      rationale: '↓ LDL, ↓ HbA1c via MUFA + fibres + arginine + polyphénols',
      effect: '↓ LDL -7 %, ↓ HbA1c -0.07 %',
      references: [
        { type: 'meta-analysis', citation: 'Afshin 2014, Am J Clin Nutr, n=61 RCT', pmid: '24717358' },
      ],
    },
    {
      id: 'L_LEGUMINOUSES_REGULAR',
      name_fr: 'Légumineuses (lentilles, pois chiches, haricots)',
      tier: 'T1',
      dose: '3-4 portions de 100-150 g/sem, cuites puis refroidies 24h',
      rationale: '↓ HbA1c -0.48 % via fibres fermentescibles + amidon résistant + protéines',
      effect: '↓ HbA1c -0.48 %, ↓ LDL -0.27 mmol/L',
      references: [
        { type: 'meta-analysis', citation: 'Sievenpiper 2009, Diabetologia, n=41 RCT', pmid: '19655120' },
      ],
    },
    {
      id: 'L_FATTY_FISH_2X',
      name_fr: 'Poisson gras (saumon, maquereau, sardines)',
      tier: 'T2',
      dose: '2-3 portions de 100-150 g/sem',
      rationale: '↑ Omega-3 Index, ↓ CRP via résolvines et protectines (SPMs)',
      effect: '↓ CRP -15 à -20 %, ↑ Omega-3 Index +2-3 %',
      references: [
        { type: 'RCT', citation: 'Calder 2018, Mol Nutr Food Res', pmid: '29345063' },
      ],
    },
    {
      id: 'L_MEAL_TIMING_12H',
      name_fr: 'Fenêtre alimentaire ≤ 12 h/j',
      tier: 'T1',
      dose: 'Dîner avant 20h, petit-déjeuner après 8h',
      rationale: '↓ insuline à jeun via alignement circadien + ↑ AMPK + autophagie hépatique',
      effect: '↓ HOMA-IR, ↓ insuline à jeun',
      references: [
        { type: 'RCT crossover', citation: 'Sutton 2018, Cell Metab', pmid: '30122554' },
      ],
    },
  ],

  // ── Prescription culinaire ──────────────────────
  dish: {
    title: 'Bol méditerranéen anti-IR aux lentilles, vinaigrette au cidre et oléagineux',
    description: 'Dîner ciblant l\'IR fonctionnelle avec couverture inflammatoire co-dominante. 6 leviers T1 (méta-analyses), 1 levier T2 (RCT). Architecture validée par la littérature : 50 % végétaux / 25 % protéines / 25 % lipides MUFA+ω-3.',
    architecture: '50 % végétaux non amylacés · 25 % protéines (légumineuses) · 25 % lipides (EVOO + oléagineux)',
    total_time: 40,
    servings: 2,
    ebm_summary: { T1: 6, T2: 1, T3: 0 },

    expected_effects: {
      postprandial: {
        text: '↓ pic glycémique -29 % (séquence légumes→protéines→glucides). ↓ AUC glucose 2h -20 % (vinaigre pré-prandial). ↑ GLP-1 et PYY (satiété).',
        biomarkers: ['AUC glucose 2h -20%', 'pic glucose -29%', 'GLP-1'],
      },
      short_term: {
        text: '↓ HOMA-IR -0.5 attendu en 4 semaines. ↓ triglycérides postprandiaux. ↑ Satiété et ↓ fringales glucidiques. Amélioration du transit (↑ fibres 8-12 g/j).',
        biomarkers: ['HOMA-IR -0.5', 'TG -0.2 mmol/L', 'Bristol 3-4'],
      },
      long_term: {
        text: '↓ HbA1c -0.3 % à -0.5 % si adhésion ≥ 3 mois. ↓ CRP-us parallèlement à l\'amélioration de l\'IR. ↓ TG/HDL ratio. ↓ MASLD probabilité (si stéatose infraclinique).',
        biomarkers: ['HbA1c -0.3 à -0.5%', 'CRP-us < 1 mg/L', 'TG/HDL ratio < 1.0'],
      },
    },

    ingredients: [
      ['Lentilles vertes cuites, refroidies 24 h', '200 g cuite', 'Amidon résistant (RS3) × 2 après refroidissement'],
      ['Poivron rouge grillé', '1 pièce', 'Vit C 190 mg · β-carotène · quercétine'],
      ['Concombre en dés', '½ pièce', 'Silice · hydratation · fibres'],
      ['Tomates cerises', '150 g', 'Lycopène biodisponible après cuisson'],
      ['Mesclun (roquette, mâche, jeunes pousses)', '100 g', 'Diversité végétale ≥ 5 espèces / repas'],
      ['Huile d\'olive EVOO', '2 c.s. (30 ml)', '≥40 ml/j cible dont 1 c.s. à cru'],
      ['Vinaigre de cidre', '1 c.s. (15 ml)', 'Avant repas, dilué dans 100 ml d\'eau'],
      ['Noix + amandes concassées', '30 g', 'Mix oléagineux : MUFA + ω-3 ALA + magnésium'],
      ['Herbes fraîches (persil, menthe, coriandre)', '1 poignée', 'Polyphénols · saveur sans sel'],
    ],

    steps: [
      { order: 1, instruction: 'Diluer 15 ml de vinaigre de cidre dans 100 ml d\'eau. Boire 10 min avant le repas.', timing: 'T-10' },
      { order: 2, instruction: 'Commencer par le mesclun et les légumes crus (concombre, tomates, herbes). Manger seul pendant 5 min.', timing: 'T+0', note: 'Active les incrétines avant la charge glucidique' },
      { order: 3, instruction: 'Ajouter les lentilles refroidies et le poivron grillé. Arroser d\'1 c.s. d\'EVOO.', timing: 'T+5', note: 'Les lentilles refroidies = amidon résistant (RS3)' },
      { order: 4, instruction: 'Parsemer de noix et amandes concassées.', timing: 'T+10' },
      { order: 5, instruction: 'Ajouter 1 c.s. d\'EVOO cru en finition (préserve les polyphénols oléocanthal).', timing: 'T+12' },
      { order: 6, instruction: 'Marche légère 10-15 min postprandiale.', timing: 'T+30', note: 'Active GLUT-4 translocation indépendante de l\'insuline (AMPK)' },
    ],

    shopping_list: [
      ['Lentilles vertes', '200 g'],
      ['Poivron rouge', '1 pièce'],
      ['Concombre', '1 pièce'],
      ['Tomates cerises', '250 g'],
      ['Mesclun', '100 g'],
      ['Huile d\'olive EVOO', '1 bouteille'],
      ['Vinaigre de cidre bio', '1 bouteille'],
      ['Noix', '100 g'],
      ['Amandes', '100 g'],
      ['Herbes fraîches', '1 botte'],
    ],
  },

  // ── Contre-indications et interactions ──────────
  contraindications: [
    { condition: 'Reflux gastro-œsophagien actif', lever: 'Vinaigre pré-prandial', severity: 'relative', action: 'Réduire à 5 ml ou substituer par jus de citron' },
    { condition: 'Calculs rénaux oxaliques', lever: 'Légumineuses', severity: 'relative', action: 'Trempage 12 h + cuisson 2 eaux + limiter à 2×/sem' },
  ],
  drug_interactions: [
    { drug: 'Warfarine / AVK', lever: 'Poisson gras (ω-3)', severity: 'modérée', action: '↑ INR théorique. Surveillance si > 3 portions/sem' },
    { drug: 'Metformine', lever: 'Vinaigre', severity: 'bénigne', action: 'Synergie additive sur ↓ glycémie. Aucun risque' },
  ],
  adverse_effects: [
    { effet: 'Ballonnements transitoires (1-2 sem)', lever: 'Légumineuses', freq: 'fréquent', gestion: 'Introduire progressivement : 50 g → 100 → 200 g sur 3 sem' },
  ],

  // ── Plan de suivi ──────────────────────────────
  follow_up: {
    next_consultation: '2026-08-14',
    review_biomarkers: ['HOMA-IR', 'CRP-us', 'Omega-3 Index', 'TG/HDL ratio'],
    criteria_to_reassess: [
      'Si Bristol normalisé (3-4) + ballonnements < 1/sem → ajouter PHASE 2 : diversification microbiote (30 plantes/sem)',
      'Si HOMA-IR < 1.5 à J+28 → espacer consultations à 1/mois',
      'Si CRP-us reste > 1 ou HOMA-IR > 1.5 → vérifier compliance vinaigre + séquence + amplitude fenêtre',
    ],
    escalation_triggers: [
      'CRP-us > 3 → bilan inflammatoire complémentaire (IL-6, TNF-α, ferritine)',
      'HOMA-IR > 4.0 ou HbA1c > 6.5 % → orientation endocrinologue',
    ],
  },

  // ── Références générales ───────────────────────
  references_generales: [
    { section: 'Méthode des bottlenecks', citation: 'Functional Chef, modèle causal IFD v0.2 (IR → INFLAM → DYSBIOSE)' },
    { section: 'Cadre EBM tiering', citation: 'Classification T1/T2/T3 adaptée de Oxford Centre for Evidence-Based Medicine (OCEBM 2011)' },
    { section: 'Vinaigre pré-prandial', citation: 'Shishehbor 2017, J Funct Foods 32: 1-15', pmid: '28287520' },
    { section: 'Séquence alimentaire', citation: 'Shukla 2015, Diabetes Care 38(7): e98-e99', pmid: '26370069' },
    { section: 'Régime méditerranéen + EVOO', citation: 'Estruch 2013, N Engl J Med 368(14): 1279-1290', pmid: '23432189' },
    { section: 'Olégineux et santé métabolique', citation: 'Afshin 2014, Am J Clin Nutr 100(1): 278-288', pmid: '24717358' },
    { section: 'Légumineuses et HbA1c', citation: 'Sievenpiper 2009, Diabetologia 52(8): 1479-1495', pmid: '19655120' },
    { section: 'Omega-3 et inflammation', citation: 'Calder 2018, Mol Nutr Food Res 62(15): e1700940', pmid: '29345063' },
    { section: 'Fenêtre alimentaire 12h', citation: 'Sutton 2018, Cell Metab 27(6): 1212-1221', pmid: '30122554' },
  ],

  warnings: [
    'Vinaigre pré-prandial : à modérer en cas de reflux actif. Rincer la bouche après (préservation émail dentaire).',
    'Légumineuses : introduire progressivement si sensibilité digestive. Trempage 12h + cuisson 2 eaux réduisent les FODMAPs et oxalates.',
    'Ce document ne se substitue pas à un avis médical personnalisé. La prescription culinaire est une aide à la décision, pas un diagnostic.',
  ],
};

/** ══════════════════════════════════════════════════════
 *  COMPOSANT
 *  ══════════════════════════════════════════════════════ */

const BOTTLENECK_COLORS: Record<string, string> = { IR: '#b54016', INFLAM: '#bc6c25', DYSBIOSE: '#a4161a' };

export default function PrescriptionPage() {
  const params = useParams();
  const [c] = useState(MOCK);

  return (
    <div className="bg-neutral-50 min-h-screen font-sans">
      {/* Print toolbar */}
      <div className="print:hidden sticky top-0 z-50 bg-white border-b border-neutral-200 px-6 py-2 flex items-center justify-between text-sm text-neutral-600">
        <div className="flex items-center gap-4">
          <span className="font-medium text-neutral-800">Prescription médicale</span>
          <span className="text-[11px] font-mono text-neutral-400">{c.document_id}</span>
        </div>
        <button onClick={() => window.print()} className="bg-neutral-900 text-white px-5 py-1.5 rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors">
          🖨️ Imprimer / Exporter PDF
        </button>
      </div>

      {/* Page A4 */}
      <div className="max-w-[210mm] mx-auto bg-white shadow-sm my-6 print:my-0 print:shadow-none">
        <div className="p-8 md:p-10 print:p-8 text-neutral-900">

          {/* ═══ HEADER ═══ */}
          <div className="flex justify-between items-start border-b-2 border-neutral-800 pb-4 mb-6">
            <div>
              <h1 className="text-xl font-bold tracking-tight font-serif">Functional Chef</h1>
              <p className="text-[9px] text-neutral-500 mt-0.5">Moteur de prescription nutritionnelle — EBM-tiered — v{c.engine_version}</p>
            </div>
            <div className="text-right text-[10px] text-neutral-600 space-y-0.5">
              <p className="font-medium">{c.prescriber.name}</p>
              <p>{c.prescriber.specialty}</p>
              <p className="font-mono text-neutral-400">{c.prescriber.rpps}</p>
            </div>
          </div>

          {/* ═══ IDs ═══ */}
          <div className="grid grid-cols-3 gap-4 mb-6 text-[10px]">
            <div className="bg-neutral-50 border rounded p-2">
              <p className="text-[8px] uppercase tracking-wider text-neutral-500 font-medium">Document</p>
              <p className="font-mono font-medium text-neutral-700">{c.document_id}</p>
            </div>
            <div className="bg-neutral-50 border rounded p-2">
              <p className="text-[8px] uppercase tracking-wider text-neutral-500 font-medium">Émis le</p>
              <p className="font-medium text-neutral-700">{new Date(c.issued_at).toLocaleDateString('fr-FR', { dateStyle: 'long' })}</p>
            </div>
            <div className="bg-neutral-50 border rounded p-2">
              <p className="text-[8px] uppercase tracking-wider text-neutral-500 font-medium">Valide jusqu'au</p>
              <p className="font-medium text-neutral-700">{new Date(c.valid_until).toLocaleDateString('fr-FR', { dateStyle: 'long' })}</p>
            </div>
          </div>

          {/* ═══ PATIENT ═══ */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 mb-6 grid grid-cols-4 gap-4 text-[13px]">
            <div>
              <p className="text-[9px] uppercase tracking-wider text-neutral-500 font-medium mb-0.5">Patient</p>
              <p className="font-medium">{c.patient.name}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wider text-neutral-500 font-medium mb-0.5">Né(e) le</p>
              <p>{c.patient.dob}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wider text-neutral-500 font-medium mb-0.5">N° dossier</p>
              <p className="font-mono text-neutral-600">{c.patient.record_number}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wider text-neutral-500 font-medium mb-0.5">Repas</p>
              <p className="font-medium capitalize">{c.indication.meal_type}</p>
            </div>
          </div>

          {/* ═══ INDICATION ═══ */}
          <div className="mb-6">
            <p className="text-[9px] uppercase tracking-wider text-neutral-500 font-medium mb-1.5">Indication clinique</p>
            <p className="text-sm text-neutral-800 leading-relaxed">{c.indication.clinical_context}</p>
            <p className="text-sm text-neutral-700 leading-relaxed mt-1"><span className="font-medium">Objectif thérapeutique :</span> {c.indication.therapeutic_goal}</p>
          </div>

          {/* ═══ BIOMARQUEURS INITIAUX ═══ */}
          <div className="mb-6">
            <p className="text-[9px] uppercase tracking-wider text-neutral-500 font-medium mb-2">Bilan biologique initial</p>
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-neutral-300 text-[8px] text-neutral-500 uppercase tracking-wider">
                  <th className="text-left font-medium pb-1 w-1/4">Marqueur</th>
                  <th className="text-left font-medium pb-1 w-[60px]">Valeur</th>
                  <th className="text-left font-medium pb-1 w-[60px]">Cible</th>
                  <th className="text-left font-medium pb-1">Statut</th>
                </tr>
              </thead>
              <tbody>
                {c.baseline_biomarkers.map((b, i) => (
                  <tr key={i} className="border-b border-neutral-100">
                    <td className="py-1 font-medium">{b.code.replace(/_/g, ' ')}</td>
                    <td className="py-1 font-mono">{b.value}{b.unit}</td>
                    <td className="py-1 font-mono text-neutral-500">{b.target}</td>
                    <td className={`py-1 text-[10px] font-bold ${
                      b.flag === 'MAJOR' ? 'text-red-700' : 'text-amber-700'
                    }`}>{b.flag}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ═══ CLASSIFICATION ═══ */}
          <div className="mb-6">
            <p className="text-[9px] uppercase tracking-wider text-neutral-500 font-medium mb-2">Classification des bottlenecks</p>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {c.classification.scores.map((s: any) => {
                const isDom = s.role === 'dominant';
                const isCo = s.role === 'co_dominant';
                return (
                  <div key={s.bottleneck_id}
                    className={`rounded-lg border p-2 ${isDom ? 'ring-2 ring-offset-2 ring-neutral-800' : isCo ? 'ring-2 ring-offset-2 ring-amber-600/40' : ''}`}
                    style={{ borderColor: s.triggered ? BOTTLENECK_COLORS[s.bottleneck_id] : '#e5e5e5' }}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider"
                        style={{ color: BOTTLENECK_COLORS[s.bottleneck_id] }}>{s.bottleneck_id}</span>
                      <span className="text-[11px] font-mono font-bold">{s.score} pts</span>
                    </div>
                    <p className="text-xs font-medium">{s.label}</p>
                    <p className="text-[9px] text-neutral-500">{s.major} M · {s.moderate} m</p>
                    {isDom && <p className="text-[9px] font-bold text-neutral-800 mt-0.5">⬅ DOMINANT</p>}
                    {isCo && <p className="text-[9px] font-bold text-amber-700 mt-0.5">⬅ CO-DOMINANT</p>}
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-neutral-600 leading-relaxed italic">{c.classification.rationale}</p>
            <p className="text-[9px] text-neutral-500 mt-1">
              Niveau de confiance : <span className="font-medium text-neutral-700">confirmé</span>
              &nbsp;(≥ 3 critères concordants par bottleneck)
            </p>
          </div>

          {/* ═══ LEVIERS ═══ */}
          <div className="mb-6">
            <p className="text-[9px] uppercase tracking-wider text-neutral-500 font-medium mb-2">Leviers prescrits — {c.levers.length} interventions</p>
            <div className="space-y-1.5">
              {c.levers.map((l: any) => (
                <div key={l.id} className="border border-neutral-200 rounded-lg p-2.5 text-[12px]">
                  <div className="flex items-start gap-2">
                    <span className={`shrink-0 text-[10px] font-bold font-mono px-1 py-0.5 rounded mt-0.5 ${
                      l.tier === 'T1' ? 'bg-emerald-100 text-emerald-800' :
                      l.tier === 'T2' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                    }`}>{l.tier}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-neutral-900">{l.name_fr}</p>
                      <p className="text-neutral-600 text-[11px]">{l.dose}</p>
                      <p className="text-neutral-500 text-[10px] italic mt-0.5">{l.rationale}</p>
                      <p className="text-neutral-600 text-[11px] mt-0.5"><span className="font-medium">Effet attendu :</span> {l.effect}</p>
                      {l.references.map((r: any, ri: number) => (
                        <p key={ri} className="text-[9px] text-neutral-400 font-mono mt-0.5">
                          [{r.type}] {r.citation}
                          {r.pmid ? ` — PMID ${r.pmid}` : ''}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-neutral-200 text-[9px] text-neutral-500">
              <span>T1 = méta-analyse de RCT · T2 = RCT ou cohorte · T3 = mécanistique</span>
              <span className="ml-auto font-medium text-neutral-700">
                {c.dish.ebm_summary.T1} T1 · {c.dish.ebm_summary.T2} T2 · {c.dish.ebm_summary.T3} T3
              </span>
            </div>
          </div>

          {/* ═══ PRESCRIPTION CULINAIRE ═══ */}
          <div className="mb-6">
            <p className="text-[9px] uppercase tracking-wider text-neutral-500 font-medium mb-2">Prescription culinaire</p>
            <h2 className="text-base font-bold text-neutral-900 font-serif mb-1.5">{c.dish.title}</h2>
            <p className="text-xs text-neutral-600 mb-3 leading-relaxed">{c.dish.description}</p>

            <div className="flex flex-wrap gap-3 text-[11px] text-neutral-600 mb-3 pb-3 border-b border-neutral-200">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-neutral-800 text-white text-[7px] flex items-center justify-center font-bold">i</span>{c.dish.architecture}</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-neutral-800 text-white text-[7px] flex items-center justify-center font-bold">⏱</span>{c.dish.total_time} min</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-neutral-800 text-white text-[7px] flex items-center justify-center font-bold">×</span>{c.dish.servings} portions</span>
            </div>

            {/* Ingrédients */}
            <p className="text-[9px] uppercase tracking-wider text-neutral-500 font-medium mb-1.5">Ingrédients</p>
            <table className="w-full text-[12px] mb-4">
              <thead><tr className="border-b border-neutral-300 text-[8px] text-neutral-500 uppercase tracking-wider">
                <th className="text-left font-medium pb-1 w-2/5">Ingrédient</th>
                <th className="text-left font-medium pb-1 w-[70px]">Quantité</th>
                <th className="text-left font-medium pb-1">Note clinique</th>
              </tr></thead>
              <tbody>
                {c.dish.ingredients.map((ing: string[], i: number) => (
                  <tr key={i} className="border-b border-neutral-100">
                    <td className="py-1 text-[12px]">{ing[0]}</td>
                    <td className="py-1 text-neutral-600 font-mono text-[11px]">{ing[1]}</td>
                    <td className="py-1 text-neutral-500 text-[11px] italic">{ing[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Protocole */}
            <p className="text-[9px] uppercase tracking-wider text-neutral-500 font-medium mb-1.5">Protocole de préparation et consommation</p>
            <ol className="space-y-1.5 mb-4">
              {c.dish.steps.map((s: any) => (
                <li key={s.order} className="flex gap-2 text-[12px]">
                  <span className="shrink-0 w-4 h-4 rounded-full bg-neutral-800 text-white text-[8px] font-bold flex items-center justify-center mt-0.5">{s.order}</span>
                  <div className="flex-1">
                    <span className="text-neutral-800">{s.instruction}</span>
                    {s.note && <span className="text-neutral-500 text-[11px] italic ml-1">— {s.note}</span>}
                  </div>
                  <span className="text-[9px] font-mono text-neutral-400 shrink-0">{s.timing}</span>
                </li>
              ))}
            </ol>

            {/* Effets attendus */}
            <p className="text-[9px] uppercase tracking-wider text-neutral-500 font-medium mb-1.5">Effets biologiques attendus</p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5">
                <p className="text-[9px] uppercase tracking-wider text-emerald-700 font-bold mb-1">Postprandial · 2-4 h</p>
                <p className="text-[11px] text-neutral-700 leading-relaxed">{c.dish.expected_effects.postprandial.text}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {c.dish.expected_effects.postprandial.biomarkers.map((b: string, i: number) => (
                    <span key={i} className="text-[8px] bg-emerald-200 text-emerald-800 px-1 rounded font-mono">{b}</span>
                  ))}
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                <p className="text-[9px] uppercase tracking-wider text-amber-700 font-bold mb-1">Court terme · 4 sem</p>
                <p className="text-[11px] text-neutral-700 leading-relaxed">{c.dish.expected_effects.short_term.text}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {c.dish.expected_effects.short_term.biomarkers.map((b: string, i: number) => (
                    <span key={i} className="text-[8px] bg-amber-200 text-amber-800 px-1 rounded font-mono">{b}</span>
                  ))}
                </div>
              </div>
              <div className="bg-neutral-800 text-white rounded-lg p-2.5">
                <p className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold mb-1">Long terme · 12 sem</p>
                <p className="text-[11px] text-neutral-300 leading-relaxed">{c.dish.expected_effects.long_term.text}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {c.dish.expected_effects.long_term.biomarkers.map((b: string, i: number) => (
                    <span key={i} className="text-[8px] bg-neutral-700 text-neutral-200 px-1 rounded font-mono">{b}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Liste courses */}
            <p className="text-[9px] uppercase tracking-wider text-neutral-500 font-medium mb-1.5">Liste de courses</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[12px] mb-4">
              {c.dish.shopping_list.map((item: string[], i: number) => (
                <div key={i} className="flex items-center gap-2 py-0.5 border-b border-neutral-100">
                  <input type="checkbox" className="rounded accent-neutral-800 w-3 h-3" />
                  <span>{item[0]}</span>
                  <span className="ml-auto text-neutral-500 text-[11px] font-mono">{item[1]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ═══ CONTRE-INDICATIONS + INTERACTIONS ═══ */}
          <div className="mb-6">
            <p className="text-[9px] uppercase tracking-wider text-neutral-500 font-medium mb-2">Contre-indications et interactions</p>

            {c.contraindications.length > 0 && (
              <div className="mb-2">
                <p className="text-[8px] uppercase tracking-wider text-red-600 font-bold mb-1">Contre-indications</p>
                {c.contraindications.map((ci: any, i: number) => (
                  <div key={i} className="flex gap-2 text-[11px] text-neutral-700 mb-1">
                    <span className="text-red-500 shrink-0">⚠</span>
                    <span><span className="font-medium">{ci.condition}</span> → {ci.lever}. {ci.action}</span>
                  </div>
                ))}
              </div>
            )}
            {c.drug_interactions.length > 0 && (
              <div className="mb-2">
                <p className="text-[8px] uppercase tracking-wider text-amber-600 font-bold mb-1">Interactions médicamenteuses</p>
                {c.drug_interactions.map((di: any, i: number) => (
                  <div key={i} className="flex gap-2 text-[11px] text-neutral-700 mb-1">
                    <span className="text-amber-500 shrink-0">💊</span>
                    <span><span className="font-medium">{di.drug}</span> + {di.lever} : {di.action}</span>
                  </div>
                ))}
              </div>
            )}
            {c.adverse_effects.length > 0 && (
              <div>
                <p className="text-[8px] uppercase tracking-wider text-neutral-500 font-bold mb-1">Effets indésirables possibles</p>
                {c.adverse_effects.map((ae: any, i: number) => (
                  <div key={i} className="flex gap-2 text-[11px] text-neutral-700 mb-1">
                    <span className="text-neutral-400 shrink-0">·</span>
                    <span><span className="font-medium">{ae.effet}</span> ({ae.freq}) — {ae.gestion}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ═══ PLAN DE SUIVI ═══ */}
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-[9px] uppercase tracking-wider text-blue-700 font-bold mb-1.5">Plan de suivi</p>
            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <div>
                <p className="font-medium text-blue-800 mb-0.5">Prochaine consultation</p>
                <p>{new Date(c.follow_up.next_consultation).toLocaleDateString('fr-FR', { dateStyle: 'long' })}</p>
                <p className="font-medium text-blue-800 mt-2 mb-0.5">Biomarqueurs de contrôle</p>
                <p className="font-mono">{c.follow_up.review_biomarkers.join(' · ')}</p>
              </div>
              <div>
                <p className="font-medium text-blue-800 mb-0.5">Critères de réévaluation</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {c.follow_up.criteria_to_reassess.map((cr: string, i: number) => (
                    <li key={i} className="text-[11px]">{cr}</li>
                  ))}
                </ul>
                <p className="font-medium text-blue-800 mt-2 mb-0.5">Critères d'escalade</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {c.follow_up.escalation_triggers.map((et: string, i: number) => (
                    <li key={i} className="text-[11px]">{et}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* ═══ PRÉCAUTIONS ═══ */}
          {c.warnings.length > 0 && (
            <div className="mb-6 p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-[9px] font-bold text-amber-800 mb-1">⚠ Précautions</p>
              <ul className="space-y-0.5">
                {c.warnings.map((w: string, i: number) => (
                  <li key={i} className="text-[11px] text-amber-900 flex gap-1.5">
                    <span className="text-amber-600 shrink-0">·</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ═══ RÉFÉRENCES ═══ */}
          <div className="mb-6 pt-3 border-t border-neutral-200">
            <p className="text-[9px] uppercase tracking-wider text-neutral-500 font-medium mb-1.5">Références scientifiques</p>
            <div className="space-y-0.5">
              {c.references_generales.map((r: any, i: number) => (
                <p key={i} className="text-[9px] text-neutral-500 leading-relaxed">
                  [{r.section}] {r.citation}
                  {r.pmid ? <span className="text-neutral-400 font-mono"> — PMID {r.pmid}</span> : ''}
                </p>
              ))}
            </div>
          </div>

          {/* ═══ SIGNATURE ═══ */}
          <div className="mt-6 pt-4 border-t-2 border-neutral-800">
            <div className="grid grid-cols-2 gap-6 text-[12px]">
              <div>
                <p className="text-[9px] uppercase tracking-wider text-neutral-500 font-medium mb-0.5">Prescripteur</p>
                <p className="font-medium">{c.prescriber.name}</p>
                <p className="text-[11px] text-neutral-600">{c.prescriber.specialty}</p>
                <p className="text-[10px] text-neutral-500 font-mono">{c.prescriber.rpps}</p>
                <p className="text-[11px] text-neutral-500 mt-2">Cachet et signature</p>
                <div className="mt-2 h-12 border-b border-neutral-300 w-3/4" />
              </div>
              <div className="text-right">
                <p className="text-[9px] uppercase tracking-wider text-neutral-500 font-medium mb-0.5">Date et validité</p>
                <p className="font-medium">Émis le {new Date(c.issued_at).toLocaleDateString('fr-FR', { dateStyle: 'long' })}</p>
                <p className="text-[11px] text-neutral-600">Valide jusqu'au {new Date(c.valid_until).toLocaleDateString('fr-FR', { dateStyle: 'long' })}</p>
                <div className="mt-3 space-y-0.5">
                  <p className="text-[9px] text-neutral-400 font-mono">Doc: {c.document_id}</p>
                  <p className="text-[9px] text-neutral-400 font-mono">Engine: {c.engine_version}</p>
                  <p className="text-[9px] text-neutral-400 font-mono">
                    FC-{Math.abs(c.document_id.split('').reduce((a: number, c: string) => ((a << 5) - a) + c.charCodeAt(0), 0)).toString(16).slice(0, 8)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 pt-2 border-t border-neutral-200 text-[7px] text-neutral-400 leading-relaxed">
            <p>Functional Chef v{c.engine_version} — Moteur de prescription nutritionnelle EBM-driven — Classe IIa (Règle 11.1 MDR)</p>
            <p>Ce document est une aide à la décision médicale. Il ne se substitue pas au jugement clinique du praticien. Les références scientifiques sont citées à titre informatif.</p>
          </div>

        </div>
      </div>
    </div>
  );
}
