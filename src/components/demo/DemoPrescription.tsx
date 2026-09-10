'use client';

import Link from 'next/link';
import { EBMBadge } from '@/components/EBMBadge';
import { bottleneckLabel, ROLE_LABELS, TIER_LEGEND } from '@/lib/demo/labels';
import type { DemoDishSource, PublicDemoResult } from '@/lib/demo/run-public-demo';
import type { ComposedDish } from '@/lib/reasoning/types';

function sourceLabel(source: DemoDishSource): string {
  if (source === 'live') return 'Composition Claude (optionnelle)';
  if (source === 'fixture') return 'Aperçu catalogue (cas type, déterministe)';
  return 'Aperçu déterministe (sélecteur, sans LLM)';
}

export function DemoPrescription({
  preview,
  dish,
  dishSource,
}: {
  preview: PublicDemoResult;
  dish: ComposedDish | null;
  dishSource: DemoDishSource;
}) {
  const { classification, lever_selection } = preview;

  if (!classification.dominant) {
    return (
      <div className="card !p-6 text-center">
        <p className="text-ink-500 text-sm">Aucun bottleneck dominant détecté.</p>
        <p className="text-xs text-ink-400 mt-1">
          Chargez un cas A/B/C, ou augmentez les biomarqueurs hors cibles.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section>
        <p className="label mb-3">Leviers retenus (sélecteur déterministe)</p>
        <p className="text-xs text-ink-500 mb-4">
          Cible : {bottleneckLabel(classification.dominant)}
          {classification.co_dominant
            ? ` · co-dominant : ${bottleneckLabel(classification.co_dominant)}`
            : ''}
          . Badges T1/T2/T3 = niveau de preuve du levier pour ce bottleneck.
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {TIER_LEGEND.map((t) => (
            <span key={t.tier} className="inline-flex items-center gap-1.5 text-xs text-ink-600">
              <EBMBadge tier={t.tier} />
              {t.label}
            </span>
          ))}
        </div>
        <div className="space-y-2">
          {lever_selection.selected.map((l) => (
            <div key={l.lever_id} className="card !p-4 flex gap-3 items-start">
              <EBMBadge tier={l.tier_for_active_bottleneck} showTooltip className="shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-baseline gap-2">
                  <p className="font-serif text-lg text-ink-900">{l.name_fr}</p>
                  <span className="text-[10px] uppercase tracking-wider text-ink-500">
                    {ROLE_LABELS[l.role] ?? l.role}
                  </span>
                </div>
                <p className="text-sm text-ink-600 mt-1 leading-relaxed">{l.expected_effect}</p>
                {l.dose_or_protocol && (
                  <p className="text-xs text-ink-500 mt-1 font-mono">{l.dose_or_protocol}</p>
                )}
              </div>
            </div>
          ))}
        </div>
        {lever_selection.warnings.length > 0 && (
          <ul className="mt-3 text-xs text-ink-500 space-y-1">
            {lever_selection.warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        )}
      </section>

      {dish && (
        <section>
          <p className="label mb-1">Prescription culinaire (aperçu)</p>
          <p className="text-xs text-ink-500 mb-4">{sourceLabel(dishSource)}</p>
          <div className="card !p-6 space-y-6">
            <div>
              <h3 className="font-serif text-2xl text-ink-900 tracking-editorial">{dish.title}</h3>
              <p className="text-sm text-ink-600 mt-2 leading-relaxed">{dish.description}</p>
              <div className="flex flex-wrap gap-4 mt-3 text-xs text-ink-500">
                <span>{dish.servings} portions</span>
                <span>{dish.total_time_min} min</span>
                <span className="font-mono">
                  {dish.architecture.vegetables_pct}/{dish.architecture.protein_pct}/
                  {dish.architecture.lipid_pct}
                </span>
                <span className="flex gap-2">
                  {dish.ebm_summary.T1_count > 0 && (
                    <span>
                      <EBMBadge tier="T1" /> ×{dish.ebm_summary.T1_count}
                    </span>
                  )}
                  {dish.ebm_summary.T2_count > 0 && (
                    <span>
                      <EBMBadge tier="T2" /> ×{dish.ebm_summary.T2_count}
                    </span>
                  )}
                  {dish.ebm_summary.T3_count > 0 && (
                    <span>
                      <EBMBadge tier="T3" /> ×{dish.ebm_summary.T3_count}
                    </span>
                  )}
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-ink-500 mb-2 font-medium">
                  Ingrédients
                </p>
                <ul className="divide-y divide-ink-100 text-sm">
                  {dish.ingredients.map((ing, i) => (
                    <li key={`${ing.name}-${i}`} className="py-1.5 flex justify-between gap-3">
                      <span className="text-ink-800">
                        {ing.name}
                        {ing.notes && (
                          <span className="block text-xs text-ink-500 italic">{ing.notes}</span>
                        )}
                      </span>
                      <span className="biomarker-value text-ink-600 whitespace-nowrap">
                        {ing.quantity}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-ink-500 mb-2 font-medium">
                  Protocole
                </p>
                <ol className="space-y-2 text-sm text-ink-800">
                  {dish.steps.map((step) => (
                    <li key={step.order} className="flex gap-3">
                      <span className="font-mono text-xs text-saffron-700 mt-0.5">
                        {String(step.order).padStart(2, '0')}
                      </span>
                      <span className="leading-relaxed">{step.instruction}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-3">
              <div className="bg-ink-50 border border-ink-100 rounded-sm p-3">
                <p className="text-[10px] uppercase tracking-wider text-saffron-700 mb-1">
                  Postprandial 2-4h
                </p>
                <p className="text-xs text-ink-700 leading-relaxed">
                  {dish.expected_effects.postprandial_2_4h}
                </p>
              </div>
              <div className="bg-ink-50 border border-ink-100 rounded-sm p-3">
                <p className="text-[10px] uppercase tracking-wider text-saffron-700 mb-1">
                  4 semaines
                </p>
                <p className="text-xs text-ink-700 leading-relaxed">
                  {dish.expected_effects.short_term_4_weeks}
                </p>
              </div>
              <div className="bg-ink-50 border border-ink-100 rounded-sm p-3">
                <p className="text-[10px] uppercase tracking-wider text-saffron-700 mb-1">
                  12 semaines
                </p>
                <p className="text-xs text-ink-700 leading-relaxed">
                  {dish.expected_effects.long_term_12_weeks}
                </p>
              </div>
            </div>

            {dish.warnings.length > 0 && (
              <ul className="text-xs text-ink-600 space-y-1 border-t border-ink-100 pt-4">
                {dish.warnings.map((w) => (
                  <li key={w}>· {w}</li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      <div className="bg-saffron-50/40 border border-saffron-200 rounded-sm p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="font-serif text-xl text-ink-900">Continuer vers la beta praticien</p>
          <p className="text-sm text-ink-600 mt-1">
            La démo s’arrête ici. Pré-inscription : email professionnel, invitation ensuite.
            Pas de compte créé automatiquement.
          </p>
        </div>
        <Link href="/beta" className="btn-primary text-sm !py-2.5 !px-5 whitespace-nowrap">
          Pré-inscription beta →
        </Link>
      </div>
    </div>
  );
}
