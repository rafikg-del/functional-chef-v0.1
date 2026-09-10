'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { NonDmNotice } from '@/components/NonDmNotice';

const SPECIALTIES = [
  { value: 'medecin_fonctionnel', label: 'Médecine fonctionnelle / nutritionnelle' },
  { value: 'medecin_generaliste', label: 'Médecine générale' },
  { value: 'dieteticien', label: 'Diététicien(ne) / Nutritionniste' },
  { value: 'naturopathe', label: 'Naturopathe' },
  { value: 'chercheur', label: 'Chercheur / enseignant' },
  { value: 'autre', label: 'Autre professionnel de santé' },
] as const;

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    full_name: '',
    specialty: '',
    rpps_number: '',
    practice_name: '',
  });

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.push('/auth');
        return;
      }
      const { data } = await supabase
        .from('professional_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) {
        setForm({
          full_name: data.full_name ?? '',
          specialty: data.specialty ?? '',
          rpps_number: data.rpps_number ?? '',
          practice_name: data.practice_name ?? '',
        });
      }
      setLoading(false);
    });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth');
      return;
    }

    const payload = {
      user_id: user.id,
      full_name: form.full_name.trim(),
      specialty: form.specialty,
      rpps_number: form.rpps_number.trim() || null,
      practice_name: form.practice_name.trim() || null,
    };

    const { error: err } = await supabase
      .from('professional_profiles')
      .upsert(payload, { onConflict: 'user_id' });

    if (err) {
      setError(err.message);
      setSaving(false);
      return;
    }

    router.push('/consent');
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-ink-500">Chargement…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <header className="border-b border-ink-200">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/dashboard" className="font-serif text-xl tracking-tight text-ink-900">
            Functional Chef
            <span className="text-xs uppercase tracking-widest text-saffron-700 font-medium ml-3">
              Profil praticien
            </span>
          </Link>
          <Link href="/dashboard" className="text-sm text-ink-600 hover:text-ink-900">
            ← Tableau de bord
          </Link>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-6 py-12">
        <h1 className="font-serif text-3xl text-ink-900 mb-3 tracking-editorial">
          Compléter le profil professionnel
        </h1>
        <p className="text-sm text-ink-600 mb-6 leading-relaxed">
          Requis avant la première consultation. Le numéro RPPS est optionnel.
          Aucune donnée patient n’est demandée ici.
        </p>
        <NonDmNotice className="mb-8" />

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label" htmlFor="full_name">Nom complet</label>
            <input
              id="full_name"
              required
              minLength={2}
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="input-field"
              placeholder="Dr Marie Dupont"
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
              {SPECIALTIES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="practice_name">Structure (optionnel)</label>
            <input
              id="practice_name"
              value={form.practice_name}
              onChange={(e) => setForm({ ...form, practice_name: e.target.value })}
              className="input-field"
              placeholder="Cabinet / clinique"
            />
          </div>
          <div>
            <label className="label" htmlFor="rpps">RPPS (optionnel)</label>
            <input
              id="rpps"
              value={form.rpps_number}
              onChange={(e) => setForm({ ...form, rpps_number: e.target.value })}
              className="input-field"
              placeholder="11 chiffres"
            />
          </div>

          {error && (
            <div className="p-3 bg-tier-t3/10 border border-tier-t3/30 rounded-sm">
              <p className="text-xs text-tier-t3">{error}</p>
            </div>
          )}

          <button type="submit" disabled={saving} className="btn-primary w-full !py-3">
            {saving ? 'Enregistrement…' : 'Enregistrer et continuer vers le consentement →'}
          </button>
        </form>
      </div>
    </main>
  );
}
