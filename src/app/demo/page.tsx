'use client';

import { useState } from 'react';
import Link from 'next/link';
import { NonDmNotice } from '@/components/NonDmNotice';
import { DemoPrescription } from '@/components/demo/DemoPrescription';
import {
  BIOMARKER_LABELS,
  DEMO_CASES,
  loadDemoPatient,
  type DemoCaseKey,
} from '@/lib/demo/cases';
import { BOTTLENECK_META, PHENOTYPE_LABELS, WEIGHT_LABELS } from '@/lib/demo/labels';
import { runPublicDemo, type DemoDishSource, type PublicDemoResult } from '@/lib/demo/run-public-demo';
import type { ComposedDish } from '@/lib/reasoning/types';

export default function DemoPage() {
  const initial = loadDemoPatient('A');
  const [activeCase, setActiveCase] = useState<DemoCaseKey>('A');
  const [editing, setEditing] = useState(false);
  const [biomarkers, setBiomarkers] = useState<Record<string, number>>(initial.biomarker_values);
  const [clinicalSignals, setClinicalSignals] = useState<Record<string, number | string>>(
    initial.clinical_signals
  );
  const [preview, setPreview] = useState<PublicDemoResult | null>(null);
  const [dish, setDish] = useState<ComposedDish | null>(null);
  const [dishSource, setDishSource] = useState<DemoDishSource>('fixture');
  const [expandedBottleneck, setExpandedBottleneck] = useState<string | null>(null);
  const [liveHint, setLiveHint] = useState('');

  function loadCase(key: DemoCaseKey) {
    const patient = loadDemoPatient(key);
    setActiveCase(key);
    setBiomarkers({ ...patient.biomarker_values });
    setClinicalSignals({ ...patient.clinical_signals });
    setPreview(null);
    setDish(null);
    setLiveHint('');
    setEditing(key === 'custom');
  }

  function runDemo() {
    const patient = {
      biomarker_values: biomarkers,
      clinical_signals: clinicalSignals,
      exclusions: {},
      context: {},
    };
    const result = runPublicDemo({ patient, case_key: activeCase });
    setPreview(result);
    setDish(result.dish);
    setDishSource(result.dish_source);
    setLiveHint('');

    void fetch('/api/demo-compose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ case_key: activeCase, patient }),
    })
      .then(async (res) => {
        if (!res.ok) return;
        const body = (await res.json()) as {
          dish_source?: DemoDishSource;
          dish?: ComposedDish | null;
        };
        if (body.dish_source === 'live' && body.dish) {
          setDish(body.dish);
          setDishSource('live');
          setLiveHint('Composition Claude disponible sur cet environnement.');
        }
      })
      .catch(() => {
        /* fixture already shown — never fail the demo */
      });
  }

  const scoreColor = (t: boolean) => (t ? 'text-tier-t1' : 'text-ink-400');

  return (
    <main className="min-h-screen">
      <header className="border-b border-ink-200 bg-ink-50/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-serif text-xl tracking-tight text-ink-900">
            Functional Chef
            <span className="text-xs uppercase tracking-widest text-saffron-700 font-medium ml-3">
              Démo publique
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
          Sans compte. Classification + leviers + aperçu de plat dans le navigateur.
          Claude n’est pas requis. Ce n’est pas un espace praticien.
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <NonDmNotice className="mb-8" />

        <section className="mb-10">
          <p className="label mb-3">Cas cliniques préchargés</p>
          <p className="text-xs text-ink-500 mb-4">
            Choisissez A, B ou C — ou un profil personnalisé. Puis lancez le moteur :
            classification, leviers T1–T3, aperçu culinaire.
          </p>
          <div className="flex flex-wrap gap-3">
            {(['A', 'B', 'C'] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => loadCase(k)}
                className={`px-4 py-2.5 text-sm rounded-sm border transition-all ${
                  activeCase === k
                    ? 'bg-saffron-700 text-ink-50 border-saffron-700 font-medium'
                    : 'bg-white text-ink-700 border-ink-300 hover:border-saffron-500'
                }`}
              >
                {DEMO_CASES[k].name}
              </button>
            ))}
            <button
              type="button"
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

        <section className="mb-10">
          <div className="flex items-baseline justify-between mb-4">
            <p className="label mb-0">Biomarqueurs</p>
            <button
              type="button"
              onClick={() => setEditing(!editing)}
              className="text-xs text-saffron-700 hover:text-saffron-800 font-medium"
            >
              {editing ? '← Lecture seule' : '✎ Modifier'}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(biomarkers).map(([key, val]) => (
              <div
                key={key}
                className={`card !p-3 flex items-baseline justify-between ${editing ? 'ring-1 ring-saffron-400/50' : ''}`}
              >
                <span className="text-xs text-ink-600 font-medium">
                  {BIOMARKER_LABELS[key] || key}
                </span>
                {editing ? (
                  <input
                    type="number"
                    step="0.1"
                    value={val}
                    onChange={(e) =>
                      setBiomarkers({ ...biomarkers, [key]: parseFloat(e.target.value) || 0 })
                    }
                    className="w-20 text-right text-sm font-mono biomarker-value bg-white border border-ink-300 px-2 py-1 rounded-sm focus:outline-none focus:ring-1 focus:ring-saffron-500"
                  />
                ) : (
                  <span className="text-sm font-mono biomarker-value">{val}</span>
                )}
              </div>
            ))}
            {Object.entries(clinicalSignals).map(([key, val]) => (
              <div
                key={key}
                className={`card !p-3 flex items-baseline justify-between ${editing ? 'ring-1 ring-saffron-400/50' : ''}`}
              >
                <span className="text-xs text-ink-600 font-medium">
                  {BIOMARKER_LABELS[key] || key}
                </span>
                {editing ? (
                  <input
                    type="number"
                    step="1"
                    value={val as number}
                    onChange={(e) =>
                      setClinicalSignals({
                        ...clinicalSignals,
                        [key]: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-20 text-right text-sm font-mono biomarker-value bg-white border border-ink-300 px-2 py-1 rounded-sm focus:outline-none focus:ring-1 focus:ring-saffron-500"
                  />
                ) : (
                  <span className="text-sm font-mono biomarker-value">{val}</span>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="mb-10 flex flex-wrap items-center gap-4">
          <button type="button" onClick={runDemo} className="btn-primary text-base !px-8 !py-3">
            Lancer le moteur →
          </button>
          <span className="text-xs text-ink-500">
            Déterministe, local. Pas d’export PDF, pas de dossier patient.
            {liveHint ? ` ${liveHint}` : ''}
          </span>
        </section>

        {preview && (
          <>
            <section className="mb-10">
              <p className="label mb-3">Résultat de la classification</p>
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                {preview.classification.scores.map((s) => {
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
                        <span className="font-mono text-xs font-bold text-ink-600">
                          {meta?.short}
                        </span>
                        <span className={`text-xs font-mono font-bold ${scoreColor(s.triggered)}`}>
                          {s.triggered ? '✓ Déclenché' : '— non déclenché'}
                        </span>
                      </div>
                      <p className="font-serif text-sm text-ink-900 mb-2">{meta?.label}</p>
                      <div className="text-xs text-ink-600 space-y-0.5">
                        <p>
                          Score pondéré : <span className="font-mono font-bold">{s.score}</span>
                        </p>
                        <p>
                          Majeurs : {s.major_hits} · Modérés : {s.moderate_hits} · Mineurs :{' '}
                          {s.minor_hits}
                        </p>
                      </div>
                      {s.is_dominant && (
                        <div className="mt-2 pt-2 border-t border-saffron-300">
                          <span className="text-xs font-bold text-saffron-700">← Dominant</span>
                        </div>
                      )}
                      {s.is_co_dominant && (
                        <div className="mt-2 pt-2 border-t border-tier-t2/30">
                          <span className="text-xs font-bold text-tier-t2">← Co-dominant</span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedBottleneck(
                            expandedBottleneck === s.bottleneck_id ? null : s.bottleneck_id
                          )
                        }
                        className="mt-2 text-[10px] text-ink-500 hover:text-ink-700 uppercase tracking-wider"
                      >
                        {expandedBottleneck === s.bottleneck_id
                          ? 'Masquer les preuves ▲'
                          : 'Voir les preuves ▼'}
                      </button>
                      {expandedBottleneck === s.bottleneck_id && (
                        <div className="mt-2 pt-2 border-t border-ink-200 space-y-1">
                          {s.evidence.length === 0 && (
                            <p className="text-xs text-ink-400 italic">
                              Aucun biomarqueur déclenché
                            </p>
                          )}
                          {s.evidence.map((ev, i) => (
                            <div
                              key={`${ev.biomarker_id}-${i}`}
                              className="text-[11px] bg-ink-100/50 px-2 py-1 rounded-sm flex justify-between gap-2"
                            >
                              <span className="font-mono text-ink-700">
                                {BIOMARKER_LABELS[ev.biomarker_id] || ev.biomarker_id}
                              </span>
                              <span className="text-ink-500">
                                ={ev.observed_value} · {WEIGHT_LABELS[ev.weight]} (+
                                {ev.contribution} pts)
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div
                className={`card !p-4 ${preview.classification.dominant ? 'bg-tier-t1/5 border-tier-t1/20' : 'bg-ink-100/50 border-ink-200'}`}
              >
                <p className="text-xs text-ink-500 font-medium mb-1">Rationale du moteur</p>
                <p className="text-sm text-ink-800 leading-relaxed">
                  {preview.classification.rationale}
                </p>
                {preview.classification.phenotypes &&
                  preview.classification.phenotypes.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {preview.classification.phenotypes.map((p) => (
                        <span
                          key={p}
                          className="text-[10px] uppercase tracking-wider bg-tier-t1/20 text-tier-t1 font-bold px-2 py-0.5 rounded-sm"
                        >
                          {PHENOTYPE_LABELS[p] ?? p}
                        </span>
                      ))}
                    </div>
                  )}
              </div>
            </section>

            <DemoPrescription preview={preview} dish={dish} dishSource={dishSource} />
          </>
        )}

        <section className="bg-ink-100/50 border border-ink-200 rounded-sm p-6 text-center mt-10">
          <p className="font-serif text-xl text-ink-900 mb-2">Praticien, pas encore invité ?</p>
          <p className="text-sm text-ink-600 mb-4">
            La file d’attente beta enregistre votre email professionnel dans Supabase — pas un
            succès fictif. L’espace connecté n’est pas ouvert depuis cette démo.
          </p>
          <Link href="/beta" className="btn-primary text-base !px-8 !py-3">
            M&apos;inscrire à la beta →
          </Link>
        </section>
      </div>

      <footer className="border-t border-ink-200 py-6 text-xs text-ink-500">
        <div className="max-w-6xl mx-auto px-6 flex justify-between">
          <span>Functional Chef · Démo publique · sans compte · non DM</span>
          <Link href="/" className="hover:text-ink-700 transition-colors">
            Accueil
          </Link>
        </div>
      </footer>
    </main>
  );
}
