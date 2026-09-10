'use client';

import { useState } from 'react';
import Link from 'next/link';
import { NonDmNotice } from '@/components/NonDmNotice';

const SPECIALTY_OPTIONS = [
  { value: 'medecin_fonctionnel', label: 'Médecine fonctionnelle / nutritionnelle' },
  { value: 'medecin_generaliste', label: 'Médecine générale' },
  { value: 'dieteticien', label: 'Diététicien(ne) / Nutritionniste' },
  { value: 'naturopathe', label: 'Naturopathe' },
  { value: 'chercheur', label: 'Chercheur / enseignant' },
  { value: 'autre', label: 'Autre professionnel de santé' },
] as const;

const VOLUME_OPTIONS = [
  { value: '0-5', label: '0-5' },
  { value: '5-15', label: '5-15' },
  { value: '15-30', label: '15-30' },
  { value: '30+', label: '30+' },
] as const;

export default function BetaPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [operatorChecklist, setOperatorChecklist] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    specialty: '',
    patients_per_week: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setOperatorChecklist([]);
    setLoading(true);

    try {
      const res = await fetch('/api/beta-waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: form.name,
          email: form.email,
          specialty: form.specialty,
          patients_per_week: form.patients_per_week,
          source: 'beta_page',
        }),
      });

      const body = (await res.json().catch(() => ({}))) as {
        error?: string;
        operator_checklist?: string[];
      };

      if (!res.ok) {
        setError(body.error || 'Inscription impossible pour le moment. Rien n’a été enregistré.');
        setOperatorChecklist(body.operator_checklist ?? []);
        return;
      }

      setSubmitted(true);
    } catch {
      setError('Réseau indisponible. Vérifiez votre connexion et réessayez.');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="max-w-lg mx-auto px-6 text-center">
          <p className="label mb-4">Pré-inscription</p>
          <h1 className="font-serif text-3xl text-ink-900 mb-4 tracking-editorial">
            Demande enregistrée
          </h1>
          <p className="text-sm text-ink-600 mb-6 leading-relaxed">
            Merci {form.name}. Votre email professionnel est dans la file d’attente
            beta. Nous vous écrirons pour un accès invité — pas d’ouverture automatique
            de compte.
          </p>
          <p className="text-xs text-ink-500 mb-8">
            En attendant, vous pouvez explorer la{' '}
            <Link href="/demo" className="text-saffron-700 hover:underline">
              démo publique
            </Link>{' '}
            (cas A/B/C, sans compte).
          </p>
          <Link href="/" className="btn-primary">
            ← Retour à l’accueil
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <header className="border-b border-ink-200">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="font-serif text-xl tracking-tight text-ink-900">
            Functional Chef
            <span className="text-xs uppercase tracking-widest text-saffron-700 font-medium ml-3">
              Beta praticien
            </span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/demo" className="text-ink-600 hover:text-ink-900 transition-colors">
              Démo
            </Link>
            <Link href="/" className="text-ink-600 hover:text-ink-900 transition-colors">
              ← Accueil
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-6 py-16">
        <p className="label">File d’attente beta</p>
        <h1 className="font-serif text-4xl text-ink-900 leading-tight tracking-editorial mb-4">
          Pré-inscription praticien
        </h1>
        <p className="text-sm text-ink-600 mb-6 leading-relaxed">
          La beta est limitée à <strong>20 praticiens invités</strong>. L’accès complet
          (classification + composition + export PDF) est ouvert sur invitation, en
          échange d’un retour d’usage. Ce formulaire n’ouvre pas une session de
          production.
        </p>

        <NonDmNotice className="mb-8" />

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label" htmlFor="name">Nom complet</label>
            <input
              id="name"
              type="text"
              required
              autoComplete="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-field"
              placeholder="Dr Marie Dupont"
            />
          </div>
          <div>
            <label className="label" htmlFor="email">Email professionnel</label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input-field"
              placeholder="marie.dupont@cabinet.fr"
            />
          </div>
          <div>
            <label className="label" htmlFor="specialty">Spécialité</label>
            <select
              id="specialty"
              required
              value={form.specialty}
              onChange={(e) => setForm({ ...form, specialty: e.target.value })}
              className="input-field"
            >
              <option value="">— Sélectionnez —</option>
              {SPECIALTY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="patients_per_week">
              Patients avec volet nutritionnel / semaine
            </label>
            <select
              id="patients_per_week"
              required
              value={form.patients_per_week}
              onChange={(e) => setForm({ ...form, patients_per_week: e.target.value })}
              className="input-field"
            >
              <option value="">— Sélectionnez —</option>
              {VOLUME_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="p-3 bg-tier-t3/10 border border-tier-t3/30 rounded-sm space-y-2">
              <p className="text-xs text-tier-t3 leading-relaxed">{error}</p>
              {operatorChecklist.length > 0 && (
                <div>
                  <p className="text-[11px] font-medium text-ink-700 mb-1">
                    Checklist opérateur (à faire sur Supabase / Vercel) :
                  </p>
                  <ol className="list-decimal list-inside text-[11px] text-ink-700 space-y-1">
                    {operatorChecklist.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}

          <div className="pt-2">
            <p className="text-[11px] text-ink-500 leading-relaxed mb-4">
              Nous enregistrons uniquement votre nom, email, spécialité et volume
              d’activité — pas de données patient. En soumettant, vous acceptez d’être
              contacté pour la beta. Voir la{' '}
              <Link href="/privacy" className="text-saffron-700 hover:underline">
                politique de confidentialité
              </Link>
              .
            </p>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-base !py-3"
            >
              {loading ? 'Enregistrement…' : 'Rejoindre la file d’attente →'}
            </button>
          </div>
        </form>

        <div className="mt-10 pt-6 border-t border-ink-200">
          <p className="text-xs text-ink-500 text-center">
            Déjà invité ?{' '}
            <Link href="/auth" className="text-saffron-700 hover:underline">
              Connexion espace praticien
            </Link>
            {' · '}
            <a
              href="https://github.com/rafikg-del/functional-chef-v0.1"
              className="text-saffron-700 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
