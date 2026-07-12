'use client';

import { useState } from 'react';
import type { ConsultationResult, MealType } from '@/lib/reasoning/types';

interface Props {
  onResult: (r: ConsultationResult) => void;
  onError: (msg: string) => void;
  onLoadingChange: (loading: boolean) => void;
}

const PRESET_CASES = {
  custom: { label: 'Saisie personnalisée', biomarkers: {}, signals: {}, age: undefined, sex: undefined },
  caseA: {
    label: 'Cas A — IR isolée (F 48 ans)',
    age: 48,
    sex: 'F' as const,
    biomarkers: { HOMA_IR: 2.1, TG_HDL_RATIO: 1.8, ALT: 28, WAIST_HEIGHT_RATIO: 0.55, CRP_US: 0.8 },
    signals: {},
  },
  caseB: {
    label: 'Cas B — INFLAM isolé (H 62 ans)',
    age: 62,
    sex: 'M' as const,
    biomarkers: { CRP_US: 2.4, OMEGA_INDEX: 4.5, AA_EPA_RATIO: 12, NLR: 2.8, HOMA_IR: 1.2 },
    signals: {},
  },
  caseC: {
    label: 'Cas C — DYSBIOSE dominante (F 35 ans)',
    age: 35,
    sex: 'F' as const,
    biomarkers: { CRP_US: 1.1, HOMA_IR: 1.4 },
    signals: { BRISTOL_SCORE: 6, BLOATING_FREQ: 7, FIBER_INTAKE: 12, ABX_LIFETIME: 5 },
  },
  caseD: {
    label: 'Cas D — IR phénotype hépatique MASLD (H 52 ans)',
    age: 52,
    sex: 'M' as const,
    biomarkers: {
      HOMA_IR: 2.0,
      TG_HDL_RATIO: 1.7,
      ALT: 32,
      TRIGLYCERIDES: 1.4,
      LIVER_FAT_PDFF: 12.5,
      FASTING_INSULIN: 9,
    },
    signals: { FRUCTOSE_INTAKE: 65, FREE_SUGAR_PCT_ENERGY: 14 },
  },
};

type PresetKey = keyof typeof PRESET_CASES;

export function IntentForm({ onResult, onError, onLoadingChange }: Props) {
  const [preset, setPreset] = useState<PresetKey>('caseA');
  const [intent, setIntent] = useState('Déjeuner anti-IR ciblé, post-charge glucidique du matin');
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [biomarkers, setBiomarkers] = useState<Record<string, number>>(PRESET_CASES.caseA.biomarkers);
  const [signals, setSignals] = useState<Record<string, number | string>>(PRESET_CASES.caseA.signals);
  const [age, setAge] = useState<number | ''>(PRESET_CASES.caseA.age ?? '');
  const [sex, setSex] = useState<'F' | 'M' | 'O' | ''>(PRESET_CASES.caseA.sex ?? '');

  function applyPreset(key: PresetKey) {
    setPreset(key);
    const p = PRESET_CASES[key];
    setBiomarkers(p.biomarkers);
    setSignals(p.signals);
    setAge(p.age ?? '');
    setSex(p.sex ?? '');
    if (key === 'caseD') {
      setIntent('Déjeuner anti-DNL hépatique : limiter fructose, séquence anti-pic, pas de SSB');
    } else if (key === 'caseA') {
      setIntent('Déjeuner anti-IR ciblé, post-charge glucidique du matin');
    }
  }

  async function handleSubmit() {
    onLoadingChange(true);
    onError('');
    try {
      const res = await fetch('/api/compose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intent,
          meal_type: mealType,
          patient: {
            age: age || undefined,
            sex: sex || undefined,
            biomarker_values: biomarkers,
            clinical_signals: signals,
            exclusions: {},
            context: { cuisine_pref: 'mediterranean', time_per_meal: 30, servings: 2, language: 'fr' },
          },
        }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || `HTTP ${res.status}`);
      }
      const data = (await res.json()) as ConsultationResult;
      onResult(data);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      onLoadingChange(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Preset selector */}
      <div>
        <label className="label">Cas test pré-renseigné</label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          {(Object.keys(PRESET_CASES) as PresetKey[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => applyPreset(k)}
              className={`text-xs px-3 py-2 rounded-sm border transition-colors text-left ${
                preset === k
                  ? 'bg-saffron-50 border-saffron-500 text-saffron-900'
                  : 'bg-white border-ink-200 text-ink-700 hover:border-ink-400'
              }`}
            >
              {PRESET_CASES[k].label}
            </button>
          ))}
        </div>
      </div>

      {/* Intent */}
      <div>
        <label className="label">Intent clinique</label>
        <textarea
          value={intent}
          onChange={(e) => setIntent(e.target.value)}
          rows={2}
          className="input-field font-serif text-lg"
          placeholder="Ex: Dîner pro-microbiote post-antibiothérapie..."
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="label">Type de repas</label>
          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value as MealType)}
            className="input-field"
          >
            <option value="breakfast">Petit-déjeuner</option>
            <option value="lunch">Déjeuner</option>
            <option value="dinner">Dîner</option>
            <option value="snack">Collation</option>
            <option value="full_day">Journée complète</option>
          </select>
        </div>
        <div>
          <label className="label">Âge</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value ? parseInt(e.target.value) : '')}
            className="input-field biomarker-value"
          />
        </div>
        <div>
          <label className="label">Sexe</label>
          <select
            value={sex}
            onChange={(e) => setSex(e.target.value as 'F' | 'M' | 'O' | '')}
            className="input-field"
          >
            <option value="">—</option>
            <option value="F">F</option>
            <option value="M">M</option>
            <option value="O">Autre</option>
          </select>
        </div>
      </div>

      {/* Biomarkers preview (read-only summary from preset) */}
      <div>
        <label className="label">Biomarqueurs renseignés</label>
        <div className="card p-4">
          {Object.keys(biomarkers).length === 0 && Object.keys(signals).length === 0 ? (
            <p className="text-sm text-ink-500 italic">
              Aucun biomarqueur. Sélectionner un cas test ou enrichir manuellement.
            </p>
          ) : (
            <dl className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 text-sm">
              {Object.entries(biomarkers).map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-ink-100 pb-1">
                  <dt className="text-ink-600">{k}</dt>
                  <dd className="biomarker-value text-ink-900">{v}</dd>
                </div>
              ))}
              {Object.entries(signals).map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-ink-100 pb-1">
                  <dt className="text-ink-600">{k}</dt>
                  <dd className="biomarker-value text-ink-900">{String(v)}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>

      <button onClick={handleSubmit} className="btn-primary w-full md:w-auto">
        Générer le plat fonctionnel
      </button>
    </div>
  );
}
