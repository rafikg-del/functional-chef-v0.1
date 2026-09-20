'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { PatientNotice, PatientShell, WrongAccountNotice } from '@/components/patient/PatientShell';
import { redirectForPatientApiStatus } from '@/lib/patient/patient-paths';

const EXCLUSION_OPTIONS = [
  'gluten',
  'lactose',
  'végétarien',
  'végétalien',
  'porc',
  'fruits de mer',
  'arachides',
  'œufs',
  'soja',
];

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

export default function PatientOnboardingPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [exclusions, setExclusions] = useState<string[]>([]);
  const [allergiesText, setAllergiesText] = useState('');
  const [householdSize, setHouseholdSize] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    void (async () => {
      const claim = await fetch('/api/patient/claim-role', { method: 'POST' });
      if (claim.status === 403) {
        setForbidden(true);
        setReady(true);
        return;
      }
      const dest = redirectForPatientApiStatus(claim.status, '/patient/onboarding');
      if (dest) {
        router.push(dest);
        return;
      }
      await supabase.auth.refreshSession();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push('/patient/auth?next=/patient/onboarding');
        return;
      }
      setEmail(user.email ?? null);
      const { data } = await supabase
        .from('patient_profiles')
        .select('display_name, dietary_exclusions, allergies, household_size')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) {
        setDisplayName(typeof data.display_name === 'string' ? data.display_name : '');
        setExclusions(asStringArray(data.dietary_exclusions));
        const allergies = asStringArray(data.allergies);
        setAllergiesText(allergies.join(', '));
        setHouseholdSize(
          typeof data.household_size === 'number' ? String(data.household_size) : ''
        );
      }
      setReady(true);
    })();
  }, [router]);

  function toggleExclusion(value: string) {
    setExclusions((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push('/patient/auth?next=/patient/onboarding');
      return;
    }

    const allergies = allergiesText
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    const size = householdSize.trim() ? Number(householdSize) : null;
    if (size !== null && (!Number.isFinite(size) || size < 1)) {
      setError('Indiquez un nombre de personnes valide.');
      setLoading(false);
      return;
    }

    const payload = {
      user_id: user.id,
      display_name: displayName.trim() || null,
      dietary_exclusions: exclusions,
      allergies,
      household_size: size,
    };

    const { data: existing } = await supabase
      .from('patient_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    const query = existing
      ? supabase.from('patient_profiles').update(payload).eq('user_id', user.id)
      : supabase.from('patient_profiles').insert(payload);

    const { error: saveError } = await query;
    if (saveError) {
      setError(saveError.message);
      setLoading(false);
      return;
    }
    router.push('/patient/new');
  }

  if (!ready) {
    return (
      <main className="min-h-screen flex items-center justify-center text-sm text-ink-500">
        Chargement…
      </main>
    );
  }

  return (
    <PatientShell email={email}>
      {forbidden ? (
        <WrongAccountNotice />
      ) : (
        <>
          <p className="label">Profil</p>
          <h1 className="font-serif text-3xl text-ink-900 tracking-editorial mb-2">
            Vos préférences culinaires
          </h1>
          <p className="text-sm text-ink-600 mb-6">
            Allergies et exclusions alimentaires — pour composer des menus
            cuisinables chez vous. Rien de médical.
          </p>
          <PatientNotice className="mb-6" />

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="label" htmlFor="display-name">
                Comment vous appeler
              </label>
              <input
                id="display-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="input-field"
                placeholder="Prénom"
              />
            </div>

            <fieldset>
              <legend className="label">Exclusions alimentaires</legend>
              <div className="flex flex-wrap gap-2">
                {EXCLUSION_OPTIONS.map((option) => {
                  const on = exclusions.includes(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggleExclusion(option)}
                      className={`text-xs px-3 py-1.5 rounded-full border ${
                        on
                          ? 'bg-saffron-700 text-ink-50 border-saffron-700'
                          : 'bg-white text-ink-700 border-ink-300'
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div>
              <label className="label" htmlFor="allergies">
                Allergies (séparées par une virgule)
              </label>
              <input
                id="allergies"
                value={allergiesText}
                onChange={(e) => setAllergiesText(e.target.value)}
                className="input-field"
                placeholder="ex. noisettes, sésame"
              />
            </div>

            <div>
              <label className="label" htmlFor="household">
                Nombre de personnes à table (optionnel)
              </label>
              <input
                id="household"
                type="number"
                min={1}
                value={householdSize}
                onChange={(e) => setHouseholdSize(e.target.value)}
                className="input-field"
                placeholder="2"
              />
            </div>

            {error && (
              <p className="text-xs text-tier-t3 bg-tier-t3/10 border border-tier-t3/30 p-3 rounded-sm">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full sm:w-auto">
              {loading ? 'Enregistrement…' : 'Continuer vers un menu'}
            </button>
          </form>
        </>
      )}
    </PatientShell>
  );
}
