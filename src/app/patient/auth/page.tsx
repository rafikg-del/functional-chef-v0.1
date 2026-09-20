'use client';

import { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { PatientNotice, PatientPublicHeader } from '@/components/patient/PatientShell';
import { safeInternalPath } from '@/lib/patient/patient-paths';

async function claimPatientRole(): Promise<void> {
  await fetch('/api/patient/claim-role', { method: 'POST' });
  const supabase = createClient();
  await supabase.auth.refreshSession();
}

function PatientAuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = useMemo(
    () => safeInternalPath(searchParams.get('next'), '/patient/onboarding'),
    [searchParams]
  );
  const afterAuth = nextPath.startsWith('/patient') ? nextPath : '/patient/onboarding';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'register' | 'magic'>('register');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const supabase = createClient();

    try {
      if (mode === 'magic') {
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(afterAuth)}`,
          },
        });
        if (otpError) throw otpError;
        setMagicSent(true);
        return;
      }

      if (mode === 'register') {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent('/patient/onboarding')}`,
          },
        });
        if (signUpError) throw signUpError;
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          await claimPatientRole();
          router.push('/patient/onboarding');
          router.refresh();
          return;
        }
        setMagicSent(true);
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;
      await claimPatientRole();
      router.push(afterAuth);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }

  if (magicSent) {
    return (
      <main className="min-h-screen flex flex-col">
        <PatientPublicHeader />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md text-center">
            <h1 className="font-serif text-3xl text-ink-900 mb-4 tracking-editorial">
              Vérifiez votre email
            </h1>
            <p className="text-sm text-ink-600 mb-8">
              Un lien vous a été envoyé à <strong>{email}</strong> pour
              finaliser votre compte patient.
            </p>
            <button
              type="button"
              onClick={() => {
                setMagicSent(false);
                setMode('magic');
              }}
              className="btn-ghost text-sm"
            >
              Renvoyer
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col">
      <PatientPublicHeader />
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="max-w-sm w-full">
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl text-ink-900 tracking-editorial">
              Compte patient
            </h1>
            <p className="text-xs text-ink-600 mt-2">
              Connexion et inscription — espace patient
            </p>
          </div>

          <PatientNotice className="mb-6" />

          <div className="card !p-5">
            <div className="flex border border-ink-200 rounded-sm overflow-hidden mb-6">
              {(['register', 'login', 'magic'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`flex-1 py-2 text-xs font-medium transition-colors ${
                    mode === m
                      ? 'bg-saffron-700 text-ink-50'
                      : 'bg-white text-ink-600 hover:bg-ink-100'
                  }`}
                >
                  {m === 'register' ? 'Inscription' : m === 'login' ? 'Connexion' : 'Lien magique'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label" htmlFor="patient-email">
                  Email
                </label>
                <input
                  id="patient-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="vous@email.fr"
                  autoComplete="email"
                />
              </div>

              {mode !== 'magic' && (
                <div>
                  <label className="label" htmlFor="patient-password">
                    Mot de passe
                  </label>
                  <input
                    id="patient-password"
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field"
                    placeholder="••••••••"
                    autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  />
                </div>
              )}

              {error && (
                <p className="text-xs text-tier-t3 bg-tier-t3/10 border border-tier-t3/30 p-3 rounded-sm">
                  {error}
                </p>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full !py-2.5 text-sm">
                {loading
                  ? 'Chargement…'
                  : mode === 'login'
                    ? 'Se connecter'
                    : mode === 'register'
                      ? 'Créer un compte'
                      : 'Envoyer le lien'}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-ink-500 mt-6">
            <Link href="/patient" className="hover:text-ink-700">
              ← Espace patient
            </Link>
            {' · '}
            <Link href="/" className="hover:text-ink-700">
              Espace praticiens
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default function PatientAuthPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center text-sm text-ink-500">
          Chargement…
        </main>
      }
    >
      <PatientAuthForm />
    </Suspense>
  );
}
