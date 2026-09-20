'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BiomarkerEditor } from '@/components/patient/BiomarkerEditor';
import { PatientNotice, PatientShell, WrongAccountNotice } from '@/components/patient/PatientShell';
import {
  editedMapFromRows,
  rowsFromBiomarkers,
  type BiomarkerRow,
} from '@/lib/patient/biomarker-fields';
import { createClient } from '@/lib/supabase/client';
import { redirectForPatientApiStatus } from '@/lib/patient/patient-paths';
import type { BiomarkerMap } from '@/lib/patient/types';
import { canLeaveGoalsStep, canLeaveLabStep, GOAL_TAGS } from '@/lib/patient/wizard-steps';

const STEPS = ['Laboratoire', 'Objectifs', 'Génération'] as const;

export default function NewPatientPlanPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [parsed, setParsed] = useState<BiomarkerMap>({});
  const [rows, setRows] = useState<BiomarkerRow[]>(() => rowsFromBiomarkers({}));
  const [parseMessage, setParseMessage] = useState('');
  const [problem, setProblem] = useState('');
  const [goals, setGoals] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    void (async () => {
      const claim = await fetch('/api/patient/claim-role', { method: 'POST' });
      if (claim.status === 403) {
        setForbidden(true);
        return;
      }
      const dest = redirectForPatientApiStatus(claim.status, '/patient/new');
      if (dest) {
        router.push(dest);
        return;
      }
      await supabase.auth.refreshSession();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push('/patient/auth?next=/patient/new');
        return;
      }
      setEmail(user.email ?? null);
    })();
  }, [router]);

  const biomarkerCount = useMemo(
    () => Object.keys(editedMapFromRows(rows)).length,
    [rows]
  );

  async function handlePdf(file: File) {
    setParseMessage('');
    setError('');
    const form = new FormData();
    form.set('file', file);
    const res = await fetch('/api/patient/parse-lab', { method: 'POST', body: form });
    const body = await res.json().catch(() => ({}));
    if (res.status === 403) {
      setForbidden(true);
      return;
    }
    const dest = redirectForPatientApiStatus(res.status, '/patient/new');
    if (dest) {
      router.push(dest);
      return;
    }
    if (!res.ok) {
      setParseMessage(
        typeof body.error === 'string'
          ? body.error
          : 'Impossible de lire ce PDF. Saisissez vos biomarqueurs manuellement.'
      );
      return;
    }
    const biomarkers = (body.biomarkers ?? {}) as BiomarkerMap;
    setParsed(biomarkers);
    setRows(rowsFromBiomarkers(biomarkers));
    setParseMessage('PDF lu. Vérifiez les valeurs avant de continuer.');
  }

  function toggleTag(tag: string) {
    setTags((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]
    );
  }

  async function handleGenerate() {
    setError('');
    setLoading(true);
    const edited = editedMapFromRows(rows);
    try {
      const labRes = await fetch('/api/patient/labs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parsed_biomarkers: parsed,
          edited_biomarkers: edited,
        }),
      });
      const labBody = await labRes.json().catch(() => ({}));
      if (labRes.status === 403) {
        setForbidden(true);
        return;
      }
      const labDest = redirectForPatientApiStatus(labRes.status, '/patient/new');
      if (labDest) {
        router.push(labDest);
        return;
      }

      const planRes = await fetch('/api/patient/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lab_id: typeof labBody.id === 'string' ? labBody.id : undefined,
          parsed_biomarkers: parsed,
          edited_biomarkers: edited,
          problem_text: problem.trim(),
          goals_text: goals.trim(),
          goal_tags: tags,
        }),
      });
      const planBody = await planRes.json().catch(() => ({}));
      if (planRes.status === 403) {
        setForbidden(true);
        return;
      }
      const planDest = redirectForPatientApiStatus(planRes.status, '/patient/new');
      if (planDest) {
        router.push(planDest);
        return;
      }
      if (!planRes.ok) {
        setError(
          typeof planBody.error === 'string'
            ? planBody.error
            : 'Impossible de composer le menu pour le moment.'
        );
        return;
      }
      if (typeof planBody.id !== 'string') {
        setError('Menu créé mais identifiant manquant.');
        return;
      }
      router.push(`/patient/plans/${planBody.id}`);
    } catch {
      setError('Impossible de composer le menu pour le moment.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <PatientShell email={email}>
      <p className="label">Nouveau menu</p>
      <h1 className="font-serif text-3xl text-ink-900 tracking-editorial mb-2">
        Composer la semaine
      </h1>
      <p className="text-sm text-ink-600 mb-6">
        Trois étapes : laboratoire, objectifs, puis un menu 7 jours et une liste
        de courses.
      </p>

      <ol className="grid grid-cols-3 gap-2 mb-8">
        {STEPS.map((label, index) => (
          <li
            key={label}
            className={`text-center text-[11px] sm:text-xs py-2 rounded-sm border ${
              index === step
                ? 'bg-saffron-700 text-ink-50 border-saffron-700'
                : index < step
                  ? 'bg-ink-100 text-ink-800 border-ink-200'
                  : 'bg-white text-ink-500 border-ink-200'
            }`}
          >
            {index + 1}. {label}
          </li>
        ))}
      </ol>

      <PatientNotice className="mb-6" />

      {forbidden ? <WrongAccountNotice /> : null}

      {!forbidden && step === 0 && (
        <section className="space-y-6">
          <div>
            <label className="label" htmlFor="lab-pdf">
              Analyse PDF (optionnel)
            </label>
            <input
              id="lab-pdf"
              type="file"
              accept="application/pdf,.pdf"
              className="block w-full text-sm text-ink-600 file:mr-3 file:px-3 file:py-1.5 file:border file:border-ink-300 file:rounded-sm file:bg-white"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handlePdf(file);
              }}
            />
            {parseMessage && <p className="text-xs text-ink-600 mt-2">{parseMessage}</p>}
          </div>
          <BiomarkerEditor rows={rows} onChange={setRows} />
          <button
            type="button"
            className="btn-primary w-full sm:w-auto"
            disabled={!canLeaveLabStep(rows)}
            onClick={() => setStep(1)}
          >
            Continuer
          </button>
        </section>
      )}

      {!forbidden && step === 1 && (
        <section className="space-y-6">
          <div>
            <label className="label" htmlFor="problem">
              Ce qui vous pose problème
            </label>
            <textarea
              id="problem"
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              className="input-field min-h-[6rem]"
              placeholder="Ex. coups de fatigue après le déjeuner, digestion lourde…"
            />
          </div>
          <div>
            <label className="label" htmlFor="goals">
              Vos objectifs culinaires
            </label>
            <textarea
              id="goals"
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              className="input-field min-h-[6rem]"
              placeholder="Ex. des plats simples pour la semaine, plus de légumes…"
            />
          </div>
          <fieldset>
            <legend className="label">Ressenti (optionnel)</legend>
            <div className="flex flex-wrap gap-2">
              {GOAL_TAGS.map((tag) => {
                const on = tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`text-xs px-3 py-1.5 rounded-full border ${
                      on
                        ? 'bg-saffron-700 text-ink-50 border-saffron-700'
                        : 'bg-white text-ink-700 border-ink-300'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </fieldset>
          <label className="flex items-start gap-3 text-sm text-ink-700">
            <input
              type="checkbox"
              className="mt-1"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            <span>
              J’accepte que mes données de santé (analyses, allergies) soient
              conservées pour composer mes menus. Consentement explicite —
              aide culinaire, pas un avis médical.
            </span>
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <button type="button" className="btn-ghost" onClick={() => setStep(0)}>
              Retour
            </button>
            <button
              type="button"
              className="btn-primary"
              disabled={!canLeaveGoalsStep({ problem, goals, consent })}
              onClick={() => setStep(2)}
            >
              Continuer
            </button>
          </div>
        </section>
      )}

      {!forbidden && step === 2 && (
        <section className="space-y-6">
          <div className="card !p-5 space-y-2 text-sm text-ink-700">
            <p>
              <strong>{biomarkerCount}</strong> biomarqueur{biomarkerCount > 1 ? 's' : ''}{' '}
              prêt{biomarkerCount > 1 ? 's' : ''} pour la composition.
            </p>
            {problem.trim() ? <p>Problème : {problem.trim()}</p> : null}
            {goals.trim() ? <p>Objectifs : {goals.trim()}</p> : null}
            <p className="text-xs text-ink-500">
              Un menu 7 jours et une liste de courses seront enregistrés dans
              votre historique.
            </p>
          </div>
          {error && (
            <p className="text-xs text-tier-t3 bg-tier-t3/10 border border-tier-t3/30 p-3 rounded-sm">
              {error}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-3">
            <button type="button" className="btn-ghost" onClick={() => setStep(1)}>
              Retour
            </button>
            <button
              type="button"
              className="btn-primary"
              disabled={loading}
              onClick={() => void handleGenerate()}
            >
              {loading ? 'Composition…' : 'Générer mon menu'}
            </button>
          </div>
        </section>
      )}
    </PatientShell>
  );
}
