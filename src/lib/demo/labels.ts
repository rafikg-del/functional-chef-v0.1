import type { BottleneckId, EBMTier, ThresholdWeight } from '@/lib/reasoning/types';

export const BOTTLENECK_META: Record<
  BottleneckId,
  { label: string; short: string; color: string }
> = {
  IR: { label: 'Insulinorésistance fonctionnelle', short: 'IR', color: 'bg-tier-t1' },
  INFLAM: { label: 'Inflammaging', short: 'INFLAM', color: 'bg-tier-t2' },
  DYSBIOSE: { label: 'Dysbiose intestinale', short: 'DYSBIOSE', color: 'bg-tier-t3' },
};

export const PHENOTYPE_LABELS: Record<string, string> = {
  hepatic_masld: 'Stéatose / MASLD (imagerie)',
  pcos_adipose: 'Phénotype SOPK / adipeux',
  functional_iron_blockade: 'Blocage fonctionnel du fer',
};

export const WEIGHT_LABELS: Record<ThresholdWeight, string> = {
  major: 'majeur',
  moderate: 'modéré',
  minor: 'mineur',
  discriminant: 'discriminant',
};

export const ROLE_LABELS: Record<string, string> = {
  universal_star: 'Étoile transversale',
  targeted: 'Ciblé',
  modulator: 'Modulateur',
};

export const TIER_LEGEND: { tier: EBMTier; label: string }[] = [
  { tier: 'T1', label: 'méta-analyse RCT' },
  { tier: 'T2', label: 'RCT modeste / cohorte' },
  { tier: 'T3', label: 'mécanistique' },
];

export function bottleneckLabel(id: string | null | undefined): string {
  if (!id) return '—';
  return BOTTLENECK_META[id as BottleneckId]?.label ?? id;
}
