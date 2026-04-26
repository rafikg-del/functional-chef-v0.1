'use client';

import { useState } from 'react';
import Link from 'next/link';
import { IntentForm } from '@/components/IntentForm';
import { DishOutput } from '@/components/DishOutput';
import type { ConsultationResult } from '@/lib/reasoning/types';

export default function ConsultationPage() {
  const [result, setResult] = useState<ConsultationResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <main className="min-h-screen">
      <header className="border-b border-ink-200">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-baseline justify-between">
          <Link href="/" className="font-serif text-xl tracking-tight text-ink-900">
            Functional Chef
            <span className="text-xs uppercase tracking-widest text-saffron-700 font-medium ml-3">
              Consultation
            </span>
          </Link>
          <Link
            href="/"
            className="text-sm text-ink-600 hover:text-ink-900 transition-colors"
          >
            ← Accueil
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {!result && !loading && (
          <>
            <p className="label">Nouvelle consultation</p>
            <h1 className="font-serif text-4xl text-ink-900 leading-tight tracking-editorial mb-8">
              Profil patient & intent clinique
            </h1>
            <IntentForm
              onResult={setResult}
              onError={setError}
              onLoadingChange={setLoading}
            />
            {error && (
              <div className="mt-6 p-4 border border-tier-t3/30 bg-tier-t3/5 rounded-sm">
                <p className="text-sm text-tier-t3 font-medium">Erreur</p>
                <p className="text-sm text-ink-700 mt-1">{error}</p>
              </div>
            )}
          </>
        )}

        {loading && (
          <div className="py-32 text-center">
            <div className="inline-block animate-pulse">
              <p className="font-serif text-2xl text-ink-700 mb-2">
                Composition en cours…
              </p>
              <p className="text-sm text-ink-500">
                Classification → filtres sécurité → sélection leviers → composition Claude
              </p>
            </div>
          </div>
        )}

        {result && !loading && (
          <>
            <button
              onClick={() => setResult(null)}
              className="btn-ghost mb-8 text-sm"
            >
              ← Nouvelle consultation
            </button>
            <DishOutput result={result} />
          </>
        )}
      </div>
    </main>
  );
}
