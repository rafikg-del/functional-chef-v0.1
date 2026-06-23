'use client';

import { useState } from 'react';
import type { ResearchAgentOutput } from '@/lib/research/types';

interface ResearchAgentResponse {
  brief: ResearchAgentOutput;
  literature_search?: {
    query: string;
    pmids: string[];
    warnings: string[];
  };
  meta?: {
    provider?: string;
    model: string;
    input_tokens?: number;
    output_tokens?: number;
    latency_ms?: number;
  };
}

interface Props {
  onResult: (result: ResearchAgentResponse) => void;
  onError: (message: string) => void;
  onLoadingChange: (loading: boolean) => void;
}

const DEFAULT_PROBLEM =
  "Patient actif, sommeil fragmenté, réveils nocturnes, envies de sucre à 17h, HRV basse et impression de récupération insuffisante malgré alimentation correcte. Explorer le bottleneck charge allostatique.";

const DEFAULT_LITERATURE = `[
  {
    "title": "Example paper title",
    "year": 2024,
    "pmid": "optional",
    "abstract": "Paste abstract here if available",
    "key_findings": ["Finding 1", "Finding 2"]
  }
]`;

export function ResearchAgentForm({ onResult, onError, onLoadingChange }: Props) {
  const [problem, setProblem] = useState(DEFAULT_PROBLEM);
  const [targetBottleneck, setTargetBottleneck] = useState('Charge allostatique');
  const [population, setPopulation] = useState('Adulte 35-65 ans, non pathologie aiguë');
  const [dailyContext, setDailyContext] = useState('Stress professionnel, fatigue perçue, sommeil non récupérateur');
  const [mealType, setMealType] = useState('dinner');
  const [literatureJson, setLiteratureJson] = useState('');
  const [includeLiteratureExample, setIncludeLiteratureExample] = useState(false);
  const [autoPubMed, setAutoPubMed] = useState(true);
  const [pubMedQuery, setPubMedQuery] = useState('');
  const [maxPubMedResults, setMaxPubMedResults] = useState(6);
  const [llmProvider, setLlmProvider] = useState<'anthropic' | 'grok'>('grok');
  const [grokApiKey, setGrokApiKey] = useState('');
  const [llmModel, setLlmModel] = useState('');

  async function handleSubmit() {
    onLoadingChange(true);
    onError('');

    try {
      let literature;
      const rawLiterature = literatureJson;
      if (rawLiterature.trim()) {
        literature = JSON.parse(rawLiterature);
        if (!Array.isArray(literature)) {
          throw new Error('La littérature doit être un tableau JSON.');
        }
      }

      const res = await fetch('/api/research-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem,
          target_bottleneck_name: targetBottleneck || undefined,
          llm: {
            provider: llmProvider,
            model: llmModel || undefined,
            grok_api_key: llmProvider === 'grok' ? grokApiKey || undefined : undefined,
          },
          context: {
            population,
            daily_context: dailyContext,
            preferred_cuisine: 'mediterranean',
            meal_type: mealType,
            language: 'fr',
          },
          literature,
          literature_search: {
            enabled: autoPubMed,
            query: pubMedQuery || undefined,
            max_results: maxPubMedResults,
          },
        }),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.message || body.error || `HTTP ${res.status}`);
      }

      onResult(body as ResearchAgentResponse);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      onLoadingChange(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="label">Problématique santé / quotidien</label>
        <textarea
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          rows={5}
          className="input-field font-serif text-lg"
          placeholder="Ex: sommeil fragmenté + cravings sucre + HRV basse..."
        />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="label">Bottleneck cible optionnel</label>
          <input
            value={targetBottleneck}
            onChange={(e) => setTargetBottleneck(e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label className="label">Population</label>
          <input
            value={population}
            onChange={(e) => setPopulation(e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label className="label">Repas attendu</label>
          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
            className="input-field"
          >
            <option value="breakfast">Petit-déjeuner</option>
            <option value="lunch">Déjeuner</option>
            <option value="dinner">Dîner</option>
            <option value="snack">Collation</option>
            <option value="full_day">Journée complète</option>
          </select>
        </div>
      </div>

      <div>
        <label className="label">Contexte quotidien</label>
        <input
          value={dailyContext}
          onChange={(e) => setDailyContext(e.target.value)}
          className="input-field"
        />
      </div>

      <div>
        <div className="card p-4 space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="label">Fournisseur LLM</label>
              <select
                value={llmProvider}
                onChange={(e) => setLlmProvider(e.target.value as 'anthropic' | 'grok')}
                className="input-field"
              >
                <option value="grok">Grok / xAI</option>
                <option value="anthropic">Anthropic</option>
              </select>
            </div>
            <div>
              <label className="label">Modèle optionnel</label>
              <input
                value={llmModel}
                onChange={(e) => setLlmModel(e.target.value)}
                className="input-field"
                placeholder={llmProvider === 'grok' ? 'grok-4.3' : 'claude-opus-4-7'}
              />
            </div>
            {llmProvider === 'grok' && (
              <div>
                <label className="label">Clé Grok / xAI</label>
                <input
                  type="password"
                  value={grokApiKey}
                  onChange={(e) => setGrokApiKey(e.target.value)}
                  className="input-field"
                  placeholder="xai-..."
                  autoComplete="off"
                />
              </div>
            )}
          </div>
          <p className="text-xs text-ink-500">
            La clé Grok saisie ici est transmise uniquement à cette requête serveur et n&apos;est pas persistée.
            En production, tu peux aussi utiliser `GROK_API_KEY` ou `XAI_API_KEY`.
          </p>
        </div>
      </div>

      <div>
        <div className="card p-4 space-y-4">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={autoPubMed}
              onChange={(e) => setAutoPubMed(e.target.checked)}
              className="mt-1"
            />
            <span>
              <span className="block text-sm font-medium text-ink-900">
                Recherche PubMed automatique
              </span>
              <span className="block text-xs text-ink-500 mt-1">
                Récupère quelques abstracts via NCBI E-utilities et les injecte dans la synthèse.
              </span>
            </span>
          </label>

          {autoPubMed && (
            <div className="grid md:grid-cols-[1fr_160px] gap-4">
              <div>
                <label className="label">Requête PubMed optionnelle</label>
                <input
                  value={pubMedQuery}
                  onChange={(e) => setPubMedQuery(e.target.value)}
                  className="input-field"
                  placeholder="Vide = requête construite depuis la problématique"
                />
              </div>
              <div>
                <label className="label">Nombre d&apos;abstracts</label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={maxPubMedResults}
                  onChange={(e) => setMaxPubMedResults(Number(e.target.value))}
                  className="input-field biomarker-value"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between gap-4">
          <label className="label mb-0">Littérature fournie (JSON optionnel)</label>
          <button
            type="button"
            onClick={() => {
              setIncludeLiteratureExample((v) => !v);
              setLiteratureJson('');
            }}
            className="text-xs text-saffron-700 hover:text-saffron-900"
          >
            {includeLiteratureExample ? 'Retirer exemple' : 'Voir format'}
          </button>
        </div>
        <textarea
          value={includeLiteratureExample ? DEFAULT_LITERATURE : literatureJson}
          onChange={(e) => {
            setIncludeLiteratureExample(false);
            setLiteratureJson(e.target.value);
          }}
          rows={includeLiteratureExample || literatureJson ? 8 : 3}
          className="input-field font-mono text-xs"
          placeholder='[{"title":"...", "pmid":"...", "abstract":"..."}]'
        />
        <p className="text-xs text-ink-500 mt-2">
          Sans bibliographie fournie, l&apos;agent produit une draft avec références à vérifier, sans inventer de PMID/DOI.
        </p>
      </div>

      <button onClick={handleSubmit} className="btn-primary w-full md:w-auto">
        Générer la fiche bottleneck
      </button>
    </div>
  );
}
