'use client';

import { useState } from 'react';
import Link from 'next/link';
import { NonDmNotice } from '@/components/NonDmNotice';

// Import the actual classifier engine
import { classifyBottlenecks } from '@/lib/reasoning/bottleneck-classifier';
import type { Bottleneck, BiomarkerThreshold, PatientProfile } from '@/lib/reasoning/types';

// ─── Static data for client-side demo ──────────────────────────────

const BOTTLENECKS: Bottleneck[] = [
  { id: 'IR', name: 'insulin_resistance', display_name_fr: 'Insulinorésistance', priority_rank: 1 },
  { id: 'INFLAM', name: 'inflammaging', display_name_fr: 'Inflammaging', priority_rank: 2 },
  { id: 'DYSBIOSE', name: 'dysbiosis', display_name_fr: 'Dysbiose', priority_rank: 3 },
];

const THRESHOLDS: BiomarkerThreshold[] = [
  { id: '1', bottleneck_id: 'IR', biomarker_id: 'HOMA_IR', functional_target_min: null, functional_target_max: 1.3, alert_threshold_low: null, alert_threshold_high: 1.5, alert_categorical_value: null, weight: 'major' },
  { id: '2', bottleneck_id: 'IR', biomarker_id: 'TG_HDL_RATIO', functional_target_min: null, functional_target_max: 1.0, alert_threshold_low: null, alert_threshold_high: 1.5, alert_categorical_value: null, weight: 'major' },
  { id: '3', bottleneck_id: 'IR', biomarker_id: 'ALT', functional_target_min: null, functional_target_max: 22, alert_threshold_low: null, alert_threshold_high: 25, alert_categorical_value: null, weight: 'moderate' },
  { id: '4', bottleneck_id: 'IR', biomarker_id: 'FASTING_INSULIN', functional_target_min: null, functional_target_max: 6, alert_threshold_low: null, alert_threshold_high: 8, alert_categorical_value: null, weight: 'major' },
  { id: '5', bottleneck_id: 'INFLAM', biomarker_id: 'CRP_US', functional_target_min: null, functional_target_max: 1, alert_threshold_low: null, alert_threshold_high: 1, alert_categorical_value: null, weight: 'major' },
  { id: '6', bottleneck_id: 'INFLAM', biomarker_id: 'OMEGA3_INDEX', functional_target_min: 8, functional_target_max: null, alert_threshold_low: 6, alert_threshold_high: null, alert_categorical_value: null, weight: 'major' },
  { id: '7', bottleneck_id: 'INFLAM', biomarker_id: 'AA_EPA_RATIO', functional_target_min: null, functional_target_max: 3, alert_threshold_low: null, alert_threshold_high: 7, alert_categorical_value: null, weight: 'major' },
  { id: '8', bottleneck_id: 'DYSBIOSE', biomarker_id: 'BRISTOL_SCORE', functional_target_min: null, functional_target_max: null, alert_threshold_low: 3, alert_threshold_high: 5, alert_categorical_value: null, weight: 'major' },
  { id: '9', bottleneck_id: 'DYSBIOSE', biomarker_id: 'BLOATING_FREQ', functional_target_min: null, functional_target_max: 2, alert_threshold_low: null, alert_threshold_high: 3, alert_categorical_value: null, weight: 'major' },
  { id: '10', bottleneck_id: 'DYSBIOSE', biomarker_id: 'CALPROTECTIN', functional_target_min: null, functional_target_max: 50, alert_threshold_low: null, alert_threshold_high: 50, alert_categorical_value: null, weight: 'major' },
  { id: '11', bottleneck_id: 'DYSBIOSE', biomarker_id: 'ABX_LIFETIME', functional_target_min: null, functional_target_max: 3, alert_threshold_low: null, alert_threshold_high: 3, alert_categorical_value: null, weight: 'moderate' },
  { id: '12', bottleneck_id: 'DYSBIOSE', biomarker_id: 'FIBER_INTAKE', functional_target_min: 25, functional_target_max: null, alert_threshold_low: 15, alert_threshold_high: null, alert_categorical_value: null, weight: 'moderate' },
  { id: '13', bottleneck_id: 'DYSBIOSE', biomarker_id: 'PLANT_DIVERSITY', functional_target_min: 30, functional_target_max: null, alert_threshold_low: 15, alert_threshold_high: null, alert_categorical_value: null, weight: 'moderate' },
];

const BOTTLENECK_META: Record<string, { label: string; short: string; color: string }> = {
  IR: { label: 'Insulinorésistance fonctionnelle', short: 'IR', color: 'bg-tier-t1' },
  INFLAM: { label: 'Inflammaging', short: 'INFLAM', color: 'bg-tier-t2' },
  DYSBIOSE: { label: 'Dysbiose intestinale', short: 'DYSBIOSE', color: 'bg-tier-t3' },
};

type CaseKey = 'A' | 'B' | 'C' | 'custom';

const CUSTOM_TEMPLATE: PatientProfile = {
  biomarker_values: {
    HOMA_IR: 1.2,
    TG_HDL_RATIO: 1.0,
    CRP_US: 0.6,
    OMEGA3_INDEX: 8,
  },
  clinical_signals: {
    BRISTOL_SCORE: 4,
    FIBER_INTAKE: 25,
  },
  exclusions: {},
  context: {},
};

const CASES: Record<string, { name: string; patient: PatientProfile }> = {
  A: {
    name: 'Cas A — IR isolée (F 48 ans, HOMA-IR 2.1)',
    patient: {
      biomarker_values: { HOMA_IR: 2.1, TG_HDL_RATIO: 1.8, ALT: 28, FASTING_INSULIN: 9, CRP_US: 0.8 },
      clinical_signals: {},
      exclusions: {},
      context: {},
    },
  },
  B: {
    name: 'Cas B — Inflammaging (H 62 ans, CRP-us 2.4)',
    patient: {
      biomarker_values: { CRP_US: 2.4, OMEGA3_INDEX: 4.5, AA_EPA_RATIO: 12, HOMA_IR: 1.2 },
      clinical_signals: {},
      exclusions: {},
      context: {},
    },
  },
  C: {
    name: 'Cas C — Dysbiose + INFLAM (F 35 ans, Bristol 6)',
    patient: {
      biomarker_values: { CALPROTECTIN: 80, CRP_US: 1.1, OMEGA3_INDEX: 5.5, HOMA_IR: 1.4 },
      clinical_signals: { BRISTOL_SCORE: 6, BLOATING_FREQ: 5, ABX_LIFETIME: 5, FIBER_INTAKE: 12 },
      exclusions: {},
      context: {},
    },
  },
};

const BIOMARKER_LABELS: Record<string, string> = {
  HOMA_IR: 'HOMA-IR',
  TG_HDL_RATIO: 'TG/HDL',
  ALT: 'ALT (TGP)',
  FASTING_INSULIN: 'Insuline à jeun',
  CRP_US: 'CRP-us (mg/L)',
  OMEGA3_INDEX: 'Omega-3 Index (%)',
  AA_EPA_RATIO: 'AA/EPA',
  CALPROTECTIN: 'Calprotectine (µg/g)',
  BRISTOL_SCORE: 'Bristol Stool',
  BLOATING_FREQ: 'Ballonnements (/sem)',
  ABX_LIFETIME: 'Antibio. lifetime (n)',
  FIBER_INTAKE: 'Fibres (g/j)',
  PLANT_DIVERSITY: 'Plantes/semaine',
};

// ─── Demo Page ────────────────────────────────────────────────────

export default function DemoPage() {
  const [activeCase, setActiveCase] = useState<CaseKey>('A');
  const [editing, setEditing] = useState(false);
  const [biomarkers, setBiomarkers] = useState<Record<string, number>>(CASES['A'].patient.biomarker_values);
  const [clinicalSignals, setClinicalSignals] = useState<Record<string, number | string>>(CASES['A'].patient.clinical_signals);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof classifyBottlenecks> | null>(null);
  const [expandedBottleneck, setExpandedBottleneck] = useState<string | null>(null);

  function loadCase(key: CaseKey) {
    if (key === 'custom') {
      setActiveCase('custom');
      setBiomarkers({ ...CUSTOM_TEMPLATE.biomarker_values });
      setClinicalSignals({ ...CUSTOM_TEMPLATE.clinical_signals });
      setShowResult(false);
      setResult(null);
      setEditing(true);
      return;
    }
    const c = CASES[key];
    if (!c) return;
    setActiveCase(key);
    setBiomarkers({ ...c.patient.biomarker_values });
    setClinicalSignals({ ...c.patient.clinical_signals });
    setShowResult(false);
    setResult(null);
    setEditing(false);
  }

  function runClassifier() {
    const patient: PatientProfile = {
      biomarker_values: biomarkers,
      clinical_signals: clinicalSignals,
      exclusions: {},
      context: {},
    };
    const r = classifyBottlenecks(patient, BOTTLENECKS, THRESHOLDS);
    setResult(r);
    setShowResult(true);
  }

  const scoreColor = (t: boolean) => t ? 'text-tier-t1' : 'text-ink-400';

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-ink-200 bg-ink-50/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-serif text-xl tracking-tight text-ink-900">
            Functional Chef
            <span className="text-xs uppercase tracking-widest text-saffron-700 font-medium ml-3">
              Démo hors-ligne
            </span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/beta" className="text-saffron-700 hover:text-saffron-800 font-medium">
              Pré-inscription
            </Link>
            <Link href="/" className="text-ink-600 hover:text-ink-900 transition-colors">
              ← Accueil
            </Link>
          </div>
        </div>
      </header>

      <div className="bg-ink-100 border-b border-ink-200">
        <div className="max-w-6xl mx-auto px-6 py-2 text-xs text-ink-600">
          Classification 100&nbsp;% dans le navigateur. Aucune session connectée,
          aucune donnée envoyée à un serveur. Ce n’est pas un espace praticien.
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <NonDmNotice className="mb-8" />
        {/* Case selector */}
        <section className="mb-10">
          <p className="label mb-3">Cas cliniques préchargés</p>
          <p className="text-xs text-ink-500 mb-4">
            Cas A, B et C tournent hors-ligne. Ajustez les biomarqueurs, puis lancez
            la classification — sans compte, sans clé API.
          </p>
          <div className="flex flex-wrap gap-3">
            {(['A', 'B', 'C'] as CaseKey[]).map((k) => (
              <button
                key={k}
                onClick={() => loadCase(k)}
                className={`px-4 py-2.5 text-sm rounded-sm border transition-all ${
                  activeCase === k
                    ? 'bg-saffron-700 text-ink-50 border-saffron-700 font-medium'
                    : 'bg-white text-ink-700 border-ink-300 hover:border-saffron-500'
                }`}
              >
                {CASES[k].name}
              </button>
            ))}
            <button
              onClick={() => loadCase('custom')}
              className={`px-4 py-2.5 text-sm rounded-sm border transition-all ${
                activeCase === 'custom'
                  ? 'bg-saffron-700 text-ink-50 border-saffron-700 font-medium'
                  : 'bg-white text-ink-700 border-ink-300 hover:border-saffron-500'
              }`}
            >
              + Personnalisé
            </button>
          </div>
        </section>

        {/* Biomarker editor */}
        <section className="mb-10">
          <div className="flex items-baseline justify-between mb-4">
            <p className="label mb-0">Biomarqueurs</p>
            <button
              onClick={() => setEditing(!editing)}
              className="text-xs text-saffron-700 hover:text-saffron-800 font-medium"
            >
              {editing ? '← Lecture seule' : '✎ Modifier'}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(biomarkers).map(([key, val]) => (
              <div key={key} className={`card !p-3 flex items-baseline justify-between ${editing ? 'ring-1 ring-saffron-400/50' : ''}`}>
                <span className="text-xs text-ink-600 font-medium">{BIOMARKER_LABELS[key] || key}</span>
                {editing ? (
                  <input
                    type="number"
                    step="0.1"
                    value={val}
                    onChange={(e) => setBiomarkers({ ...biomarkers, [key]: parseFloat(e.target.value) || 0 })}
                    className="w-20 text-right text-sm font-mono biomarker-value bg-white border border-ink-300 px-2 py-1 rounded-sm focus:outline-none focus:ring-1 focus:ring-saffron-500"
                  />
                ) : (
                  <span className="text-sm font-mono biomarker-value">{val}</span>
                )}
              </div>
            ))}
            {Object.entries(clinicalSignals).map(([key, val]) => (
              <div key={key} className={`card !p-3 flex items-baseline justify-between ${editing ? 'ring-1 ring-saffron-400/50' : ''}`}>
                <span className="text-xs text-ink-600 font-medium">{BIOMARKER_LABELS[key] || key}</span>
                {editing ? (
                  <input
                    type="number"
                    step="1"
                    value={val as number}
                    onChange={(e) => setClinicalSignals({ ...clinicalSignals, [key]: parseFloat(e.target.value) || 0 })}
                    className="w-20 text-right text-sm font-mono biomarker-value bg-white border border-ink-300 px-2 py-1 rounded-sm focus:outline-none focus:ring-1 focus:ring-saffron-500"
                  />
                ) : (
                  <span className="text-sm font-mono biomarker-value">{val}</span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Classify button + Safety filter toggle */}
        <section className="mb-10 flex flex-wrap items-center gap-4">
          <button
            onClick={runClassifier}
            className="btn-primary text-base !px-8 !py-3"
          >
            Lancer la classification →
          </button>
          <span className="text-xs text-ink-500">
            Moteur déterministe local. Pas de composition Claude, pas d’export PDF, pas de dossier patient.
          </span>
        </section>

        {/* Results */}
        {showResult && result && (
          <>
            {/* Dominant bottleneck */}
            <section className="mb-10">
              <p className="label mb-3">Résultat de la classification</p>
              <div className="grid grid-cols-3 gap-4 mb-4">
                {result.scores.map((s) => {
                  const meta = BOTTLENECK_META[s.bottleneck_id];
                  return (
                    <div
                      key={s.bottleneck_id}
                      className={`card !p-5 border-l-4 transition-all ${
                        s.is_dominant
                          ? 'border-saffron-700 bg-saffron-50/50'
                          : s.is_co_dominant
                          ? 'border-tier-t2 bg-amber-50/30'
                          : s.triggered
                          ? 'border-ink-300 bg-ink-50/50'
                          : 'border-ink-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-baseline justify-between mb-2">
                        <span className="font-mono text-xs font-bold text-ink-600">{meta?.short}</span>
                        <span className={`text-xs font-mono font-bold ${scoreColor(s.triggered)}`}>
                          {s.triggered ? '✓ DÉCLENCHÉ' : '— pas déclenché'}
                        </span>
                      </div>
                      <p className="font-serif text-sm text-ink-900 mb-2">{meta?.label}</p>
                      <div className="text-xs text-ink-600 space-y-0.5">
                        <p>Score pondéré : <span className="font-mono font-bold">{s.score}</span></p>
                        <p>Majeurs : {s.major_hits} · Modérés : {s.moderate_hits} · Mineurs : {s.minor_hits}</p>
                      </div>
                      {s.is_dominant && (
                        <div className="mt-2 pt-2 border-t border-saffron-300">
                          <span className="text-xs font-bold text-saffron-700">← DOMINANT</span>
                        </div>
                      )}
                      {s.is_co_dominant && (
                        <div className="mt-2 pt-2 border-t border-tier-t2/30">
                          <span className="text-xs font-bold text-tier-t2">← CO-DOMINANT</span>
                        </div>
                      )}
                      <button
                        onClick={() => setExpandedBottleneck(expandedBottleneck === s.bottleneck_id ? null : s.bottleneck_id)}
                        className="mt-2 text-[10px] text-ink-500 hover:text-ink-700 uppercase tracking-wider"
                      >
                        {expandedBottleneck === s.bottleneck_id ? 'Masquer les preuves ▲' : 'Voir les preuves ▼'}
                      </button>
                      {expandedBottleneck === s.bottleneck_id && (
                        <div className="mt-2 pt-2 border-t border-ink-200 space-y-1">
                          {s.evidence.length === 0 && <p className="text-xs text-ink-400 italic">Aucun biomarqueur déclenché</p>}
                          {s.evidence.map((ev, i) => (
                            <div key={i} className="text-[11px] bg-ink-100/50 px-2 py-1 rounded-sm flex justify-between">
                              <span className="font-mono text-ink-700">{ev.biomarker_id}</span>
                              <span className="text-ink-500">={ev.observed_value} · {ev.weight} (+{ev.contribution} pts)</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className={`card !p-4 ${result.dominant ? 'bg-tier-t1/5 border-tier-t1/20' : 'bg-ink-100/50 border-ink-200'}`}>
                <p className="text-xs text-ink-500 font-medium mb-1">Rationale du moteur</p>
                <p className="text-sm text-ink-800 leading-relaxed">{result.rationale}</p>
                {result.phenotypes && result.phenotypes.length > 0 && (
                  <div className="mt-2 flex gap-2">
                    {result.phenotypes.map((p) => (
                      <span key={p} className="text-[10px] uppercase tracking-wider bg-tier-t1/20 text-tier-t1 font-bold px-2 py-0.5 rounded-sm">
                        {p}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section className="mb-10">
              <p className="label mb-3">Aperçu d’architecture (schéma, pas un plat composé)</p>
              {result.dominant ? (
                <div className="card !p-6 border-dashed border-2 border-ink-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div>
                      <p className="font-serif text-xl text-ink-900">
                        Cible : {BOTTLENECK_META[result.dominant]?.label}
                      </p>
                      <p className="text-xs text-ink-500">
                        Schéma pédagogique. La composition réelle (Claude) n’est disponible
                        que dans l’espace praticien invité — pas ici.
                      </p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-ink-500 mb-1 font-medium">Architecture</p>
                      <ul className="space-y-1 text-ink-700">
                        <li>• 50% végétaux (fibres, polyphénols)</li>
                        <li>• 20-30% protéines</li>
                        <li>• 20% lipides (MUFA + ω-3)</li>
                      </ul>
                      <div className="mt-3 flex gap-2">
                        <span className="text-[10px] bg-tier-t1/20 text-tier-t1 font-bold px-2 py-0.5 rounded-sm">T1</span>
                        <span className="text-[10px] bg-tier-t2/20 text-tier-t2 font-bold px-2 py-0.5 rounded-sm">T2</span>
                        <span className="text-[10px] bg-tier-t3/20 text-tier-t3 font-bold px-2 py-0.5 rounded-sm">T3</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-ink-500 mb-1 font-medium">Effets attendus</p>
                      <ul className="space-y-1 text-ink-700">
                        <li><span className="text-[10px] font-mono text-ink-500">2-4h</span> ↓ pic glycémique postprandial</li>
                        <li><span className="text-[10px] font-mono text-ink-500">4 sem</span> ↑ sensibilité insulinique</li>
                        <li><span className="text-[10px] font-mono text-ink-500">12 sem</span> ↓ HbA1c · ↓ CRP-us</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-ink-200 flex flex-col sm:flex-row justify-between gap-3 items-start sm:items-center">
                    <p className="text-xs text-ink-500">
                      La démo s’arrête à la classification. Pour la composition et l’export PDF,
                      pré-inscrivez-vous à la beta — un accès invité sera envoyé par email.
                    </p>
                    <Link href="/beta" className="btn-primary text-xs !py-2 !px-4 whitespace-nowrap">
                      Pré-inscription beta →
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="card !p-6 text-center">
                  <p className="text-ink-500 text-sm">Aucun bottleneck dominant détecté.</p>
                  <p className="text-xs text-ink-400 mt-1">Ajoutez des biomarqueurs ou chargez un cas prérempli.</p>
                </div>
              )}
            </section>
          </>
        )}

        {/* Always-visible CTA */}
        <section className="bg-ink-100/50 border border-ink-200 rounded-sm p-6 text-center">
          <p className="font-serif text-xl text-ink-900 mb-2">Praticien, pas encore invité ?</p>
          <p className="text-sm text-ink-600 mb-4">
            La file d’attente beta enregistre votre email professionnel dans Supabase.
            L’espace connecté n’est pas ouvert depuis cette démo.
          </p>
          <Link href="/beta" className="btn-primary text-base !px-8 !py-3">
            M'inscrire à la beta →
          </Link>
        </section>
      </div>

      <footer className="border-t border-ink-200 py-6 text-xs text-ink-500">
        <div className="max-w-6xl mx-auto px-6 flex justify-between">
          <span>Functional Chef · Démo hors-ligne · Classification locale · non DM</span>
          <Link href="/" className="hover:text-ink-700 transition-colors">Accueil</Link>
        </div>
      </footer>
    </main>
  );
}
