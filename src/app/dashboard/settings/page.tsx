'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DataErrorBanner } from '@/components/DataStatusBanners';

export default function SettingsPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [confirm, setConfirm] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setEmail(user?.email ?? '');
    });
  }, []);

  async function handleDelete() {
    setError(null);
    if (!acknowledged || confirm !== email) {
      setError('Saisissez votre email professionnel et confirmez la suppression.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/account/delete', { method: 'POST' });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error || 'La suppression a échoué.');
        setLoading(false);
        return;
      }
      const supabase = createClient();
      await supabase.auth.signOut();
      setDone(true);
      setTimeout(() => router.push('/'), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inattendue');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="text-center py-20">
        <p className="font-serif text-2xl text-ink-900 mb-2">Compte anonymisé</p>
        <p className="text-sm text-ink-600">Redirection vers l’accueil…</p>
      </div>
    );
  }

  return (
    <div>
      <p className="label">LIV-35</p>
      <h1 className="font-serif text-3xl text-ink-900 tracking-editorial mb-2">Paramètres</h1>
      <p className="text-sm text-ink-600 mb-8">
        Compte praticien · droit à l’oubli · journal d’audit
      </p>

      <div className="grid gap-6">
        <section className="card !p-5">
          <p className="label">Journal d’audit</p>
          <p className="text-sm text-ink-700 mb-3">
            Consultez les actions enregistrées sur votre compte (classification, composition, validation, export).
          </p>
          <Link href="/dashboard/audit" className="btn-ghost text-sm !py-2 !px-4">
            Ouvrir l’audit trail →
          </Link>
        </section>

        <section className="card !p-5">
          <p className="label">Politique de confidentialité</p>
          <p className="text-sm text-ink-700 mb-3">
            Version v1.0-20260714 — rédaction à faire relire par un avocat avant une beta sur données réelles.
          </p>
          <Link href="/privacy" className="text-sm text-saffron-700 hover:underline">
            Lire la politique →
          </Link>
        </section>

        <section className="card !p-5 border-tier-t3/30">
          <p className="label">Droit à l’oubli</p>
          <p className="text-sm text-ink-700 mb-4">
            Cette action anonymise vos consultations et profils patients (fonction SQL
            {' '}<code>delete_professional_account</code>), puis tente de supprimer l’utilisateur Auth.
            Irréversible. Les journaux d’audit sont détachés (obligation médico-légale de conservation).
          </p>
          <p className="text-xs text-ink-500 mb-4">
            API : <code>POST /api/account/delete</code> (session requise).
          </p>

          {error && (
            <div className="mb-4">
              <DataErrorBanner title="Suppression refusée" message={error} />
            </div>
          )}

          <label className="flex items-start gap-3 cursor-pointer mb-4">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-1"
            />
            <span className="text-sm text-ink-700">
              Je comprends que les données nominatives liées à ce compte seront anonymisées.
            </span>
          </label>

          <label className="label" htmlFor="confirm-email">Saisissez {email || 'votre email'} pour confirmer</label>
          <input
            id="confirm-email"
            type="email"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="input-field mb-4"
            autoComplete="off"
            placeholder={email || 'email@cabinet.fr'}
          />

          <button
            onClick={handleDelete}
            disabled={loading || !acknowledged || confirm !== email || !email}
            className="btn-primary text-sm !py-2.5 !px-5 bg-tier-t3 hover:bg-tier-t3"
          >
            {loading ? 'Suppression…' : 'Supprimer mon compte'}
          </button>
        </section>
      </div>
    </div>
  );
}
