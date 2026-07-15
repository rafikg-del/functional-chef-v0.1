'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ConsentPage() {
  const router = useRouter();
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function handleAccept() {
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError('Vous devez être connecté.');
      setLoading(false);
      return;
    }

    const { error: err } = await supabase
      .from('professional_profiles')
      .update({
        accepted_terms_at: new Date().toISOString(),
        privacy_version: 'v1.0-20260714',
      })
      .eq('user_id', user.id);

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    // Log consent in audit trail
    await supabase.from('audit_log').insert({
      user_id: user.id,
      action: 'consent.accept',
      entity_type: 'professional_profile',
      metadata: { version: 'v1.0-20260714' },
    });

    setDone(true);
  }

  if (done) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto px-6 text-center">
          <div className="text-4xl mb-4">✅</div>
          <h1 className="font-serif text-3xl text-ink-900 mb-4 tracking-editorial">
            Consentement enregistré
          </h1>
          <p className="text-sm text-ink-600 mb-8">
            Vous pouvez maintenant utiliser Functional Chef.
          </p>
          <Link href="/dashboard" className="btn-primary">
            Accéder au tableau de bord →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <header className="border-b border-ink-200">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <Link href="/dashboard" className="font-serif text-xl tracking-tight text-ink-900">
            Functional Chef
            <span className="text-xs uppercase tracking-widest text-saffron-700 font-medium ml-3">
              Consentement RGPD
            </span>
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="font-serif text-3xl text-ink-900 mb-6 tracking-editorial">
          Consentement au traitement des données
        </h1>

        <div className="prose prose-sm prose-ink max-w-none space-y-4 text-ink-700">
          <p>
            En tant que professionnel de santé utilisant Functional Chef, vous êtes 
            responsable du traitement des données de santé de vos patients. Ce formulaire 
            formalise votre consentement à utiliser l'outil dans le cadre de votre pratique.
          </p>

          <h3 className="font-serif text-lg text-ink-900 mt-6">Ce que vous acceptez</h3>
          <ul className="space-y-2">
            <li><strong>Traitement des données de santé</strong> — Les biomarqueurs et signaux cliniques que vous soumettez sont traités par Functional Chef pour générer des prescriptions culinaires personnalisées.</li>
            <li><strong>Hébergement sécurisé</strong> — Les données sont hébergées sur Supabase (PostgreSQL, chiffré au repos et en transit, hébergement France/UE).</li>
            <li><strong>Non-partage</strong> — Aucune donnée patient n'est partagée avec des tiers. Les appels API LLM (Anthropic/OpenAI) sont anonymisés (pas de PHI dans les prompts).</li>
            <li><strong>Traçabilité</strong> — Chaque consultation est horodatée et liée à votre compte. Une piste d'audit complète est conservée 10 ans (obligation médico-légale).</li>
            <li><strong>Droit à l'oubli</strong> — Vous pouvez supprimer votre compte et toutes les données associées à tout moment.</li>
          </ul>

          <h3 className="font-serif text-lg text-ink-900 mt-6">Vos obligations</h3>
          <ul className="space-y-2">
            <li>Recueillir le consentement explicite de vos patients avant d'utiliser Functional Chef pour leur prescription.</li>
            <li>Ne pas soumettre de données nominatives directes (nom, prénom, date de naissance) dans les champs libres.</li>
            <li>Valider médicalement chaque sortie avant transmission au patient.</li>
          </ul>

          <h3 className="font-serif text-lg text-ink-900 mt-6">Durée de conservation</h3>
          <ul className="space-y-2">
            <li>Consultations : <strong>3 ans</strong></li>
            <li>Profils patients : <strong>5 ans</strong></li>
            <li>Journal d'audit : <strong>10 ans</strong></li>
          </ul>

          <p className="text-xs text-ink-500 mt-6">
            Version : v1.0-20260714 · Dernière mise à jour : 14 juillet 2026
          </p>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-tier-t3/10 border border-tier-t3/30 rounded-sm">
            <p className="text-xs text-tier-t3">{error}</p>
          </div>
        )}

        <div className="mt-8 space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-1"
            />
            <span className="text-sm text-ink-700">
              J'ai lu et j'accepte les conditions ci-dessus. Je comprends mes 
              responsabilités en tant que professionnel de santé utilisateur de Functional Chef.
            </span>
          </label>

          <button
            onClick={handleAccept}
            disabled={!accepted || loading}
            className="btn-primary w-full !py-3"
          >
            {loading ? 'Enregistrement...' : 'Accepter et continuer'}
          </button>
        </div>
      </div>
    </main>
  );
}
