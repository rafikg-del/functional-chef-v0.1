'use client';

import { EBMBadge } from './EBMBadge';
import type { ConsultationResult } from '@/lib/reasoning/types';

const BOTTLENECK_LABEL: Record<string, string> = {
  ALLOSTATIC_LOAD: 'Charge allostatique',
  IR: 'Insulinorésistance',
  INFLAM: 'Inflammaging',
  DYSBIOSE: 'Dysbiose',
};

export function DishOutput({ result }: { result: ConsultationResult }) {
  const { classification, lever_selection, dish, warnings } = result;

  return (
    <div className="space-y-10">
      {/* Classification banner */}
      <section className="border-l-2 border-saffron-500 pl-5">
        <p className="label">Classification</p>
        <h3 className="font-serif text-2xl text-ink-900 mt-1">
          Bottleneck dominant :{' '}
          <span className="text-saffron-700">
            {classification.dominant ? BOTTLENECK_LABEL[classification.dominant] : '—'}
          </span>
          {classification.co_dominant && (
            <span className="text-ink-600 text-lg">
              {' '}
              · co-dominant : {BOTTLENECK_LABEL[classification.co_dominant]}
            </span>
          )}
        </h3>
        <p className="text-sm text-ink-600 mt-2 leading-relaxed">
          {classification.rationale}
        </p>

        {/* Score breakdown */}
        <div className="mt-4 grid md:grid-cols-3 gap-3">
          {classification.scores.map((s) => (
            <div
              key={s.bottleneck_id}
              className={`text-xs p-3 rounded-sm border ${
                s.is_dominant
                  ? 'bg-saffron-50 border-saffron-300'
                  : s.is_co_dominant
                  ? 'bg-saffron-50/50 border-saffron-200'
                  : 'bg-white border-ink-200'
              }`}
            >
              <div className="flex justify-between items-baseline">
                <span className="font-medium text-ink-900">
                  {BOTTLENECK_LABEL[s.bottleneck_id]}
                </span>
                <span className="font-mono text-ink-700">
                  {s.score} pts {s.triggered ? '✓' : '·'}
                </span>
              </div>
              <p className="text-ink-500 mt-1">
                {s.major_hits} maj · {s.moderate_hits} mod · {s.minor_hits} min
                {s.discriminant_hits > 0 && ` · ${s.discriminant_hits} discr`}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Dish */}
      <section>
        <p className="label">Plat composé</p>
        <h2 className="font-serif text-4xl text-ink-900 leading-tight tracking-editorial mt-1">
          {dish.title}
        </h2>
        <p className="text-ink-600 mt-3 max-w-3xl leading-relaxed">{dish.description}</p>

        <div className="flex gap-6 mt-4 text-sm text-ink-600">
          <span>{dish.servings} portions</span>
          <span>·</span>
          <span>{dish.total_time_min} min</span>
          <span>·</span>
          <span className="font-mono">
            {dish.architecture.vegetables_pct}/{dish.architecture.protein_pct}/
            {dish.architecture.lipid_pct}
          </span>
        </div>

        {/* EBM summary */}
        <div className="flex gap-3 mt-4">
          {dish.ebm_summary.T1_count > 0 && (
            <span className="text-xs text-tier-t1">
              <EBMBadge tier="T1" /> ×{dish.ebm_summary.T1_count}
            </span>
          )}
          {dish.ebm_summary.T2_count > 0 && (
            <span className="text-xs text-tier-t2">
              <EBMBadge tier="T2" /> ×{dish.ebm_summary.T2_count}
            </span>
          )}
          {dish.ebm_summary.T3_count > 0 && (
            <span className="text-xs text-tier-t3">
              <EBMBadge tier="T3" /> ×{dish.ebm_summary.T3_count}
            </span>
          )}
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Ingredients */}
        <section>
          <p className="label">Ingrédients</p>
          <ul className="mt-3 divide-y divide-ink-100">
            {dish.ingredients.map((ing, i) => (
              <li key={i} className="py-2 flex justify-between gap-4">
                <div className="flex-1">
                  <span className="text-ink-900">{ing.name}</span>
                  {ing.notes && (
                    <span className="text-xs text-ink-500 italic block mt-0.5">
                      {ing.notes}
                    </span>
                  )}
                </div>
                <span className="biomarker-value text-ink-700 text-sm whitespace-nowrap">
                  {ing.quantity}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Steps */}
        <section>
          <p className="label">Protocole de cuisson</p>
          <ol className="mt-3 space-y-3">
            {dish.steps.map((step) => (
              <li key={step.order} className="flex gap-3">
                <span className="font-mono text-xs text-saffron-700 mt-1 shrink-0">
                  {String(step.order).padStart(2, '0')}
                </span>
                <div className="flex-1 text-sm text-ink-800 leading-relaxed">
                  {step.instruction}
                  {(step.duration_min || step.temperature_max_c) && (
                    <span className="block text-xs text-ink-500 mt-1 font-mono">
                      {step.duration_min && `${step.duration_min} min`}
                      {step.duration_min && step.temperature_max_c && ' · '}
                      {step.temperature_max_c && `≤${step.temperature_max_c}°C`}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>

      {/* Levers activated */}
      <section>
        <p className="label">Leviers mobilisés</p>
        <div className="mt-3 space-y-3">
          {dish.levers_activated.map((l) => (
            <div key={l.lever_id} className="card flex gap-4 items-start">
              <EBMBadge tier={l.tier} showTooltip className="shrink-0 mt-1" />
              <div className="flex-1">
                <p className="font-serif text-lg text-ink-900">{l.name_fr}</p>
                <p className="text-sm text-ink-600 mt-1 leading-relaxed">
                  {l.rationale_one_line}
                </p>
                <p className="font-mono text-xs text-ink-400 mt-2">{l.lever_id}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Expected effects */}
      <section>
        <p className="label">Effets biologiques attendus</p>
        <div className="grid md:grid-cols-3 gap-4 mt-3">
          <div className="card">
            <p className="text-xs uppercase tracking-wider text-saffron-700 mb-2">
              Postprandial 2-4h
            </p>
            <p className="text-sm text-ink-800 leading-relaxed">
              {dish.expected_effects.postprandial_2_4h}
            </p>
          </div>
          <div className="card">
            <p className="text-xs uppercase tracking-wider text-saffron-700 mb-2">
              Court terme · 4 sem
            </p>
            <p className="text-sm text-ink-800 leading-relaxed">
              {dish.expected_effects.short_term_4_weeks}
            </p>
          </div>
          <div className="card">
            <p className="text-xs uppercase tracking-wider text-saffron-700 mb-2">
              Long terme · 12 sem
            </p>
            <p className="text-sm text-ink-800 leading-relaxed">
              {dish.expected_effects.long_term_12_weeks}
            </p>
          </div>
        </div>
      </section>

      {/* Shopping list */}
      <section>
        <p className="label">Liste de courses</p>
        <ul className="mt-3 grid md:grid-cols-2 gap-x-8 text-sm">
          {dish.shopping_list.map((s, i) => (
            <li key={i} className="flex justify-between border-b border-ink-100 py-1.5">
              <span className="text-ink-800">{s.item}</span>
              <span className="biomarker-value text-ink-600">{s.quantity}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Warnings */}
      {warnings.length > 0 && (
        <section className="bg-saffron-50/50 border border-saffron-200 rounded-sm p-5">
          <p className="label text-saffron-800">Avertissements & précautions</p>
          <ul className="mt-2 space-y-1.5 text-sm text-ink-800">
            {warnings.map((w, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-saffron-700">·</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* LLM meta footer */}
      {result.llm_meta && (
        <footer className="text-xs text-ink-400 font-mono pt-4 border-t border-ink-100 flex flex-wrap gap-4">
          <span>{result.llm_meta.model}</span>
          {result.llm_meta.input_tokens && (
            <span>
              in: {result.llm_meta.input_tokens}t · out: {result.llm_meta.output_tokens}t
            </span>
          )}
          {result.llm_meta.latency_ms && <span>{result.llm_meta.latency_ms}ms</span>}
          {result.consultation_id && (
            <span className="ml-auto">id: {result.consultation_id.slice(0, 8)}…</span>
          )}
        </footer>
      )}
    </div>
  );
}
