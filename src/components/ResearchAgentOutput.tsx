'use client';

import { EBMBadge } from './EBMBadge';
import type { ResearchAgentOutput } from '@/lib/research/types';

interface Props {
  result: {
    brief: ResearchAgentOutput;
    literature_search?: {
      query: string;
      pmids: string[];
      papers?: {
        title: string;
        pmid?: string;
        year?: number;
        journal?: string;
      }[];
      warnings: string[];
    };
    meta?: {
      provider?: string;
      model: string;
      input_tokens?: number;
      output_tokens?: number;
      latency_ms?: number;
    };
  };
}

export function ResearchAgentOutput({ result }: Props) {
  const { brief, meta } = result;

  return (
    <div className="space-y-10">
      <section className="border-l-2 border-saffron-500 pl-5">
        <p className="label">Bottleneck</p>
        <h1 className="font-serif text-4xl text-ink-900 leading-tight tracking-editorial">
          {brief.bottleneck.name_fr}
        </h1>
        <p className="text-sm font-mono text-saffron-700 mt-2">{brief.bottleneck.id}</p>
        <p className="text-ink-700 mt-4 leading-relaxed max-w-3xl">
          {brief.bottleneck.functional_definition}
        </p>
        <div className="grid md:grid-cols-2 gap-4 mt-5">
          <div className="card">
            <p className="label">Priorité dans cascade</p>
            <p className="text-sm text-ink-800">{brief.bottleneck.priority_in_cascade}</p>
          </div>
          <div className="card">
            <p className="label">Confiance</p>
            <p className="text-sm text-ink-800">{brief.bottleneck.confidence}</p>
            <p className="text-xs text-ink-500 mt-2">{brief.bottleneck.rationale}</p>
          </div>
        </div>
      </section>

      {result.literature_search && (
        <section>
          <p className="label">Littérature PubMed importée</p>
          <div className="card">
            <p className="text-xs font-mono text-ink-500 break-words">
              Query: {result.literature_search.query}
            </p>
            {result.literature_search.papers && result.literature_search.papers.length > 0 ? (
              <ul className="mt-4 divide-y divide-ink-100">
                {result.literature_search.papers.map((paper) => (
                  <li key={paper.pmid ?? paper.title} className="py-3">
                    <p className="text-sm font-medium text-ink-900">{paper.title}</p>
                    <p className="text-xs text-ink-500 mt-1">
                      {paper.journal ?? 'Journal NR'}
                      {paper.year ? ` · ${paper.year}` : ''}
                      {paper.pmid ? ` · PMID:${paper.pmid}` : ''}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-ink-600 mt-4">Aucun abstract importé.</p>
            )}
            {result.literature_search.warnings.length > 0 && (
              <ul className="mt-4 space-y-1 text-xs text-saffron-800">
                {result.literature_search.warnings.map((warning) => (
                  <li key={warning}>· {warning}</li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      <section>
        <p className="label">Critères d&apos;entrée</p>
        <div className="overflow-x-auto border border-ink-200 rounded-sm">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-left">
              <tr>
                <th className="p-3 font-medium">Biomarqueur</th>
                <th className="p-3 font-medium">Cible</th>
                <th className="p-3 font-medium">Seuil alerte</th>
                <th className="p-3 font-medium">Poids</th>
                <th className="p-3 font-medium">Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {brief.entry_criteria.map((criterion, index) => (
                <tr key={`${criterion.biomarker}-${index}`}>
                  <td className="p-3 font-medium text-ink-900">{criterion.biomarker}</td>
                  <td className="p-3 text-ink-700">{criterion.target}</td>
                  <td className="p-3 text-ink-700">{criterion.alert_threshold}</td>
                  <td className="p-3 font-mono text-saffron-700">{criterion.weight}</td>
                  <td className="p-3 text-ink-600">{criterion.rationale}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card mt-4">
          <p className="label">Règle de classification</p>
          <p className="font-mono text-sm text-ink-900">{brief.classification_rule}</p>
        </div>
      </section>

      <section>
        <p className="label">Points d&apos;impact biologiques</p>
        <div className="grid md:grid-cols-2 gap-4 mt-3">
          {brief.biological_impact_points.map((point, index) => (
            <div key={`${point.pathway}-${index}`} className="card">
              <div className="flex items-center justify-between gap-3">
                <p className="font-serif text-xl text-ink-900">{point.pathway}</p>
                <EBMBadge tier={point.ebm_tier} />
              </div>
              <p className="text-sm text-ink-700 mt-2">{point.biological_target}</p>
              <p className="text-sm text-ink-600 mt-1">{point.desired_direction}</p>
              <p className="text-xs font-mono text-ink-400 mt-3">{point.timeframe}</p>
              <p className="text-xs text-ink-500 mt-1">{point.reference_pivot}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <p className="label">Architecture du plat</p>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="card">
            <p className="font-mono text-saffron-700 text-sm">50%</p>
            <p className="text-sm text-ink-800 mt-2">{brief.plate_architecture.vegetables_50_pct}</p>
          </div>
          <div className="card">
            <p className="font-mono text-saffron-700 text-sm">20-30%</p>
            <p className="text-sm text-ink-800 mt-2">{brief.plate_architecture.protein_20_30_pct}</p>
          </div>
          <div className="card">
            <p className="font-mono text-saffron-700 text-sm">20%</p>
            <p className="text-sm text-ink-800 mt-2">{brief.plate_architecture.lipids_20_pct}</p>
          </div>
          <div className="card">
            <p className="font-mono text-saffron-700 text-sm">Modulateurs</p>
            <ul className="text-sm text-ink-800 mt-2 space-y-1">
              {brief.plate_architecture.required_modulators.map((item) => (
                <li key={item}>· {item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section>
        <p className="label">Leviers à ajouter ou mapper</p>
        <div className="space-y-3 mt-3">
          {brief.levers.map((lever) => (
            <div key={lever.lever_id} className="card">
              <div className="flex items-start gap-4">
                <EBMBadge tier={lever.ebm_tier} className="shrink-0 mt-1" />
                <div className="flex-1">
                  <p className="font-serif text-xl text-ink-900">{lever.name_fr}</p>
                  <p className="font-mono text-xs text-ink-400 mt-1">{lever.lever_id}</p>
                  <p className="text-sm text-ink-700 mt-3">{lever.mechanism}</p>
                  <p className="text-sm text-ink-600 mt-2">
                    <span className="font-medium">Dose/protocole:</span> {lever.dose_or_protocol}
                  </p>
                  <p className="text-xs text-ink-500 mt-2">{lever.reference_pivot}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <p className="label">Recettes prêtes à l&apos;emploi</p>
        <div className="space-y-6 mt-3">
          {brief.recipes.map((recipe) => (
            <article key={recipe.title} className="card">
              <h2 className="font-serif text-2xl text-ink-900">{recipe.title}</h2>
              <p className="text-sm text-ink-600 mt-2">{recipe.architecture_notes}</p>
              <p className="font-mono text-xs text-ink-500 mt-2">
                {recipe.meal_type} · {recipe.servings} portions · {recipe.total_time_min} min
              </p>
              <div className="grid md:grid-cols-2 gap-6 mt-5">
                <div>
                  <p className="label">Ingrédients</p>
                  <ul className="divide-y divide-ink-100 text-sm">
                    {recipe.ingredients.map((ingredient) => (
                      <li key={`${recipe.title}-${ingredient.name}`} className="py-2">
                        <div className="flex justify-between gap-4">
                          <span className="text-ink-900">{ingredient.name}</span>
                          <span className="font-mono text-ink-600">{ingredient.quantity}</span>
                        </div>
                        <p className="text-xs text-ink-500 mt-1">{ingredient.functional_role}</p>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="label">Étapes</p>
                  <ol className="space-y-2 text-sm">
                    {recipe.steps.map((step) => (
                      <li key={`${recipe.title}-${step.order}`} className="flex gap-3">
                        <span className="font-mono text-xs text-saffron-700 mt-1">
                          {String(step.order).padStart(2, '0')}
                        </span>
                        <span className="text-ink-800">{step.instruction}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <p className="label">Anti-patterns</p>
          <ul className="space-y-1 text-sm text-ink-800">
            {brief.anti_patterns.map((item) => (
              <li key={item}>· {item}</li>
            ))}
          </ul>
        </div>
        <div className="card">
          <p className="label">Gaps & warnings</p>
          <ul className="space-y-1 text-sm text-ink-800">
            {[...brief.research_gaps, ...brief.warnings].map((item) => (
              <li key={item}>· {item}</li>
            ))}
          </ul>
        </div>
      </section>

      {meta && (
        <footer className="text-xs text-ink-400 font-mono pt-4 border-t border-ink-100 flex flex-wrap gap-4">
          {meta.provider && <span>{meta.provider}</span>}
          <span>{meta.model}</span>
          {meta.input_tokens && (
            <span>
              in: {meta.input_tokens}t · out: {meta.output_tokens}t
            </span>
          )}
          {meta.latency_ms && <span>{meta.latency_ms}ms</span>}
        </footer>
      )}
    </div>
  );
}
