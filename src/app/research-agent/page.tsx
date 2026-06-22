'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ResearchAgentForm } from '@/components/ResearchAgentForm';
import { ResearchAgentOutput } from '@/components/ResearchAgentOutput';
import type { ResearchAgentOutput as ResearchAgentOutputType } from '@/lib/research/types';

interface ResearchAgentResponse {
  brief: ResearchAgentOutputType;
  meta?: {
    model: string;
    input_tokens?: number;
    output_tokens?: number;
    latency_ms?: number;
  };
}

export default function ResearchAgentPage() {
  const [result, setResult] = useState<ResearchAgentResponse | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <main className="min-h-screen">
      <header className="border-b border-ink-200">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-baseline justify-between">
          <Link href="/" className="font-serif text-xl tracking-tight text-ink-900">
            Functional Chef
            <span className="text-xs uppercase tracking-widest text-saffron-700 font-medium ml-3">
              Research Agent
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

      <div className="max-w-5xl mx-auto px-6 py-12">
        {!result && !loading && (
          <>
            <p className="label">Agent scientifique</p>
            <h1 className="font-serif text-4xl text-ink-900 leading-tight tracking-editorial mb-4">
              Problématique → bottleneck → leviers → recettes
            </h1>
            <p className="text-ink-600 leading-relaxed max-w-3xl mb-8">
              Cet agent produit une fiche de curation scientifique à partir d&apos;une problématique
              santé ou quotidienne. La sortie est une draft expert-review : elle sert à enrichir
              le référentiel, pas à remplacer la classification patient déterministe.
            </p>
            <ResearchAgentForm
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
                Analyse scientifique en cours…
              </p>
              <p className="text-sm text-ink-500">
                Synthèse littérature → bottleneck → impact points → leviers → recettes
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
              ← Nouvelle analyse
            </button>
            <ResearchAgentOutput result={result} />
          </>
        )}
      </div>
    </main>
  );
}
